# Quiz & Flashcards Feature

## Overview

This feature provides a complete quiz system with CSV import/export, shuffle mode, and history tracking.

## Features

### 1. Quiz Import/Export (.csv)

- **Import from CSV**: Upload a CSV file to create a new quiz set
- **Export to CSV**: Download quiz questions as a CSV file
- **Template**: Download a template CSV with proper format
- **Validation**: Line-by-line error reporting for invalid rows

#### CSV Format

| Column | Required | Description |
|--------|----------|-------------|
| `question` | ✅ Yes | The question text |
| `answer` | ✅ Yes | The correct answer |
| `type` | No | `multiple_choice`, `true_false`, or `short_answer` |
| `options` | No | Options separated by `\|` or `;` (e.g., `A\|B\|C\|D`) |
| `explanation` | No | Explanation shown after answering |

#### Example CSV

```csv
question,answer,type,options,explanation
"What is 2+2?","4","multiple_choice","2|3|4|5","Basic addition"
"Python is a snake","False","true_false","True|False","It's also a programming language"
"Capital of France?","Paris","short_answer","","The City of Lights"
```

### 2. Shuffle Quiz Mode

- **Shuffle Toggle**: Enable/disable question randomization before starting
- **Client-side Shuffle**: Questions are shuffled in the browser, no server storage needed
- **No Repetition**: Each question appears exactly once per session

### 3. Quiz History & Analytics
- **Attempt History**: View past attempts with quiz titles, scores, and timing
- **Per-question Review**: Inspect your answers vs. correct answers for each attempt
- **Trend Line**: Quick sparkline of recent scores

## Components

### `QuizImportExport`
Handles CSV file import/export with validation preview.

```tsx
<QuizImportExport onImportSuccess={(quizSetId) => console.log('Imported:', quizSetId)} />
```

### `QuizPlayer`
Full quiz experience with shuffle toggle.

```tsx
<QuizPlayer
  quizSetId="uuid"
  quizTitle="My Quiz"
  onComplete={(result) => console.log('Score:', result.score)}
  onCancel={() => goBack()}
/>
```

### `QuizSetList`
Displays user's quiz sets with actions.

```tsx
<QuizSetList
  onSelectQuiz={(quiz) => startQuiz(quiz)}
  onCreateNew={() => showImport()}
/>
```

## API Endpoints

### Quiz Sets
- `GET /api/v1/quiz/sets` - List user's quiz sets
- `POST /api/v1/quiz/sets` - Create new quiz set
- `GET /api/v1/quiz/sets/{id}` - Get quiz set with questions
- `PUT /api/v1/quiz/sets/{id}` - Update quiz set
- `DELETE /api/v1/quiz/sets/{id}` - Delete quiz set

### CSV Import/Export
- `GET /api/v1/quiz/template` - Download CSV template
- `POST /api/v1/quiz/preview` - Preview CSV with validation
- `POST /api/v1/quiz/import` - Import quiz from CSV
- `GET /api/v1/quiz/sets/{id}/export` - Export quiz to CSV

### Quiz Attempts
- `POST /api/v1/quiz/attempts` - Start new attempt
- `POST /api/v1/quiz/attempts/{id}/submit` - Submit answers
- `GET /api/v1/quiz/attempts` - List user's attempts

## Database Tables

- `quiz_sets` - Quiz collections
- `quiz_questions` - Individual questions
- `quiz_attempts` - User attempts and scores

## Usage Example

```tsx
import { useQuiz, QuizPlayer, QuizImportExport } from '@/features/quiz'

function MyQuizPage() {
  const { fetchQuizSets, loading } = useQuiz()
  
  // ... component logic
}
```
