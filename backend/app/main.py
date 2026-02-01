from fastapi import FastAPI
from app.core.config import settings
from app.routes import health
from app.routes import auth, admin, health, account, transaction
from app.routes import user
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[ "http://localhost:5173",
        "https://smartbank.vercel.app",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(account.router)
app.include_router(health.router)
app.include_router(transaction.router)
app.include_router(user.router)

@app.get("/")
def root():
    return {"message": "SmartBank Backend is running"}
