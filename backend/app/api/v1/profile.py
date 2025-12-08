"""
User Profile API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from uuid import UUID
import os
import shutil
from pathlib import Path
from typing import Optional

from app.api.deps import get_database
from app.core.security import get_current_user_id
from app.schemas.profile import ProfileResponse, ProfileUpdate
from app.services.profile_service import ProfileService

router = APIRouter(prefix="/profile", tags=["Profile"])

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads/avatars")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Allowed image extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.get("/me", response_model=ProfileResponse)
def get_my_profile(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_database)
):
    """Get current user's profile"""
    service = ProfileService(db)
    return service.get_profile(UUID(current_user_id))


@router.put("/me", response_model=ProfileResponse)
def update_my_profile(
    profile_data: ProfileUpdate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_database)
):
    """Update current user's profile"""
    service = ProfileService(db)
    return service.update_profile(UUID(current_user_id), profile_data)


@router.post("/me/avatar", response_model=ProfileResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_database)
):
    """Upload user avatar"""
    # Validate file type
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Validate file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 5MB limit"
        )
    
    # Generate unique filename
    user_id = UUID(current_user_id)
    filename = f"{user_id}{file_ext}"
    file_path = UPLOAD_DIR / filename
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(contents)
        
        # Generate URL (in production, use CDN or cloud storage)
        avatar_url = f"/uploads/avatars/{filename}"
        
        # Update user profile
        service = ProfileService(db)
        profile_update = ProfileUpdate(avatar_url=avatar_url)
        return service.update_profile(user_id, profile_update)
    
    except Exception as e:
        # Clean up on error
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload avatar: {str(e)}"
        )


@router.delete("/me/avatar")
def delete_avatar(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_database)
):
    """Delete user avatar"""
    service = ProfileService(db)
    user_id = UUID(current_user_id)
    
    # Get current profile
    profile = service.get_profile(user_id)
    
    if profile.avatar_url:
        # Delete file if exists
        file_path = Path(profile.avatar_url.lstrip("/"))
        if file_path.exists():
            file_path.unlink()
        
        # Update profile to remove avatar_url
        profile_update = ProfileUpdate(avatar_url=None)
        service.update_profile(user_id, profile_update)
    
    return {"message": "Avatar deleted successfully"}
