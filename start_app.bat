@echo off
TITLE HerWay Safety System

echo ===================================================
echo     STARTING HERWAY WOMEN SAFETY SYSTEM
echo ===================================================

:: Check if backend folder exists
if not exist "backend" (
    echo [ERROR] 'backend' folder not found!
    pause
    exit
)

:: Check if frontend folder exists
if not exist "frontend" (
    echo [ERROR] 'frontend' folder not found!
    pause
    exit
)

echo.
echo [1/2] Launching Backend (FastAPI)...
start "HerWay Backend" cmd /k "cd backend && python -m uvicorn main:app --reload --port 8000"

echo [2/2] Launching Frontend (Next.js)...
start "HerWay Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo     SYSTEM IS RUNNING
echo ===================================================
echo.
echo  - Frontend: http://localhost:3000
echo  - Backend:  http://localhost:8000
echo  - API Docs: http://localhost:8000/docs
echo.
echo Minimize this window (do not close it).
pause
