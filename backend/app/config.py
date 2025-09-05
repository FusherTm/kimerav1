import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Asenkron bağlantı için (SQLAlchemy + asyncpg)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://erp_admin:StrongPasswordAdmin123@c_postgre_sql:5432/erp_db"
    )

    # Eğer sync bağlantıya da ihtiyaç olursa (örn. alembic migration için):
    DATABASE_URL_SYNC: str = os.getenv(
        "DATABASE_URL_SYNC",
        "postgresql+psycopg2://erp_admin:StrongPasswordAdmin123@c_postgre_sql:5432/erp_db"
    )

    SECRET_KEY: str = os.getenv("SECRET_KEY", "StrongPasswordAdmin123")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

settings = Settings()
