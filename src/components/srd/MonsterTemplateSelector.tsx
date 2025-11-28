'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { MonsterStatBlock } from './MonsterStatBlock'
import { ChallengeRatingBadge } from './shared'
import { Search, Loader2, X, Check, Skull, ChevronDown, ChevronUp } from 'lucide-react'
import type { SRDMonster } from '@/lib/srd/models'

interface MonsterTemplateSelectorProps {
  onSelect: (monster: SRDMonster) => void
  onClear: () => void
  selectedMonster?: SRDMonster | null
  className?: string
}

export function MonsterTemplateSelector({
  onSelect,
  onClear,
  selectedMonster,
  className = '',
}: MonsterTemplateSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(!selectedMonster)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [results, setResults] = useState<SRDMonster[]>([])
  const [loading, setLoading] = useState(false)
  const [previewMonster, setPreviewMonster] = useState<SRDMonster | null>(null)
  const [crFilter, setCrFilter] = useState<string>('')

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch monsters
  useEffect(() => {
    if (!isExpanded) return

    async function fetchMonsters() {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          type: 'monsters',
          query: debouncedQuery,
          source: 'all',
          limit: '50',
        })

        const response = await fetch(`/api/srd?${params}`)
        if (response.ok) {
          const data = await response.json()
          let monsters = data.results as SRDMonster[]

          // Apply CR filter if set
          if (crFilter) {
            const cr = parseFloat(crFilter)
            monsters = monsters.filter((m) => m.challengeRating === cr)
          }

          // Sort by CR then name
          monsters.sort((a, b) => {
            if (a.challengeRating !== b.challengeRating) {
              return a.challengeRating - b.challengeRating
            }
            return a.name.localeCompare(b.name)
          })

          setResults(monsters.slice(0, 20)) // Limit to 20 results
        }
      } catch (error) {
        console.error('Error fetching monsters:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    fetchMonsters()
  }, [debouncedQuery, crFilter, isExpanded])

  const handleSelectMonster = useCallback(
    (monster: SRDMonster) => {
      setPreviewMonster(monster)
    },
    []
  )

  const handleApplyTemplate = useCallback(() => {
    if (previewMonster) {
      onSelect(previewMonster)
      setIsExpanded(false)
      setPreviewMonster(null)
      setSearchQuery('')
    }
  }, [previewMonster, onSelect])

  const handleClear = useCallback(() => {
    onClear()
    setPreviewMonster(null)
    setSearchQuery('')
    setIsExpanded(true)
  }, [onClear])

  // If a monster is already selected, show compact view
  if (selectedMonster && !isExpanded) {
    return (
      <Card variant="fantasy" className={`border-success/50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Check className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Based on template:</p>
                <p className="font-semibold text-foreground">{selectedMonster.name}</p>
              </div>
              <ChallengeRatingBadge cr={selectedMonster.challengeRating} showXP={false} size="sm" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsExpanded(true)}>
                Change
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="fantasy" className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Skull className="h-5 w-5 text-primary" />
            Start from SRD Template
          </CardTitle>
          {selectedMonster && (
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
              <ChevronUp className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Search for an existing monster to use as a starting point
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and Filter Row */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search monsters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="w-32">
            <select
              value={crFilter}
              onChange={(e) => setCrFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Any CR</option>
              <option value="0">CR 0</option>
              <option value="0.125">CR 1/8</option>
              <option value="0.25">CR 1/4</option>
              <option value="0.5">CR 1/2</option>
              {Array.from({ length: 30 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  CR {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : results.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              {debouncedQuery ? 'No monsters found' : 'Search for a monster to get started'}
            </div>
          ) : (
            results.map((monster) => (
              <button
                key={monster.id}
                onClick={() => handleSelectMonster(monster)}
                className={`p-3 text-left rounded-lg border transition-colors ${
                  previewMonster?.id === monster.id
                    ? 'bg-primary/10 border-primary'
                    : 'bg-card border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground truncate">{monster.name}</span>
                  <ChallengeRatingBadge cr={monster.challengeRating} showXP={false} size="sm" />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {monster.size} {monster.type}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Preview Panel */}
        {previewMonster && (
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-foreground">Preview: {previewMonster.name}</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreviewMonster(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleApplyTemplate}>
                  <Check className="h-4 w-4 mr-1" />
                  Use This Template
                </Button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto rounded-lg border border-border">
              <MonsterStatBlock monster={previewMonster} variant="compact" />
            </div>
          </div>
        )}

        {/* Skip Option */}
        {!selectedMonster && !previewMonster && (
          <p className="text-xs text-muted-foreground text-center">
            Or skip this step to create a monster from scratch
          </p>
        )}
      </CardContent>
    </Card>
  )
}
