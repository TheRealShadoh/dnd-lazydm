'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/useToast'
import { MainNav } from '@/components/layout/MainNav'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Loader2,
  Sparkles,
  Wand2,
  FileText,
  Users,
  Swords,
  Map,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react'

interface GeneratedCampaign {
  name: string
  description: string
  synopsis?: string
  genre?: string
  level?: string
  players?: string
  duration?: string
  plotHooks?: string[]
  themes?: string[]
  warnings?: string[]
  majorNPCs?: Array<{
    name: string
    race: string
    class?: string
    personality?: string
    motivation?: string
  }>
  scenes?: Array<{
    title: string
    description: string
    readAloud?: string
  }>
  customMonsters?: Array<{
    name: string
    challengeRating: number
    type: string
  }>
}

const TONE_OPTIONS = [
  { value: 'heroic', label: 'Heroic', description: 'Classic fantasy adventure' },
  { value: 'serious', label: 'Serious', description: 'Darker, more grounded' },
  { value: 'lighthearted', label: 'Lighthearted', description: 'Fun and whimsical' },
  { value: 'dark', label: 'Dark', description: 'Horror and tragedy' },
  { value: 'comedic', label: 'Comedic', description: 'Humor-focused' },
]

const GENRE_OPTIONS = [
  'Fantasy Adventure',
  'Dark Fantasy',
  'High Fantasy',
  'Sword & Sorcery',
  'Mystery',
  'Horror',
  'Romantasy',
  'Political Intrigue',
  'Dungeon Crawl',
  'Exploration',
]

