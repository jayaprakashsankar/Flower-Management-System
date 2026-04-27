@echo off
echo =======================================
echo  FloraChain — Starting All Servers
echo =======================================

REM Start Django API server on port 8000
echo Starting Django API on http://localhost:8000 ...
start "FloraChain API" cmd /k "cd /d "%~dp0backend" && python manage.py runserver 8000"

REM Start frontend static server on port 8765
echo Starting Frontend on http://localhost:8765 ...
start "FloraChain Frontend" cmd /k "cd /d "%~dp0" && python -m http.server 8765"

ping 127.0.0.1 -n 4 > nul
echo.
echo =======================================
echo  Frontend:  http://localhost:8765
echo  API:       http://localhost:8000/api/
echo  Admin:     http://localhost:8000/admin/
echo =======================================
start http://localhost:8765
