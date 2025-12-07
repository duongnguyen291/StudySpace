"""
Authentication API endpoints
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.api.deps import get_database
from app.core.security import create_access_token, get_current_user_id
from app.core.config import settings
from app.services.user_service import UserService
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_database)
):
    """
    Register a new user
    
    - **email**: User email (must be unique)
    - **username**: Username (3-100 characters)
    - **password**: Password (minimum 6 characters)
    """
    service = UserService(db)
    
    # Register user
    user = service.register_user(user_data)
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    db: Session = Depends(get_database)
):
    """
    Login and get access token
    
    - **email**: User email
    - **password**: User password
    """
    logger.info(f"Login attempt for email: {credentials.email}")
    service = UserService(db)
    
    try:
        # Authenticate user
        user = service.authenticate_user(credentials.email, credentials.password)
        if not user:
            logger.warning(f"Login failed: User not found or incorrect password for email: {credentials.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        logger.info(f"Login successful for user: {user.email} (ID: {user.id})")
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email},
            expires_delta=access_token_expires
        )
        
        user_response = UserResponse.model_validate(user)
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error for email {credentials.email}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login",
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_database)
):
    """Get current authenticated user information"""
    from uuid import UUID
    service = UserService(db)
    
    user = service.get_user_by_id(UUID(current_user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.post("/logout")
async def logout():
    """
    Logout user
    Note: With JWT, logout is handled client-side by removing the token.
    This endpoint exists for consistency and potential future token blacklisting.
    """
    return {"message": "Successfully logged out"}

