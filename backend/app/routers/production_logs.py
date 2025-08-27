from .. import models, schemas
from .common import get_crud_router
router = get_crud_router(models.ProductionLog, schemas.ProductionLogRead, schemas.ProductionLogCreate, "/production_logs")
