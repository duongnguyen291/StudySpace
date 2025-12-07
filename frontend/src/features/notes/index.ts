/**
 * Notes Feature Module
 * Public API exports
 */

// Components
export { QuickNotePopup } from './components/QuickNotePopup'
export { QuickNoteFloatingButton } from './components/QuickNoteFloatingButton'
export { ExportButton } from './components/ExportButton'
export { RichTextEditor } from './components/RichTextEditor'
export { NoteCategorySelector } from './components/NoteCategorySelector'

// Hooks
export { useQuickNote } from './hooks/useQuickNote'

// Services
export { noteService, noteCategoryService } from './services/noteService'

// Types
export type { Note, NoteCreate, NoteUpdate, NoteCategory, NoteCategoryCreate, NoteCategoryUpdate } from './types/note.types'

// Utils
export { exportToDocx, exportToPdf, exportToTxt, exportToHtml } from './utils/exportNote'
export type { ExportNoteData } from './utils/exportNote'
export { sanitizeHtml, stripHtml } from './utils/sanitizeHtml'

