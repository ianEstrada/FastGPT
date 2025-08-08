from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse, HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import uvicorn
import os
import httpx
import json
import asyncio
from datetime import datetime
from typing import Optional, List


app = FastAPI(title="Fast GPT Chatbot", description="Chatbot con Ollama para acceso remoto")

# Configurar CORS para acceso remoto
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especifica las IPs permitidas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://localhost:11434"

# Obtener directorio actual del script
script_dir = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(script_dir, "static")

# Crear directorio static si no existe
if not os.path.exists(static_dir):
    os.makedirs(static_dir)
    print(f"⚠️ Directorio static creado en: {static_dir}")

# Montar carpeta estática para frontend
app.mount("/static", StaticFiles(directory=static_dir), name="static")

class ChatRequest(BaseModel):
    model: str
    prompt: str
    context: Optional[List[dict]] = None
    system_prompt: Optional[str] = None
    max_tokens: Optional[int] = None
    temperature: Optional[float] = None

class StreamChatRequest(BaseModel):
    model: str
    prompt: str
    context: Optional[List[dict]] = None
    system_prompt: Optional[str] = None

@app.post("/api/chat")
async def chat_endpoint(data: ChatRequest):
    """Endpoint de chat optimizado con soporte para contexto"""
    model_map = {
        "llama3.1": "llama3.1:8b",
        "qwen2.5": "qwen2.5:7b",
    }
    actual_model = model_map.get(data.model, data.model)
    
    # Construir prompt con contexto si existe
    full_prompt = data.prompt
    if data.context and len(data.context) > 0:
        context_messages = []
        for msg in data.context[-10:]:  # Solo los últimos 10 mensajes para evitar contexto muy largo
            if msg.get('role') == 'user':
                context_messages.append(f"Usuario: {msg.get('content', '')}")
            elif msg.get('role') == 'assistant':
                context_messages.append(f"Asistente: {msg.get('content', '')}")
        
        if context_messages:
            full_prompt = "\n".join(context_messages) + f"\nUsuario: {data.prompt}\nAsistente:"
    
    # Agregar system prompt si existe
    if data.system_prompt:
        full_prompt = f"System: {data.system_prompt}\n\n{full_prompt}"
    
    payload = {
        "model": actual_model,
        "prompt": full_prompt,
        "stream": False,
        "options": {}
    }
    
    # Configuraciones opcionales
    if data.temperature is not None:
        payload["options"]["temperature"] = data.temperature
    if data.max_tokens is not None:
        payload["options"]["num_predict"] = data.max_tokens
    
    async with httpx.AsyncClient(timeout=120) as client:
        try:
            response = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json=payload
            )
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            return {"error": f"Error de conexión con Ollama: {str(e)}"}
        except Exception as e:
            return {"error": f"Error interno: {str(e)}"}

@app.post("/api/chat/stream")
async def chat_stream_endpoint(data: StreamChatRequest):
    """Endpoint de chat con streaming para respuestas en tiempo real"""
    model_map = {
        "llama3.1": "llama3.1:8b",
        "qwen2.5": "qwen2.5:7b",
    }
    actual_model = model_map.get(data.model, data.model)
    
    # Construir prompt con contexto
    full_prompt = data.prompt
    if data.context and len(data.context) > 0:
        context_messages = []
        for msg in data.context[-8:]:
            if msg.get('role') == 'user':
                context_messages.append(f"Usuario: {msg.get('content', '')}")
            elif msg.get('role') == 'assistant':
                context_messages.append(f"Asistente: {msg.get('content', '')}")
        
        if context_messages:
            full_prompt = "\n".join(context_messages) + f"\nUsuario: {data.prompt}\nAsistente:"
    
    if data.system_prompt:
        full_prompt = f"System: {data.system_prompt}\n\n{full_prompt}"
    
    async def generate_stream():
        async with httpx.AsyncClient(timeout=120) as client:
            try:
                async with client.stream(
                    "POST",
                    f"{OLLAMA_URL}/api/generate",
                    json={
                        "model": actual_model,
                        "prompt": full_prompt,
                        "stream": True
                    }
                ) as response:
                    response.raise_for_status()
                    async for chunk in response.aiter_lines():
                        if chunk:
                            try:
                                data = json.loads(chunk)
                                if "response" in data:
                                    yield f"data: {json.dumps({'content': data['response'], 'done': data.get('done', False)})}\n\n"
                                if data.get('done', False):
                                    break
                            except json.JSONDecodeError:
                                continue
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*"
        }
    )

@app.get("/health")
async def health_check():
    """Endpoint para verificar que el servidor está funcionando"""
    return {"status": "healthy", "service": "Fast GPT Chatbot"}

@app.get("/api/models")
async def get_models():
    """Obtener lista de modelos disponibles en Ollama con información detallada"""
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(f"{OLLAMA_URL}/api/tags")
            response.raise_for_status()
            data = response.json()
            
            # Procesar y estructurar mejor la información
            models = []
            for model in data.get('models', []):
                model_info = {
                    'name': model.get('name', ''),
                    'display_name': model.get('name', '').split(':')[0].title(),
                    'size': model.get('size', 0),
                    'modified_at': model.get('modified_at', ''),
                    'available': True
                }
                models.append(model_info)
            
            return {'models': models, 'count': len(models)}
    
    except Exception as e:
        # Modelos por defecto si Ollama no responde
        default_models = [
            {'name': 'llama3.1:8b', 'display_name': 'Llama 3.1', 'size': 0, 'available': False},
            {'name': 'qwen2.5:7b', 'display_name': 'Qwen 2.5', 'size': 0, 'available': False},
            {'name': 'llama2:7b', 'display_name': 'Llama 2', 'size': 0, 'available': False},
            {'name': 'mistral:7b', 'display_name': 'Mistral', 'size': 0, 'available': False}
        ]
        return {'models': default_models, 'count': len(default_models), 'error': str(e)}

@app.get("/api/status")
async def get_ollama_status():
    """Verificar estado de conexión con Ollama"""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(f"{OLLAMA_URL}/api/version")
            response.raise_for_status()
            return {'status': 'connected', 'ollama_version': response.json()}
    except Exception as e:
        return {'status': 'disconnected', 'error': str(e)}

@app.get("/")
async def main():
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    else:
        return HTMLResponse("""
        <html>
            <head><title>FastGPT</title></head>
            <body>
                <h1>🤖 FastGPT Server</h1>
                <p>⚠️ Archivo index.html no encontrado en directorio static.</p>
                <p>📁 Directorio static: {}</p>
                <p>💡 Coloca tu archivo index.html en el directorio static para ver la interfaz.</p>
                <hr>
                <h2>🔗 Endpoints disponibles:</h2>
                <ul>
                    <li><a href="/health">📊 /health</a> - Estado del servidor</li>
                    <li><a href="/api/models">🤖 /api/models</a> - Modelos disponibles</li>
                    <li><a href="/api/status">🔍 /api/status</a> - Estado de Ollama</li>
                </ul>
            </body>
        </html>
        """.format(static_dir))

if __name__ == "__main__":
    # Configuración para acceso remoto
    import uvicorn
    print("🚀 Iniciando Fast GPT Chatbot Server...")
    print("📱 Acceso desde teléfono: http://192.168.1.64:8000")
    print("💻 Acceso local: http://localhost:8000")
    print("🛑 Presiona Ctrl+C para detener el servidor\n")
    
    uvicorn.run(
        app,  # Usar la instancia directa en lugar del string
        host="0.0.0.0",  # Escucha en todas las interfaces
        port=8000,
        reload=False,  # Desactivar reload para evitar problemas
        access_log=True
    )