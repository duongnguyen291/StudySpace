"""
Tests for MusicPlaylist Model
"""
import pytest
import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.music import MusicPlaylist


class TestMusicPlaylist:
    """Test cases for MusicPlaylist model"""

    def test_create_music_playlist(self, db_session: Session):
        """Test creating a music playlist instance"""
        playlist = MusicPlaylist(
            name="Lofi Study Beats",
            description="Relaxing lofi music for studying",
            playlist_type="lofi",
            audio_url="https://example.com/audio.mp3",
            thumbnail_url="https://example.com/thumbnail.jpg",
            duration_minutes=60,
            is_active=True
        )
        db_session.add(playlist)
        db_session.commit()
        db_session.refresh(playlist)

        assert playlist.id is not None
        assert playlist.name == "Lofi Study Beats"
        assert playlist.description == "Relaxing lofi music for studying"
        assert playlist.playlist_type == "lofi"
        assert playlist.audio_url == "https://example.com/audio.mp3"
        assert playlist.thumbnail_url == "https://example.com/thumbnail.jpg"
        assert playlist.duration_minutes == 60
        assert playlist.is_active is True
        assert playlist.created_at is not None

    def test_music_playlist_default_active(self, db_session: Session):
        """Test that is_active defaults to True"""
        playlist = MusicPlaylist(
            name="Default Playlist"
        )
        db_session.add(playlist)
        db_session.commit()
        db_session.refresh(playlist)

        assert playlist.is_active is True

    def test_music_playlist_optional_fields(self, db_session: Session):
        """Test that optional fields can be None"""
        playlist = MusicPlaylist(
            name="Minimal Playlist"
        )
        db_session.add(playlist)
        db_session.commit()
        db_session.refresh(playlist)

        assert playlist.description is None
        assert playlist.playlist_type is None
        assert playlist.audio_url is None
        assert playlist.thumbnail_url is None
        assert playlist.duration_minutes is None
        assert playlist.name == "Minimal Playlist"

    def test_music_playlist_id_is_uuid(self, db_session: Session):
        """Test that playlist id is a UUID"""
        playlist = MusicPlaylist(
            name="UUID Test"
        )
        db_session.add(playlist)
        db_session.commit()
        db_session.refresh(playlist)

        assert isinstance(playlist.id, uuid.UUID)

    def test_music_playlist_timestamps(self, db_session: Session):
        """Test that created_at is set automatically"""
        playlist = MusicPlaylist(
            name="Timestamp Test"
        )
        db_session.add(playlist)
        db_session.commit()
        db_session.refresh(playlist)

        assert isinstance(playlist.created_at, datetime)

    def test_music_playlist_update(self, db_session: Session):
        """Test updating a music playlist"""
        playlist = MusicPlaylist(
            name="Original Name",
            description="Original Description",
            playlist_type="piano",
            duration_minutes=30,
            is_active=True
        )
        db_session.add(playlist)
        db_session.commit()

        # Update fields
        playlist.name = "Updated Name"
        playlist.description = "Updated Description"
        playlist.playlist_type = "rain"
        playlist.duration_minutes = 45
        playlist.is_active = False
        db_session.commit()
        db_session.refresh(playlist)

        assert playlist.name == "Updated Name"
        assert playlist.description == "Updated Description"
        assert playlist.playlist_type == "rain"
        assert playlist.duration_minutes == 45
        assert playlist.is_active is False

    def test_music_playlist_delete(self, db_session: Session):
        """Test deleting a music playlist"""
        playlist = MusicPlaylist(
            name="To Be Deleted"
        )
        db_session.add(playlist)
        db_session.commit()

        playlist_id = playlist.id
        db_session.delete(playlist)
        db_session.commit()

        deleted_playlist = db_session.get(MusicPlaylist, playlist_id)
        assert deleted_playlist is None

    def test_music_playlist_playlist_types(self, db_session: Session):
        """Test different playlist types"""
        playlist_types = ["lofi", "piano", "rain", "nature", "ambient"]
        
        for playlist_type in playlist_types:
            playlist = MusicPlaylist(
                name=f"{playlist_type.capitalize()} Playlist",
                playlist_type=playlist_type
            )
            db_session.add(playlist)
            db_session.commit()
            db_session.refresh(playlist)

            assert playlist.playlist_type == playlist_type
            db_session.delete(playlist)
            db_session.commit()

    def test_music_playlist_duration_negative(self, db_session: Session):
        """Test that duration_minutes can be set to various values"""
        playlist = MusicPlaylist(
            name="Duration Test",
            duration_minutes=0
        )
        db_session.add(playlist)
        db_session.commit()
        db_session.refresh(playlist)

        assert playlist.duration_minutes == 0

        playlist.duration_minutes = 120
        db_session.commit()
        db_session.refresh(playlist)

        assert playlist.duration_minutes == 120

