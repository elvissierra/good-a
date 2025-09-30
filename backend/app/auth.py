from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import HTTPException, status, Depends, APIRouter
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from passlib.hash import bcrypt

from backend.settings import settings
from .dependacies import get_db
from . import models
from .schemas import TokenPair

ALGO = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def create_tokens(user_id: int):
    now = datetime.utcnow()
    access = jwt.encode(
        {"sub": user_id, "exp": now + timedelta(minutes=settings.ACCESS_TTL_MIN)},
        settings.SECRET, algorithm=ALGO
    )
    refresh = jwt.encode(
        {"sub": user_id, "exp": now + timedelta(days=settings.REFRESH_TTL_DAYS), "typ": "refresh"},
        settings.SECRET, algorithm=ALGO
    )
    return access, refresh

def verify_access_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, settings.SECRET, algorithms=[ALGO])
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

def get_current_user_id(token: dict = Depends(verify_access_token)) -> int:
    return int(token["sub"])

auth_router = APIRouter(prefix="/auth", tags=["auth"])

# JSON body for auth endpoints
class AuthIn(BaseModel):
    email: EmailStr
    password: str

@auth_router.post("/register", response_model=TokenPair)
def register(payload: AuthIn, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(email=payload.email, password_hash=bcrypt.hash(payload.password))
    db.add(user); db.commit(); db.refresh(user)
    access, refresh = create_tokens(user.id)
    return TokenPair(access_token=access, refresh_token=refresh)

@auth_router.post("/login", response_model=TokenPair)
def login(payload: AuthIn, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not bcrypt.verify(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access, refresh = create_tokens(user.id)
    return TokenPair(access_token=access, refresh_token=refresh)

@auth_router.post("/refresh", response_model=TokenPair)
def refresh_token(refresh_token: str):
    try:
        payload = jwt.decode(refresh_token, settings.SECRET, algorithms=[ALGO])
        if payload.get("typ") != "refresh":
            raise JWTError("Not a refresh token")
        user_id = payload["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    access, new_refresh = create_tokens(int(user_id))
    return TokenPair(access_token=access, refresh_token=new_refresh)