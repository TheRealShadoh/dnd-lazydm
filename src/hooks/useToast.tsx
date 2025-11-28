'use client'

import { createContext, useContext, ReactNode, useCallback } from 'react'
import { toast as sonnerToast } from 'sonner'
import { Toaster } from '@/components/ui/Sonner'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface ToastContextType {
  showToast: (message: string, variant: ToastVariant, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const showToast = useCallback((message: string, variant: ToastVariant, duration = 5000) => {
    const icons = {
      success: <CheckCircle className="h-5 w-5 text-success" />,
      error: <XCircle className="h-5 w-5 text-destructive" />,
      warning: <AlertTriangle className="h-5 w-5 text-warning" />,
      info: <Info className="h-5 w-5 text-primary" />,
    }

    sonnerToast(message, {
      icon: icons[variant],
      duration,
      className: variant,
    })
  }, [])

  const success = useCallback((message: string, duration?: number) => {
    sonnerToast.success(message, {
      icon: <CheckCircle className="h-5 w-5 text-success" />,
      duration,
    })
  }, [])

  const error = useCallback((message: string, duration?: number) => {
    sonnerToast.error(message, {
      icon: <XCircle className="h-5 w-5 text-destructive" />,
      duration,
    })
  }, [])

  const warning = useCallback((message: string, duration?: number) => {
    sonnerToast.warning(message, {
      icon: <AlertTriangle className="h-5 w-5 text-warning" />,
      duration,
    })
  }, [])

  const info = useCallback((message: string, duration?: number) => {
    sonnerToast.info(message, {
      icon: <Info className="h-5 w-5 text-primary" />,
      duration,
    })
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Re-export toast for direct usage
export { sonnerToast as toast }
