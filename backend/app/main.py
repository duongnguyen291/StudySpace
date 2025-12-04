"""
StudySpace Backend - FastAPI Application
Entry point for the application
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
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
    # Trust Railway proxy headers
    root_path="/api/v1" if settings.ENVIRONMENT == "production" else "",
)

# Trust Railway proxy headers
if settings.ENVIRONMENT == "production":
    app.add_middleware(
        TrustedHostMiddleware, 
        allowed_hosts=["studyspace-production-3806.up.railway.app", "*.railway.app"]
    )

# CORS middleware
# Allow all origins in development, specific origins in production
cors_origins = settings.ALLOWED_ORIGINS if settings.ENVIRONMENT == "production" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info(f"CORS enabled for origins: {cors_origins}")

# Custom middleware to prevent HTTP redirects
@app.middleware("http")
async def force_https_redirects(request, call_next):
    """
    Prevent Railway from redirecting to HTTP upstream
    """
    response = await call_next(request)
    
    # If this is a redirect response, ensure location header uses HTTPS
    if response.status_code in [301, 302, 307, 308] and "location" in response.headers:
        location = response.headers["location"]
        if location.startswith("http://") and not "localhost" in location:
            # Force HTTPS in redirect location
            response.headers["location"] = location.replace("http://", "https://")
            logger.warning(f"Fixed redirect from HTTP to HTTPS: {location}")
    
    return response

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