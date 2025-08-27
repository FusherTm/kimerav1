from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Type
from pydantic import BaseModel
from ..services.crud import CRUDService
from ..database import get_db
from ..dependencies import get_current_org


def get_crud_router(model: Type, read_schema: Type[BaseModel], create_schema: Type[BaseModel], prefix: str):
    router = APIRouter(prefix=prefix, tags=[prefix.strip('/')])
    service = CRUDService(model)

    @router.post('/', response_model=read_schema)
    def create_item(item_in: create_schema, db: Session = Depends(get_db), org=Depends(get_current_org)):
        return service.create(db, item_in, organization_id=org.id)

    @router.get('/', response_model=list[read_schema])
    def list_items(db: Session = Depends(get_db), org=Depends(get_current_org)):
        return service.list(db, organization_id=org.id)

    return router
