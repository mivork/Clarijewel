@echo off
if not exist P:\ subst P: "%~dp0."
if not exist P:\backend (
  echo Failed to map P: drive to this folder.
  pause
  exit /b 1
)
echo Starting Clarijewel dev environment...

start "MySQL" "C:\xampp\mysql_start.bat"
timeout /t 3 /nobreak > nul

start "Laravel Backend" cmd /k "cd /d P:\backend && php artisan serve --port=8001"
start "Next.js Frontend" cmd /k "cd /d P:\frontend && npm run dev"
start "Stripe Webhook" cmd /k ""C:\Users\yugo1\AppData\Local\Microsoft\WinGet\Packages\Stripe.StripeCli_Microsoft.Winget.Source_8wekyb3d8bbwe\stripe.exe" listen --forward-to localhost:8001/api/stripe/webhook"
start "Laravel Scheduler" cmd /k "cd /d P:\backend && php artisan schedule:work"

echo.
echo Started. Keep all windows open.
echo Open http://localhost:3000 in your browser.
