@echo off
title FastGPT Launcher
echo.
echo =============================
echo      FastGPT Launcher
echo =============================
echo.

echo Iniciando FastGPT...
echo Ejecutando script desde backend...

REM Cambiar al directorio del script de backend
cd /d "%~dp0backend\scripts"

REM Ejecutar el script de inicio simple
call start-simple.bat

pause
