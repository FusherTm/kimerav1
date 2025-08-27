from .. import models, schemas
from .common import get_crud_router
router = get_crud_router(models.PurchaseOrderItem, schemas.PurchaseOrderItemRead, schemas.PurchaseOrderItemCreate, "/purchase_order_items")
