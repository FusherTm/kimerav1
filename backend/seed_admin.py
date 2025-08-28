import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
import app.models as models


DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        org = db.query(models.Organization).filter_by(name="Default Org").first()
        if not org:
            org = models.Organization(name="Default Org")
            db.add(org)
            db.flush()
        user = db.query(models.User).filter_by(email="admin@example.com").first()
        if not user:
            # WARNING: dev only, password stored in plain text
            user = models.User(
                email="admin@example.com",
                hashed_password="admin",
                is_active=True,
            )
            db.add(user)
        db.commit()
        print("Seed OK: admin@example.com / admin")
    finally:
        db.close()


if __name__ == "__main__":
    main()

