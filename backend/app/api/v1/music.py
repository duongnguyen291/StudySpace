"""
Music Playlist API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.api.deps import get_database
from app.services.music_service import MusicService
from app.schemas.music import (
    MusicPlaylistCreate,
    MusicPlaylistUpdate,
    MusicPlaylistResponse
)

router = APIRouter()


@router.get("/playlists", response_model=List[MusicPlaylistResponse])
async def get_playlists(
    playlist_type: Optional[str] = Query(
        None,
        description="Filter by playlist type (lofi, piano, rain, nature, ambient)"
    ),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    db: Session = Depends(get_database)
):
    """
    Get all playlists, optionally filtered by type
    
    - **playlist_type**: Filter by type (lofi, piano, rain, nature, ambient)
    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return
    """
    service = MusicService(db)
    return service.get_playlists(playlist_type=playlist_type, skip=skip, limit=limit)


@router.get("/playlists/{playlist_id}", response_model=MusicPlaylistResponse)
async def get_playlist(
    playlist_id: UUID,
    db: Session = Depends(get_database)
):
    """
    Get a specific playlist by ID
    
    - **playlist_id**: UUID of the playlist
    """
    service = MusicService(db)
    return service.get_playlist(playlist_id)


@router.post(
    "/playlists",
    response_model=MusicPlaylistResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_playlist(
    playlist_data: MusicPlaylistCreate,
    db: Session = Depends(get_database)
):
    """
    Create a new playlist
    
    - **name**: Playlist name (required)
    - **description**: Playlist description (optional)
    - **playlist_type**: Type of playlist (lofi, piano, rain, nature, ambient)
    - **audio_url**: URL to audio file/stream
    - **thumbnail_url**: URL to thumbnail image
    - **duration_minutes**: Duration in minutes
    """
    service = MusicService(db)
    return service.create_playlist(playlist_data)


@router.put("/playlists/{playlist_id}", response_model=MusicPlaylistResponse)
async def update_playlist(
    playlist_id: UUID,
    playlist_data: MusicPlaylistUpdate,
    db: Session = Depends(get_database)
):
    """
    Update a playlist
    
    - **playlist_id**: UUID of the playlist to update
    - All fields are optional
    """
    service = MusicService(db)
    return service.update_playlist(playlist_id, playlist_data)


@router.delete(
    "/playlists/{playlist_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_playlist(
    playlist_id: UUID,
    db: Session = Depends(get_database)
):
    """
    Delete a playlist (soft delete - sets is_active=False)
    
    - **playlist_id**: UUID of the playlist to delete
    """
    service = MusicService(db)
    service.delete_playlist(playlist_id)
    return None