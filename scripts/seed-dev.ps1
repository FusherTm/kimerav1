param(
  [string]$DatabaseUrl = "postgresql://postgres:postgres@localhost:5432/erp"
)

$repoRoot = Resolve-Path "$PSScriptRoot/.."
$venvPython = Join-Path $repoRoot ".venv\Scripts\python.exe"
$pythonExe = if (Test-Path $venvPython) { $venvPython } else { "python" }

Push-Location "$repoRoot"
try {
  $env:DATABASE_URL = $DatabaseUrl
  Write-Host "Seeding admin user to $DatabaseUrl ..." -ForegroundColor Yellow
  & $pythonExe backend\seed_admin.py
}
finally {
  Pop-Location
}

