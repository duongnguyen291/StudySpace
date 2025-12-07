/**
 * Notes Feature Module
 * Public API exports
 */

// Components
export { QuickNotePopup } from './components/QuickNotePopup'
export { QuickNoteFloatingButton } from './components/QuickNoteFloatingButton'
export { ExportButton } from './components/ExportButton'
export { RichTextEditor } from './components/RichTextEditor'

// Hooks
export { useQuickNote } from './hooks/useQuickNote'

// Types
export type { Note, NoteCreate, NoteUpdate } from './types/note.types'

// Utils
export { exportToDocx, exportToPdf, exportToTxt, exportToHtml } from './utils/exportNote'
export type { ExportNoteData } from './utils/exportNote'
export { sanitizeHtml, stripHtml } from './utils/sanitizeHtml'

