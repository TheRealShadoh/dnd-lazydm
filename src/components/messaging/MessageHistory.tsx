'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  MessageSquare,
  Loader2,
  Trash2,
  RefreshCw,
  ScrollText,
  Eye,
  EyeOff,
  Clock,
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { useConfirm } from '@/hooks/useConfirm'
import { CampaignMessage, PlayerMessage, garbleText } from '@/types/messaging'

interface MessageHistoryProps {
  campaignId: string
  isDM?: boolean
}

export function MessageHistory({ campaignId, isDM = false }: MessageHistoryProps) {
  const toast = useToast()
  const { confirm } = useConfirm()
  const [messages, setMessages] = useState<(CampaignMessage | PlayerMessage)[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadMessages = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    else setRefreshing(true)

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [campaignId])

  const handleClear = async () => {
    const confirmed = await confirm({
      title: 'Clear Message History',
      message: 'Are you sure you want to clear all messages? This cannot be undone.',
      confirmText: 'Clear All',
      variant: 'danger',
    })

    if (!confirmed) return

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/messages`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setMessages([])
        toast.success('Messages cleared')
      } else {
        toast.error('Failed to clear messages')
      }
    } catch {
      toast.error('Failed to clear messages')
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getRecipientsText = (msg: CampaignMessage) => {
    if (msg.recipients.type === 'all') return 'All Players'
    if (msg.recipients.type === 'player') return '1 Player'
    if (msg.recipients.type === 'players') {
      return `${msg.recipients.playerIds.length} Players`
    }
    return 'Unknown'
  }

  if (loading) {
    return (
      <Card variant="fantasy">
        <CardContent className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Loading messages...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="fantasy">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-primary" />
              Message History
            </CardTitle>
            <CardDescription>
              {isDM ? 'All messages you have sent' : 'Messages you have received'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadMessages(false)}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
              />
            </Button>
            {isDM && messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No messages yet.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.map((msg) => {
              const isCampaignMsg = 'originalText' in msg
              const playerMsg = msg as PlayerMessage
              const dmMsg = msg as CampaignMessage

              return (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg border ${
                    isCampaignMsg
                      ? 'bg-primary/5 border-primary/20'
                      : playerMsg.isMasked
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-purple-500/10 border-purple-500/30'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          isCampaignMsg
                            ? 'bg-primary/20 text-primary'
                            : playerMsg.isMasked
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}
                      >
                        {isCampaignMsg ? dmMsg.language : playerMsg.language}
                      </span>
                      {isCampaignMsg && (
                        <span className="text-xs text-muted-foreground">
                          To: {getRecipientsText(dmMsg)}
                        </span>
                      )}
                      {!isCampaignMsg && playerMsg.isMasked && (
                        <span className="text-xs text-amber-400 flex items-center gap-1">
                          <EyeOff className="h-3 w-3" />
                          Masked
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>

                  {/* Message Content */}
                  <p
                    className={`text-sm ${
                      !isCampaignMsg && playerMsg.isMasked
                        ? 'font-mono text-amber-200/80 tracking-wider'
                        : 'text-foreground'
                    }`}
                  >
                    {isCampaignMsg ? dmMsg.originalText : playerMsg.text}
                  </p>

                  {/* DM Preview of garbled text */}
                  {isDM && isCampaignMsg && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">
                        Players who don&apos;t understand {dmMsg.language} see:
                      </p>
                      <p className="text-xs font-mono text-muted-foreground/70 tracking-wider">
                        {garbleText(dmMsg.originalText)}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
