from fastapi import APIRouter, Depends, HTTPException
from app.schemas.account import AccountCreateRequest, AccountResponse
from app.core.dependencies import get_current_user
from app.db.mongodb import get_db
from app.services.account_service import create_account

router = APIRouter(prefix="/account", tags=["Account"])

@router.post("/create", response_model=AccountResponse)
async def create_new_account(
    data: AccountCreateRequest,
    user=Depends(get_current_user),
    db=Depends(get_db)
):
    if user["role"] != "user":
        raise HTTPException(status_code=403, detail="Only users can create accounts")

    account = await create_account(
        db=db,
        user_id=user["_id"],
        account_type=data.account_type
    )

    return {
        "account_number": account["account_number"],
        "account_type": account["account_type"],
        "balance": account["balance"],
        "daily_limit": account["daily_limit"],
        "is_active": account["is_active"]
    }
