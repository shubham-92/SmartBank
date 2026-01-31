from app.utils.account_number import generate_account_number

ACCOUNT_LIMITS = {
    "savings": 50000,
    "current": 200000,
    "fd": 0
}

async def create_account(db, user_id: str, account_type: str):
    account_number = generate_account_number()

    # Ensure uniqueness
    while await db.accounts.find_one({"account_number": account_number}):
        account_number = generate_account_number()

    account = {
        "user_id": user_id,
        "account_number": account_number,
        "account_type": account_type,
        "balance": 5000,
        "daily_limit": ACCOUNT_LIMITS[account_type],
        "is_active": True
    }

    await db.accounts.insert_one(account)
    return account
