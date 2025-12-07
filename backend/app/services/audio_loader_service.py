"""
Audio Loader Service
Handles audio file operations, validation, and streaming
"""
import os
from pathlib import Path
from typing import Optional, Dict, Any
from urllib.parse import urlparse
import httpx
from fastapi import HTTPException, status
from fastapi.responses import StreamingResponse, RedirectResponse

from app.core.config import settings


class AudioLoaderService:
    """Service for loading and managing audio files"""
    
    def __init__(self):
        # Base path for local audio files (relative to project root)
        self.audio_base_path = Path("static/audio")
        # Supported audio formats
        self.supported_formats = {".mp3", ".wav", ".ogg", ".m4a", ".aac"}
        # Supported external URL patterns
        self.supported_url_patterns = [
            "http://",
            "https://",
            "youtube.com",
            "youtu.be",
            "soundcloud.com",
            "spotify.com"
        ]
    
    def validate_audio_url(self, url: str) -> bool:
        """
        Validate audio URL format
        
        Args:
            url: Audio URL to validate
            
        Returns:
            True if URL is valid, False otherwise
        """
        if not url or not isinstance(url, str):
            return False
        
        # Check if it's a local path
        if url.startswith("/") or url.startswith("./"):
            return True
        
        # Check if it's a valid URL
        try:
            parsed = urlparse(url)
            # Must have scheme (http/https) or be a local path
            if parsed.scheme in ("http", "https"):
                return True
            # Check for known audio hosting platforms
            if any(pattern in url.lower() for pattern in self.supported_url_patterns):
                return True
        except Exception:
            pass
        
        return False
    
    def get_audio_info(self, url: str) -> Dict[str, Any]:
        """
        Get audio file information
        
        Args:
            url: Audio URL
            
        Returns:
            Dictionary with audio information (format, size, etc.)
        """
        if not self.validate_audio_url(url):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid audio URL format"
            )
        
        info = {
            "url": url,
            "type": self._get_audio_type(url),
            "format": self._get_audio_format(url),
            "is_local": self._is_local_path(url),
            "is_external": self._is_external_url(url)
        }
        
        return info
    
    def _get_audio_type(self, url: str) -> str:
        """Determine audio type (local, external, youtube, etc.)"""
        if self._is_local_path(url):
            return "local"
        elif "youtube.com" in url.lower() or "youtu.be" in url.lower():
            return "youtube"
        elif "soundcloud.com" in url.lower():
            return "soundcloud"
        elif "spotify.com" in url.lower():
            return "spotify"
        else:
            return "external"
    
    def _get_audio_format(self, url: str) -> Optional[str]:
        """Extract audio format from URL"""
        parsed = urlparse(url)
        path = parsed.path.lower()
        
        for fmt in self.supported_formats:
            if path.endswith(fmt):
                return fmt.lstrip(".")
        
        return None
    
    def _is_local_path(self, url: str) -> bool:
        """Check if URL is a local file path"""
        return url.startswith("/") or url.startswith("./") or not url.startswith(("http://", "https://"))
    
    def _is_external_url(self, url: str) -> bool:
        """Check if URL is an external URL"""
        return url.startswith(("http://", "https://"))
    
    def get_local_audio_path(self, url: str) -> Optional[Path]:
        """
        Get local file path for audio
        
        Args:
            url: Audio URL (local path)
            
        Returns:
            Path object if file exists, None otherwise
        """
        if not self._is_local_path(url):
            return None
        
        # Normalize path
        if url.startswith("/"):
            # Absolute path
            file_path = Path(url)
        elif url.startswith("./"):
            # Relative path from project root
            file_path = Path(url.lstrip("./"))
        else:
            # Assume relative to audio base path
            file_path = self.audio_base_path / url
        
        # Check if file exists
        if file_path.exists() and file_path.is_file():
            return file_path
        
        return None
    
    async def stream_audio(self, url: str, range_header: Optional[str] = None) -> StreamingResponse:
        """
        Stream audio file (for local files only)
        
        Args:
            url: Audio URL
            range_header: HTTP Range header for partial content
            
        Returns:
            StreamingResponse with audio content
        """
        # For local files
        if self._is_local_path(url):
            file_path = self.get_local_audio_path(url)
            if not file_path:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Audio file not found"
                )
            
            # Determine media type
            media_type = self._get_media_type(file_path.suffix)
            
            # Open and stream file
            file_handle = open(file_path, "rb")
            
            # Handle range requests for audio streaming
            if range_header:
                # Parse range header (e.g., "bytes=0-1023")
                range_match = range_header.replace("bytes=", "").split("-")
                start = int(range_match[0]) if range_match[0] else 0
                end = int(range_match[1]) if len(range_match) > 1 and range_match[1] else None
                
                file_size = file_path.stat().st_size
                if end is None:
                    end = file_size - 1
                
                file_handle.seek(start)
                content_length = end - start + 1
                
                return StreamingResponse(
                    iter([file_handle.read(content_length)]),
                    status_code=206,  # Partial Content
                    media_type=media_type,
                    headers={
                        "Content-Range": f"bytes {start}-{end}/{file_size}",
                        "Accept-Ranges": "bytes",
                        "Content-Length": str(content_length)
                    }
                )
            
            # Full file stream
            return StreamingResponse(
                iter([file_handle.read()]),
                media_type=media_type,
                headers={
                    "Accept-Ranges": "bytes",
                    "Content-Length": str(file_path.stat().st_size)
                }
            )
        
        # For external URLs, return redirect or proxy
        # In production, you might want to proxy the stream
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Streaming external URLs is not supported. Use the URL directly in the frontend."
        )
    
    def _get_media_type(self, file_extension: str) -> str:
        """Get MIME type for audio file"""
        media_types = {
            ".mp3": "audio/mpeg",
            ".wav": "audio/wav",
            ".ogg": "audio/ogg",
            ".m4a": "audio/mp4",
            ".aac": "audio/aac"
        }
        return media_types.get(file_extension.lower(), "audio/mpeg")
    
    async def check_audio_availability(self, url: str) -> Dict[str, Any]:
        """
        Check if audio URL is accessible
        
        Args:
            url: Audio URL to check
            
        Returns:
            Dictionary with availability status
        """
        result = {
            "url": url,
            "available": False,
            "error": None
        }
        
        # For local files
        if self._is_local_path(url):
            file_path = self.get_local_audio_path(url)
            result["available"] = file_path is not None
            if not result["available"]:
                result["error"] = "File not found"
            return result
        
        # For external URLs, check with HTTP request
        if self._is_external_url(url):
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    response = await client.head(url, follow_redirects=True)
                    result["available"] = response.status_code == 200
                    if not result["available"]:
                        result["error"] = f"HTTP {response.status_code}"
            except httpx.TimeoutException:
                result["error"] = "Request timeout"
            except httpx.RequestError as e:
                result["error"] = str(e)
            except Exception as e:
                result["error"] = f"Unexpected error: {str(e)}"
        
        return result