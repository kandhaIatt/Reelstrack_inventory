@echo off
echo ===================================================
echo     Starting ReelTrack Full-Stack Application
echo ===================================================
echo.

echo Starting Spring Boot Backend (Port 8080)...
start "ReelTrack Backend" cmd /k "cd backend && mvnw.cmd spring-boot:run"

echo Starting React Frontend (Port 5173)...
start "ReelTrack Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Application starting!
echo Backend API: http://localhost:8080/api
echo Frontend App: http://localhost:5173
echo.
echo Default Credentials:
echo Admin: admin / password123
echo Operator: operator / password123
echo ===================================================
pause
