import os
import pytest
from fastapi.testclient import TestClient

# Ensure test database before app import
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")

from app.main import app  # noqa: E402
from app.database import Base, engine, SessionLocal  # noqa: E402
from app import models  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture()
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client():
    return TestClient(app)


@pytest.fixture()
def org(db):
    org = models.Organization(name="Test Org", slug="test")
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


@pytest.fixture()
def auth_headers(client: TestClient, db, org: models.Organization):
    email = "admin@example.com"
    password = "secret123"
    # Register user via API
    r = client.post("/auth/register", json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    user_id = r.json()["id"]
    # Add membership as admin directly in DB
    ou = models.UserOrganization(user_id=user_id, org_id=org.id, role="admin")
    db.add(ou)
    db.commit()
    # Get token
    r2 = client.post("/auth/token", data={"username": email, "password": password})
    assert r2.status_code == 200, r2.text
    token = r2.json()["access_token"]
    return {"Authorization": f"Bearer {token}", "X-Org-Slug": org.slug}

