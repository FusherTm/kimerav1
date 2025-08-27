from .. import models, schemas
from .common import get_crud_router
router = get_crud_router(models.PurchaseOrder, schemas.PurchaseOrderRead, schemas.PurchaseOrderCreate, "/purchase_orders")
