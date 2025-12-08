'use client'

import { AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

const variantStyles = {
  danger: {
    icon: 'bg-red-500/20 text-red-400',
    button: 'bg-red-500 hover:bg-red-600 shadow-red-500/25 hover:shadow-red-500/40',
  },
  warning: {
    icon: 'bg-yellow-500/20 text-yellow-400',
    button: 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/25 hover:shadow-yellow-500/40',
  },
  info: {
    icon: 'bg-blue-500/20 text-blue-400',
    button: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/25 hover:shadow-blue-500/40',
  },
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null

  const styles = variantStyles[variant]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div 
        className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 w-full max-w-sm border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon & Close */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${styles.icon}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">
            {title}
          </h3>
          <p className="text-white/60 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl font-medium transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${styles.button}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Deleting...</span>
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

