from fastapi import FastAPI
from .routers import (
    auth,
    organizations,
    partners,
    categories,
    products,
    materials,
    orders,
    order_items,
    purchase_orders,
    purchase_order_items,
    production_stations,
    production_jobs,
    production_logs,
    accounts,
    financial_transactions,
)
from .api import production, dashboard
from app.api import admin as admin_router
from fastapi.middleware.cors import CORSMiddlewareb

app = FastAPI(title="ERP API")

# CORS (Cross-Origin Resource Sharing) Ayarları
# Bu bölüm, frontend'in (localhost:3000) backend'e (localhost:8000)
# güvenli bir şekilde istek atabilmesini sağlar.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend'in adresine izin veriyoruz
    allow_credentials=True,
    allow_methods=["*"],  # Tüm metodlara (GET, POST, vb.) izin ver
    allow_headers=["*"],  # Tüm başlıklara izin ver
)

app.include_router(auth.router)
app.include_router(organizations.router)
app.include_router(partners.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(materials.router)
app.include_router(orders.router)
app.include_router(order_items.router)
app.include_router(purchase_orders.router)
app.include_router(purchase_order_items.router)
app.include_router(production_stations.router)
app.include_router(production_jobs.router)
app.include_router(production_logs.router)
app.include_router(accounts.router)
app.include_router(financial_transactions.router)
app.include_router(production.router)
app.include_router(dashboard.router)
app.include_router(admin_router)

@app.get("/")
async def root():
    return {"message": "ERP API"}
