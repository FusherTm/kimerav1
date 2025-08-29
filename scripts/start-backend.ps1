param(
  [string]$HostIP = "0.0.0.0",
  [int]$Port = 8000
)

# Resolve repo root and prefer local venv python if available
$repoRoot = Resolve-Path "$PSScriptRoot/.."
$venvPython = Join-Path $repoRoot ".venv\\Scripts\\python.exe"
$pythonExe = if (Test-Path $venvPython) { $venvPython } else { "python" }

Push-Location "$PSScriptRoot/../backend"
try {
  if (-not $env:DATABASE_URL) {
    # Default to local Postgres exposed by docker compose (5432:5432)
    $env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/erp"
    Write-Host "DATABASE_URL not set. Using $env:DATABASE_URL" -ForegroundColor Yellow
  } else {
    Write-Host "Using DATABASE_URL from environment." -ForegroundColor Yellow
  }

  # Ensure required Python deps are installed (check a key import)
  & $pythonExe -c "import pydantic_settings, uvicorn" 2>$null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing backend dependencies (pip install -r requirements.txt)..." -ForegroundColor Yellow
    & $pythonExe -m pip install --upgrade pip | Out-Null
    & $pythonExe -m pip install -r requirements.txt
  }

  # Auto-run DB migrations in dev to avoid schema drift
  try {
    $env:DATABASE_URL = $env:DATABASE_URL  # ensure visible to child
    $checkOut = (& $pythonExe scripts\db_stamp_if_needed.py).Trim()
    if ($LASTEXITCODE -eq 10 -or $checkOut -eq 'NO_VERSION') {
      Write-Host "Alembic version tablosu yok. Stamping to 'indexes_20250828'..." -ForegroundColor Yellow
      & $pythonExe -m alembic stamp indexes_20250828
    }
    Write-Host "Applying DB migrations (alembic upgrade head)..." -ForegroundColor Yellow
    & $pythonExe -m alembic upgrade head | Out-Null
  } catch {
    Write-Host "Warning: Alembic stamp/upgrade failed or Alembic not installed. Continuing..." -ForegroundColor DarkYellow
  }

  Write-Host "Starting backend on http://$($HostIP):$Port ..." -ForegroundColor Cyan
  # Use explicit python to avoid PATH/env issues with uvicorn
  & $pythonExe -m uvicorn app.main:app --host $HostIP --port $Port --reload
}
finally {
  Pop-Location
}
