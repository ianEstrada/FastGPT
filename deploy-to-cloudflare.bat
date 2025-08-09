@echo off
echo 🚀 Desplegando FastGPT a Cloudflare Pages...
echo.

REM Verificar que existe la carpeta frontend
if not exist "frontend" (
    echo ❌ Error: No se encontró la carpeta frontend
    pause
    exit /b 1
)

echo 📁 Carpeta frontend encontrada
echo.

echo 📋 INSTRUCCIONES PARA DESPLEGAR:
echo.
echo 1. 🔧 CONFIGURAR BACKEND:
echo    - Ejecuta: python backend/server.py
echo    - En otra terminal: ngrok http 8000
echo    - Copia la URL de ngrok (ej: https://abc123.ngrok.io)
echo.
echo 2. ✅ CONFIGURACIÓN ACTUALIZADA:
echo    - URL de ngrok: https://25b9768f4f67.ngrok-free.app
echo    - Archivo _redirects ya configurado
echo.
echo 3. 🌐 DESPLEGAR EN CLOUDFLARE:
echo    Opción A - Drag & Drop:
echo    - Ve a: https://dash.cloudflare.com
echo    - Pages → Upload assets
echo    - Arrastra la carpeta 'frontend'
echo.
echo    Opción B - Git (Recomendado):
echo    - Sube la carpeta frontend a GitHub
echo    - Conecta el repositorio con Cloudflare Pages
echo.
echo 📂 Carpetas disponibles para desplegar:
dir /b frontend
echo.

echo 💡 TIP: Usa la carpeta 'frontend' para Cloudflare Pages
echo      La carpeta 'backend/static' es para uso local

pause
