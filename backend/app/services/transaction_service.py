from datetime import datetime, timedelta
from fastapi import HTTPException
from datetime import datetime


def start_of_today():
    now = datetime.utcnow()
    return datetime(now.year, now.month, now.day)
async def transfer_money(db, sender, to_account_number: str, amount: float):
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")

    sender_account = await db.accounts.find_one({
        "user_id": sender["_id"],
        "is_active": True
    })

    if not sender_account:
        raise HTTPException(status_code=404, detail="Sender account not found")

    if sender_account["account_type"] == "fd":
        raise HTTPException(status_code=400, detail="FD accounts cannot transfer")

    receiver_account = await db.accounts.find_one({
        "account_number": to_account_number,
        "is_active": True
    })

    if not receiver_account:
        raise HTTPException(status_code=404, detail="Receiver account not found")

    if sender_account["balance"] < amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    # DAILY LIMIT CHECK
    today_start = start_of_today()

    cursor = db.transactions.find({
        "from_account": sender_account["account_number"],
        "timestamp": {"$gte": today_start}
    })

    today_total = 0
    async for tx in cursor:
        today_total += tx["amount"]

    if today_total + amount > sender_account["daily_limit"]:
        raise HTTPException(status_code=400, detail="Daily transaction limit exceeded")

    # BALANCE UPDATE
    await db.accounts.update_one(
        {"_id": sender_account["_id"]},
        {"$inc": {"balance": -amount}}
    )

    await db.accounts.update_one(
        {"_id": receiver_account["_id"]},
        {"$inc": {"balance": amount}}
    )

    # TRANSACTION LOG
    transaction = {
        "from_account": sender_account["account_number"],
        "to_account": receiver_account["account_number"],
        "amount": amount,
        "timestamp": datetime.utcnow()
    }

    await db.transactions.insert_one(transaction)

    return transaction