'use client'

import { useEffect, useState } from 'react'
import { X, MessageSquare, ScrollText, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PlayerMessage } from '@/types/messaging'
import { useMessageStore } from '@/lib/stores/messageStore'

interface MessagePopupProps {
  message: PlayerMessage
  onClose: () => void
  autoHide?: boolean
  autoHideDelay?: number
}

export function MessagePopup({
  message,
  onClose,
  autoHide = true,
  autoHideDelay = 10000,
}: MessagePopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true))

    // Auto-hide after delay
    if (autoHide) {
      const timer = setTimeout(() => {
        handleClose()
      }, autoHideDelay)
      return () => clearTimeout(timer)
    }
  }, [autoHide, autoHideDelay])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div
      className={`fixed top-4 right-4 z-[100] max-w-md w-full transform transition-all duration-300 ease-out ${
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-lg border shadow-2xl ${
          message.isMasked
            ? 'bg-gradient-to-br from-amber-950/95 to-amber-900/95 border-amber-500/50'
            : 'bg-gradient-to-br from-purple-950/95 to-purple-900/95 border-purple-500/50'
        }`}
      >
        {/* Decorative top border */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            message.isMasked
              ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500'
              : 'bg-gradient-to-r from-purple-500 via-pink-400 to-purple-500'
          }`}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            {message.isMasked ? (
              <ScrollText className="h-5 w-5 text-amber-400" />
            ) : (
              <MessageSquare className="h-5 w-5 text-purple-400" />
            )}
            <span className="text-sm font-medium text-foreground">
              Message from {message.senderName}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Language indicator */}
        <div className="px-4 pb-2">
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              message.isMasked
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-purple-500/20 text-purple-300'
            }`}
          >
            {message.language}
            {message.isMasked && ' (Unknown to you)'}
          </span>
        </div>

        {/* Message Content */}
        <div className="px-4 pb-4">
          <div
            className={`p-4 rounded-lg ${
              message.isMasked
                ? 'bg-amber-900/50 border border-amber-500/30'
                : 'bg-purple-900/50 border border-purple-500/30'
            }`}
          >
            <p
              className={`${
                message.isMasked
                  ? 'font-mono text-amber-200/80 tracking-wider'
                  : 'text-foreground'
              }`}
            >
              {message.text}
            </p>
          </div>

          {message.isMasked && (
            <p className="text-xs text-amber-400/70 mt-2 italic">
              You do not understand this language. The message appears as arcane symbols.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-black/20 border-t border-white/10">
          <span className="text-xs text-muted-foreground">
            {formatTime(message.timestamp)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-xs h-7"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  )
}

// Provider component to show popups globally
export function MessagePopupProvider() {
  const { showMessagePopup, currentPopupMessage, hidePopup, markAsRead } = useMessageStore()

  if (!showMessagePopup || !currentPopupMessage) {
    return null
  }

  const handleClose = () => {
    if (currentPopupMessage) {
      markAsRead(currentPopupMessage.campaignId, currentPopupMessage.id)
    }
    hidePopup()
  }

  return <MessagePopup message={currentPopupMessage} onClose={handleClose} />
}
