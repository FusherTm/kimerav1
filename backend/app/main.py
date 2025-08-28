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
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ERP API")

origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

@app.get("/healthz")
def healthz():
    return {"ok": True}

@app.get("/")
async def root():
    return {"message": "ERP API"}
