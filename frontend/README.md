# StudySpace Frontend

Next.js 14 application for StudySpace platform.

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
src/
├── app/              # Next.js App Router
├── features/         # Feature modules
├── shared/           # Shared components, hooks, utils
└── store/            # Global state management
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

