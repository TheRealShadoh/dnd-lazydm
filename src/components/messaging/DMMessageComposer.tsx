'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import {
  MessageSquare,
  Send,
  Users,
  Globe,
  Eye,
  EyeOff,
  Loader2,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import {
  DND_LANGUAGES,
  SPECIAL_LANGUAGES,
  LanguageOption,
  PlayerLanguageProfile,
  garbleText,
  playerKnowsLanguage,
} from '@/types/messaging'

interface Player {
  id: string
  name: string
  email?: string
  languages?: string[]
}

interface DMMessageComposerProps {
  campaignId: string
  players: Player[]
  onMessageSent?: () => void
}

export function DMMessageComposer({
  campaignId,
  players,
  onMessageSent,
}: DMMessageComposerProps) {
  const toast = useToast()

  // Form state
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>(['all'])
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>('Common')
  const [customLanguage, setCustomLanguage] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)

  // Computed values
  const isAllSelected = selectedRecipients.includes('all')
  const effectiveLanguage =
    selectedLanguage === SPECIAL_LANGUAGES.CUSTOM ? customLanguage : selectedLanguage

  // Toggle recipient selection
  const toggleRecipient = (playerId: string) => {
    if (playerId === 'all') {
      setSelectedRecipients(['all'])
    } else {
      setSelectedRecipients((prev) => {
        const filtered = prev.filter((id) => id !== 'all')
        if (filtered.includes(playerId)) {
          return filtered.filter((id) => id !== playerId)
        }
        return [...filtered, playerId]
      })
    }
  }

  // Generate preview for each player
  const generatePreviews = () => {
    const targetPlayers = isAllSelected
      ? players
      : players.filter((p) => selectedRecipients.includes(p.id))

    return targetPlayers.map((player) => {
      const playerLangs = player.languages || ['Common']
      const understands = playerKnowsLanguage(playerLangs, effectiveLanguage)
      return {
        player,
        understands,
        text: understands ? message : garbleText(message),
      }
    })
  }

  // Send message
  const handleSend = async () => {
    if (!message.trim()) {
      toast.warning('Please enter a message')
      return
    }

    if (selectedRecipients.length === 0) {
      toast.warning('Please select at least one recipient')
      return
    }

    if (selectedLanguage === SPECIAL_LANGUAGES.CUSTOM && !customLanguage.trim()) {
      toast.warning('Please enter a custom language name')
      return
    }

    setSending(true)
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: isAllSelected
            ? { type: 'all' }
            : selectedRecipients.length === 1
            ? { type: 'player', playerId: selectedRecipients[0] }
            : { type: 'players', playerIds: selectedRecipients },
          language: effectiveLanguage,
          message: message.trim(),
        }),
      })

      if (res.ok) {
        toast.success('Message sent!')
        setMessage('')
        setShowPreview(false)
        onMessageSent?.()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to send message')
      }
    } catch {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const previews = showPreview ? generatePreviews() : []

  return (
    <Card variant="fantasy">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Send Message to Players
        </CardTitle>
        <CardDescription>
          Send language-aware messages. Players who don&apos;t know the language will see garbled text.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recipients */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Recipients
          </Label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => toggleRecipient('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isAllSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All Players
            </button>
            {players.map((player) => (
              <button
                key={player.id}
                type="button"
                onClick={() => toggleRecipient(player.id)}
                disabled={isAllSelected}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedRecipients.includes(player.id) && !isAllSelected
                    ? 'bg-primary text-primary-foreground'
                    : isAllSelected
                    ? 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {player.name || player.email || 'Unknown Player'}
              </button>
            ))}
          </div>
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Language
          </Label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="w-full flex items-center justify-between px-4 py-2 bg-muted border border-border rounded-lg text-foreground hover:bg-muted/80 transition-colors"
            >
              <span>
                {selectedLanguage === SPECIAL_LANGUAGES.CUSTOM
                  ? customLanguage || 'Custom Language...'
                  : selectedLanguage}
              </span>
              {showLanguageDropdown ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showLanguageDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {/* Special options */}
                <div className="p-2 border-b border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLanguage(SPECIAL_LANGUAGES.UNKNOWN)
                      setShowLanguageDropdown(false)
                    }}
                    className={`w-full px-3 py-2 text-left rounded transition-colors ${
                      selectedLanguage === SPECIAL_LANGUAGES.UNKNOWN
                        ? 'bg-primary/20 text-primary'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <span className="font-medium">Unknown</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      (No one can read)
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLanguage(SPECIAL_LANGUAGES.CUSTOM)
                      setShowLanguageDropdown(false)
                    }}
                    className={`w-full px-3 py-2 text-left rounded transition-colors ${
                      selectedLanguage === SPECIAL_LANGUAGES.CUSTOM
                        ? 'bg-primary/20 text-primary'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <span className="font-medium">Custom Language</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      (Enter your own)
                    </span>
                  </button>
                </div>

                {/* Standard languages */}
                <div className="p-2">
                  {DND_LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        setSelectedLanguage(lang)
                        setShowLanguageDropdown(false)
                      }}
                      className={`w-full px-3 py-2 text-left rounded transition-colors ${
                        selectedLanguage === lang
                          ? 'bg-primary/20 text-primary'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Custom language input */}
          {selectedLanguage === SPECIAL_LANGUAGES.CUSTOM && (
            <Input
              value={customLanguage}
              onChange={(e) => setCustomLanguage(e.target.value)}
              placeholder="Enter custom language name..."
              className="mt-2"
            />
          )}
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            placeholder="Enter your message..."
          />
        </div>

        {/* Preview Toggle */}
        {message.trim() && (
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Preview Message
              </>
            )}
          </button>
        )}

        {/* Preview */}
        {showPreview && previews.length > 0 && (
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg border border-border">
            <h4 className="text-sm font-medium text-foreground mb-3">
              How each player will see this message:
            </h4>
            <div className="space-y-3">
              {previews.map(({ player, understands, text }) => (
                <div
                  key={player.id}
                  className={`p-3 rounded-lg border ${
                    understands
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-yellow-500/10 border-yellow-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground">
                      {player.name || 'Unknown Player'}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        understands
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {understands ? 'Understands' : 'Cannot read'}
                    </span>
                  </div>
                  <p
                    className={`text-sm ${
                      understands ? 'text-muted-foreground' : 'text-muted-foreground/70 font-mono'
                    }`}
                  >
                    {text}
                  </p>
                  {!understands && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Languages known: {(player.languages || ['Common']).join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Send Button */}
        <Button
          variant="primary"
          onClick={handleSend}
          disabled={sending || !message.trim()}
          className="w-full"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
