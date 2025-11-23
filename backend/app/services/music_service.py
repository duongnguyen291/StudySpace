"""
Music Service
Business logic for Music operations
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from fastapi import HTTPException, status

from app.repositories.music_repo import MusicPlaylistRepository
from app.schemas.music import (
    MusicPlaylistCreate,
    MusicPlaylistUpdate,
    MusicPlaylistResponse
)
from app.models.music import MusicPlaylist


class MusicService:
    """Service for music business logic"""
    
    def __init__(self, db: Session):
        self.repo = MusicPlaylistRepository(db)
    
    def get_playlists(
        self,
        playlist_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[MusicPlaylistResponse]:
        """Get all playlists, optionally filtered by type"""
        if playlist_type:
            playlists = self.repo.get_by_type(playlist_type, skip, limit)
        else:
            playlists = self.repo.get_active_playlists(skip, limit)
        
        return [MusicPlaylistResponse.model_validate(p) for p in playlists]
    
    def get_playlist(self, playlist_id: UUID) -> MusicPlaylistResponse:
        """Get a specific playlist"""
        playlist = self.repo.get_by_id(playlist_id)
        if not playlist:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Playlist not found"
            )
        if not playlist.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Playlist not found"
            )
        return MusicPlaylistResponse.model_validate(playlist)
    
    def create_playlist(
        self,
        playlist_data: MusicPlaylistCreate
    ) -> MusicPlaylistResponse:
        """Create a new playlist"""
        playlist_dict = playlist_data.model_dump()
        playlist = self.repo.create(playlist_dict)
        return MusicPlaylistResponse.model_validate(playlist)
    
    def update_playlist(
        self,
        playlist_id: UUID,
        playlist_data: MusicPlaylistUpdate
    ) -> MusicPlaylistResponse:
        """Update a playlist"""
        playlist = self.repo.get_by_id(playlist_id)
        if not playlist:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Playlist not found"
            )
        
        update_dict = playlist_data.model_dump(exclude_unset=True)
        updated_playlist = self.repo.update(playlist, update_dict)
        return MusicPlaylistResponse.model_validate(updated_playlist)
    
    def delete_playlist(self, playlist_id: UUID) -> bool:
        """Delete a playlist (soft delete by setting is_active=False)"""
        playlist = self.repo.get_by_id(playlist_id)
        if not playlist:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Playlist not found"
            )
        
        playlist.is_active = False
        self.repo.db.commit()
        self.repo.db.refresh(playlist)
        return True