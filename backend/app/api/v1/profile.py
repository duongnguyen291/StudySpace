"""
User Profile API endpoints
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_profile():
    """Get user profile"""
    return {"message": "Get profile endpoint - to be implemented"}


@router.put("/")
async def update_profile():
    """Update user profile"""
    return {"message": "Update profile endpoint - to be implemented"}

