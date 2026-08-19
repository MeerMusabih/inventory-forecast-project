@echo off
title Inventory Forecast - Setup
echo.
echo ============================================
echo   Inventory Forecast ^& Predictive Analytics
echo   Setup Script
echo ============================================
echo.

:: Check Python
echo Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed.
    echo Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)
python --version
echo [OK] Python found.

:: Check Node.js
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed.
    echo Download from: https://nodejs.org/ (LTS version)
    pause
    exit /b 1
)
node --version
echo [OK] Node.js found.
echo.

:: Install Python packages
echo Installing Python packages...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Python packages.
    pause
    exit /b 1
)
cd ..
echo [OK] Python packages installed.

:: Generate backend data
echo Generating backend data...
cd backend
python data/generator.py
cd ..
echo [OK] Backend data generated.

:: Install npm packages
echo Installing Node.js packages...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Node.js packages.
    pause
    exit /b 1
)
echo [OK] Node.js packages installed.

:: Generate frontend data
echo Generating frontend data...
node scripts/generate-static-data.mjs
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate frontend data.
    pause
    exit /b 1
)
echo [OK] Frontend data generated.

:: Build frontend
echo Building frontend...
call npx vite build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build frontend.
    pause
    exit /b 1
)
echo [OK] Frontend built.

echo.
echo ============================================
echo   Setup Complete!
echo   Run start.bat to launch the app.
echo ============================================
pause