export default function GenerateCampaignPage() {
  const router = useRouter()
  const toast = useToast()

  // Generation form state
  const [concept, setConcept] = useState('')
  const [genre, setGenre] = useState('Fantasy Adventure')
  const [level, setLevel] = useState('1-5')
  const [players, setPlayers] = useState('4-5')
  const [duration, setDuration] = useState('3-5 sessions')
  const [tone, setTone] = useState('heroic')
  const [sceneCount, setSceneCount] = useState(5)
  const [includeMonsters, setIncludeMonsters] = useState(true)
  const [includeNPCs, setIncludeNPCs] = useState(true)
  const [setting, setSetting] = useState('')
  const [additionalContext, setAdditionalContext] = useState('')

  // UI state
  const [generating, setGenerating] = useState(false)
  const [enhancing, setEnhancing] = useState(false)
  const [generatedCampaign, setGeneratedCampaign] = useState<GeneratedCampaign | null>(null)
  const [creating, setCreating] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generationStep, setGenerationStep] = useState<string>('')
  const [generationProgress, setGenerationProgress] = useState(0)

  const handleEnhancePrompt = async () => {
    if (!concept.trim()) {
      toast.warning('Please enter a concept to enhance')
      return
    }

    setEnhancing(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: concept.trim(),
          type: 'campaign',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to enhance prompt')
      }

      if (data.success && data.enhanced) {
        setConcept(data.enhanced)
        toast.success('Prompt enhanced!')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to enhance prompt'
      setError(message)
      toast.error(message)
    } finally {
      setEnhancing(false)
    }
  }

  const handleGenerate = async () => {
    if (!concept.trim()) {
      toast.warning('Please enter a campaign concept')
      return
    }

    setGenerating(true)
    setError(null)
    setGeneratedCampaign(null)
    setGenerationProgress(0)

    // Simulate progress steps while waiting for API
    const steps = [
      { step: 'Analyzing your concept...', progress: 10 },
      { step: 'Generating campaign structure...', progress: 25 },
      { step: 'Creating story synopsis...', progress: 40 },
      { step: 'Designing scenes and encounters...', progress: 55 },
      { step: 'Building NPCs and characters...', progress: 70 },
      { step: 'Crafting custom monsters...', progress: 85 },
      { step: 'Finalizing campaign details...', progress: 95 },
    ]

    let stepIndex = 0
    const progressInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        setGenerationStep(steps[stepIndex].step)
        setGenerationProgress(steps[stepIndex].progress)
        stepIndex++
      }
    }, 3000)

    try {
      setGenerationStep(steps[0].step)
      setGenerationProgress(steps[0].progress)

      const res = await fetch('/api/ai/generate/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept,
          genre,
          level,
          players,
          duration,
          tone,
          sceneCount,
          includeMonsters,
          includeNPCs,
          setting: setting || undefined,
          context: additionalContext || undefined,
        }),
      })

      clearInterval(progressInterval)
      const data = await res.json()

      if (res.ok && data.success) {
        setGenerationStep('Complete!')
        setGenerationProgress(100)
        setGeneratedCampaign(data.campaign)
        toast.success('Campaign generated successfully!')
      } else {
        setError(data.error || 'Failed to generate campaign')
        toast.error(data.error || 'Failed to generate campaign')
      }
    } catch (err) {
      clearInterval(progressInterval)
      console.error('Generation error:', err)
      setError('Failed to generate campaign. Please try again.')
      toast.error('Failed to generate campaign')
    } finally {
      setGenerating(false)
      setGenerationStep('')
      setGenerationProgress(0)
    }
  }

  const handleCreateCampaign = async () => {
    if (!generatedCampaign) return

    setCreating(true)
    try {
      // Generate slug from name
      const slug = generatedCampaign.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      // Create the campaign with all generated content
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: generatedCampaign.name,
          slug,
          description: generatedCampaign.description,
          synopsis: generatedCampaign.synopsis,
          level: generatedCampaign.level,
          players: generatedCampaign.players,
          duration: generatedCampaign.duration,
          genre: generatedCampaign.genre,
          plotHooks: generatedCampaign.plotHooks,
          scenes: generatedCampaign.scenes,
          customMonsters: generatedCampaign.customMonsters,
          majorNPCs: generatedCampaign.majorNPCs,
          theme: {
            primary: '#ab47bc',
            secondary: '#7b1fa2',
          },
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success('Campaign created! You can now add the generated content.')
        router.push(`/admin/campaigns/${data.slug}`)
      } else {
        toast.error('Failed to create campaign')
      }
    } catch (err) {
      console.error('Create error:', err)
      toast.error('Failed to create campaign')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container max-w-5xl mx-auto py-8 px-4">
        <PageHeader
          title="AI Campaign Generator"
          description="Generate a complete D&D campaign using AI"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Admin', href: '/admin' },
            { label: 'Generate Campaign' },
          ]}
        />

        <div className="space-y-8 mt-8">
          {/* Generation Form */}
          <Card variant="fantasy">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                Campaign Concept
              </CardTitle>
              <CardDescription>
                Describe your campaign idea and let AI generate the details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Concept */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="concept">Campaign Concept *</Label>
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
                <textarea
                  id="concept"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  rows={4}
                  disabled={generating || enhancing}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg
                           text-foreground resize-y disabled:opacity-50
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="A group of adventurers must infiltrate a vampire's ball to rescue a kidnapped noble, but they soon discover the noble doesn't want to be rescued..."
                />
                <p className="text-xs text-muted-foreground">
                  Be specific about themes, plot hooks, or unique elements you want included
                </p>
              </div>

              {/* Basic Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <select
                    id="genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-foreground"
                  >
                    {GENRE_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Party Level</Label>
                  <Input
                    id="level"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    placeholder="1-5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="3-5 sessions"
                  />
                </div>
              </div>

              {/* Tone Selection */}
              <div className="space-y-2">
                <Label>Tone</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {TONE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTone(option.value)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        tone === option.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-muted/50 text-foreground hover:bg-muted'
                      }`}
                    >
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                Advanced Options
              </button>

              {showAdvanced && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="players">Number of Players</Label>
                      <Input
                        id="players"
                        value={players}
                        onChange={(e) => setPlayers(e.target.value)}
                        placeholder="4-5"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sceneCount">Number of Scenes</Label>
                      <Input
                        id="sceneCount"
                        type="number"
                        min={3}
                        max={10}
                        value={sceneCount}
                        onChange={(e) => setSceneCount(parseInt(e.target.value) || 5)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="setting">Setting (optional)</Label>
                      <Input
                        id="setting"
                        value={setting}
                        onChange={(e) => setSetting(e.target.value)}
                        placeholder="Forgotten Realms, Eberron..."
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeMonsters}
                        onChange={(e) => setIncludeMonsters(e.target.checked)}
                        className="rounded border-border"
                      />
                      <span className="text-sm text-foreground">Include custom monsters</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeNPCs}
                        onChange={(e) => setIncludeNPCs(e.target.checked)}
                        className="rounded border-border"
                      />
                      <span className="text-sm text-foreground">Include major NPCs</span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="context">Additional Context (optional)</Label>
                    <textarea
                      id="context"
                      value={additionalContext}
                      onChange={(e) => setAdditionalContext(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-muted border border-border rounded-lg
                               text-foreground resize-y
                               focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      placeholder="Any specific requirements, party composition, or constraints..."
                    />
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <Button
                variant="primary"
                size="lg"
                onClick={handleGenerate}
                disabled={generating || !concept.trim()}
                className="w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating Campaign...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Campaign
                  </>
                )}
              </Button>

              {/* Generation Progress */}
              {generating && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{generationStep}</span>
                    <span className="text-primary font-medium">{generationProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500 ease-out"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    <span>AI is crafting your adventure... This typically takes 30-60 seconds.</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generated Campaign Preview */}
          {generatedCampaign && (
            <Card variant="fantasy">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Generated: {generatedCampaign.name}
                    </CardTitle>
                    <CardDescription>{generatedCampaign.description}</CardDescription>
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleCreateCampaign}
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Map className="h-4 w-4 mr-2" />
                        Create Campaign
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Synopsis */}
                {generatedCampaign.synopsis && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Synopsis</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {generatedCampaign.synopsis}
                    </p>
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap gap-3">
                  {generatedCampaign.genre && (
                    <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                      {generatedCampaign.genre}
                    </span>
                  )}
                  {generatedCampaign.level && (
                    <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                      Level {generatedCampaign.level}
                    </span>
                  )}
                  {generatedCampaign.duration && (
                    <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                      {generatedCampaign.duration}
                    </span>
                  )}
                </div>

                {/* Plot Hooks */}
                {generatedCampaign.plotHooks && generatedCampaign.plotHooks.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Plot Hooks</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {generatedCampaign.plotHooks.map((hook, i) => (
                        <li key={i}>{hook}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Scenes Preview */}
                {generatedCampaign.scenes && generatedCampaign.scenes.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Scenes ({generatedCampaign.scenes.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {generatedCampaign.scenes.map((scene, i) => (
                        <div key={i} className="p-3 bg-muted/50 rounded-lg border border-border">
                          <div className="font-medium text-foreground">{i + 1}. {scene.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {scene.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* NPCs Preview */}
                {generatedCampaign.majorNPCs && generatedCampaign.majorNPCs.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Major NPCs ({generatedCampaign.majorNPCs.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {generatedCampaign.majorNPCs.map((npc, i) => (
                        <div key={i} className="p-3 bg-muted/50 rounded-lg border border-border">
                          <div className="font-medium text-foreground">{npc.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {npc.race} {npc.class && `- ${npc.class}`}
                          </div>
                          {npc.motivation && (
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {npc.motivation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Monsters Preview */}
                {generatedCampaign.customMonsters && generatedCampaign.customMonsters.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Swords className="h-4 w-4" />
                      Custom Monsters ({generatedCampaign.customMonsters.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {generatedCampaign.customMonsters.map((monster, i) => (
                        <span key={i} className="px-3 py-1 bg-destructive/20 text-destructive rounded-full text-sm">
                          {monster.name} (CR {monster.challengeRating})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {generatedCampaign.warnings && generatedCampaign.warnings.length > 0 && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <h3 className="font-semibold text-yellow-500 mb-2">Content Warnings</h3>
                    <div className="flex flex-wrap gap-2">
                      {generatedCampaign.warnings.map((warning, i) => (
                        <span key={i} className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded text-sm">
                          {warning}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-foreground mb-2">About AI Campaign Generation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The AI will generate a complete campaign structure including:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Campaign synopsis and plot hooks</li>
                <li>Multiple interconnected scenes with descriptions</li>
                <li>Major NPCs with personalities and motivations</li>
                <li>Custom monsters balanced for your party level</li>
                <li>Encounter suggestions and rewards</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                After generation, you can create the campaign and then add or modify individual
                scenes, monsters, and NPCs through the campaign admin panel.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
