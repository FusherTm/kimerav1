from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import schemas
from ..auth import register_user, login_for_access_token
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post('/register', response_model=schemas.UserRead)
async def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    return await register_user(user_in, db)

@router.post('/token')
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    return await login_for_access_token(form_data, db)
