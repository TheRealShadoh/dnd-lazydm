'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const variantStyles = {
    danger: {
      border: 'border-red-500',
      shadow: 'shadow-red-500/50',
      titleColor: 'text-red-400',
      confirmBg: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      border: 'border-yellow-500',
      shadow: 'shadow-yellow-500/50',
      titleColor: 'text-yellow-400',
      confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
      border: 'border-purple-500',
      shadow: 'shadow-purple-500/50',
      titleColor: 'text-purple-400',
      confirmBg: 'bg-purple-600 hover:bg-purple-700',
    },
  }

  const styles = variantStyles[variant]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-md bg-gray-900 rounded-xl border-2 ${styles.border} shadow-2xl ${styles.shadow}`}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-800">
              <h3 className={`text-xl font-bold ${styles.titleColor}`}>{title}</h3>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-300">{message}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 border-t border-gray-800">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-3 ${styles.confirmBg} text-white rounded-lg font-semibold transition-colors`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
