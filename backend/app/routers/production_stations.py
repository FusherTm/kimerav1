from .. import models, schemas
from .common import get_crud_router
router = get_crud_router(models.ProductionStation, schemas.ProductionStationRead, schemas.ProductionStationCreate, "/production_stations")
