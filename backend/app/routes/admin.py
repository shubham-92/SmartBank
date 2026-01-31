from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.schemas.admin import AdminSignupRequest
from app.schemas.auth import LoginRequest, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.core.config import settings
from app.core.dependencies import is_admin
from app.db.mongodb import get_db

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.post("/signup", response_model=TokenResponse)
async def admin_signup(data: AdminSignupRequest, db=Depends(get_db)):
    if data.bank_secret != settings.BANK_ADMIN_SECRET:
        raise HTTPException(
            status_code=403,
            detail="Invalid bank secret"
        )

    existing = await db.admins.find_one({"email": data.email})
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Admin already exists"
        )

    admin = {
        "email": data.email,
        "password": hash_password(data.password),
        "name": data.name,
        "role": "admin"
    }

    result = await db.admins.insert_one(admin)

    token = create_access_token({
        "sub": str(result.inserted_id),
        "role": "admin"
    })

    return {"access_token": token}


@router.post("/login", response_model=TokenResponse)
async def admin_login(data: LoginRequest, db=Depends(get_db)):
    admin = await db.admins.find_one({"email": data.email})
    if not admin or not verify_password(data.password, admin["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    token = create_access_token({
        "sub": str(admin["_id"]),
        "role": "admin"
    })

    return {"access_token": token}
@router.get("/search")
async def search_user(
    query: str,
    admin=Depends(is_admin),
    db=Depends(get_db)
):
    # Search by account number
    account = await db.accounts.find_one({"account_number": query})

    if account:
        user = await db.users.find_one({"_id": account["user_id"]})
        return {
            "name": user["name"],
            "email": user["email"],
            "account_number": account["account_number"],
            "account_type": account["account_type"],
            "balance": account["balance"],
            "daily_limit": account["daily_limit"],
            "is_active": account["is_active"]
        }

    # Search by user name
    cursor = db.users.find({"name": {"$regex": query, "$options": "i"}})
    results = []

    async for user in cursor:
        acc = await db.accounts.find_one({"user_id": user["_id"]})
        if acc:
            results.append({
                "name": user["name"],
                "email": user["email"],
                "account_number": acc["account_number"],
                "account_type": acc["account_type"],
                "balance": acc["balance"],
                "daily_limit": acc["daily_limit"],
                "is_active": acc["is_active"]
            })

    if not results:
        raise HTTPException(status_code=404, detail="No records found")

    return results

@router.get("/user/{account_number}")
async def view_user(
    account_number: str,
    admin=Depends(is_admin),
    db=Depends(get_db)
):
    account = await db.accounts.find_one({"account_number": account_number})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    user = await db.users.find_one({"_id": account["user_id"]})

    cursor = db.transactions.find({
        "$or": [
            {"from_account": account_number},
            {"to_account": account_number}
        ]
    }).sort("timestamp", -1)

    transactions = []
    async for tx in cursor:
        transactions.append({
            "from_account": tx["from_account"],
            "to_account": tx["to_account"],
            "amount": tx["amount"],
            "time": tx["timestamp"]
        })

    return {
        "name": user["name"],
        "email": user["email"],
        "phone": user.get("phone"),
        "address": user.get("address"),
        "pan_number": user.get("pan_number"),
        "account": {
            "account_number": account["account_number"],
            "account_type": account["account_type"],
            "balance": account["balance"],
            "daily_limit": account["daily_limit"],
            "is_active": account["is_active"]
        },
        "transactions": transactions
    }

@router.delete("/account/{account_number}")
async def delete_account(
    account_number: str,
    admin=Depends(is_admin),
    db=Depends(get_db)
):
    result = await db.accounts.update_one(
        {"account_number": account_number},
        {"$set": {"is_active": False}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Account not found")

    return {"message": "Account deactivated successfully"}
class UpdateLimitRequest(BaseModel):
    account_number: str
    new_limit: float


@router.patch("/account/limit")
async def update_limit(
    data: UpdateLimitRequest,
    admin=Depends(is_admin),
    db=Depends(get_db)
):
    result = await db.accounts.update_one(
        {"account_number": data.account_number},
        {"$set": {"daily_limit": data.new_limit}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Account not found")

    return {"message": "Daily limit updated"}
