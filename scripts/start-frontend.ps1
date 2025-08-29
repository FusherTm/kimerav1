param(
  [int]$Port = 3000
)

Push-Location "$PSScriptRoot/../frontend"
try {
  if (-not (Test-Path node_modules)) {
    Write-Host "Installing frontend dependencies (npm install)..." -ForegroundColor Yellow
    npm install
  }
  Write-Host "Starting frontend on http://0.0.0.0:$Port ..." -ForegroundColor Cyan
  npx next dev --hostname 0.0.0.0 --port $Port
}
finally {
  Pop-Location
}

