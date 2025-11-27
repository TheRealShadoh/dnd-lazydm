'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Plus, FileText, Swords, Image as ImageIcon, ExternalLink, Edit2, Eye, Upload, Users, X } from 'lucide-react'
import { useConfirm } from '@/hooks/useConfirm'
import { useToast } from '@/hooks/useToast'
import { ManualCharacterForm } from '@/components/characters/ManualCharacterForm'
import { Button } from '@/components/ui/Button'
import { CampaignAccessManager } from '@/components/admin/CampaignAccessManager'
import { MainNav } from '@/components/layout/MainNav'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface CampaignMetadata {
  name: string
  slug: string
  description: string
  level?: string
  players?: string
  duration?: string
  genre?: string
  thumbnail?: string
  theme?: {
    primary: string
    secondary: string
  }
  createdAt: string
}

interface Scene {
  name: string
  slug: string
  path: string
}

interface Monster {
  name: string
  cr: string
}

interface DnDBeyondCharacter {
  characterId: string
  name: string
  cachedData?: any
  lastSync?: string
}

export default function CampaignAdminPage() {
  const params = useParams()
  const campaignId = params.campaignId as string
  const { confirm } = useConfirm()
  const toast = useToast()
  const [campaign, setCampaign] = useState<CampaignMetadata | null>(null)
  const [scenes, setScenes] = useState<Scene[]>([])
  const [monsters, setMonsters] = useState<Monster[]>([])
  const [characters, setCharacters] = useState<DnDBeyondCharacter[]>([])
  const [loading, setLoading] = useState(true)

  // Manual character add form state
  const [showManualForm, setShowManualForm] = useState(false)
  const [manualCharacter, setManualCharacter] = useState({
    name: '',
    class: '',
    level: 1,
    race: '',
    background: '',
    alignment: '',
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
    currentHp: 0,
    maxHp: 0,
    tempHp: 0,
    ac: 10,
    initiative: 0,
    speed: 30,
    proficiencyBonus: 2,
    inspiration: false,
    // Saving throws
    strSave: 0,
    dexSave: 0,
    conSave: 0,
    intSave: 0,
    wisSave: 0,
    chaSave: 0,
    // Skills
    acrobatics: 0,
    animalHandling: 0,
    arcana: 0,
    athletics: 0,
    deception: 0,
    history: 0,
    insight: 0,
    intimidation: 0,
    investigation: 0,
    medicine: 0,
    nature: 0,
    perception: 0,
    performance: 0,
    persuasion: 0,
    religion: 0,
    sleightOfHand: 0,
    stealth: 0,
    survival: 0,
    passivePerception: 10,
    // Other
    languages: '',
    equipment: '',
    features: '',
  })
  const [addingCharacter, setAddingCharacter] = useState(false)

  // PDF import state
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const [pdfProgress, setPdfProgress] = useState('')

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        // Load campaign metadata
        const metadataResponse = await fetch(`/api/campaigns/${campaignId}/metadata`)
        if (metadataResponse.ok) {
          const data = await metadataResponse.json()
          setCampaign(data)
        }

        // Load scenes list
        const scenesResponse = await fetch(`/api/campaigns/${campaignId}/scenes/list`)
        if (scenesResponse.ok) {
          const data = await scenesResponse.json()
          setScenes(data.scenes || [])
        }

        // Load monsters list
        const monstersResponse = await fetch(`/api/campaigns/${campaignId}/monsters/list`)
        if (monstersResponse.ok) {
          const data = await monstersResponse.json()
          setMonsters(data.monsters || [])
        }

        // Load characters list
        const charactersResponse = await fetch(`/api/campaigns/${campaignId}/characters`)
        if (charactersResponse.ok) {
          const data = await charactersResponse.json()
          setCharacters(data.characters || [])
        }
      } catch (error) {
        console.error('Error loading campaign:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCampaign()
  }, [campaignId])


  const handleRemoveCharacter = async (characterId: string) => {
    const confirmed = await confirm({
      title: 'Remove Character',
      message: 'Are you sure you want to remove this character from the campaign?',
      confirmText: 'Remove',
      variant: 'danger',
    })

    if (!confirmed) return

    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/characters?characterId=${characterId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        setCharacters((prev) => prev.filter((c) => c.characterId !== characterId))
        toast.success('Character removed successfully')
      } else {
        toast.error('Failed to remove character')
      }
    } catch (error) {
      console.error('Error removing character:', error)
      toast.error('Failed to remove character')
    }
  }


  const handleManualAdd = async () => {
    if (!manualCharacter.name || !manualCharacter.class || !manualCharacter.race) {
      toast.warning('Please fill in at least Name, Class, and Race')
      return
    }

    setAddingCharacter(true)
    try {
      const characterData = {
        id: `manual-${Date.now()}`,
        name: manualCharacter.name,
        level: manualCharacter.level,
        race: manualCharacter.race,
        background: manualCharacter.background,
        alignment: manualCharacter.alignment,
        classes: [{ name: manualCharacter.class, level: manualCharacter.level }],
        currentHitPoints: manualCharacter.currentHp,
        maxHitPoints: manualCharacter.maxHp,
        temporaryHitPoints: manualCharacter.tempHp,
        armorClass: manualCharacter.ac,
        initiative: manualCharacter.initiative,
        speed: `${manualCharacter.speed} ft`,
        proficiencyBonus: manualCharacter.proficiencyBonus,
        stats: {
          strength: manualCharacter.str,
          dexterity: manualCharacter.dex,
          constitution: manualCharacter.con,
          intelligence: manualCharacter.int,
          wisdom: manualCharacter.wis,
          charisma: manualCharacter.cha,
        },
        savingThrows: {
          strength: manualCharacter.strSave,
          dexterity: manualCharacter.dexSave,
          constitution: manualCharacter.conSave,
          intelligence: manualCharacter.intSave,
          wisdom: manualCharacter.wisSave,
          charisma: manualCharacter.chaSave,
        },
        skills: {
          acrobatics: manualCharacter.acrobatics,
          animalHandling: manualCharacter.animalHandling,
          arcana: manualCharacter.arcana,
          athletics: manualCharacter.athletics,
          deception: manualCharacter.deception,
          history: manualCharacter.history,
          insight: manualCharacter.insight,
          intimidation: manualCharacter.intimidation,
          investigation: manualCharacter.investigation,
          medicine: manualCharacter.medicine,
          nature: manualCharacter.nature,
          perception: manualCharacter.perception,
          performance: manualCharacter.performance,
          persuasion: manualCharacter.persuasion,
          religion: manualCharacter.religion,
          sleightOfHand: manualCharacter.sleightOfHand,
          stealth: manualCharacter.stealth,
          survival: manualCharacter.survival,
        },
        passivePerception: manualCharacter.passivePerception,
        inspiration: manualCharacter.inspiration,
        languages: manualCharacter.languages,
        equipment: manualCharacter.equipment,
        featuresAndTraits: manualCharacter.features,
        conditions: [],
        deathSaves: { failCount: 0, successCount: 0 },
      }

      const response = await fetch(`/api/campaigns/${campaignId}/characters/manual-add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterData }),
      })

      if (response.ok) {
        const data = await response.json()
        setCharacters((prev) => [...prev, data.character])

        // Reset form
        setManualCharacter({
          name: '', class: '', level: 1, race: '', background: '', alignment: '',
          str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
          currentHp: 0, maxHp: 0, tempHp: 0, ac: 10, initiative: 0, speed: 30,
          proficiencyBonus: 2, inspiration: false,
          strSave: 0, dexSave: 0, conSave: 0, intSave: 0, wisSave: 0, chaSave: 0,
          acrobatics: 0, animalHandling: 0, arcana: 0, athletics: 0, deception: 0,
          history: 0, insight: 0, intimidation: 0, investigation: 0, medicine: 0,
          nature: 0, perception: 0, performance: 0, persuasion: 0, religion: 0,
          sleightOfHand: 0, stealth: 0, survival: 0, passivePerception: 10,
          languages: '', equipment: '', features: '',
        })
        setShowManualForm(false)
        toast.success(`Character "${characterData.name}" added successfully!`)
      } else {
        const error = await response.json()
        toast.error(`Failed to add character: ${error.error}`)
      }
    } catch (error) {
      console.error('Character add error:', error)
      toast.error(`Failed to add character: ${(error as Error).message}`)
    } finally {
      setAddingCharacter(false)
    }
  }

  const handlePdfImport = async () => {
    if (!pdfFile) {
      toast.warning('Please select a PDF file first')
      return
    }

    setUploadingPdf(true)
    setPdfProgress('Reading PDF file...')

    try {
      const formData = new FormData()
      formData.append('pdf', pdfFile)

      setPdfProgress('Uploading and parsing PDF...')
      const response = await fetch(`/api/campaigns/${campaignId}/characters/import-pdf`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setPdfProgress('Character imported successfully!')
        setCharacters((prev) => [...prev, data.character])
        setPdfFile(null)
        setTimeout(() => setPdfProgress(''), 2000)
        toast.success(`Character "${data.character.name}" imported from PDF!`)
      } else {
        const error = await response.json()
        setPdfProgress('')
        toast.error(`Failed to import PDF: ${error.error}`)
      }
    } catch (error) {
      console.error('PDF import error:', error)
      setPdfProgress('')
      toast.error(`Failed to import PDF: ${(error as Error).message}`)
    } finally {
      setUploadingPdf(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground font-ui">Loading campaign...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
          <Card variant="fantasy" className="max-w-md text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 mb-4 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
                <X className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-muted-foreground mb-4">Campaign not found</p>
              <Link href="/dashboard">
                <Button variant="primary">Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <PageHeader
          title={campaign.name}
          description={campaign.description}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: campaign.name },
          ]}
          actions={
            <Link href={`/campaigns/${campaignId}`} target="_blank">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </Link>
          }
        />

        {/* Campaign Meta Tags */}
        {(campaign.level || campaign.players || campaign.duration || campaign.genre) && (
          <div className="mb-8 flex flex-wrap gap-3">
            {campaign.level && <span className="px-3 py-1 bg-muted rounded-lg text-sm text-muted-foreground">Level {campaign.level}</span>}
            {campaign.players && <span className="px-3 py-1 bg-muted rounded-lg text-sm text-muted-foreground">{campaign.players} players</span>}
            {campaign.duration && <span className="px-3 py-1 bg-muted rounded-lg text-sm text-muted-foreground">{campaign.duration}</span>}
            {campaign.genre && <span className="px-3 py-1 bg-muted rounded-lg text-sm text-muted-foreground">{campaign.genre}</span>}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href={`/admin/campaigns/${campaignId}/scenes/new`}>
            <Card className="group h-full hover:border-primary/50 transition-all duration-200 cursor-pointer">
              <CardContent className="pt-6">
                <div className="w-12 h-12 mb-3 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-display text-foreground mb-2 group-hover:text-primary transition-colors">
                  Add Scene
                </h3>
                <p className="text-muted-foreground text-sm">
                  Create a new scene with combat, roleplay, or puzzle templates
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/admin/campaigns/${campaignId}/monsters/new`}>
            <Card className="group h-full hover:border-primary/50 transition-all duration-200 cursor-pointer">
              <CardContent className="pt-6">
                <div className="w-12 h-12 mb-3 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                  <Swords className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-xl font-bold font-display text-foreground mb-2 group-hover:text-primary transition-colors">
                  Add Monster
                </h3>
                <p className="text-muted-foreground text-sm">
                  Build a new monster stat block with all D&D 5e attributes
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card
            className="group h-full hover:border-primary/50 transition-all duration-200 cursor-pointer"
            onClick={() => toast.info('Image upload feature coming soon!')}
          >
            <CardContent className="pt-6">
              <div className="w-12 h-12 mb-3 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                <ImageIcon className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold font-display text-foreground mb-2 group-hover:text-primary transition-colors">
                Upload Images
              </h3>
              <p className="text-muted-foreground text-sm">
                Add images for scenes, monsters, and NPCs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Content Sections */}
        <div className="space-y-6">
          {/* Scenes Section */}
          <Card variant="fantasy">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Scenes
                </CardTitle>
                <Link href={`/admin/campaigns/${campaignId}/scenes/new`}>
                  <Button variant="primary" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    New Scene
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {scenes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {scenes.map((scene) => (
                    <div
                      key={scene.slug}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{scene.name}</div>
                        <div className="text-sm text-muted-foreground">{scene.slug}</div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/admin/campaigns/${campaignId}/scenes/${scene.slug}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <Link href={scene.path} target="_blank">
                          <Button variant="primary" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p>No scenes yet. Create your first scene to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monsters Section */}
          <Card variant="fantasy">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Swords className="h-5 w-5 text-destructive" />
                  Monster Stat Blocks
                  {monsters.length > 0 && (
                    <span className="text-lg text-muted-foreground">({monsters.length})</span>
                  )}
                </CardTitle>
                <Link href={`/admin/campaigns/${campaignId}/monsters/new`}>
                  <Button variant="primary" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    New Monster
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {monsters.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {monsters.map((monster, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0">
                            <Swords className="w-6 h-6 text-destructive" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{monster.name}</div>
                            <div className="text-sm text-muted-foreground">CR {monster.cr}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3">
                    <Link href={`/campaigns/${campaignId}/reference/monsters`} target="_blank">
                      <Button variant="primary">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Full Reference Page
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Swords className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p>No monsters yet. Create your first monster stat block to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* D&D Beyond Characters Section */}
          <Card variant="fantasy">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Characters
                {characters.length > 0 && (
                  <span className="text-lg text-muted-foreground">({characters.length})</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* PDF Import */}
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Import from PDF
                </h3>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                      className="flex-1 px-3 py-2 bg-muted border border-border rounded text-foreground
                                 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0
                                 file:bg-primary file:text-primary-foreground file:cursor-pointer
                                 hover:file:bg-primary/90"
                    />
                    <Button
                      variant="primary"
                      onClick={handlePdfImport}
                      disabled={!pdfFile || uploadingPdf}
                    >
                      {uploadingPdf ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        'Import PDF'
                      )}
                    </Button>
                  </div>
                  {pdfProgress && (
                    <div className="px-3 py-2 bg-info/10 border border-info/30 rounded text-info text-sm">
                      {pdfProgress}
                    </div>
                  )}
                  {pdfFile && (
                    <div className="text-sm text-muted-foreground">
                      Selected: {pdfFile.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Manual Add Character */}
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Manual Add
                  </h3>
                  {!showManualForm && (
                    <Button variant="primary" onClick={() => setShowManualForm(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add New Character
                    </Button>
                  )}
                </div>

              {showManualForm && (
                <ManualCharacterForm
                  character={manualCharacter}
                  onChange={setManualCharacter}
                  onSubmit={handleManualAdd}
                  onCancel={() => {
                    setShowManualForm(false)
                    setManualCharacter({
                      name: '', class: '', level: 1, race: '', background: '', alignment: '',
                      str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
                      currentHp: 0, maxHp: 0, tempHp: 0, ac: 10, initiative: 0, speed: 30,
                      proficiencyBonus: 2, inspiration: false,
                      strSave: 0, dexSave: 0, conSave: 0, intSave: 0, wisSave: 0, chaSave: 0,
                      acrobatics: 0, animalHandling: 0, arcana: 0, athletics: 0, deception: 0,
                      history: 0, insight: 0, intimidation: 0, investigation: 0, medicine: 0,
                      nature: 0, perception: 0, performance: 0, persuasion: 0, religion: 0,
                      sleightOfHand: 0, stealth: 0, survival: 0, passivePerception: 10,
                      languages: '', equipment: '', features: '',
                    })
                  }}
                  isLoading={addingCharacter}
                />
              )}
              </div>

              {/* Characters List */}
              {characters.length > 0 ? (
                <div className="space-y-3">
                  {characters.map((character) => {
                    const char = character.cachedData
                    const hp = char?.currentHitPoints || 0
                    const maxHp = char?.maxHitPoints || 0
                    const ac = char?.armorClass || 10
                    const level = char?.level || 1
                    const className = char?.classes
                      ?.map((c: any) => `${c.name} ${c.level}`)
                      .join(' / ') || 'Unknown'

                    return (
                      <div
                        key={character.characterId}
                        className="p-4 bg-muted/50 rounded-lg border border-border"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4 flex-1">
                            {char?.avatarUrl && (
                              <img
                                src={char.avatarUrl}
                                alt={character.name}
                                className="w-16 h-16 rounded-lg object-cover border-2 border-border"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-foreground">{character.name}</h3>
                                <span className="text-sm text-muted-foreground">Lvl {level}</span>
                              </div>
                              <div className="text-sm text-muted-foreground mb-2">
                                {char?.race} - {className}
                              </div>
                              <div className="flex gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">HP:</span>
                                  <span className="font-semibold text-destructive">
                                    {hp} / {maxHp}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">AC:</span>
                                  <span className="font-semibold text-info">{ac}</span>
                                </div>
                              </div>
                              {character.lastSync && (
                                <div className="text-xs text-muted-foreground mt-2">
                                  Last synced: {new Date(character.lastSync).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveCharacter(character.characterId)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p>No characters linked yet. Add a D&D Beyond character to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Theme Section */}
          {campaign.theme && (
            <Card variant="fantasy">
              <CardHeader>
                <CardTitle>Campaign Theme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Primary Color</div>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded border-2 border-border"
                        style={{ backgroundColor: campaign.theme.primary }}
                      />
                      <span className="font-mono text-foreground">{campaign.theme.primary}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Secondary Color</div>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded border-2 border-border"
                        style={{ backgroundColor: campaign.theme.secondary }}
                      />
                      <span className="font-mono text-foreground">{campaign.theme.secondary}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campaign Info */}
          <Card variant="fantasy">
            <CardHeader>
              <CardTitle>Campaign Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Slug:</span>
                  <span className="font-mono text-foreground">{campaign.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="text-foreground">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Path:</span>
                  <span className="font-mono text-foreground text-xs">
                    src/app/campaigns/{campaign.slug}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Access Section */}
          <CampaignAccessManager campaignId={campaignId} />
        </div>
      </main>
    </div>
  )
}
