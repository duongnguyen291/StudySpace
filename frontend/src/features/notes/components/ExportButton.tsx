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
  themeColor?: string
  themeBorderColor?: string
  themeBgColor?: string
}

export const ExportButton = ({ 
  note, 
  variant = 'outline', 
  size = 'sm',
  themeColor,
  themeBorderColor,
  themeBgColor,
}: ExportButtonProps) => {
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

  const getButtonStyles = () => {
    if (themeColor && themeBorderColor && themeBgColor) {
      return {
        default: {
          backgroundColor: themeBorderColor,
          color: themeColor,
          borderColor: themeBorderColor,
        },
        outline: {
          backgroundColor: `${themeBgColor}60`,
          borderColor: themeBorderColor,
          color: themeColor,
          boxShadow: `0 2px 8px 0 ${themeBorderColor}40, inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`,
        },
        ghost: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          color: '#ffffff',
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
        },
      }
    }
    // Default styles khi không có theme props (cho note list)
    return {
      default: {},
      outline: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        color: '#ffffff',
        boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      },
      ghost: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        color: '#ffffff',
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      },
    }
  }

  const buttonStyles = getButtonStyles()

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
            ${sizeClasses[size]}
            rounded-md
            flex items-center gap-2
            transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
            border
          `}
          style={buttonStyles[variant]}
          onMouseEnter={(e) => {
            if (variant === 'outline' && themeBgColor) {
              e.currentTarget.style.backgroundColor = `${themeBgColor}80`
              e.currentTarget.style.boxShadow = `0 4px 12px 0 ${themeBorderColor}60, inset 0 1px 0 0 rgba(255, 255, 255, 0.15)`
            } else if (variant === 'ghost') {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
              e.currentTarget.style.boxShadow = '0 4px 8px 0 rgba(0, 0, 0, 0.3)'
            } else if (variant === 'default' && themeBorderColor) {
              e.currentTarget.style.opacity = '0.9'
            } else if (variant === 'outline' && !themeBgColor) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
            } else if (variant === 'ghost' && !themeBgColor) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
            }
          }}
          onMouseLeave={(e) => {
            if (variant === 'outline' && themeBgColor) {
              e.currentTarget.style.backgroundColor = `${themeBgColor}60`
              e.currentTarget.style.boxShadow = `0 2px 8px 0 ${themeBorderColor}40, inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`
            } else if (variant === 'ghost') {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.boxShadow = '0 2px 4px 0 rgba(0, 0, 0, 0.2)'
            } else if (variant === 'default') {
              e.currentTarget.style.opacity = '1'
            } else if (variant === 'outline' && !themeBgColor) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
            } else if (variant === 'ghost' && !themeBgColor) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            }
          }}
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

