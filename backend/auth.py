from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
from models import User, generate_uuid
import os

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-please-change-in-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

mongo_url = os.environ.get("MONGO_URL")
_client = AsyncIOMotorClient(mongo_url)
db = _client[os.environ.get("DB_NAME", "test_database")]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token", auto_error=False)

router = APIRouter(prefix="/api/auth", tags=["auth"])


# ---- Pydantic schemas ----

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    avatar: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# ---- Helpers ----

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": user_id, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    doc = await db.users.find_one({"id": user_id})
    if not doc:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**doc)


# Optional dependency — returns None if no token present (for public read routes)
async def get_optional_user(token: str = Depends(oauth2_scheme)) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            return None
        doc = await db.users.find_one({"id": user_id})
        return User(**doc) if doc else None
    except JWTError:
        return None


# ---- Routes ----

@router.post("/register", response_model=TokenResponse)
async def register(data: RegisterRequest):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = generate_uuid()
    avatar = data.avatar or f"https://api.dicebear.com/7.x/avataaars/svg?seed={data.name.replace(' ', '')}"
    user_doc = {
        "id": user_id,
        "name": data.name,
        "email": data.email,
        "avatar": avatar,
        "is_ai": False,
        "password_hash": hash_password(data.password),
        "created_at": datetime.utcnow(),
    }
    await db.users.insert_one(user_doc)

    token = create_access_token(user_id)
    user = User(**user_doc)
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "name": user.name, "email": user.email, "avatar": user.avatar, "isAI": user.is_ai},
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    doc = await db.users.find_one({"email": data.email})
    if not doc or not verify_password(data.password, doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(doc["id"])
    user = User(**doc)
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "name": user.name, "email": user.email, "avatar": user.avatar, "isAI": user.is_ai},
    )


# OAuth2 form-based token endpoint (used by OpenAPI /docs)
@router.post("/token")
async def token_form(form: OAuth2PasswordRequestForm = Depends()):
    doc = await db.users.find_one({"email": form.username})
    if not doc or not verify_password(form.password, doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": create_access_token(doc["id"]), "token_type": "bearer"}


@router.get("/me", response_model=dict)
async def me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "avatar": current_user.avatar,
        "isAI": current_user.is_ai,
    }
