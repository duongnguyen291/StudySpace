# StudySpace Backend

FastAPI application for StudySpace platform.

## Getting Started

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload
```

## Project Structure

```
app/
├── api/          # API routes
├── core/         # Core configuration
├── models/       # Database models
├── schemas/      # Pydantic schemas
├── services/     # Business logic
├── repositories/ # Data access layer
└── utils/        # Utilities
```

## API Documentation

After starting the server, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

