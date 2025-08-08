# 🚀 FastGPT - Chatbot Moderno con Ollama

Un chatbot web moderno y elegante que conecta con Ollama para proporcionar una experiencia de chat inteligente desde cualquier dispositivo.

![FastGPT Preview](https://img.shields.io/badge/FastGPT-v2.0-blue?style=for-the-badge&logo=robot)

## ✨ Características Principales

### 🎨 Interfaz Moderna
- **Diseño responsive** que se adapta perfectamente a móviles, tablets y desktop
- **Tema elegante** con gradientes y animaciones suaves
- **Sidebar deslizante** para navegación de chats
- **Indicadores de estado** en tiempo real

### 🤖 Funcionalidades de Chat
- **Múltiples conversaciones** con historial persistente
- **Selector de modelos** dinámico (Llama 3.1, Qwen 2.5, Mistral, etc.)
- **Contexto inteligente** que mantiene la coherencia en la conversación
- **Animaciones de escritura** que simulan respuestas naturales
- **Timestamps** en cada mensaje

### 🔧 Optimizaciones Técnicas
- **API asíncrona** con FastAPI para máximo rendimiento
- **Manejo inteligente de errores** y reintentos automáticos
- **Almacenamiento local** del historial de chats
- **Verificación de estado** de Ollama en tiempo real
- **Soporte para streaming** de respuestas (futuro)

### 📱 Acceso Remoto
- **Servidor configurado** para acceso desde cualquier dispositivo en la red local
- **CORS habilitado** para desarrollo y uso móvil
- **URLs amigables** para acceso fácil desde el teléfono

## 🛠️ Instalación y Configuración

### Prerrequisitos
1. **Python 3.8+** instalado
2. **Ollama** instalado y ejecutándose
3. Al menos un modelo descargado en Ollama

### Instalación Rápida

1. **Instala las dependencias:**
   ```bash
   cd C:\Users\Lightning\Documents\FastGPT
   pip install fastapi uvicorn httpx requests
   ```

2. **Verifica que Ollama esté ejecutándose:**
   ```bash
   ollama serve
   ```

3. **Descarga algunos modelos (opcional):**
   ```bash
   ollama pull llama3.1:8b
   ollama pull qwen2.5:7b
   ollama pull mistral:7b
   ```

4. **Ejecuta el servidor:**
   ```bash
   # Opción A: Script automático (recomendado)
   start-backend.bat
   
   # Opción B: Manual
   cd backend
   python server.py
   ```

5. **Accede al chatbot:**
   - **Local:** http://localhost:8000
   - **Móvil:** http://192.168.1.64:8000 (o tu IP local)

## 🌍 Deployment Público (¡GRATIS!)

¿Quieres acceder a tu chatbot desde cualquier lugar del mundo? **[Consulta la Guía Completa de Deployment](DEPLOYMENT_GUIDE.md)**

### 🚀 Lo que Obtienes:
- 🔗 **URL personalizada gratuita:** `tu-chatbot.pages.dev`
- 🌐 **Acceso global:** Desde cualquier país y dispositivo
- 📱 **PWA optimizado:** Funciona como una app nativa
- ⚡ **CDN global:** Velocidad máxima en todo el mundo
- 🔒 **HTTPS automático:** Certificados SSL gratis
- 💰 **Costo:** ¡**COMPLETAMENTE GRATIS**!

### ⚡ Inicio Rápido:
1. Copia el archivo `frontend/index.html`
2. Configura tu backend con ngrok: `ngrok http 8000`
3. Sube el frontend a Cloudflare Pages
4. ¡Listo! Tu chatbot ya es accesible desde cualquier lugar

## 📂 Estructura del Proyecto

```
FastGPT/
├── 📁 backend/                 # Servidor Python FastAPI
│   ├── server.py              # Servidor principal
│   └── static/
│       └── index.html         # Interfaz local simple
├── 📁 frontend/               # Frontend para deploy
│   └── index.html             # Interfaz completa para Cloudflare
├── 🚀 start-backend.bat       # Script automático de inicio
├── 📘 DEPLOYMENT_GUIDE.md     # Guía de despliegue completa
├── 📖 README.md               # Esta documentación
└── 📁 venv/                   # Entorno virtual Python
```

## 🎯 Características Detalladas

### 🔄 Sistema de Chat Inteligente
- **Historial persistente:** Los chats se guardan automáticamente en localStorage
- **Cambio de modelos:** Selecciona entre diferentes modelos de IA sin reiniciar
- **Contexto dinámico:** El sistema mantiene el contexto de la conversación automáticamente
- **Títulos automáticos:** Los chats se titulan automáticamente basados en el primer mensaje

### 🎨 Experiencia de Usuario
- **Animaciones fluidas:** Transiciones suaves en toda la interfaz
- **Indicadores visuales:** Estados de conexión, escritura y carga claramente visibles
- **Responsive design:** Funciona perfectamente en todos los dispositivos
- **Atajos de teclado:** Enter para enviar, Shift+Enter para nueva línea

### ⚡ Rendimiento Optimizado
- **API asíncrona:** Manejo no bloqueante de múltiples solicitudes
- **Timeouts inteligentes:** Configuraciones optimizadas para diferentes operaciones
- **Reintentos automáticos:** Sistema robusto de manejo de errores
- **Carga lazy:** Los recursos se cargan solo cuando son necesarios

## 🔧 Configuración Avanzada

### Modificar el archivo `config.json`:

```json
{
    "server": {
        "host": "0.0.0.0",        // IP del servidor
        "port": 8000,             // Puerto del servidor
        "reload": false           // Hot reload (solo desarrollo)
    },
    "ollama": {
        "url": "http://localhost:11434", // URL de Ollama
        "timeout": 120,                   // Timeout en segundos
        "max_retries": 3                  // Reintentos máximos
    },
    "chat": {
        "max_context_messages": 10,      // Mensajes de contexto máximos
        "default_temperature": 0.7,      // Creatividad del modelo
        "default_max_tokens": 2000       // Longitud máxima de respuesta
    }
}
```

## 🌐 Endpoints de la API

### Chat
- **POST** `/api/chat` - Enviar mensaje
- **POST** `/api/chat/stream` - Chat con streaming (próximamente)

### Modelos
- **GET** `/api/models` - Lista de modelos disponibles
- **GET** `/api/status` - Estado de conexión con Ollama

### Sistema
- **GET** `/health` - Estado del servidor
- **GET** `/` - Interfaz web principal

## 📱 Uso en Móviles

### Configuración de Red
1. Asegúrate de que tu PC y móvil están en la misma red WiFi
2. Verifica tu IP local: `ipconfig` (Windows) o `ip addr` (Linux)
3. Accede desde el móvil usando: `http://[TU_IP]:8000`

### Funciones Móviles
- **Sidebar táctil:** Desliza para abrir/cerrar la lista de chats
- **Textarea adaptable:** Se ajusta automáticamente al contenido
- **Botones optimizados:** Tamaño perfecto para dedos
- **Navegación intuitiva:** Gestos naturales en toda la interfaz

## 🚀 Mejoras Implementadas

### Backend Optimizado
- ✅ **API asíncrona** con FastAPI
- ✅ **Manejo de contexto** inteligente
- ✅ **Sistema de reintentos** robusto
- ✅ **Endpoints adicionales** para modelos y estado
- ✅ **Configuración flexible** de modelos

### Frontend Moderno
- ✅ **Diseño completamente renovado** con CSS moderno
- ✅ **JavaScript orientado a objetos** y modular
- ✅ **Sistema de estado** robusto
- ✅ **Animaciones fluidas** y naturales
- ✅ **Responsive design** perfecto

### Experiencia de Usuario
- ✅ **Historial persistente** con localStorage
- ✅ **Selector de modelos** dinámico
- ✅ **Indicadores de estado** en tiempo real
- ✅ **Animaciones de escritura** realistas
- ✅ **Manejo de errores** amigable

## 🐛 Solución de Problemas

### Error de Conexión con Ollama
```bash
# Verifica que Ollama esté ejecutándose
ollama serve

# Verifica que los modelos estén disponibles
ollama list
```

### El servidor no arranca
```bash
# Verifica que las dependencias estén instaladas
pip install fastapi uvicorn httpx requests

# Verifica que el puerto no esté en uso
netstat -ano | findstr :8000
```

### No se puede acceder desde el móvil
1. Verifica la IP con `ipconfig`
2. Asegúrate de que Windows Firewall permita el puerto 8000
3. Confirma que estés en la misma red WiFi

## 📈 Próximas Características

- 🔄 **Streaming de respuestas** en tiempo real
- 🎨 **Temas personalizables** (oscuro/claro)
- 📁 **Exportar/importar** chats
- 🔍 **Búsqueda en historial** de conversaciones
- 🔒 **Autenticación** y usuarios múltiples
- 📊 **Estadísticas de uso** y analytics
- 🌍 **Múltiples idiomas** (i18n)

## 🤝 Contribución

¿Quieres contribuir? ¡Excelente!

1. Fork del proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

## 🙋‍♂️ Soporte

Si tienes preguntas o problemas:

1. Revisa la sección de **Solución de Problemas**
2. Verifica que Ollama esté ejecutándose correctamente
3. Asegúrate de tener las dependencias instaladas

---

**¡Disfruta usando FastGPT! 🎉**

> Hecho con ❤️ para proporcionar la mejor experiencia de chat con IA local.
