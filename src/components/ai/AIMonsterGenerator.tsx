'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Sparkles, Loader2, AlertCircle, Wand2, Zap } from 'lucide-react'

export interface GeneratedMonsterData {
  name: string
  size: string
  type: string
  alignment?: string
  armorClass: number
  armorType?: string
  hitPoints: number
  hitDice: string
  speed: string
  abilities: {
    str: number
    dex: number
    con: number
    int: number
    wis: number
    cha: number
  }
  savingThrows?: string[]
  skills?: string[]
  damageResistances?: string[]
  damageImmunities?: string[]
  conditionImmunities?: string[]
  senses?: string[]
  languages?: string[]
  challengeRating: number
  xp?: number
  traits?: Array<{ name: string; description: string }>
  actions?: Array<{ name: string; description: string }>
  reactions?: Array<{ name: string; description: string }>
  legendaryActions?: Array<{ name: string; description: string }>
  description?: string
  imagePrompt?: string
}

interface AIMonsterGeneratorProps {
  onGenerated: (monster: GeneratedMonsterData) => void
  campaignId?: string
}

export function AIMonsterGenerator({ onGenerated, campaignId }: AIMonsterGeneratorProps) {
  const [concept, setConcept] = useState('')
  const [targetCR, setTargetCR] = useState('')
  const [monsterType, setMonsterType] = useState('')
  const [size, setSize] = useState('')

  const [generating, setGenerating] = useState(false)
  const [enhancing, setEnhancing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEnhancePrompt = async () => {
    if (!concept.trim()) {
      setError('Please enter a concept to enhance')
      return
    }

    setEnhancing(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: concept.trim(),
          type: 'monster',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enhance prompt')
      }

      if (data.success && data.enhanced) {
        setConcept(data.enhanced)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enhance prompt')
    } finally {
      setEnhancing(false)
    }
  }

  const handleGenerate = async () => {
    if (!concept.trim()) {
      setError('Please enter a monster concept')
      return
    }

    setGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/generate/monster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: concept.trim(),
          targetCR: targetCR || undefined,
          monsterType: monsterType || undefined,
          size: size || undefined,
          campaignId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate monster')
      }

      if (data.success && data.monster) {
        onGenerated(data.monster)
        setConcept('')
        setTargetCR('')
        setMonsterType('')
        setSize('')
      } else {
        throw new Error('Invalid response from API')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate monster')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Monster Generator
        </CardTitle>
        <CardDescription>
          Describe your monster concept and let AI create a balanced stat block
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="concept">Monster Concept *</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleEnhancePrompt}
              disabled={enhancing || generating || !concept.trim()}
              className="text-xs h-7 px-2"
            >
              {enhancing ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Zap className="h-3 w-3 mr-1" />
                  Enhance Prompt
                </>
              )}
            </Button>
          </div>
          <Textarea
            id="concept"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="e.g., A corrupted tree guardian that protects an ancient forest, using root attacks and poison spores"
            rows={3}
            disabled={generating || enhancing}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ai-cr">Target CR (optional)</Label>
            <Input
              id="ai-cr"
              type="text"
              value={targetCR}
              onChange={(e) => setTargetCR(e.target.value)}
              placeholder="e.g., 3"
              disabled={generating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-type">Creature Type (optional)</Label>
            <select
              id="ai-type"
              value={monsterType}
              onChange={(e) => setMonsterType(e.target.value)}
              disabled={generating}
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg
                       focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                       text-foreground font-ui disabled:opacity-50"
            >
              <option value="">Any</option>
              <option value="Aberration">Aberration</option>
              <option value="Beast">Beast</option>
              <option value="Celestial">Celestial</option>
              <option value="Construct">Construct</option>
              <option value="Dragon">Dragon</option>
              <option value="Elemental">Elemental</option>
              <option value="Fey">Fey</option>
              <option value="Fiend">Fiend</option>
              <option value="Giant">Giant</option>
              <option value="Humanoid">Humanoid</option>
              <option value="Monstrosity">Monstrosity</option>
              <option value="Ooze">Ooze</option>
              <option value="Plant">Plant</option>
              <option value="Undead">Undead</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-size">Size (optional)</Label>
            <select
              id="ai-size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              disabled={generating}
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg
                       focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                       text-foreground font-ui disabled:opacity-50"
            >
              <option value="">Any</option>
              <option value="Tiny">Tiny</option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
              <option value="Huge">Huge</option>
              <option value="Gargantuan">Gargantuan</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="button"
          variant="primary"
          onClick={handleGenerate}
          disabled={generating || !concept.trim()}
          className="w-full"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Monster...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate with AI
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Requires Claude API key configured in Settings
        </p>
      </CardContent>
    </Card>
  )
}
