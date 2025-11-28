'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MainNav } from '@/components/layout/MainNav'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'
import {
  Loader2,
  Save,
  RotateCcw,
  FileText,
  Swords,
  Users,
  Map,
  Target,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

interface SystemPrompt {
  type: string
  name: string
  description: string
  prompt: string
  isDefault: boolean
  updatedAt: string
}

const PROMPT_ICONS: Record<string, React.ReactNode> = {
  campaign: <Map className="h-5 w-5" />,
  monster: <Swords className="h-5 w-5" />,
  npc: <Users className="h-5 w-5" />,
  scene: <FileText className="h-5 w-5" />,
  encounter: <Target className="h-5 w-5" />,
}

export default function SystemPromptsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const toast = useToast()

  const [prompts, setPrompts] = useState<SystemPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [editedPrompt, setEditedPrompt] = useState('')
  const [defaultPrompt, setDefaultPrompt] = useState('')
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)

  // Check auth and admin status
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin
      if (!isAdmin) {
        router.push('/dashboard')
        toast.error('Admin access required')
      }
    }
  }, [status, session, router, toast])

  // Load prompts
  useEffect(() => {
    async function loadPrompts() {
      try {
        const res = await fetch('/api/admin/system-prompts')
        if (res.ok) {
          const data = await res.json()
          setPrompts(data.prompts || [])
        } else if (res.status === 403) {
          toast.error('Admin access required')
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Failed to load prompts:', error)
        toast.error('Failed to load system prompts')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      loadPrompts()
    }
  }, [status, router, toast])

  // Load specific prompt when selected
  useEffect(() => {
    async function loadPrompt() {
      if (!selectedType) return

      try {
        const res = await fetch(`/api/admin/system-prompts?type=${selectedType}`)
        if (res.ok) {
          const data = await res.json()
          setEditedPrompt(data.prompt?.prompt || '')
          setDefaultPrompt(data.defaultPrompt || '')
        }
      } catch (error) {
        console.error('Failed to load prompt:', error)
      }
    }

    loadPrompt()
  }, [selectedType])

  const handleSave = async () => {
    if (!selectedType) return

    setSaving(true)
    try {
      const res = await fetch('/api/admin/system-prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          prompt: editedPrompt,
        }),
      })

      if (res.ok) {
        toast.success('System prompt saved!')
        // Refresh prompts list
        const listRes = await fetch('/api/admin/system-prompts')
        if (listRes.ok) {
          const data = await listRes.json()
          setPrompts(data.prompts || [])
        }
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save prompt')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save prompt')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!selectedType) return

    setResetting(true)
    try {
      const res = await fetch('/api/admin/system-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType }),
      })

      if (res.ok) {
        const data = await res.json()
        setEditedPrompt(data.prompt?.prompt || defaultPrompt)
        toast.success('Prompt reset to default!')
        // Refresh prompts list
        const listRes = await fetch('/api/admin/system-prompts')
        if (listRes.ok) {
          const listData = await listRes.json()
          setPrompts(listData.prompts || [])
        }
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to reset prompt')
      }
    } catch (error) {
      console.error('Reset error:', error)
      toast.error('Failed to reset prompt')
    } finally {
      setResetting(false)
    }
  }

  const selectedPromptData = prompts.find(p => p.type === selectedType)

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container max-w-7xl mx-auto py-8 px-4">
        <PageHeader
          title="System Prompts"
          description="Customize AI generation prompts for campaigns, monsters, NPCs, and more"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Admin', href: '/admin' },
            { label: 'System Prompts' },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
          {/* Prompt List */}
          <div className="lg:col-span-1">
            <Card variant="fantasy">
              <CardHeader>
                <CardTitle>Prompt Types</CardTitle>
                <CardDescription>Select a prompt to edit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {prompts.map((prompt) => (
                  <button
                    key={prompt.type}
                    onClick={() => setSelectedType(prompt.type)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      selectedType === prompt.type
                        ? 'bg-primary/20 border border-primary/50 text-primary'
                        : 'bg-muted/50 border border-border hover:bg-muted text-foreground'
                    }`}
                  >
                    <div className={selectedType === prompt.type ? 'text-primary' : 'text-muted-foreground'}>
                      {PROMPT_ICONS[prompt.type] || <FileText className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{prompt.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        {prompt.isDefault ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            Default
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 text-yellow-500" />
                            Modified
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Prompt Editor */}
          <div className="lg:col-span-3">
            {selectedType ? (
              <Card variant="fantasy">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {PROMPT_ICONS[selectedType]}
                        {selectedPromptData?.name || selectedType}
                      </CardTitle>
                      <CardDescription>
                        {selectedPromptData?.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {!selectedPromptData?.isDefault && (
                        <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-500 rounded">
                          Modified
                        </span>
                      )}
                      {selectedPromptData?.updatedAt && (
                        <span className="text-xs text-muted-foreground">
                          Updated: {new Date(selectedPromptData.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      System Prompt
                    </label>
                    <textarea
                      value={editedPrompt}
                      onChange={(e) => setEditedPrompt(e.target.value)}
                      rows={20}
                      className="w-full px-4 py-3 bg-muted border border-border rounded-lg
                               text-foreground font-mono text-sm resize-y
                               focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      placeholder="Enter the system prompt..."
                    />
                    <p className="text-xs text-muted-foreground">
                      This prompt guides the AI when generating {selectedType} content.
                      Changes affect all future generations.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      disabled={resetting || selectedPromptData?.isDefault}
                    >
                      {resetting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Resetting...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset to Default
                        </>
                      )}
                    </Button>

                    <Button
                      variant="primary"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Show default for comparison */}
                  {!selectedPromptData?.isDefault && defaultPrompt && (
                    <details className="pt-4 border-t border-border">
                      <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                        View default prompt for comparison
                      </summary>
                      <pre className="mt-2 p-4 bg-muted/50 rounded-lg text-xs text-muted-foreground overflow-auto max-h-64 whitespace-pre-wrap">
                        {defaultPrompt}
                      </pre>
                    </details>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card variant="fantasy">
                <CardContent className="py-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Select a Prompt Type
                  </h3>
                  <p className="text-muted-foreground">
                    Choose a prompt type from the list to view and edit its system prompt.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Info Card */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-foreground mb-2">About System Prompts</h3>
            <p className="text-sm text-muted-foreground mb-4">
              System prompts define how the AI generates content. They include instructions about:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li><strong>Campaign:</strong> Full adventure generation with scenes, NPCs, and encounters</li>
              <li><strong>Monster:</strong> Balanced creature stat blocks following D&D 5e rules</li>
              <li><strong>NPC:</strong> Memorable characters with personalities and motivations</li>
              <li><strong>Scene:</strong> Individual adventure scenes with read-aloud text and objectives</li>
              <li><strong>Encounter:</strong> Combat encounters balanced for party level</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              Modifying these prompts allows you to customize the AI&apos;s output style, focus areas, and level of detail.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
