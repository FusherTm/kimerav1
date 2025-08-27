from .. import models, schemas
from .common import get_crud_router
router = get_crud_router(models.ProductionJob, schemas.ProductionJobRead, schemas.ProductionJobCreate, "/production_jobs")
