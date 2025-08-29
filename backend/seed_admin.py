import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
import app.models as models
from app.auth import get_password_hash


DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        org = db.query(models.Organization).filter_by(slug="default-org").first()
        if not org:
            org = models.Organization(name="Default Org", slug="default-org")
            db.add(org)
            db.flush()

        user = db.query(models.User).filter_by(email="admin@example.com").first()
        if not user:
            user = models.User(
                email="admin@example.com",
                hashed_password=get_password_hash("admin"),
                is_active=True,
            )
            db.add(user)
            db.flush()
        else:
            # Ensure password is hashed in case of previous plain-text seed
            if not user.hashed_password or not user.hashed_password.startswith("$2b$"):
                user.hashed_password = get_password_hash("admin")

        # Ensure role exists with broad permissions
        role = db.query(models.Role).filter_by(name="admin").first()
        admin_perms = {
            "partner:create": True,
            "partner:update": True,
            "partner:delete": True,
            "product:create": True,
            "product:update": True,
            "product:delete": True,
            "category:create": True,
            "category:update": True,
            "category:delete": True,
            "order:create": True,
            "order:update": True,
            "admin:view": True,
            "admin:update": True,
            "admin:assign": True,
            "personnel:view": True,
            "personnel:create": True,
            "personnel:update": True,
            "personnel:delete": True,
        }
        if not role:
            role = models.Role(name="admin", permissions=admin_perms)
            db.add(role)
        else:
            # Merge to ensure required admin permissions are present
            perms = role.permissions or {}
            perms.update(admin_perms)
            role.permissions = perms
            db.add(role)

        # Ensure membership exists
        membership = (
            db.query(models.UserOrganization)
            .filter_by(user_id=user.id, org_id=org.id)
            .first()
        )
        if not membership:
            membership = models.UserOrganization(user_id=user.id, org_id=org.id, role="admin")
            db.add(membership)

        # Ensure a generic 'Muhtelif Müşteri' partner exists for this org
        misc = (
            db.query(models.Partner)
            .filter_by(organization_id=org.id, name="Muhtelif Müşteri")
            .first()
        )
        if not misc:
            misc = models.Partner(
                organization_id=org.id,
                type=models.PartnerType.CUSTOMER,
                name="Muhtelif Müşteri",
                is_active=True,
            )
            db.add(misc)

        db.commit()
        print("Seed OK: admin@example.com / admin (org: default-org)")
    finally:
        db.close()


if __name__ == "__main__":
    main()

