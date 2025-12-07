'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Folder, Book, Lightbulb, Search, Briefcase, User, Plus, X } from 'lucide-react'
import { noteCategoryService } from '../services/noteService'
import type { NoteCategory } from '../types/note.types'

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  folder: Folder,
  book: Book,
  lightbulb: Lightbulb,
  search: Search,
  briefcase: Briefcase,
  user: User,
}

interface Props {
  selectedCategoryId: string | null
  onCategoryChange: (categoryId: string | null) => void
  disabled?: boolean
  textColor?: string
  compact?: boolean
}

export const NoteCategorySelector = ({
  selectedCategoryId,
  onCategoryChange,
  disabled = false,
  textColor = '#ffffff',
  compact = false,
}: Props) => {
  const [categories, setCategories] = useState<NoteCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await noteCategoryService.getAll()
        setCategories(data)
      } catch (err) {
        console.error('Failed to load note categories:', err)
      } finally {
        setLoading(false)
      }
    }
    loadCategories()
  }, [])

  const selectedCategory = categories.find(c => c.id === selectedCategoryId)
  const IconComponent = selectedCategory ? ICON_MAP[selectedCategory.icon] || Folder : Folder

  if (loading) {
    return (
      <div 
        className={`${compact ? 'h-9' : 'h-10'} px-3 rounded-lg bg-white/10 border border-white/20 flex items-center gap-2`}
        style={{ color: `${textColor}80` }}
      >
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Đang tải...</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`${compact ? 'h-9 text-xs' : 'h-10 text-sm'} w-full px-3 rounded-lg bg-white/10 border border-white/20 flex items-center justify-between gap-2 transition-all hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed`}
        style={{ color: textColor }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {selectedCategory ? (
            <>
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${selectedCategory.color}30` }}
              >
                <IconComponent className="w-3 h-3" style={{ color: selectedCategory.color }} />
              </div>
              <span className="truncate">{selectedCategory.name}</span>
            </>
          ) : (
            <>
              <Folder className="w-4 h-4 opacity-50" />
              <span className="opacity-70">Chọn danh mục</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          {selectedCategory && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onCategoryChange(null)
              }}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-3 h-3 opacity-50" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Dropdown */}
          <div 
            className="absolute z-20 top-full left-0 right-0 mt-1 py-1 rounded-lg border border-white/20 backdrop-blur-xl shadow-xl max-h-60 overflow-y-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
            }}
          >
            {/* None option */}
            <button
              type="button"
              onClick={() => {
                onCategoryChange(null)
                setIsOpen(false)
              }}
              className={`w-full px-3 py-2 flex items-center gap-2 text-sm transition-colors hover:bg-white/10 ${
                !selectedCategoryId ? 'bg-white/10' : ''
              }`}
              style={{ color: textColor }}
            >
              <Folder className="w-4 h-4 opacity-50" />
              <span className="opacity-70">Không có danh mục</span>
            </button>

            {/* Divider */}
            <div className="border-t border-white/10 my-1" />

            {/* Categories */}
            {categories.map((category) => {
              const CatIcon = ICON_MAP[category.icon] || Folder
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    onCategoryChange(category.id)
                    setIsOpen(false)
                  }}
                  className={`w-full px-3 py-2 flex items-center gap-2 text-sm transition-colors hover:bg-white/10 ${
                    selectedCategoryId === category.id ? 'bg-white/10' : ''
                  }`}
                  style={{ color: textColor }}
                >
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${category.color}30` }}
                  >
                    <CatIcon className="w-3 h-3" style={{ color: category.color }} />
                  </div>
                  <span className="truncate">{category.name}</span>
                  {category.is_default && (
                    <span className="ml-auto text-xs opacity-50">Mặc định</span>
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default NoteCategorySelector

