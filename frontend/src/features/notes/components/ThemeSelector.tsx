"use client"

import { useState, useRef, useEffect } from 'react'
import { NOTE_THEMES, type NoteTheme, DEFAULT_THEME } from '../constants/note-themes'
import { Check, Palette, ChevronDown } from 'lucide-react'

interface ThemeSelectorProps {
  selectedTheme?: NoteTheme
  onThemeChange: (theme: NoteTheme) => void
  disabled?: boolean
  textColor?: string
}

export const ThemeSelector = ({ selectedTheme = DEFAULT_THEME, onThemeChange, disabled, textColor }: ThemeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const selectedThemeConfig = NOTE_THEMES[selectedTheme]

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

  const handleThemeSelect = (theme: NoteTheme) => {
    if (!disabled) {
      onThemeChange(theme)
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Theme Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
        `}
        style={{
          backgroundColor: selectedThemeConfig.bgColorHex,
          borderColor: selectedThemeConfig.borderColorHex,
          color: selectedThemeConfig.textColorHex || textColor,
        }}
      >
        <Palette className="w-4 h-4" />
        <span className="text-sm font-medium">{selectedThemeConfig.icon} {selectedThemeConfig.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 bg-gray-900/95 backdrop-blur-md rounded-lg border border-white/20 shadow-2xl z-50 min-w-[320px] max-h-[500px] overflow-y-auto p-3"
          style={{ 
            backgroundColor: 'rgba(17, 24, 39, 0.98)',
          }}
        >
          <div className="text-xs font-medium text-white mb-3 px-2">Chọn theme</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(NOTE_THEMES).map((theme) => {
              const isSelected = selectedTheme === theme.id
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleThemeSelect(theme.id)}
                  disabled={disabled}
                  className={`
                    relative px-4 py-2.5 rounded-lg border-2 transition-all text-left
                    ${isSelected 
                      ? 'shadow-lg ring-2 ring-blue-500/50' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  style={isSelected ? {
                    backgroundColor: theme.bgColorHex,
                    borderColor: theme.borderColorHex,
                  } : {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {/* Theme info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{theme.icon}</span>
                      <span 
                        className="text-sm font-medium"
                        style={{ color: isSelected ? theme.textColorHex : '#e5e7eb' }}
                      >
                        {theme.name}
                      </span>
                    </div>
                    
                    {/* Check icon */}
                    {isSelected && (
                      <Check className="w-4 h-4" style={{ color: theme.textColorHex }} />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

