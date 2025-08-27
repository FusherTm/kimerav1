import subprocess
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/run-migrations", status_code=200)
def run_migrations():
    """
    Runs the Alembic migration commands programmatically from within the app.
    """
    try:
        # Adım 1: Revision (Fotoğraf Çekme)
        # Not: --autogenerate interaktif olduğu için, burada önce boş bir revision oluşturup sonra upgrade etmek daha güvenli olabilir.
        # Şimdilik direkt upgrade'i deneyelim. Genellikle iskelet için yeterlidir.
        # subprocess.run(["alembic", "revision", "--autogenerate", "-m", "Initial schema"], check=True, cwd="/app/backend")

        # Adım 2: Upgrade (İnşaat)
        result = subprocess.run(
            ["alembic", "upgrade", "head"],
            check=True,
            capture_output=True,
            text=True,
            cwd="/app/backend" # Komutu backend klasöründen çalıştır
        )
        return {"status": "success", "output": result.stdout}

    except subprocess.CalledProcessError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Migration failed: {e.stderr}"
        )
    except FileNotFoundError:
         raise HTTPException(
            status_code=500,
            detail="Alembic command not found. Is it installed in the container?"
        )
