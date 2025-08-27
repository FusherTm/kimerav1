# alembic/env.py

import os
import sys
from pathlib import Path
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# ---- Proje kökünü PYTHONPATH'e ekle (/app) ----
sys.path.append(str(Path(__file__).resolve().parents[1]))

# ---- App importları (Base + modeller metadata'ya yüklensin) ----
from app.database import Base           # sende Base burada
import app.models                       # modelleri yükle (autogenerate için şart)
target_metadata = Base.metadata

# ---- Alembic config ----
config = context.config

# Logging config (alembic.ini'den)
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ---- DATABASE_URL'i alembic'e enjekte et (kritik kısım) ----
db_url = os.getenv("DATABASE_URL")
if not db_url:
    raise RuntimeError(
        "DATABASE_URL env var set edilmemiş. "
        "Compose/Dockerfile'da environment olarak ver ya da alembic.ini'de sqlalchemy.url'i düz yaz."
    )
# ini'deki %(DATABASE_URL)s yerine gerçek URL'yi yaz
config.set_main_option("sqlalchemy.url", db_url)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
