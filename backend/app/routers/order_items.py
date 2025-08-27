from .. import models, schemas
from .common import get_crud_router
router = get_crud_router(models.OrderItem, schemas.OrderItemRead, schemas.OrderItemCreate, "/order_items")
