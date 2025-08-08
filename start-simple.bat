@echo off
title FastGPT Backend Launcher
echo.
echo ================================
echo   FastGPT Backend Launcher
echo ================================
echo.

echo Verificando Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python no encontrado. Instala Python desde https://python.org
    pause
    exit /b
)
echo OK: Python encontrado

echo.
echo Verificando Ollama...
ollama --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Ollama no encontrado. Descarga desde https://ollama.ai
    pause
    exit /b
)
echo OK: Ollama encontrado

echo.
echo Iniciando Ollama si no esta activo...
curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo Iniciando Ollama...
    start /B ollama serve
    echo Esperando 10 segundos...
    timeout /t 10 /nobreak >nul
) else (
    echo OK: Ollama ya esta ejecutandose
)

echo.
echo Obteniendo IP local...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        set LOCAL_IP=%%b
        goto ip_found
    )
)
:ip_found
echo Tu IP local es: %LOCAL_IP%

echo.
echo Iniciando servidor FastGPT...
echo Cambiando a directorio backend...
cd /d "%~dp0backend"

if not exist "server.py" (
    echo ERROR: server.py no encontrado en %cd%
    pause
    exit /b
)

echo.
echo ====================================
echo URLs de acceso:
echo   Local: http://localhost:8000
echo   Red WiFi: http://%LOCAL_IP%:8000
echo ====================================
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

python server.py

echo.
echo Servidor detenido. Presiona cualquier tecla para salir.
pause
