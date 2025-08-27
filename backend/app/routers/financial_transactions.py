from .. import models, schemas
from .common import get_crud_router
router = get_crud_router(models.FinancialTransaction, schemas.FinancialTransactionRead, schemas.FinancialTransactionCreate, "/financial_transactions")
