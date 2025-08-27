from typing import Type, TypeVar, Generic, List
from sqlalchemy.orm import Session
from pydantic import BaseModel

ModelType = TypeVar('ModelType')
CreateSchemaType = TypeVar('CreateSchemaType', bound=BaseModel)

class CRUDService(Generic[ModelType, CreateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def create(self, db: Session, obj_in: CreateSchemaType, organization_id):
        obj = self.model(**obj_in.dict(), organization_id=organization_id)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    def list(self, db: Session, organization_id) -> List[ModelType]:
        return db.query(self.model).filter(self.model.organization_id == organization_id).all()
