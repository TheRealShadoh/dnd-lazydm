'use client'

import { useState, useEffect, useMemo } from 'react'
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
} from 'lucide-react'

// Fallback models if API fetch fails
const FALLBACK_MODELS = [
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)', free: true },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', free: false },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', free: false },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', free: false },
  { id: 'openai/gpt-4o', name: 'GPT-4o', free: false },
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

interface ModelInfo {
  id: string
  name: string
  free: boolean
  contextLength?: number
}

type DetectedProvider = 'claude' | 'openrouter' | 'unknown' | null

function detectProviderFromKey(key: string): DetectedProvider {
  if (!key) return null
  if (key.startsWith('sk-ant-')) return 'claude'
  // OpenRouter keys can be sk-or- or sk-or-v1-
  if (key.startsWith('sk-or-')) return 'openrouter'
  return 'unknown'
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

  // Unified form state
  const [aiApiKey, setAiApiKey] = useState('')
  const [openRouterModel, setOpenRouterModel] = useState('anthropic/claude-3.5-sonnet')
  const [imageKey, setImageKey] = useState('')
  const [imageProvider, setImageProvider] = useState<'openai' | 'stability' | 'none'>('none')

  const [showAiKey, setShowAiKey] = useState(false)
  const [showImageKey, setShowImageKey] = useState(false)

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string; provider?: string } | null>(null)
  const [imageTestResult, setImageTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [switchingProvider, setSwitchingProvider] = useState(false)

  // Dynamic model loading
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>(FALLBACK_MODELS)
  const [modelsLoading, setModelsLoading] = useState(true)

  // Detect provider from the key being entered
  const detectedProvider = useMemo(() => detectProviderFromKey(aiApiKey), [aiApiKey])

  // Check if both providers have keys configured
  const hasBothKeys = settings.hasClaudeKey && settings.hasOpenRouterKey

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Fetch available models from OpenRouter
  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch('/api/ai/models')
        if (res.ok) {
          const data = await res.json()
          if (data.models && data.models.length > 0) {
            setAvailableModels(data.models)
          }
        }
      } catch (error) {
        console.error('Failed to fetch models:', error)
        // Keep using fallback models
      } finally {
        setModelsLoading(false)
      }
    }

    fetchModels()
  }, [])

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

  const handleSwitchProvider = async (newProvider: 'claude' | 'openrouter') => {
    setSwitchingProvider(true)
    setMessage(null)
    setAiTestResult(null)

    try {
      const res = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiProvider: newProvider }),
      })

      if (res.ok) {
        const providerName = newProvider === 'claude' ? 'Claude' : 'OpenRouter'
        setMessage({ type: 'success', text: `Switched to ${providerName}!` })
        await reloadSettings()
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'Failed to switch provider' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to switch provider' })
    } finally {
      setSwitchingProvider(false)
    }
  }

  const handleSaveAIKey = async () => {
    setSaving(true)
    setMessage(null)
    setAiTestResult(null)

    const provider = detectProviderFromKey(aiApiKey)

    if (aiApiKey && provider === 'unknown') {
      setMessage({ type: 'error', text: 'Invalid API key format. Claude keys start with "sk-ant-", OpenRouter keys start with "sk-or-".' })
      setSaving(false)
      return
    }

    try {
      // Build the update payload based on detected provider
      const payload: Record<string, string | null> = {}

      if (!aiApiKey) {
        // Clearing the key - clear both
        payload.claudeApiKey = null
        payload.openRouterApiKey = null
        payload.aiProvider = 'claude' // Reset to default
      } else if (provider === 'claude') {
        payload.claudeApiKey = aiApiKey
        payload.aiProvider = 'claude'
      } else if (provider === 'openrouter') {
        payload.openRouterApiKey = aiApiKey
        payload.openRouterModel = openRouterModel
        payload.aiProvider = 'openrouter'
      }

      const res = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        const providerName = provider === 'claude' ? 'Claude' : provider === 'openrouter' ? 'OpenRouter' : ''
        setMessage({
          type: 'success',
          text: aiApiKey ? `${providerName} API key saved and set as active provider!` : 'API key removed!'
        })
        setAiApiKey('')
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
      console.log('Testing AI connection...')
      const res = await fetch('/api/ai/test/claude', {
        method: 'POST',
      })

      console.log('Test response status:', res.status)
      const data = await res.json()
      console.log('Test response data:', data)

      if (res.ok && data.success) {
        const providerName = data.provider === 'claude' ? 'Claude' : 'OpenRouter'
        setAiTestResult({
          success: true,
          message: data.message || 'Connection successful!',
          provider: providerName
        })
      } else {
        // Show error from response
        const errorMsg = data.error || data.message || `Connection failed (${res.status})`
        console.error('Test failed:', errorMsg)
        setAiTestResult({ success: false, message: errorMsg })
      }
    } catch (error) {
      console.error('Test connection error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Failed to test connection'
      setAiTestResult({ success: false, message: errorMsg })
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

  // Get current active provider info
  const activeProvider = settings.aiProvider
  const hasActiveKey = (activeProvider === 'claude' && settings.hasClaudeKey) ||
                       (activeProvider === 'openrouter' && settings.hasOpenRouterKey)
  const activeProviderName = activeProvider === 'claude' ? 'Claude' : 'OpenRouter'
  const activeKeyMasked = activeProvider === 'claude' ? settings.claudeApiKey : settings.openRouterApiKey

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

        {/* AI API Key - Single unified field */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>AI API Key</CardTitle>
            </div>
            <CardDescription>
              Enter your Claude or OpenRouter API key. The provider will be auto-detected.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current status */}
            {hasActiveKey && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="font-medium">Active: {activeProviderName}</span>
                      {activeProvider === 'openrouter' && (
                        <span className="text-muted-foreground">
                          ({availableModels.find(m => m.id === settings.openRouterModel)?.name || settings.openRouterModel})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Key: {activeKeyMasked}
                    </div>
                  </div>
                  {/* Provider switch button when both keys are configured */}
                  {hasBothKeys && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSwitchProvider(activeProvider === 'claude' ? 'openrouter' : 'claude')}
                      disabled={switchingProvider}
                    >
                      {switchingProvider ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        `Switch to ${activeProvider === 'claude' ? 'OpenRouter' : 'Claude'}`
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* API Key input */}
            <div className="space-y-2">
              <Label htmlFor="ai-key">
                {hasActiveKey ? 'Change API Key' : 'API Key'}
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="ai-key"
                    type={showAiKey ? 'text' : 'password'}
                    placeholder="sk-ant-... or sk-or-..."
                    value={aiApiKey}
                    onChange={(e) => setAiApiKey(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAiKey(!showAiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showAiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button onClick={handleSaveAIKey} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
              </div>

              {/* Provider detection feedback */}
              {aiApiKey && (
                <div className={`text-sm flex items-center gap-2 ${
                  detectedProvider === 'unknown' ? 'text-destructive' : 'text-muted-foreground'
                }`}>
                  {detectedProvider === 'claude' && (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span>Detected: <strong>Claude</strong> (Direct Anthropic API)</span>
                    </>
                  )}
                  {detectedProvider === 'openrouter' && (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span>Detected: <strong>OpenRouter</strong></span>
                    </>
                  )}
                  {detectedProvider === 'unknown' && (
                    <>
                      <AlertCircle className="h-4 w-4" />
                      <span>Unknown key format. Claude keys start with &quot;sk-ant-&quot;, OpenRouter with &quot;sk-or-&quot;</span>
                    </>
                  )}
                </div>
              )}

              {!aiApiKey && (
                <p className="text-xs text-muted-foreground">
                  Get a Claude key from{' '}
                  <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    console.anthropic.com
                  </a>
                  {' '}or an OpenRouter key from{' '}
                  <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    openrouter.ai
                  </a>
                </p>
              )}
            </div>

            {/* OpenRouter model selection - only shown when OpenRouter is active or being configured */}
            {(detectedProvider === 'openrouter' || (activeProvider === 'openrouter' && hasActiveKey && !aiApiKey)) && (
              <div className="space-y-2 pt-2 border-t border-border">
                <Label htmlFor="openrouter-model">OpenRouter Model</Label>
                <div className="flex gap-2">
                  <select
                    id="openrouter-model"
                    value={openRouterModel}
                    onChange={(e) => setOpenRouterModel(e.target.value)}
                    disabled={modelsLoading}
                    className="flex h-10 flex-1 rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  >
                    {modelsLoading ? (
                      <option>Loading models...</option>
                    ) : (
                      <>
                        <optgroup label="Free Models">
                          {availableModels.filter(m => m.free).map(model => (
                            <option key={model.id} value={model.id}>{model.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Paid Models">
                          {availableModels.filter(m => !m.free).map(model => (
                            <option key={model.id} value={model.id}>{model.name}</option>
                          ))}
                        </optgroup>
                      </>
                    )}
                  </select>
                  {!aiApiKey && activeProvider === 'openrouter' && (
                    <Button onClick={handleSaveOpenRouterModel} disabled={saving || openRouterModel === settings.openRouterModel || modelsLoading}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Free models have no usage cost. Paid models bill through OpenRouter.
                </p>
              </div>
            )}

            {/* Test connection */}
            {hasActiveKey && (
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
                    {aiTestResult.provider && <span>[{aiTestResult.provider}]</span>}
                    {aiTestResult.message}
                  </div>
                )}
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
