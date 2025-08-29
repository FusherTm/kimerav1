from decimal import Decimal
from fastapi.testclient import TestClient
from app import models
from sqlalchemy.orm import Session


def test_order_creates_financial_posting(client: TestClient, db: Session, auth_headers):
    # Create partner
    pr = client.post("/partners/", headers=auth_headers, json={
        "type": "CUSTOMER",
        "name": "Test Müşteri",
        "contact_person": None,
        "phone": None,
        "email": None,
        "address": None,
        "tax_number": None,
        "is_active": True,
    })
    assert pr.status_code == 200, pr.text
    partner_id = pr.json()["id"]

    # Create order directly as SIPARIS
    payload = {
        "partner_id": partner_id,
        "project_name": "Test Proje",
        "status": "SIPARIS",
        "items": [
            {"description": "Panel", "area_sqm": 2.5, "unit_price": 100}
        ],
    }
    orr = client.post("/orders/", headers=auth_headers, json=payload)
    assert orr.status_code == 200, orr.text
    order = orr.json()
    order_id = order["id"]
    grand_total = Decimal(str(order.get("grand_total") or "0"))
    assert grand_total == Decimal("250")

    # Check that a financial transaction is recorded
    tx = (
        db.query(models.FinancialTransaction)
        .filter(models.FinancialTransaction.order_id == order_id)
        .first()
    )
    assert tx is not None
    assert (tx.method or "").upper() == "ORDER"
    assert Decimal(str(tx.amount)) == grand_total


def test_partner_statement_balance(client: TestClient, db: Session, auth_headers):
    # Use any partner; list and pick the first
    lr = client.get("/partners/", headers=auth_headers)
    assert lr.status_code == 200
    items = lr.json()
    assert items, "At least one partner expected"
    pid = items[0]["id"]

    sr = client.get(f"/partners/{pid}/statement", headers=auth_headers)
    assert sr.status_code == 200, sr.text
    summary = sr.json()["summary"]
    # Balance should be postings - payments; since we didn't post payment, balance >= 0
    assert summary["balance"] >= 0

