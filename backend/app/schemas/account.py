from pydantic import BaseModel
from typing import Literal

AccountType = Literal["savings", "current", "fd"]

class AccountCreateRequest(BaseModel):
    account_type: AccountType

class AccountResponse(BaseModel):
    account_number: str
    account_type: str
    balance: float
    daily_limit: float
    is_active: bool
