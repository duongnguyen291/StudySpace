'use client'
import React, { useState, useCallback } from 'react'
import type { CSVPreviewRow, CSVImportError, QuizSet } from '../types/quiz.types'
import { importCsv, exportCsv, getQuizSets, downloadBlob } from '../services/quizService'

interface Props {
  onImportSuccess?: (quizSetId: string) => void
}

export default function QuizImportExport({ onImportSuccess }: Props): JSX.Element {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [previewRows, setPreviewRows] = useState<CSVPreviewRow[]>([])
  const [errors, setErrors] = useState<CSVImportError[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [quizSets, setQuizSets] = useState<QuizSet[]>([])
  const [selectedExportId, setSelectedExportId] = useState('')

  // Simple CSV parser for question,answer format
  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter(l => l.trim())
    if (lines.length < 2) {
      setErrors([{ line: 0, message: 'File is empty or has no data rows' }])
      setPreviewRows([])
      return
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''))
    const qIdx = headers.indexOf('question')
    const aIdx = headers.indexOf('answer')

    if (qIdx === -1 || aIdx === -1) {
      setErrors([{ line: 1, message: 'CSV must have "question" and "answer" columns' }])
      setPreviewRows([])
      return
    }

    const rows: CSVPreviewRow[] = []
    const newErrors: CSVImportError[] = []

    for (let i = 1; i < lines.length; i++) {
      // Simple CSV split (handles basic quoted values)
      const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''))
      const question = cols[qIdx] || ''
      const answer = cols[aIdx] || ''

      const isValid = !!question && !!answer
      if (!isValid) {
        newErrors.push({ line: i + 1, message: 'Missing question or answer' })
      }

      rows.push({
        line: i + 1,
        question,
        answer,
        is_valid: isValid,
        error: isValid ? null : 'Missing data'
      })
    }

    setPreviewRows(rows)
    setErrors(newErrors)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setResult(null)

    const reader = new FileReader()
    reader.onload = () => parseCSV(String(reader.result || ''))
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!selectedFile || !title.trim()) return

    const validRows = previewRows.filter(r => r.is_valid)
    if (validRows.length === 0) {
      setResult({ success: false, message: 'No valid questions to import' })
      return
    }

    setIsLoading(true)
    try {
      const res = await importCsv(selectedFile, title.trim(), description.trim() || undefined)
      if (res.success) {
        setResult({ success: true, message: `Imported ${res.questions_imported} questions!` })
        setSelectedFile(null)
        setPreviewRows([])
        setErrors([])
        setTitle('')
        setDescription('')
        if (res.quiz_set_id && onImportSuccess) onImportSuccess(res.quiz_set_id)
      } else {
        setResult({ success: false, message: 'Import failed' })
      }
    } catch {
      setResult({ success: false, message: 'Import failed' })
    } finally {
      setIsLoading(false)
    }
  }

  const loadQuizSets = async () => {
    try {
      const sets = await getQuizSets()
      setQuizSets(sets)
    } catch {}
  }

  const handleExport = async () => {
    if (!selectedExportId) return
    setIsLoading(true)
    try {
      const blob = await exportCsv(selectedExportId)
      const set = quizSets.find(s => s.id === selectedExportId)
      downloadBlob(blob, `${set?.title || 'quiz'}.csv`)
    } catch {}
    setIsLoading(false)
  }

  const downloadTemplate = () => {
    const template = 'question,answer\n"What is 2+2?","4"\n"Capital of France?","Paris"'
    const blob = new Blob([template], { type: 'text/csv' })
    downloadBlob(blob, 'quiz-template.csv')
  }

  const validCount = previewRows.filter(r => r.is_valid).length

  return (
    <div className="max-w-3xl mx-auto">
      {/* Tabs */}
      <div className="flex border-b border-slate-700 mb-6">
        <button
          onClick={() => setActiveTab('import')}
          className={`px-6 py-3 font-medium text-sm transition ${
            activeTab === 'import' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          📥 Import
        </button>
        <button
          onClick={() => { setActiveTab('export'); loadQuizSets() }}
          className={`px-6 py-3 font-medium text-sm transition ${
            activeTab === 'export' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          📤 Export
        </button>
      </div>

      {activeTab === 'import' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Import Questions from CSV</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Quiz Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="My Quiz"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Optional..."
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">CSV File *</label>
                <div className="flex gap-3">
                  <label className="flex-1 flex items-center justify-center px-4 py-3 bg-slate-900 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-emerald-500 transition">
                    <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                    <span className="text-slate-400">{selectedFile ? `📄 ${selectedFile.name}` : '📁 Choose CSV'}</span>
                  </label>
                  <button onClick={downloadTemplate} className="px-4 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 text-sm">
                    📋 Template
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">Format: <code className="text-emerald-400">question,answer</code></p>
              </div>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 text-sm font-medium mb-2">Errors ({errors.length}):</p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {errors.map((e, i) => (
                  <p key={i} className="text-red-300 text-xs">Line {e.line}: {e.message}</p>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          {previewRows.length > 0 && (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Preview</h3>
                <span className="text-sm text-emerald-400">{validCount} valid</span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {previewRows.slice(0, 10).map(row => (
                  <div key={row.line} className={`flex items-center gap-3 p-3 rounded-lg ${row.is_valid ? 'bg-slate-900/50' : 'bg-red-500/10'}`}>
                    <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs ${row.is_valid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {row.is_valid ? '✓' : '✗'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{row.question}</p>
                      <p className="text-slate-500 text-xs truncate">→ {row.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={isLoading || !selectedFile || !title.trim() || validCount === 0}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
          >
            {isLoading ? '⏳ Importing...' : `📥 Import ${validCount} Questions`}
          </button>

          {result && (
            <div className={`p-4 rounded-lg ${result.success ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>
              {result.success ? '✅' : '❌'} {result.message}
            </div>
          )}
        </div>
      )}

      {activeTab === 'export' && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Export Questions to CSV</h3>

          <select
            value={selectedExportId}
            onChange={e => setSelectedExportId(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white mb-4"
          >
            <option value="">Select a quiz...</option>
            {quizSets.map(s => (
              <option key={s.id} value={s.id}>{s.title} ({s.question_count} questions)</option>
            ))}
          </select>

          <button
            onClick={handleExport}
            disabled={!selectedExportId || isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl disabled:opacity-50 transition"
          >
            {isLoading ? '⏳ Exporting...' : '📤 Export to CSV'}
          </button>
        </div>
      )}
    </div>
  )
}
