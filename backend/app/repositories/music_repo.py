"""
Music Repository
Data access layer for Music operations
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.models.music import MusicPlaylist
from app.repositories.base import BaseRepository


class MusicPlaylistRepository(BaseRepository[MusicPlaylist]):
    """Repository for MusicPlaylist model"""
    
    def __init__(self, db: Session):
        super().__init__(MusicPlaylist, db)
    
    def get_by_type(
        self,
        playlist_type: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[MusicPlaylist]:
        """Get playlists by type"""
        return (
            self.db.query(MusicPlaylist)
            .filter(MusicPlaylist.playlist_type == playlist_type)
            .filter(MusicPlaylist.is_active == True)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_active_playlists(
        self,
        skip: int = 0,
        limit: int = 100
    ) -> List[MusicPlaylist]:
        """Get all active playlists"""
        return (
            self.db.query(MusicPlaylist)
            .filter(MusicPlaylist.is_active == True)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_id(self, playlist_id: UUID) -> Optional[MusicPlaylist]:
        """Get playlist by ID"""
        return (
            self.db.query(MusicPlaylist)
            .filter(MusicPlaylist.id == playlist_id)
            .first()
        )