from pydantic import BaseModel

class KYCRequest(BaseModel):
    pan_number: str
    address: str
    phone: str
