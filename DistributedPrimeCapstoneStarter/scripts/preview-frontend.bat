@echo off
cd /d "%~dp0..\frontend"
where node >nul 2>nul || (echo Install Node.js first: https://nodejs.org/ & pause & exit /b 1)
if not exist node_modules call npm install
call npm run dev -- --host 0.0.0.0
pause
