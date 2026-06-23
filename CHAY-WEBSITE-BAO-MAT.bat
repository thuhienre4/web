@echo off
title AloCoupon secure website server
cd /d "%~dp0"

set /p ADMIN_PASSWORD=Nhap mat khau admin: 
if "%ADMIN_PASSWORD%"=="" (
  echo Ban chua nhap mat khau.
  pause
  exit /b 1
)

node local-server.js
pause
