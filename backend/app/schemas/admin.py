from pydantic import BaseModel, EmailStr

class AdminSignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    bank_secret: str
class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str
