@echo off
title 🚀 FastGPT Backend Launcher
color 0a

echo.
echo ███████╗ █████╗ ███████╗████████╗ ██████╗ ██████╗ ████████╗
echo ██╔════╝██╔══██╗██╔════╝╚══██╔══╝██╔════╝ ██╔══██╗╚══██╔══╝
echo █████╗  ███████║███████╗   ██║   ██║  ███╗██████╔╝   ██║   
echo ██╔══╝  ██╔══██║╚════██║   ██║   ██║   ██║██╔═══╝    ██║   
echo ██║     ██║  ██║███████║   ██║   ╚██████╔╝██║        ██║   
echo ╚═╝     ╚═╝  ╚═╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝        ╚═╝   
echo.
echo 🤖 Iniciando FastGPT Backend Completo...
echo ============================================
echo.

REM Verificar si Python está instalado
echo 🐍 Verificando Python...
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Python no encontrado. Por favor instala Python.
    pause
    exit /b
)
echo ✅ Python encontrado

REM Verificar si Ollama está instalado
echo 🦙 Verificando Ollama...
ollama --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Ollama no encontrado. Descárgalo desde: https://ollama.ai
    pause
    exit /b
)
echo ✅ Ollama encontrado

REM Verificar si ngrok está instalado
echo 🌐 Verificando ngrok...
ngrok version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ ngrok no encontrado. Descárgalo desde: https://ngrok.com
    echo 💡 También puedes usar tu IP local en lugar de ngrok
    set USE_NGROK=false
) else (
    echo ✅ ngrok encontrado
    set USE_NGROK=true
)

echo.
echo 🚀 Iniciando servicios...
echo ========================

REM Verificar si Ollama ya está ejecutándose
echo 🔍 Verificando si Ollama ya está activo...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %ERRORLEVEL% eq 0 (
    echo ✅ Ollama ya está ejecutándose
) else (
    echo 🦙 Iniciando Ollama...
    start /B ollama serve
    echo ⏳ Esperando a que Ollama inicie...
    timeout /t 10 /nobreak >nul
    
    REM Verificar que Ollama se haya iniciado correctamente
    :wait_ollama
    curl -s http://localhost:11434/api/tags >nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo ⏳ Aún esperando Ollama...
        timeout /t 5 /nobreak >nul
        goto wait_ollama
    )
    echo ✅ Ollama iniciado correctamente
)

REM Verificar modelos disponibles
echo 📋 Modelos disponibles en Ollama:
ollama list

echo.
REM Obtener IP local
echo 🔍 Obteniendo IP local...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        set LOCAL_IP=%%b
        goto :ip_found
    )
)
:ip_found
echo 📍 Tu IP local es: %LOCAL_IP%

echo.
if "%USE_NGROK%"=="true" (
    echo 🌐 Iniciando túnel ngrok...
    start /B ngrok http 8000
    echo ⏳ Esperando a que ngrok se conecte...
    timeout /t 5 /nobreak >nul
    
    REM Intentar obtener la URL pública de ngrok
    echo 🔗 Intentando obtener URL pública...
    curl -s http://127.0.0.1:4040/api/tunnels 2>nul | findstr "public_url" >nul
    if %ERRORLEVEL% eq 0 (
        echo ✅ Túnel ngrok creado
        echo 💡 Ve a http://127.0.0.1:4040 para ver la URL pública
    ) else (
        echo ⚠️  ngrok puede no haberse conectado correctamente
        echo 💡 Verifica manualmente en http://127.0.0.1:4040
    )
) else (
    echo 💡 Solo usando IP local: http://%LOCAL_IP%:8000
)

echo.
echo 🎯 Iniciando servidor FastGPT...
echo 📁 Cambiando a directorio backend...
cd /d "C:\Users\Lightning\Documents\FastGPT\backend"

REM Verificar que el archivo server.py existe
if not exist "server.py" (
    echo ❌ server.py no encontrado en %cd%
    echo 💡 Verifica que estés en el directorio correcto
    pause
    exit /b
)

echo ✅ Archivo server.py encontrado

REM Verificar que el directorio static existe
if not exist "static" (
    echo ❌ Directorio static no encontrado
    echo 💡 Creando directorio static...
    mkdir static
    echo ⚠️  Nota: Necesitarás el archivo index.html en static/
)

echo.
echo 🎉 ¡Todo listo! Iniciando FastGPT...
echo =====================================
echo.
echo 🔗 URLs de acceso:
echo    Local: http://localhost:8000
echo    Red WiFi: http://%LOCAL_IP%:8000
if "%USE_NGROK%"=="true" (
    echo    Público: Ve a http://127.0.0.1:4040 para la URL
)
echo.
echo 💡 Presiona Ctrl+C para detener el servidor
echo.

REM Iniciar el servidor FastGPT
python server.py

echo.
echo 🔴 Servidor detenido
echo ⚠️  Cerrando servicios...

REM Opcional: Cerrar ngrok al salir
if "%USE_NGROK%"=="true" (
    taskkill /f /im ngrok.exe >nul 2>&1
)

echo.
echo 👋 ¡Hasta luego!
pause
