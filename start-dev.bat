@echo off
if not exist P:\ subst P: "%~dp0."
if not exist P:\backend (
  echo Failed to map P: drive to this folder.
  echo If P: is already used by another drive, free it and try again.
  pause
  exit /b 1
)
echo Starting Clarijewel dev environment...

if exist "C:\xampp\mysql_start.bat" (
  start "MySQL" "C:\xampp\mysql_start.bat"
  timeout /t 3 /nobreak > nul
) else (
  echo [WARN] C:\xampp\mysql_start.bat not found. Start MySQL manually.
)

start "Laravel Backend" cmd /k "cd /d P:\backend && php artisan serve --port=8001"
start "Next.js Frontend" cmd /k "cd /d P:\frontend && npm run dev"

where stripe > nul 2> nul
if errorlevel 1 (
  echo [WARN] Stripe CLI not found in PATH. Payments will not be confirmed. See README.md.
) else (
  start "Stripe Webhook" cmd /k "stripe listen --forward-to localhost:8001/api/stripe/webhook"
)

start "Laravel Scheduler" cmd /k "cd /d P:\backend && php artisan schedule:work"

echo.
echo Started. Keep all windows open.
echo Open http://localhost:3000 in your browser.
pause
