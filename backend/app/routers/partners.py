from .. import models, schemas
from .common import get_crud_router
router = get_crud_router(models.Partner, schemas.PartnerRead, schemas.PartnerCreate, "/partners")
