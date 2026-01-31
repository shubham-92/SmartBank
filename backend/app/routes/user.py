from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.db.mongodb import get_db
from app.utils.pan_validator import is_valid_pan
from app.schemas.user import KYCRequest

router = APIRouter(prefix="/user", tags=["User"])

@router.post("/kyc")
async def submit_kyc(
    data: KYCRequest,
    user=Depends(get_current_user),
    db=Depends(get_db)
):
    if not is_valid_pan(data.pan_number):
        raise HTTPException(status_code=400, detail="Invalid PAN format")

    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "pan_number": data.pan_number,
                "address": data.address,
                "phone": data.phone,
                "pan_verified": True,
                "kyc_completed": True
            }
        }
    )

    return {
        "message": "KYC completed successfully (OCR disabled)"
    }

@router.get("/dashboard")
async def get_dashboard(
    user=Depends(get_current_user),
    db=Depends(get_db)
):
    # Fetch user
    db_user = await db.users.find_one({"_id": user["_id"]})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch account (assuming 1 account per user for now)
    account = await db.accounts.find_one({"user_id": user["_id"]})

    if not account:
        return {
            "name": db_user.get("name"),
            "email": db_user.get("email"),
            "kyc_completed": db_user.get("kyc_completed", False),
            "account": None
        }

    return {
        "name": db_user.get("name"),
        "email": db_user.get("email"),
        "kyc_completed": db_user.get("kyc_completed", False),
        "account": {
            "account_number": account["account_number"],
            "account_type": account["account_type"],
            "balance": account["balance"],
            "daily_limit": account["daily_limit"],
            "is_active": account["is_active"]
        }
    }
