@echo off
title Varanasi Tour & Travel Server
echo ========================================================
echo   Starting Varanasi Tour & Travel Website Server...
echo.
echo   Public Website:  http://localhost:3000
echo   Admin Portal:    http://localhost:3000/admin/login
echo ========================================================
echo.
cd /d "%~dp0"
node server.js
pause