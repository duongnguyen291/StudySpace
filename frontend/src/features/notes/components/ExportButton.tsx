'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right + window.scrollX - 192, // 192 = dropdown width (w-48)
      })
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
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
    default: 'bg-white text-gray-900 hover:bg-white/90',
    outline: 'bg-white/10 border-white/20 text-white hover:bg-white/20',
    ghost: 'text-white/70 hover:text-white hover:bg-white/10',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
  }

  const dropdownContent = isOpen && (
    <div
      ref={dropdownRef}
      className="fixed w-48 bg-gray-800/95 backdrop-blur-md border border-white/20 rounded-lg shadow-xl z-[9999] overflow-hidden"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
      }}
    >
      <div className="py-1">
        <button
          type="button"
          onClick={() => handleExport('docx')}
          className="w-full px-4 py-2 text-left text-sm text-white/90 hover:bg-white/10 flex items-center gap-2 transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span>Export as DOCX</span>
        </button>
        <button
          type="button"
          onClick={() => handleExport('pdf')}
          className="w-full px-4 py-2 text-left text-sm text-white/90 hover:bg-white/10 flex items-center gap-2 transition-colors"
        >
          <File className="w-4 h-4" />
          <span>Export as PDF</span>
        </button>
        <button
          type="button"
          onClick={() => handleExport('html')}
          className="w-full px-4 py-2 text-left text-sm text-white/90 hover:bg-white/10 flex items-center gap-2 transition-colors"
        >
          <FileCode className="w-4 h-4" />
          <span>Export as HTML</span>
        </button>
        <button
          type="button"
          onClick={() => handleExport('txt')}
          className="w-full px-4 py-2 text-left text-sm text-white/90 hover:bg-white/10 flex items-center gap-2 transition-colors"
        >
          <FileType className="w-4 h-4" />
          <span>Export as TXT</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
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
      </div>
      {typeof window !== 'undefined' && isOpen && createPortal(dropdownContent, document.body)}
    </>
  )
}

