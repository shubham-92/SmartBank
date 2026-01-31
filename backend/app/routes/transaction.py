from fastapi import APIRouter, Depends, HTTPException
from app.schemas.transaction import TransferRequest
from app.core.dependencies import get_current_user, is_admin
from app.db.mongodb import get_db
from app.services.transaction_service import transfer_money

router = APIRouter(prefix="/transaction", tags=["Transaction"])


# ===================== USER TRANSFER =====================
@router.post("/transfer")
async def transfer(
    data: TransferRequest,
    user=Depends(get_current_user),
    db=Depends(get_db)
):
    if user["role"] != "user":
        raise HTTPException(status_code=403, detail="Only users can transfer")

    tx = await transfer_money(
        db=db,
        sender=user,
        to_account_number=data.to_account_number,
        amount=data.amount
    )

    return {
        "message": "Transfer successful",
        "transaction_id": str(tx["_id"])
    }


# ===================== USER TRANSACTION HISTORY =====================
@router.get("/history")
async def user_history(
    user=Depends(get_current_user),
    db=Depends(get_db)
):
    account = await db.accounts.find_one({"user_id": user["_id"]})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    cursor = db.transactions.find({
        "$or": [
            {"from_account": account["account_number"]},
            {"to_account": account["account_number"]}
        ]
    }).sort("timestamp", -1)

    history = []

    async for tx in cursor:
        if tx["from_account"] == account["account_number"]:
            # DEBIT
            receiver = await db.accounts.find_one(
                {"account_number": tx["to_account"]}
            )
            receiver_user = (
                await db.users.find_one({"_id": receiver["user_id"]})
                if receiver else None
            )

            history.append({
                "name": receiver_user["name"] if receiver_user else "Unknown",
                "account_number": tx["to_account"],
                "amount": tx["amount"],
                "type": "debit",
                "time": tx["timestamp"]
            })
        else:
            # CREDIT
            history.append({
                "name": "Self",
                "account_number": account["account_number"],
                "amount": tx["amount"],
                "type": "credit",
                "time": tx["timestamp"]
            })

    return history


# ===================== ADMIN TRANSACTION HISTORY =====================
@router.get("/history/admin")
async def admin_history(
    admin=Depends(is_admin),
    db=Depends(get_db)
):
    cursor = db.transactions.find().sort("timestamp", -1)
    history = []

    async for tx in cursor:
        from_acc = await db.accounts.find_one(
            {"account_number": tx["from_account"]}
        )
        to_acc = await db.accounts.find_one(
            {"account_number": tx["to_account"]}
        )

        from_user = (
            await db.users.find_one({"_id": from_acc["user_id"]})
            if from_acc else None
        )
        to_user = (
            await db.users.find_one({"_id": to_acc["user_id"]})
            if to_acc else None
        )

        history.append({
            "from_name": from_user["name"] if from_user else "Unknown",
            "from_account": tx["from_account"],
            "to_name": to_user["name"] if to_user else "Unknown",
            "to_account": tx["to_account"],
            "amount": tx["amount"],
            "type": "transfer",
            "time": tx["timestamp"]
        })

    return history
