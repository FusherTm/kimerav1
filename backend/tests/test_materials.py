from fastapi.testclient import TestClient


def test_materials_crud_minimal(client: TestClient, auth_headers):
    # Create
    r = client.post("/materials/", headers=auth_headers, json={
        "name": "Alüminyum",
        "sku": "ALU-001",
        "stock_quantity": 10,
        "unit": "KG",
    })
    assert r.status_code == 200, r.text
    mat = r.json()
    assert mat["name"] == "Alüminyum"

    # List
    r2 = client.get("/materials/", headers=auth_headers)
    assert r2.status_code == 200
    items = r2.json()
    assert any(m["id"] == mat["id"] for m in items)

