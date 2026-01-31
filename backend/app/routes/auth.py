from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.auth import SignupRequest, LoginRequest, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.db.mongodb import get_db
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup", response_model=TokenResponse)
async def user_signup(data: SignupRequest, db=Depends(get_db)):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    user = {
        "email": data.email,
        "password": hash_password(data.password),
        "name": data.name,
        "role": "user",
        "kyc_completed": False
    }

    await db.users.insert_one(user)

    token = create_access_token({
        "sub": data.email,
        "role": "user"
    })

    return {"access_token": token}


@router.post("/login", response_model=TokenResponse)
async def user_login(data: LoginRequest, db=Depends(get_db)):
    user = await db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    token = create_access_token({
        "sub": user["email"],
        "role": user["role"]
    })

    return {"access_token": token}

@router.post("/login/oauth", response_model=TokenResponse)
async def oauth_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db=Depends(get_db)
):
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    token = create_access_token({
        "sub": user["email"],
        "role": user["role"]
    })

    return {"access_token": token}