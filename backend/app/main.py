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
from .api import production, dashboard, assets, me
from .routers import invoices, roles, org_users, tenants, personnel
from app.api.admin import router as admin_router
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
from .config import settings
from .routers import supplier_prices
from .routers import connections
from .database import Base, engine

app = FastAPI(title="ERP API")

origins_env = os.getenv("ALLOW_ORIGINS")
if origins_env:
    origins = [o.strip() for o in origins_env.split(",") if o.strip()]
    allow_credentials = False if "*" in origins else True
else:
    # Default to permissive CORS for development across devices on LAN.
    # When using wildcard origin, credentials must be disabled per spec.
    origins = ["*"]
    allow_credentials = False
    logging.getLogger(__name__).warning(
        "CORS is set to '*' (development). Set ALLOW_ORIGINS env for production."
    )

# Warn if SECRET_KEY is using a weak default
if settings.SECRET_KEY in (None, "", "supersecret"):
    logging.getLogger(__name__).warning(
        "SECRET_KEY is not set securely. Set SECRET_KEY env in production."
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    # In dev, be permissive to avoid preflight/header mismatches hiding errors in the browser
    allow_headers=["*"],
)


@app.on_event("startup")
def ensure_tables():
    try:
        # Ensure new tables (e.g., connections) exist in dev environments
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        logging.getLogger(__name__).warning(f"create_all failed: {e}")

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
app.include_router(assets.router)
app.include_router(invoices.router)
app.include_router(roles.router)
app.include_router(org_users.router)
app.include_router(me.router)
app.include_router(tenants.router)
app.include_router(personnel.router)
app.include_router(supplier_prices.router)
app.include_router(connections.router)

@app.get("/healthz")
def healthz():
    return {"ok": True}

@app.get("/")
async def root():
    return {"message": "ERP API"}
