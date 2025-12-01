# Quiz feature

Location: frontend/src/features/quiz

Contains:
- components: UI components (QuizImportExport)
- services: API helpers (uploadCsv, formatCsvForDownload)
- hooks: small hooks for interaction (useQuiz)
- types: shared TypeScript types

Notes:
- App route page: /quiz (frontend/src/app/quiz/page.tsx)
- Backend endpoints expected: POST /api/v1/quiz/import