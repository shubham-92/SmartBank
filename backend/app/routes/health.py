from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["Health"])

@router.get(
    "/",
    operation_id="health_check"
)
def health_check():
    return {"status": "OK"}
