'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import {
  Globe,
  Save,
  Loader2,
  Plus,
  X,
  Users,
  Languages,
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { DND_LANGUAGES, PlayerLanguageProfile } from '@/types/messaging'

interface Player {
  id: string
  name: string
  email?: string
}

interface PlayerLanguageEditorProps {
  campaignId: string
  players: Player[]
}

export function PlayerLanguageEditor({ campaignId, players }: PlayerLanguageEditorProps) {
  const toast = useToast()
  const [profiles, setProfiles] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customLanguageInputs, setCustomLanguageInputs] = useState<Record<string, string>>({})

  // Load existing profiles
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const res = await fetch(`/api/campaigns/${campaignId}/player-languages`)
        if (res.ok) {
          const data = await res.json()
          const profileMap: Record<string, string[]> = {}
          data.profiles?.forEach((p: PlayerLanguageProfile) => {
            profileMap[p.playerId] = p.languages
          })
          // Initialize missing players with Common
          players.forEach((player) => {
            if (!profileMap[player.id]) {
              profileMap[player.id] = ['Common']
            }
          })
          setProfiles(profileMap)
        }
      } catch (error) {
        console.error('Error loading profiles:', error)
        // Initialize all players with Common
        const initial: Record<string, string[]> = {}
        players.forEach((p) => {
          initial[p.id] = ['Common']
        })
        setProfiles(initial)
      } finally {
        setLoading(false)
      }
    }

    loadProfiles()
  }, [campaignId, players])

  // Toggle a language for a player
  const toggleLanguage = (playerId: string, language: string) => {
    setProfiles((prev) => {
      const current = prev[playerId] || []
      const hasLanguage = current.some(
        (l) => l.toLowerCase() === language.toLowerCase()
      )
      return {
        ...prev,
        [playerId]: hasLanguage
          ? current.filter((l) => l.toLowerCase() !== language.toLowerCase())
          : [...current, language],
      }
    })
  }

  // Add a custom language
  const addCustomLanguage = (playerId: string) => {
    const customLang = customLanguageInputs[playerId]?.trim()
    if (!customLang) return

    setProfiles((prev) => {
      const current = prev[playerId] || []
      if (current.some((l) => l.toLowerCase() === customLang.toLowerCase())) {
        return prev
      }
      return {
        ...prev,
        [playerId]: [...current, customLang],
      }
    })
    setCustomLanguageInputs((prev) => ({ ...prev, [playerId]: '' }))
  }

  // Remove a language
  const removeLanguage = (playerId: string, language: string) => {
    setProfiles((prev) => ({
      ...prev,
      [playerId]: (prev[playerId] || []).filter(
        (l) => l.toLowerCase() !== language.toLowerCase()
      ),
    }))
  }

  // Save all profiles
  const handleSave = async () => {
    setSaving(true)
    try {
      const profilesArray = Object.entries(profiles).map(([playerId, languages]) => {
        const player = players.find((p) => p.id === playerId)
        return {
          playerId,
          playerName: player?.name || player?.email || 'Unknown',
          languages,
        }
      })

      const res = await fetch(`/api/campaigns/${campaignId}/player-languages`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profiles: profilesArray }),
      })

      if (res.ok) {
        toast.success('Player languages saved!')
      } else {
        toast.error('Failed to save languages')
      }
    } catch {
      toast.error('Failed to save languages')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card variant="fantasy">
        <CardContent className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Loading player languages...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="fantasy">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="h-5 w-5 text-primary" />
          Player Languages
        </CardTitle>
        <CardDescription>
          Set which languages each player&apos;s character knows. This affects message visibility.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {players.map((player) => (
          <div
            key={player.id}
            className="p-4 bg-muted/50 rounded-lg border border-border"
          >
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">
                {player.name || player.email || 'Unknown Player'}
              </span>
            </div>

            {/* Known Languages */}
            <div className="flex flex-wrap gap-2 mb-3">
              {(profiles[player.id] || []).map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary rounded-full text-sm"
                >
                  {lang}
                  <button
                    type="button"
                    onClick={() => removeLanguage(player.id, lang)}
                    className="hover:bg-primary/30 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {(profiles[player.id] || []).length === 0 && (
                <span className="text-sm text-muted-foreground italic">
                  No languages set
                </span>
              )}
            </div>

            {/* Standard Language Toggles */}
            <div className="mb-3">
              <Label className="text-xs text-muted-foreground mb-2 block">
                Toggle Standard Languages:
              </Label>
              <div className="flex flex-wrap gap-1">
                {DND_LANGUAGES.slice(0, 8).map((lang) => {
                  const hasLang = (profiles[player.id] || []).some(
                    (l) => l.toLowerCase() === lang.toLowerCase()
                  )
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(player.id, lang)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        hasLang
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {lang}
                    </button>
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {DND_LANGUAGES.slice(8).map((lang) => {
                  const hasLang = (profiles[player.id] || []).some(
                    (l) => l.toLowerCase() === lang.toLowerCase()
                  )
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(player.id, lang)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        hasLang
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {lang}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Custom Language Input */}
            <div className="flex gap-2">
              <Input
                value={customLanguageInputs[player.id] || ''}
                onChange={(e) =>
                  setCustomLanguageInputs((prev) => ({
                    ...prev,
                    [player.id]: e.target.value,
                  }))
                }
                placeholder="Add custom language..."
                className="flex-1 h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCustomLanguage(player.id)
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addCustomLanguage(player.id)}
                className="h-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {players.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              No players in this campaign yet.
            </p>
          </div>
        )}

        {/* Save Button */}
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving}
          className="w-full"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Language Profiles
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
