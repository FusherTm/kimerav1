param(
  [string]$Host = "localhost",
  [int]$Port = 5432,
  [string]$User = "postgres",
  [string]$Password = "postgres",
  [string]$Database = "erp"
)

$repoRoot = Resolve-Path "$PSScriptRoot/.."
$venvPython = Join-Path $repoRoot ".venv\Scripts\python.exe"
$pythonExe = if (Test-Path $venvPython) { $venvPython } else { "python" }

$py = @"
import os, psycopg2
conn = psycopg2.connect(dbname='postgres', user=os.environ['PGUSER'], password=os.environ['PGPASSWORD'], host=os.environ['PGHOST'], port=int(os.environ['PGPORT']))
conn.autocommit = True
cur = conn.cursor()
try:
    cur.execute(f"CREATE DATABASE {os.environ['PGDB']}")
    print('Created database:', os.environ['PGDB'])
except Exception as e:
    print('Info:', e)
finally:
    cur.close()
    conn.close()
"@

$env:PGHOST = $Host
$env:PGPORT = $Port
$env:PGUSER = $User
$env:PGPASSWORD = $Password
$env:PGDB = $Database

& $pythonExe -c $py

