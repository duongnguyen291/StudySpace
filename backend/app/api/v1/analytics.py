"""
Analytics API endpoints
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    return {"message": "Get dashboard stats endpoint - to be implemented"}


@router.get("/progress")
async def get_progress():
    """Get learning progress"""
    return {"message": "Get progress endpoint - to be implemented"}

