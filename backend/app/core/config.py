"""
Application Configuration
Loads settings from environment variables
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "StudySpace"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "postgresql://admin:studyspace2024@localhost:5432/studyspace"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS - Đọc từ environment variable hoặc dùng default
    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        """
        Get allowed CORS origins from environment or use defaults.
        In production, set ALLOWED_ORIGINS env var as comma-separated list:
        ALLOWED_ORIGINS="http://localhost:3000,https://your-app.vercel.app"
        """
        env_origins = os.getenv("ALLOWED_ORIGINS")
        if env_origins:
            # Parse comma-separated string from env
            return [origin.strip() for origin in env_origins.split(",")]
        
        # Default origins for development
        return [
            "http://localhost:3000",
            "http://localhost:3001", 
            "http://127.0.0.1:3000",
        ]
    
    # Audio Storage
    AUDIO_STORAGE_PATH: str = "static/audio"
    MAX_AUDIO_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    
    @property
    def ALLOWED_AUDIO_FORMATS(self) -> List[str]:
        """Get allowed audio formats from env or use defaults."""
        env_formats = os.getenv("ALLOWED_AUDIO_FORMATS")
        if env_formats:
            return [fmt.strip() for fmt in env_formats.split(",")]
        return [".mp3", ".wav", ".ogg", ".m4a", ".aac"]
    
    # AI/LLM (Optional)
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields from .env


settings = Settings()