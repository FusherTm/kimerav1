# Launch backend and frontend in separate PowerShell windows

$root = Resolve-Path "$PSScriptRoot/.."

Write-Host "Launching backend window..." -ForegroundColor Green
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location `"$root`"; `"$root\scripts\start-backend.ps1`""
)

Start-Sleep -Seconds 1

Write-Host "Launching frontend window..." -ForegroundColor Green
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location `"$root`"; `"$root\scripts\start-frontend.ps1`""
)

Write-Host "Both windows started. Open http://localhost:3000 on this PC, or http://<SUNUCU-IP>:3000 from another PC." -ForegroundColor Cyan

