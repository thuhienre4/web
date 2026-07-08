@echo off
title Web local server - C:\Web
cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel%==0 (
  set /p ADMIN_PASSWORD=Nhap mat khau admin: 
  if "%ADMIN_PASSWORD%"=="" (
    echo Ban chua nhap mat khau.
    pause
    exit /b 1
  )
  node local-server.js
  pause
  exit /b
)

echo Node.js was not found. Trying Python...
echo.

where py >nul 2>nul
if %errorlevel%==0 (
  start "" "http://127.0.0.1:3000/index.html"
  py -m http.server 3000 --bind 127.0.0.1
  pause
  exit /b
)

where python >nul 2>nul
if %errorlevel%==0 (
  start "" "http://127.0.0.1:3000/index.html"
  python -m http.server 3000 --bind 127.0.0.1
  pause
  exit /b
)

echo Python is not installed or not available in PATH.
echo Install Python, then run this file again.
pause
