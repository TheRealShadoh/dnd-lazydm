'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useConfirm } from '@/hooks/useConfirm'
import { useToast } from '@/hooks/useToast'
import { ManualCharacterForm } from '@/components/characters/ManualCharacterForm'
import { Button } from '@/components/ui/Button'

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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mb-4 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-gray-400 mb-4">Campaign not found</p>
          <Link
            href="/admin"
            className="inline-block px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg
                       font-semibold transition-colors duration-200"
          >
            Back to Admin
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <Link
              href="/admin"
              className="inline-block mb-4 text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Admin
            </Link>
            <h1 className="text-4xl font-bold text-purple-400 mb-2">{campaign.name}</h1>
            {campaign.description && (
              <p className="text-gray-400 text-lg">{campaign.description}</p>
            )}
            {(campaign.level || campaign.players || campaign.duration || campaign.genre) && (
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                {campaign.level && <div className="px-3 py-1 bg-gray-800 rounded">Level {campaign.level}</div>}
                {campaign.players && <div className="px-3 py-1 bg-gray-800 rounded">{campaign.players} players</div>}
                {campaign.duration && <div className="px-3 py-1 bg-gray-800 rounded">{campaign.duration}</div>}
                {campaign.genre && <div className="px-3 py-1 bg-gray-800 rounded">{campaign.genre}</div>}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              href={`/campaigns/${campaignId}`}
              target="_blank"
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold
                         transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href={`/admin/campaigns/${campaignId}/scenes/new`}
            className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6 hover:border-purple-500
                       transition-all duration-200 group"
          >
            <div className="w-12 h-12 mb-3 rounded-lg bg-purple-500/20 flex items-center justify-center
                            group-hover:bg-purple-500/30 transition-colors">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
              Add Scene
            </h3>
            <p className="text-gray-400 text-sm">
              Create a new scene with combat, roleplay, or puzzle templates
            </p>
          </Link>

          <Link
            href={`/admin/campaigns/${campaignId}/monsters/new`}
            className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6 hover:border-purple-500
                       transition-all duration-200 group"
          >
            <div className="w-12 h-12 mb-3 rounded-lg bg-purple-500/20 flex items-center justify-center
                            group-hover:bg-purple-500/30 transition-colors">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
              Add Monster
            </h3>
            <p className="text-gray-400 text-sm">
              Build a new monster stat block with all D&D 5e attributes
            </p>
          </Link>

          <button
            onClick={() => toast.info('Image upload feature coming soon!')}
            className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6 hover:border-purple-500
                       transition-all duration-200 group text-left"
          >
            <div className="w-12 h-12 mb-3 rounded-lg bg-purple-500/20 flex items-center justify-center
                            group-hover:bg-purple-500/30 transition-colors">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
              Upload Images
            </h3>
            <p className="text-gray-400 text-sm">
              Add images for scenes, monsters, and NPCs
            </p>
          </button>
        </div>

        {/* Campaign Content Sections */}
        <div className="space-y-6">
          {/* Scenes Section */}
          <div className="bg-gray-900 rounded-xl border-2 border-gray-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Scenes</h2>
              <Link
                href={`/admin/campaigns/${campaignId}/scenes/new`}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm
                           font-semibold transition-colors duration-200"
              >
                + New Scene
              </Link>
            </div>

            {scenes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {scenes.map((scene) => (
                  <div
                    key={scene.slug}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-white">{scene.name}</div>
                      <div className="text-sm text-gray-500">{scene.slug}</div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/campaigns/${campaignId}/scenes/${scene.slug}/edit`}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm
                                   transition-colors duration-200"
                      >
                        Edit
                      </Link>
                      <Link
                        href={scene.path}
                        target="_blank"
                        className="px-3 py-1 bg-purple-500 hover:bg-purple-600 rounded text-sm
                                   transition-colors duration-200"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <p>No scenes yet. Create your first scene to get started.</p>
              </div>
            )}
          </div>

          {/* Monsters Section */}
          <div className="bg-gray-900 rounded-xl border-2 border-gray-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                Monster Stat Blocks
                {monsters.length > 0 && (
                  <span className="ml-3 text-lg text-gray-400">({monsters.length})</span>
                )}
              </h2>
              <Link
                href={`/admin/campaigns/${campaignId}/monsters/new`}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm
                           font-semibold transition-colors duration-200"
              >
                + New Monster
              </Link>
            </div>

            {monsters.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {monsters.map((monster, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-white">{monster.name}</div>
                          <div className="text-sm text-gray-500">CR {monster.cr}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-3">
                  <Link
                    href={`/campaigns/${campaignId}/reference/monsters`}
                    target="_blank"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600
                               rounded-lg text-sm transition-colors duration-200"
                  >
                    View Full Reference Page
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <p>No monsters yet. Create your first monster stat block to get started.</p>
              </div>
            )}
          </div>

          {/* D&D Beyond Characters Section */}
          <div className="bg-gray-900 rounded-xl border-2 border-gray-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                Characters
                {characters.length > 0 && (
                  <span className="ml-3 text-lg text-gray-400">({characters.length})</span>
                )}
              </h2>
            </div>

            {/* PDF Import */}
            <div className="mb-4 p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Import from PDF</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white
                               file:mr-3 file:py-1 file:px-3 file:rounded file:border-0
                               file:bg-purple-600 file:text-white file:cursor-pointer
                               hover:file:bg-purple-700"
                  />
                  <button
                    onClick={handlePdfImport}
                    disabled={!pdfFile || uploadingPdf}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600
                               disabled:cursor-not-allowed rounded-lg font-semibold
                               transition-colors duration-200"
                  >
                    {uploadingPdf ? 'Importing...' : 'Import PDF'}
                  </button>
                </div>
                {pdfProgress && (
                  <div className="px-3 py-2 bg-blue-900/50 border border-blue-700 rounded text-blue-200 text-sm">
                    {pdfProgress}
                  </div>
                )}
                {pdfFile && (
                  <div className="text-sm text-gray-400">
                    Selected: {pdfFile.name}
                  </div>
                )}
              </div>
            </div>

            {/* Manual Add Character */}
            <div className="mb-6 p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Manual Add</h3>
                {!showManualForm && (
                  <button
                    onClick={() => setShowManualForm(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold
                               transition-colors duration-200"
                  >
                    + Add New Character
                  </button>
                )}
              </div>

              {showManualForm && (
                <div className="space-y-4 p-4 bg-gray-900/50 rounded-lg">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Name *</label>
                      <input
                        type="text"
                        value={manualCharacter.name}
                        onChange={(e) => setManualCharacter({...manualCharacter, name: e.target.value})}
                        placeholder="Character Name"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Class *</label>
                      <input
                        type="text"
                        value={manualCharacter.class}
                        onChange={(e) => setManualCharacter({...manualCharacter, class: e.target.value})}
                        placeholder="Barbarian, Wizard, etc."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Level</label>
                      <input
                        type="number"
                        value={manualCharacter.level}
                        onChange={(e) => setManualCharacter({...manualCharacter, level: parseInt(e.target.value) || 1})}
                        min="1"
                        max="20"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Race/Species *</label>
                      <input
                        type="text"
                        value={manualCharacter.race}
                        onChange={(e) => setManualCharacter({...manualCharacter, race: e.target.value})}
                        placeholder="Human, Elf, Dwarf, etc."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Background</label>
                      <input
                        type="text"
                        value={manualCharacter.background}
                        onChange={(e) => setManualCharacter({...manualCharacter, background: e.target.value})}
                        placeholder="Soldier, Sage, etc."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Alignment</label>
                      <input
                        type="text"
                        value={manualCharacter.alignment}
                        onChange={(e) => setManualCharacter({...manualCharacter, alignment: e.target.value})}
                        placeholder="Lawful Good, etc."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                  </div>

                  {/* Ability Scores */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Ability Scores</label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">STR</label>
                        <input
                          type="number"
                          value={manualCharacter.str}
                          onChange={(e) => setManualCharacter({...manualCharacter, str: parseInt(e.target.value) || 10})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">DEX</label>
                        <input
                          type="number"
                          value={manualCharacter.dex}
                          onChange={(e) => setManualCharacter({...manualCharacter, dex: parseInt(e.target.value) || 10})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">CON</label>
                        <input
                          type="number"
                          value={manualCharacter.con}
                          onChange={(e) => setManualCharacter({...manualCharacter, con: parseInt(e.target.value) || 10})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">INT</label>
                        <input
                          type="number"
                          value={manualCharacter.int}
                          onChange={(e) => setManualCharacter({...manualCharacter, int: parseInt(e.target.value) || 10})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">WIS</label>
                        <input
                          type="number"
                          value={manualCharacter.wis}
                          onChange={(e) => setManualCharacter({...manualCharacter, wis: parseInt(e.target.value) || 10})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">CHA</label>
                        <input
                          type="number"
                          value={manualCharacter.cha}
                          onChange={(e) => setManualCharacter({...manualCharacter, cha: parseInt(e.target.value) || 10})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* HP and AC */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Current HP</label>
                      <input
                        type="number"
                        value={manualCharacter.currentHp}
                        onChange={(e) => setManualCharacter({...manualCharacter, currentHp: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Max HP</label>
                      <input
                        type="number"
                        value={manualCharacter.maxHp}
                        onChange={(e) => setManualCharacter({...manualCharacter, maxHp: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Temp HP</label>
                      <input
                        type="number"
                        value={manualCharacter.tempHp}
                        onChange={(e) => setManualCharacter({...manualCharacter, tempHp: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                  </div>

                  {/* Combat Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Armor Class (AC)</label>
                      <input
                        type="number"
                        value={manualCharacter.ac}
                        onChange={(e) => setManualCharacter({...manualCharacter, ac: parseInt(e.target.value) || 10})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Initiative</label>
                      <input
                        type="number"
                        value={manualCharacter.initiative}
                        onChange={(e) => setManualCharacter({...manualCharacter, initiative: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Speed (ft)</label>
                      <input
                        type="number"
                        value={manualCharacter.speed}
                        onChange={(e) => setManualCharacter({...manualCharacter, speed: parseInt(e.target.value) || 30})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Proficiency Bonus</label>
                      <input
                        type="number"
                        value={manualCharacter.proficiencyBonus}
                        onChange={(e) => setManualCharacter({...manualCharacter, proficiencyBonus: parseInt(e.target.value) || 2})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                  </div>

                  {/* Saving Throws */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Saving Throws</label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">STR Save</label>
                        <input
                          type="number"
                          value={manualCharacter.strSave}
                          onChange={(e) => setManualCharacter({...manualCharacter, strSave: parseInt(e.target.value) || 0})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">DEX Save</label>
                        <input
                          type="number"
                          value={manualCharacter.dexSave}
                          onChange={(e) => setManualCharacter({...manualCharacter, dexSave: parseInt(e.target.value) || 0})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">CON Save</label>
                        <input
                          type="number"
                          value={manualCharacter.conSave}
                          onChange={(e) => setManualCharacter({...manualCharacter, conSave: parseInt(e.target.value) || 0})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">INT Save</label>
                        <input
                          type="number"
                          value={manualCharacter.intSave}
                          onChange={(e) => setManualCharacter({...manualCharacter, intSave: parseInt(e.target.value) || 0})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">WIS Save</label>
                        <input
                          type="number"
                          value={manualCharacter.wisSave}
                          onChange={(e) => setManualCharacter({...manualCharacter, wisSave: parseInt(e.target.value) || 0})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">CHA Save</label>
                        <input
                          type="number"
                          value={manualCharacter.chaSave}
                          onChange={(e) => setManualCharacter({...manualCharacter, chaSave: parseInt(e.target.value) || 0})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Skills</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Acrobatics (DEX)</label>
                        <input
                          type="number"
                          value={manualCharacter.acrobatics}
                          onChange={(e) => setManualCharacter({...manualCharacter, acrobatics: parseInt(e.target.value) || 0})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Animal Handling (WIS)</label>
                        <input
                          type="number"
                          value={manualCharacter.animalHandling}
                          onChange={(e) => setManualCharacter({...manualCharacter, animalHandling: parseInt(e.target.value) || 0})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Arcana (INT)</label>
                        <input
                          type="number"
                          value={manualCharacter.arcana}
                          onChange={(e) => setManualCharacter({...manualCharacter, arcana: parseInt(e.target.value) || 0})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Athletics (STR)</label>
                        <input
                          type="number"
                          value={manualCharacter.athletics}
                          onChange={(e) => setManualCharacter({...manualCharacter, athletics: parseInt(e.target.value) || 0})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Deception (CHA)</label>
                        <input
                          type="number"
                          value={manualCharacter.deception}
                          onChange={(e) => setManualCharacter({...manualCharacter, deception: parseInt(e.target.value) || 0})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">History (INT)</label>
                        <input
                          type="number"
                          value={manualCharacter.history}
                          onChange={(e) => setManualCharacter({...manualCharacter, history: parseInt(e.target.value) || 0})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Insight (WIS)</label>
                        <input
                          type="number"
                          value={manualCharacter.insight}
                          onChange={(e) => setManualCharacter({...manualCharacter, insight: parseInt(e.target.value) || 0})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Intimidation (CHA)</label>
                        <input
                          type="number"
                          value={manualCharacter.intimidation}
                          onChange={(e) => setManualCharacter({...manualCharacter, intimidation: parseInt(e.target.value) || 0})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Investigation (INT)</label>
                        <input
                          type="number"
                          value={manualCharacter.investigation}
                          onChange={(e) => setManualCharacter({...manualCharacter, investigation: parseInt(e.target.value) || 0})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Medicine (WIS)</label>
                        <input
                          type="number"
                          value={manualCharacter.medicine}
                          onChange={(e) => setManualCharacter({...manualCharacter, medicine: parseInt(e.target.value) || 0})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Nature (INT)</label>
                        <input
                          type="number"
                          value={manualCharacter.nature}
                          onChange={(e) => setManualCharacter({...manualCharacter, nature: parseInt(e.target.value) || 0})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Perception (WIS)</label>
                        <input
                          type="number"
                          value={manualCharacter.perception}
                          onChange={(e) => setManualCharacter({...manualCharacter, perception: parseInt(e.target.value) || 0})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Performance (CHA)</label>
                        <input
                          type="number"
                          value={manualCharacter.performance}
                          onChange={(e) => setManualCharacter({...manualCharacter, performance: parseInt(e.target.value) || 0})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Persuasion (CHA)</label>
                        <input
                          type="number"
                          value={manualCharacter.persuasion}
                          onChange={(e) => setManualCharacter({...manualCharacter, persuasion: parseInt(e.target.value) || 0})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Religion (INT)</label>
                        <input
                          type="number"
                          value={manualCharacter.religion}
                          onChange={(e) => setManualCharacter({...manualCharacter, religion: parseInt(e.target.value) || 0})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Sleight of Hand (DEX)</label>
                        <input
                          type="number"
                          value={manualCharacter.sleightOfHand}
                          onChange={(e) => setManualCharacter({...manualCharacter, sleightOfHand: parseInt(e.target.value) || 0})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Stealth (DEX)</label>
                        <input
                          type="number"
                          value={manualCharacter.stealth}
                          onChange={(e) => setManualCharacter({...manualCharacter, stealth: parseInt(e.target.value) || 0})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Survival (WIS)</label>
                        <input
                          type="number"
                          value={manualCharacter.survival}
                          onChange={(e) => setManualCharacter({...manualCharacter, survival: parseInt(e.target.value) || 0})}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Passive Perception & Inspiration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Passive Perception</label>
                      <input
                        type="number"
                        value={manualCharacter.passivePerception}
                        onChange={(e) => setManualCharacter({...manualCharacter, passivePerception: parseInt(e.target.value) || 10})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Inspiration</label>
                      <div className="flex items-center h-full pt-2">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={manualCharacter.inspiration}
                            onChange={(e) => setManualCharacter({...manualCharacter, inspiration: e.target.checked})}
                            className="w-5 h-5 bg-gray-700 border-gray-600 rounded"
                          />
                          <span className="ml-2 text-white">Has Inspiration</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Languages</label>
                    <textarea
                      value={manualCharacter.languages}
                      onChange={(e) => setManualCharacter({...manualCharacter, languages: e.target.value})}
                      placeholder="Common, Elvish, Draconic, etc."
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white resize-none"
                    />
                  </div>

                  {/* Equipment */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Equipment</label>
                    <textarea
                      value={manualCharacter.equipment}
                      onChange={(e) => setManualCharacter({...manualCharacter, equipment: e.target.value})}
                      placeholder="Longsword, Shield, Leather Armor, etc."
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white resize-none"
                    />
                  </div>

                  {/* Features and Traits */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Features & Traits</label>
                    <textarea
                      value={manualCharacter.features}
                      onChange={(e) => setManualCharacter({...manualCharacter, features: e.target.value})}
                      placeholder="Racial traits, class features, feats, etc."
                      rows={4}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleManualAdd}
                      disabled={addingCharacter}
                      className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600
                                 rounded-lg font-semibold transition-colors duration-200"
                    >
                      {addingCharacter ? '⏳ Adding...' : '✓ Add Character'}
                    </button>
                    <button
                      onClick={() => {
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
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold
                                 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
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
                      className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          {char?.avatarUrl && (
                            <img
                              src={char.avatarUrl}
                              alt={character.name}
                              className="w-16 h-16 rounded-lg object-cover border-2 border-gray-600"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-white">{character.name}</h3>
                              <span className="text-sm text-gray-400">Lvl {level}</span>
                            </div>
                            <div className="text-sm text-gray-400 mb-2">
                              {char?.race} - {className}
                            </div>
                            <div className="flex gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400">HP:</span>
                                <span className="font-semibold text-red-400">
                                  {hp} / {maxHp}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400">AC:</span>
                                <span className="font-semibold text-blue-400">{ac}</span>
                              </div>
                            </div>
                            {character.lastSync && (
                              <div className="text-xs text-gray-500 mt-2">
                                Last synced: {new Date(character.lastSync).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRemoveCharacter(character.characterId)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm
                                       transition-colors duration-200"
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-3xl mb-2">👥</div>
                <p>No characters linked yet. Add a D&D Beyond character to get started.</p>
              </div>
            )}
          </div>

          {/* Theme Section */}
          {campaign.theme && (
            <div className="bg-gray-900 rounded-xl border-2 border-gray-800 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Campaign Theme</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-2">Primary Color</div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded border-2 border-gray-700"
                      style={{ backgroundColor: campaign.theme.primary }}
                    />
                    <span className="font-mono text-gray-300">{campaign.theme.primary}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-2">Secondary Color</div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded border-2 border-gray-700"
                      style={{ backgroundColor: campaign.theme.secondary }}
                    />
                    <span className="font-mono text-gray-300">{campaign.theme.secondary}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Campaign Info */}
          <div className="bg-gray-900 rounded-xl border-2 border-gray-800 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Campaign Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Slug:</span>
                <span className="font-mono text-gray-300">{campaign.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Created:</span>
                <span className="text-gray-300">
                  {new Date(campaign.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Path:</span>
                <span className="font-mono text-gray-300 text-xs">
                  src/app/campaigns/{campaign.slug}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
