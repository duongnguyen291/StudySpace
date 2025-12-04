"""
StudySpace Backend - FastAPI Application
Entry point for the application
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.ENVIRONMENT == "production" else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="StudySpace API",
    description="Personal Learning Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# qicknotes
# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for audio (if local storage is used)
static_path = Path("static")
if static_path.exists():
    app.mount("/static", StaticFiles(directory="static"), name="static")

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint"""
    return JSONResponse({
        "message": "Welcome to StudySpace API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    })


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "studyspace-api"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)