# Flashcards Feature Documentation

Complete documentation for the Flashcard feature implementation in StudySpace.

## Table of Contents

1. [Overview](#overview)
2. [Backend API Documentation](#backend-api-documentation)
3. [Frontend Components](#frontend-components)
4. [Database Schema](#database-schema)
5. [Usage Guide](#usage-guide)
6. [API Examples](#api-examples)

---

## Overview

The Flashcard feature allows users to:
- Create and manage flashcard decks
- Add flashcards with questions, answers, and hints
- Review flashcards with flip animation
- Track progress using spaced repetition algorithm
- Review in random or spaced repetition mode

### Features Implemented

✅ **CRUD Operations**
- Create, read, update, delete flashcard decks
- Create, read, update, delete flashcards

✅ **Review System**
- Random review mode (shuffles all cards)
- Spaced repetition mode (shows cards due for review)
- Flip card animation (3D CSS transform)
- Progress tracking with confidence levels

✅ **Progress Tracking**
- Confidence levels (0-5 scale)
- Review count tracking
- Next review date calculation
- Spaced repetition intervals

---

## Backend API Documentation

### Base URL
```
http://localhost:8000/api/v1/flashcards
```

All endpoints require authentication via Bearer token.

### Deck Endpoints

#### Create Deck
```http
POST /flashcards/decks
```

**Request Body:**
```json
{
  "title": "French Vocabulary",
  "description": "Basic French words",
  "category_id": "uuid-optional",
  "is_public": false
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "French Vocabulary",
  "description": "Basic French words",
  "is_public": false,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00",
  "flashcard_count": 0
}
```

#### Get All Decks
```http
GET /flashcards/decks?page=1&page_size=20&search=vocabulary&category_id=uuid
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `page_size` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search in title and description
- `category_id` (optional): Filter by category
- `is_public` (optional): Filter by public status
- `sort_by` (optional): Field to sort by (default: "created_at")
- `sort_order` (optional): "asc" or "desc" (default: "desc")

**Response:** `200 OK`
```json
{
  "decks": [...],
  "total": 10,
  "page": 1,
  "page_size": 20,
  "has_next": false,
  "has_prev": false
}
```

#### Get Deck by ID
```http
GET /flashcards/decks/{deck_id}
```

**Response:** `200 OK` - Deck object

#### Update Deck
```http
PUT /flashcards/decks/{deck_id}
```

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "category_id": "uuid",
  "is_public": true
}
```

**Response:** `200 OK` - Updated deck object

#### Delete Deck
```http
DELETE /flashcards/decks/{deck_id}
```

**Response:** `204 No Content`

---

### Flashcard Endpoints

#### Create Flashcard
```http
POST /flashcards/decks/{deck_id}/flashcards
```

**Request Body:**
```json
{
  "question": "What is 'Hello' in French?",
  "answer": "Bonjour",
  "hint": "It starts with 'B'",
  "order_index": 0
}
```

**Response:** `201 Created` - Flashcard object

#### Bulk Create Flashcards
```http
POST /flashcards/decks/{deck_id}/flashcards/bulk
```

**Request Body:**
```json
[
  {
    "question": "Question 1",
    "answer": "Answer 1",
    "hint": "Hint 1",
    "order_index": 0
  },
  {
    "question": "Question 2",
    "answer": "Answer 2",
    "order_index": 1
  }
]
```

**Response:** `201 Created` - Array of flashcard objects

#### Get All Flashcards in Deck
```http
GET /flashcards/decks/{deck_id}/flashcards
```

**Response:** `200 OK`
```json
{
  "flashcards": [...],
  "total": 5,
  "deck_id": "uuid"
}
```

#### Get Flashcard by ID
```http
GET /flashcards/flashcards/{flashcard_id}?deck_id={deck_id}
```

**Response:** `200 OK` - Flashcard object with progress

#### Update Flashcard
```http
PUT /flashcards/flashcards/{flashcard_id}?deck_id={deck_id}
```

**Request Body:** (all fields optional)
```json
{
  "question": "Updated question",
  "answer": "Updated answer",
  "hint": "Updated hint",
  "order_index": 1
}
```

**Response:** `200 OK` - Updated flashcard object

#### Delete Flashcard
```http
DELETE /flashcards/flashcards/{flashcard_id}?deck_id={deck_id}
```

**Response:** `204 No Content`

---

### Review Session Endpoints

#### Start Review Session
```http
POST /flashcards/review/start
```

**Request Body:**
```json
{
  "deck_id": "uuid",
  "mode": "random",  // or "spaced"
  "limit": 10  // optional, max cards to review
}
```

**Response:** `200 OK`
```json
{
  "session_id": "uuid",
  "deck_id": "uuid",
  "cards": [
    {
      "flashcard": {...},
      "progress": {...},  // null if new card
      "is_new": true
    }
  ],
  "total_cards": 10,
  "new_cards": 5,
  "due_cards": 5,
  "mode": "random"
}
```

#### Submit Review Results
```http
POST /flashcards/review/submit
```

**Request Body:**
```json
[
  {
    "flashcard_id": "uuid",
    "confidence_level": 3  // 0-5 scale
  },
  {
    "flashcard_id": "uuid",
    "confidence_level": 4
  }
]
```

**Response:** `200 OK`
```json
{
  "success": true,
  "updated_count": 2,
  "message": "Successfully updated 2 flashcard(s)"
}
```

---

## Frontend Components

### FlashcardsPage

Main page component for flashcard management.

**Location:** `frontend/src/features/flashcards/pages/FlashcardsPage.tsx`

**Features:**
- Deck list view
- Deck creation/editing
- Flashcard management
- Review session initiation

**Usage:**
```tsx
import { FlashcardsPage } from '@/features/flashcards'

// In your route
export default function Flashcards() {
  return <FlashcardsPage />
}
```

### FlashcardCard

Component for displaying individual flashcards with flip animation.

**Location:** `frontend/src/features/flashcards/components/FlashcardCard.tsx`

**Props:**
```typescript
interface FlashcardCardProps {
  flashcard: Flashcard
  onFlip?: () => void
  showHint?: boolean
  className?: string
}
```

**Features:**
- 3D flip animation (CSS transforms)
- Question/Answer display
- Optional hint display
- Click to flip interaction

**Usage:**
```tsx
<FlashcardCard
  flashcard={flashcard}
  onFlip={() => console.log('Flipped!')}
  showHint={true}
/>
```

### ReviewSession

Modal component for reviewing flashcards.

**Location:** `frontend/src/features/flashcards/components/ReviewSession.tsx`

**Props:**
```typescript
interface ReviewSessionProps {
  session: ReviewSessionResponse
  onComplete: (results: ReviewResult[]) => void
  onClose: () => void
}
```

**Features:**
- Progress tracking
- Card navigation (Previous/Next/Skip)
- Flip animation integration
- Session completion

**Usage:**
```tsx
<ReviewSession
  session={session}
  onComplete={handleComplete}
  onClose={() => setSession(null)}
/>
```

### FlashcardDeckList

Component for displaying list of flashcard decks.

**Location:** `frontend/src/features/flashcards/components/FlashcardDeckList.tsx`

**Props:**
```typescript
interface FlashcardDeckListProps {
  decks: FlashcardDeck[]
  onCreateDeck: () => void
  onEditDeck: (deck: FlashcardDeck) => void
  onDeleteDeck: (deckId: string) => void
  onStartReview: (deckId: string) => void
  onViewDeck: (deckId: string) => void
}
```

---

## Database Schema

### flashcard_decks

Stores flashcard deck information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| category_id | UUID | Foreign key to categories (nullable) |
| title | VARCHAR(255) | Deck title |
| description | TEXT | Deck description |
| is_public | BOOLEAN | Public visibility |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### flashcards

Stores individual flashcards.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| deck_id | UUID | Foreign key to flashcard_decks |
| question | TEXT | Flashcard question |
| answer | TEXT | Flashcard answer |
| hint | TEXT | Optional hint |
| order_index | INTEGER | Display order |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### flashcard_progress

Tracks user progress on flashcards (spaced repetition).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| flashcard_id | UUID | Foreign key to flashcards |
| confidence_level | INTEGER | 0-5 scale (0=not reviewed, 5=mastered) |
| last_reviewed | TIMESTAMP | Last review time |
| next_review | TIMESTAMP | Next scheduled review |
| review_count | INTEGER | Number of times reviewed |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Unique Constraint:** `(user_id, flashcard_id)` - One progress record per user-flashcard pair

---

## Usage Guide

### Creating a Flashcard Deck

1. Navigate to `/flashcards` page
2. Click "New Deck" button
3. Enter deck title and description
4. Click "Create Deck"

### Adding Flashcards

1. Click "View" on a deck
2. Click "Add Card" button
3. Enter question and answer
4. Optionally add a hint
5. Click "Create Card"

### Reviewing Flashcards

1. Open a deck
2. Click "Start Review" button
3. Click the flashcard to flip and see the answer
4. Use navigation buttons:
   - **Previous**: Go to previous card
   - **Next**: Go to next card
   - **Skip**: Skip current card
   - **Complete Review**: Finish the session

### Review Modes

#### Random Mode
- Shuffles all cards randomly
- Good for general review
- No progress-based filtering

#### Spaced Repetition Mode
- Shows cards due for review based on:
  - New cards (never reviewed)
  - Cards with `next_review <= now`
- Optimizes learning with spaced intervals

---

## API Examples

### Example: Complete Workflow

#### 1. Create a Deck
```bash
curl -X POST "http://localhost:8000/api/v1/flashcards/decks" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Math Basics",
    "description": "Basic math questions"
  }'
```

#### 2. Add Flashcards
```bash
curl -X POST "http://localhost:8000/api/v1/flashcards/decks/{deck_id}/flashcards/bulk" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "question": "What is 2 + 2?",
      "answer": "4",
      "hint": "It'\''s a small number"
    },
    {
      "question": "What is 5 × 5?",
      "answer": "25",
      "hint": "It'\''s a square number"
    }
  ]'
```

#### 3. Start Review Session
```bash
curl -X POST "http://localhost:8000/api/v1/flashcards/review/start" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deck_id": "deck_uuid",
    "mode": "random",
    "limit": 10
  }'
```

#### 4. Submit Review Results
```bash
curl -X POST "http://localhost:8000/api/v1/flashcards/review/submit" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "flashcard_id": "flashcard_uuid_1",
      "confidence_level": 3
    },
    {
      "flashcard_id": "flashcard_uuid_2",
      "confidence_level": 4
    }
  ]'
```

---

## Spaced Repetition Algorithm

The system uses a simple spaced repetition algorithm based on confidence levels:

| Confidence Level | Interval | Description |
|-----------------|----------|-------------|
| 0 | 1 hour | Review again soon |
| 1 | 4 hours | Hard - review soon |
| 2 | 1 day | Good - review tomorrow |
| 3 | 3 days | Easy - review in 3 days |
| 4 | 1 week | Very easy - review in a week |
| 5 | 1 month | Mastered - review in a month |

**Next Review Calculation:**
```
next_review = current_time + interval_based_on_confidence
```

---

## Error Handling

### Common Errors

#### 401 Unauthorized
- **Cause:** Missing or invalid token
- **Solution:** Login again to get new token

#### 404 Not Found
- **Cause:** Deck/Flashcard doesn't exist or doesn't belong to user
- **Solution:** Check IDs are correct

#### 422 Validation Error
- **Cause:** Invalid request data
- **Solution:** Check required fields and data types

#### 500 Internal Server Error
- **Cause:** Database or server issue
- **Solution:** Check server logs and database connection

---

## Testing

### Quick Test Checklist

- [ ] Create a deck
- [ ] Add flashcards to deck
- [ ] View flashcards in deck
- [ ] Start review session
- [ ] Test flip animation
- [ ] Navigate through cards
- [ ] Complete review session
- [ ] Verify progress tracking

---

## Future Enhancements

Potential improvements for the flashcard feature:

1. **Advanced Spaced Repetition**
   - SM-2 algorithm implementation
   - Customizable intervals
   - Difficulty adjustment

2. **Study Statistics**
   - Review history
   - Performance charts
   - Mastery tracking

3. **Import/Export**
   - CSV import
   - Anki deck compatibility
   - Export to PDF

4. **Collaboration**
   - Share decks with other users
   - Public deck marketplace
   - Community contributions

5. **Rich Media**
   - Image support
   - Audio pronunciation
   - Video explanations

---

## Support

For issues or questions:
- Check API documentation: http://localhost:8000/docs
- Review code comments in source files
- Check browser console and network tab for errors

---

**Last Updated:** 2024
**Version:** 1.0.0

