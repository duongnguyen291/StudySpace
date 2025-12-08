"""
Tasks API endpoints
"""
from fastapi import APIRouter

router = APIRouter()


@router.post("/")
async def create_task():
    """Create a new task"""
    return {"message": "Create task endpoint - to be implemented"}


@router.get("/")
async def get_tasks():
    """Get all tasks for current user"""
    return {"message": "Get tasks endpoint - to be implemented"}

