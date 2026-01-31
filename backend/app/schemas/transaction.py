from pydantic import BaseModel
from datetime import datetime

# class TransactionCreateRequest(BaseModel):
#     to_account_number: str
#     amount: float

class UserTransactionResponse(BaseModel):
    receiver_name: str
    receiver_account_number: str
    amount: float
    type: str
    time: datetime

class AdminTransactionResponse(BaseModel):
    from_name: str
    from_account: str
    to_name: str
    to_account: str
    amount: float
    type: str
    time: datetime
    
class TransferRequest(BaseModel):
    to_account_number: str
    amount: float