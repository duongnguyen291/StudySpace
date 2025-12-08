"""
Music Playlist API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.api.deps import get_database
from app.services.music_service import MusicService
from app.services.audio_loader_service import AudioLoaderService
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


# ===== Audio Loader Endpoints =====

@router.get("/audio/stream")
async def stream_audio(
    url: str = Query(..., description="Audio URL to stream"),
    range_header: Optional[str] = Header(None, alias="Range"),
    db: Session = Depends(get_database)
):
    """
    Stream audio file (for local files only)
    
    - **url**: Audio URL to stream
    - **Range**: HTTP Range header for partial content support
    
    Note: External URLs should be used directly in the frontend
    """
    audio_loader = AudioLoaderService()
    return await audio_loader.stream_audio(url, range_header)


@router.get("/audio/info")
async def get_audio_info(
    url: str = Query(..., description="Audio URL to get information"),
    db: Session = Depends(get_database)
):
    """
    Get audio file information
    
    - **url**: Audio URL to check
    """
    audio_loader = AudioLoaderService()
    return audio_loader.get_audio_info(url)


@router.get("/audio/check")
async def check_audio_availability(
    url: str = Query(..., description="Audio URL to check"),
    db: Session = Depends(get_database)
):
    """
    Check if audio URL is accessible
    
    - **url**: Audio URL to check
    """
    audio_loader = AudioLoaderService()
    return await audio_loader.check_audio_availability(url)