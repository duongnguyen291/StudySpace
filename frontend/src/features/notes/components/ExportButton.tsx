'use client'

import { useState, useRef, useEffect } from 'react'
import { Download, FileText, File, FileCode, FileType, Loader2 } from 'lucide-react'
import { exportToDocx, exportToPdf, exportToTxt, exportToHtml, type ExportNoteData } from '../utils/exportNote'
import { showToast } from '@/shared/utils/toast'

interface ExportButtonProps {
  note: ExportNoteData
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md'
}

export const ExportButton = ({ note, variant = 'outline', size = 'sm' }: ExportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleExport = async (format: 'docx' | 'pdf' | 'txt' | 'html') => {
    setIsExporting(format)
    setIsOpen(false)

    try {
      switch (format) {
        case 'docx':
          await exportToDocx(note)
          showToast('Đã export thành công (DOCX)')
          break
        case 'pdf':
          await exportToPdf(note)
          showToast('Đã export thành công (PDF)')
          break
        case 'txt':
          exportToTxt(note)
          showToast('Đã export thành công (TXT)')
          break
        case 'html':
          exportToHtml(note)
          showToast('Đã export thành công (HTML)')
          break
      }
    } catch (error) {
      console.error('Export error:', error)
      showToast('Có lỗi xảy ra khi export')
    } finally {
      setIsExporting(null)
    }
  }

  const buttonClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-600 text-gray-300 hover:bg-gray-700',
    ghost: 'text-gray-300 hover:bg-gray-700',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting !== null}
        className={`
          ${buttonClasses[variant]}
          ${sizeClasses[size]}
          rounded-md
          flex items-center gap-2
          transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Đang export...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Export</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="py-1">
            <button
              type="button"
              onClick={() => handleExport('docx')}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Export as DOCX</span>
            </button>
            <button
              type="button"
              onClick={() => handleExport('pdf')}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2 transition-colors"
            >
              <File className="w-4 h-4" />
              <span>Export as PDF</span>
            </button>
            <button
              type="button"
              onClick={() => handleExport('html')}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2 transition-colors"
            >
              <FileCode className="w-4 h-4" />
              <span>Export as HTML</span>
            </button>
            <button
              type="button"
              onClick={() => handleExport('txt')}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2 transition-colors"
            >
              <FileType className="w-4 h-4" />
              <span>Export as TXT</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

