'use client'

import { Toaster as SonnerToaster } from 'sonner'

/**
 * Sonner Toaster with fantasy theme styling
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'group toast flex items-center gap-3 p-4 rounded-lg border shadow-fantasy-lg backdrop-blur-sm min-w-[300px] max-w-md',
          title: 'text-sm font-medium text-foreground',
          description: 'text-sm text-muted-foreground',
          actionButton:
            'bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-medium hover:bg-primary/90',
          cancelButton:
            'bg-muted text-muted-foreground px-3 py-1.5 rounded-md text-xs font-medium hover:bg-muted/80',
          closeButton:
            'absolute right-2 top-2 text-muted-foreground hover:text-foreground transition-colors',
          success: 'bg-green-900/90 border-success/50',
          error: 'bg-red-900/90 border-destructive/50',
          warning: 'bg-amber-900/90 border-warning/50',
          info: 'bg-primary/10 border-primary/50',
        },
      }}
    />
  )
}
