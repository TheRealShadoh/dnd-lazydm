'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MainNav } from '@/components/layout/MainNav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import {
  Settings,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  Globe
} from 'lucide-react'

// OpenRouter models
const OPENROUTER_MODELS = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', free: false },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', free: false },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)', free: true },
  { id: 'google/gemma-7b-it:free', name: 'Gemma 7B (Free)', free: true },
  { id: 'meta-llama/llama-3-8b-instruct:free', name: 'Llama 3 8B (Free)', free: true },
  { id: 'openchat/openchat-7b:free', name: 'OpenChat 7B (Free)', free: true },
  { id: 'openai/gpt-4o', name: 'GPT-4o', free: false },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', free: false },
  { id: 'google/gemini-pro', name: 'Gemini Pro', free: false },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', free: false },
]

interface AISettings {
  claudeApiKey: string | null
  openRouterApiKey: string | null
  aiProvider: 'claude' | 'openrouter'
  openRouterModel: string
  imageApiKey: string | null
  imageProvider: 'openai' | 'stability' | 'none'
  hasClaudeKey: boolean
  hasOpenRouterKey: boolean
  hasImageKey: boolean
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingAI, setTestingAI] = useState(false)
  const [testingImage, setTestingImage] = useState(false)

  const [settings, setSettings] = useState<AISettings>({
    claudeApiKey: null,
    openRouterApiKey: null,
    aiProvider: 'claude',
    openRouterModel: 'anthropic/claude-3.5-sonnet',
    imageApiKey: null,
    imageProvider: 'none',
    hasClaudeKey: false,
    hasOpenRouterKey: false,
    hasImageKey: false,
  })

  // Form state
  const [aiProvider, setAiProvider] = useState<'claude' | 'openrouter'>('claude')
  const [claudeKey, setClaudeKey] = useState('')
  const [openRouterKey, setOpenRouterKey] = useState('')
  const [openRouterModel, setOpenRouterModel] = useState('anthropic/claude-3.5-sonnet')
  const [imageKey, setImageKey] = useState('')
  const [imageProvider, setImageProvider] = useState<'openai' | 'stability' | 'none'>('none')

  const [showClaudeKey, setShowClaudeKey] = useState(false)
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false)
  const [showImageKey, setShowImageKey] = useState(false)

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [imageTestResult, setImageTestResult] = useState<{ success: boolean; message: string } | null>(null)

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Load settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/user/settings')
        if (res.ok) {
          const data = await res.json()
          if (data.settings?.aiConfig) {
            const config = data.settings.aiConfig
            setSettings(config)
            setAiProvider(config.aiProvider || 'claude')
            setOpenRouterModel(config.openRouterModel || 'anthropic/claude-3.5-sonnet')
            setImageProvider(config.imageProvider || 'none')
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      loadSettings()
    }
  }, [status])

  const reloadSettings = async () => {
    const settingsRes = await fetch('/api/user/settings')
    if (settingsRes.ok) {
      const settingsData = await settingsRes.json()
      if (settingsData.settings?.aiConfig) {
        setSettings(settingsData.settings.aiConfig)
      }
    }
  }

  const handleSaveAIProvider = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiProvider }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: `AI provider set to ${aiProvider === 'claude' ? 'Claude (Direct)' : 'OpenRouter'}` })
        await reloadSettings()
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.details?.join(', ') || data.error })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveClaudeKey = async () => {
    setSaving(true)
    setMessage(null)
    setAiTestResult(null)

    try {
      const res = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claudeApiKey: claudeKey || null }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: claudeKey ? 'Claude API key saved!' : 'Claude API key removed!' })
        setClaudeKey('')
        await reloadSettings()
      } else {
        setMessage({ type: 'error', text: data.details?.join(', ') || data.error })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveOpenRouterKey = async () => {
    setSaving(true)
    setMessage(null)
    setAiTestResult(null)

    try {
      const res = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openRouterApiKey: openRouterKey || null,
          openRouterModel,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: openRouterKey ? 'OpenRouter API key saved!' : 'OpenRouter API key removed!' })
        setOpenRouterKey('')
        await reloadSettings()
      } else {
        setMessage({ type: 'error', text: data.details?.join(', ') || data.error })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveOpenRouterModel = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openRouterModel }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Model preference saved!' })
        await reloadSettings()
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.details?.join(', ') || data.error })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveImageKey = async () => {
    setSaving(true)
    setMessage(null)
    setImageTestResult(null)

    try {
      const res = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageApiKey: imageKey || null,
          imageProvider: imageProvider,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Image generation settings saved!' })
        setImageKey('')
        await reloadSettings()
      } else {
        setMessage({ type: 'error', text: data.details?.join(', ') || data.error })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  const handleTestAI = async () => {
    setTestingAI(true)
    setAiTestResult(null)

    try {
      const res = await fetch('/api/ai/test/claude', {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setAiTestResult({ success: true, message: data.message || 'Connection successful!' })
      } else {
        setAiTestResult({ success: false, message: data.error || 'Connection failed' })
      }
    } catch {
      setAiTestResult({ success: false, message: 'Failed to test connection' })
    } finally {
      setTestingAI(false)
    }
  }

  const handleTestImage = async () => {
    setTestingImage(true)
    setImageTestResult(null)

    try {
      const res = await fetch('/api/ai/test/image', {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setImageTestResult({ success: true, message: 'Connection successful!' })
      } else {
        setImageTestResult({ success: false, message: data.error || 'Connection failed' })
      }
    } catch {
      setImageTestResult({ success: false, message: 'Failed to test connection' })
    } finally {
      setTestingImage(false)
    }
  }

  const hasActiveAIKey = (settings.aiProvider === 'claude' && settings.hasClaudeKey) ||
                         (settings.aiProvider === 'openrouter' && settings.hasOpenRouterKey)

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">Settings</h1>
            <p className="text-muted-foreground">Configure your AI integration and preferences</p>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-destructive/10 border border-destructive/20 text-destructive'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* AI Provider Selection */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>AI Provider</CardTitle>
            </div>
            <CardDescription>
              Choose which AI service to use for content generation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ai-provider">Active Provider</Label>
              <div className="flex gap-2">
                <select
                  id="ai-provider"
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value as 'claude' | 'openrouter')}
                  className="flex h-10 flex-1 rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="claude">Claude (Direct API)</option>
                  <option value="openrouter">OpenRouter (Multiple Models)</option>
                </select>
                <Button onClick={handleSaveAIProvider} disabled={saving || aiProvider === settings.aiProvider}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Set Active'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {aiProvider === 'claude'
                  ? 'Direct connection to Anthropic Claude API. Requires Claude API key.'
                  : 'Use OpenRouter to access Claude, GPT-4, Llama, and free models.'}
              </p>
            </div>

            {hasActiveAIKey && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={handleTestAI}
                  disabled={testingAI}
                >
                  {testingAI ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </Button>
                {aiTestResult && (
                  <div className={`mt-2 text-sm flex items-center gap-2 ${
                    aiTestResult.success ? 'text-green-400' : 'text-destructive'
                  }`}>
                    {aiTestResult.success ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    {aiTestResult.message}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Claude Direct API Key */}
        <Card className={`mb-6 ${aiProvider !== 'claude' ? 'opacity-60' : ''}`}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>Claude API Key</CardTitle>
              {settings.aiProvider === 'claude' && settings.hasClaudeKey && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Active</span>
              )}
            </div>
            <CardDescription>
              Direct connection to Anthropic.
              Get your API key from{' '}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                console.anthropic.com
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.hasClaudeKey && (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>API key configured: {settings.claudeApiKey}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="claude-key">
                {settings.hasClaudeKey ? 'Update API Key' : 'API Key'}
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="claude-key"
                    type={showClaudeKey ? 'text' : 'password'}
                    placeholder="sk-ant-..."
                    value={claudeKey}
                    onChange={(e) => setClaudeKey(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowClaudeKey(!showClaudeKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showClaudeKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button onClick={handleSaveClaudeKey} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your API key is encrypted and stored securely. Leave blank and save to remove.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* OpenRouter API Key */}
        <Card className={`mb-6 ${aiProvider !== 'openrouter' ? 'opacity-60' : ''}`}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>OpenRouter API Key</CardTitle>
              {settings.aiProvider === 'openrouter' && settings.hasOpenRouterKey && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Active</span>
              )}
            </div>
            <CardDescription>
              Access Claude, GPT-4, Llama, and many free models.
              Get your API key from{' '}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                openrouter.ai
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.hasOpenRouterKey && (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>API key configured: {settings.openRouterApiKey}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="openrouter-key">
                {settings.hasOpenRouterKey ? 'Update API Key' : 'API Key'}
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="openrouter-key"
                    type={showOpenRouterKey ? 'text' : 'password'}
                    placeholder="sk-or-..."
                    value={openRouterKey}
                    onChange={(e) => setOpenRouterKey(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showOpenRouterKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button onClick={handleSaveOpenRouterKey} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            </div>

            {settings.hasOpenRouterKey && (
              <div className="space-y-2 pt-2 border-t border-border">
                <Label htmlFor="openrouter-model">Model</Label>
                <div className="flex gap-2">
                  <select
                    id="openrouter-model"
                    value={openRouterModel}
                    onChange={(e) => setOpenRouterModel(e.target.value)}
                    className="flex h-10 flex-1 rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <optgroup label="Free Models">
                      {OPENROUTER_MODELS.filter(m => m.free).map(model => (
                        <option key={model.id} value={model.id}>{model.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Paid Models">
                      {OPENROUTER_MODELS.filter(m => !m.free).map(model => (
                        <option key={model.id} value={model.id}>{model.name}</option>
                      ))}
                    </optgroup>
                  </select>
                  <Button onClick={handleSaveOpenRouterModel} disabled={saving || openRouterModel === settings.openRouterModel}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Free models have no usage cost. Paid models bill through OpenRouter.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Image Generation API */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              <CardTitle>Image Generation</CardTitle>
            </div>
            <CardDescription>
              Optional: Connect an image generation API for AI-generated artwork.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-provider">Provider</Label>
              <select
                id="image-provider"
                value={imageProvider}
                onChange={(e) => setImageProvider(e.target.value as 'openai' | 'stability' | 'none')}
                className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="none">None (disabled)</option>
                <option value="openai">OpenAI DALL-E</option>
                <option value="stability">Stability AI (coming soon)</option>
              </select>
            </div>

            {imageProvider !== 'none' && (
              <>
                {settings.hasImageKey && (
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>API key configured: {settings.imageApiKey}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="image-key">
                    {settings.hasImageKey ? 'Update API Key' : 'API Key'}
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="image-key"
                        type={showImageKey ? 'text' : 'password'}
                        placeholder="sk-..."
                        value={imageKey}
                        onChange={(e) => setImageKey(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowImageKey(!showImageKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showImageKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Button onClick={handleSaveImageKey} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {imageProvider === 'openai' && (
                      <>Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">platform.openai.com</a></>
                    )}
                    {imageProvider === 'stability' && (
                      <>Get your API key from <a href="https://platform.stability.ai/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">platform.stability.ai</a></>
                    )}
                  </p>
                </div>

                {settings.hasImageKey && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      onClick={handleTestImage}
                      disabled={testingImage}
                    >
                      {testingImage ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        'Test Connection'
                      )}
                    </Button>
                    {imageTestResult && (
                      <div className={`mt-2 text-sm flex items-center gap-2 ${
                        imageTestResult.success ? 'text-green-400' : 'text-destructive'
                      }`}>
                        {imageTestResult.success ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        {imageTestResult.message}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {imageProvider === 'none' && (
              <Button onClick={handleSaveImageKey} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Provider Setting'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card variant="fantasy">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-foreground mb-2">About AI Generation</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Once configured, you&apos;ll be able to use AI to generate:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Complete campaigns with scenes and encounters</li>
              <li>Custom monsters balanced to your party level</li>
              <li>NPCs with detailed backgrounds and personalities</li>
              <li>Scene descriptions and encounter suggestions</li>
              <li>Artwork for monsters, NPCs, and scenes (with image API)</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              AI generation uses your own API keys, so you control usage and costs.
              OpenRouter free models allow unlimited generation at no cost.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
