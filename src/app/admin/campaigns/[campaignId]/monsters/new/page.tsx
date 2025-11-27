'use client'

import { useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useToast } from '@/hooks/useToast'
import { MainNav } from '@/components/layout/MainNav'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Loader2, Swords, Shield, Heart, Zap, Brain, Plus, Trash2, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { MonsterTemplateSelector } from '@/components/srd'
import { srdMonsterToFormData } from '@/lib/srd/form-mappers'
import type { SRDMonster } from '@/lib/srd/models'
import { AIMonsterGenerator, type GeneratedMonsterData } from '@/components/ai'

interface Action {
  name: string
  description: string
}

interface Trait {
  name: string
  description: string
}

export default function NewMonsterPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.campaignId as string
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  // Template state
  const [selectedTemplate, setSelectedTemplate] = useState<SRDMonster | null>(null)

  // Basic Info
  const [name, setName] = useState('')
  const [size, setSize] = useState('Medium')
  const [type, setType] = useState('Humanoid')
  const [alignment, setAlignment] = useState('Neutral')
  const [cr, setCr] = useState('1')

  // Stats
  const [ac, setAc] = useState('12')
  const [acType, setAcType] = useState('Natural Armor')
  const [hp, setHp] = useState('22')
  const [hitDice, setHitDice] = useState('4d8+4')
  const [speed, setSpeed] = useState('30 ft.')

  // Ability Scores
  const [str, setStr] = useState('10')
  const [dex, setDex] = useState('10')
  const [con, setConst] = useState('10')
  const [int, setInt] = useState('10')
  const [wis, setWis] = useState('10')
  const [cha, setCha] = useState('10')

  // Optional fields
  const [saves, setSaves] = useState('')
  const [skills, setSkills] = useState('')
  const [resistances, setResistances] = useState('')
  const [immunities, setImmunities] = useState('')
  const [senses, setSenses] = useState('Passive Perception 10')
  const [languages, setLanguages] = useState('')

  // Traits and Actions
  const [traits, setTraits] = useState<Trait[]>([])
  const [actions, setActions] = useState<Action[]>([])

  // Image
  const [imageUrl, setImageUrl] = useState('')

  const calculateModifier = (score: string) => {
    const num = parseInt(score) || 10
    const mod = Math.floor((num - 10) / 2)
    return mod >= 0 ? `+${mod}` : `${mod}`
  }

  const addTrait = () => {
    setTraits([...traits, { name: '', description: '' }])
  }

  const removeTrait = (index: number) => {
    setTraits(traits.filter((_, i) => i !== index))
  }

  const updateTrait = (index: number, field: 'name' | 'description', value: string) => {
    const updated = [...traits]
    updated[index][field] = value
    setTraits(updated)
  }

  const addAction = () => {
    setActions([...actions, { name: '', description: '' }])
  }

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index))
  }

  const updateAction = (index: number, field: 'name' | 'description', value: string) => {
    const updated = [...actions]
    updated[index][field] = value
    setActions(updated)
  }

  // Template handlers
  const handleSelectTemplate = useCallback((monster: SRDMonster) => {
    setSelectedTemplate(monster)

    // Convert SRD monster to form data and populate all fields
    const formData = srdMonsterToFormData(monster)

    setName(formData.name)
    setSize(formData.size)
    setType(formData.type)
    setAlignment(formData.alignment)
    setCr(formData.cr)
    setAc(formData.ac)
    setAcType(formData.acType)
    setHp(formData.hp)
    setHitDice(formData.hitDice)
    setSpeed(formData.speed)
    setStr(formData.str)
    setDex(formData.dex)
    setConst(formData.con)
    setInt(formData.int)
    setWis(formData.wis)
    setCha(formData.cha)
    setSaves(formData.saves)
    setSkills(formData.skills)
    setResistances(formData.resistances)
    setImmunities(formData.immunities)
    setSenses(formData.senses)
    setLanguages(formData.languages)
    setTraits(formData.traits)
    setActions(formData.actions)
    setImageUrl(formData.imageUrl)

    toast.success(`Loaded template: ${monster.name}`)
  }, [toast])

  const handleClearTemplate = useCallback(() => {
    setSelectedTemplate(null)
    // Don't clear the form - user may want to keep their edits
  }, [])

  // AI Generation handler
  const handleAIGenerated = useCallback((monster: GeneratedMonsterData) => {
    // Populate form with AI-generated monster
    setName(monster.name)
    setSize(monster.size)
    setType(monster.type)
    setAlignment(monster.alignment || 'Neutral')
    setCr(monster.challengeRating.toString())
    setAc(monster.armorClass.toString())
    setAcType(monster.armorType || '')
    setHp(monster.hitPoints.toString())
    setHitDice(monster.hitDice)
    setSpeed(typeof monster.speed === 'string' ? monster.speed : '30 ft.')
    setStr(monster.abilities.str.toString())
    setDex(monster.abilities.dex.toString())
    setConst(monster.abilities.con.toString())
    setInt(monster.abilities.int.toString())
    setWis(monster.abilities.wis.toString())
    setCha(monster.abilities.cha.toString())
    setSaves(monster.savingThrows?.join(', ') || '')
    setSkills(monster.skills?.join(', ') || '')
    setResistances(monster.damageResistances?.join(', ') || '')
    setImmunities(monster.damageImmunities?.join(', ') || '')
    setSenses(monster.senses?.join(', ') || 'Passive Perception 10')
    setLanguages(monster.languages?.join(', ') || '')
    setTraits(monster.traits || [])
    setActions(monster.actions || [])
    setImageUrl('')

    // Clear template selection since this is AI-generated
    setSelectedTemplate(null)

    toast.success(`AI generated: ${monster.name}`)
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const monsterData = {
        name,
        size,
        type,
        alignment,
        cr,
        ac,
        acType,
        hp,
        hitDice,
        speed,
        abilityScores: { str, dex, con: con, int, wis, cha },
        saves,
        skills,
        resistances,
        immunities,
        senses,
        languages,
        traits,
        actions,
        imageUrl,
      }

      const response = await fetch(`/api/campaigns/${campaignId}/monsters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(monsterData),
      })

      if (response.ok) {
        toast.success('Monster created successfully!')
        router.push(`/admin/campaigns/${campaignId}`)
      } else {
        toast.error('Failed to create monster')
      }
    } catch (error) {
      console.error('Error creating monster:', error)
      toast.error('Error creating monster')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container max-w-5xl mx-auto py-8 px-4">
        <div className="flex items-start justify-between">
          <PageHeader
            title="Create Monster Stat Block"
            description={`Campaign: ${campaignId}`}
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Admin', href: '/admin' },
              { label: 'Campaign', href: `/admin/campaigns/${campaignId}` },
              { label: 'New Monster' },
            ]}
          />
          <Link href="/srd?type=monsters" target="_blank">
            <Button variant="outline" size="sm" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Browse SRD
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          {/* AI Monster Generator */}
          <AIMonsterGenerator
            onGenerated={handleAIGenerated}
            campaignId={campaignId}
          />

          {/* SRD Template Selector */}
          <MonsterTemplateSelector
            onSelect={handleSelectTemplate}
            onClear={handleClearTemplate}
            selectedMonster={selectedTemplate}
          />

          {/* Basic Information */}
          <Card variant="fantasy">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Swords className="h-5 w-5 text-primary" />
                Basic Information
              </CardTitle>
              <CardDescription>Core details about your monster</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Monster Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Goblin"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <select
                    id="size"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg
                             focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                             text-foreground font-ui"
                  >
                    <option>Tiny</option>
                    <option>Small</option>
                    <option>Medium</option>
                    <option>Large</option>
                    <option>Huge</option>
                    <option>Gargantuan</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    type="text"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="Humanoid, Fey, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alignment">Alignment</Label>
                  <Input
                    id="alignment"
                    type="text"
                    value={alignment}
                    onChange={(e) => setAlignment(e.target.value)}
                    placeholder="Neutral Evil"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (optional)</Label>
                <Input
                  id="imageUrl"
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="font-mono text-sm"
                  placeholder="/campaigns/your-campaign/img/monster.jpg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Combat Stats */}
          <Card variant="fantasy">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Combat Stats
              </CardTitle>
              <CardDescription>Armor, hit points, and speed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Armor Class</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={ac}
                      onChange={(e) => setAc(e.target.value)}
                      className="w-24"
                      placeholder="12"
                    />
                    <Input
                      type="text"
                      value={acType}
                      onChange={(e) => setAcType(e.target.value)}
                      className="flex-1"
                      placeholder="Natural Armor"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="speed">Speed</Label>
                  <Input
                    id="speed"
                    type="text"
                    value={speed}
                    onChange={(e) => setSpeed(e.target.value)}
                    placeholder="30 ft., fly 60 ft."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hp">Hit Points</Label>
                  <Input
                    id="hp"
                    type="text"
                    value={hp}
                    onChange={(e) => setHp(e.target.value)}
                    placeholder="22"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hitDice">Hit Dice</Label>
                  <Input
                    id="hitDice"
                    type="text"
                    value={hitDice}
                    onChange={(e) => setHitDice(e.target.value)}
                    placeholder="4d8+4"
                    className="font-mono"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="cr">Challenge Rating</Label>
                  <Input
                    id="cr"
                    type="text"
                    value={cr}
                    onChange={(e) => setCr(e.target.value)}
                    placeholder="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ability Scores */}
          <Card variant="fantasy">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Ability Scores
              </CardTitle>
              <CardDescription>The six core abilities and modifiers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { label: 'STR', value: str, setter: setStr },
                  { label: 'DEX', value: dex, setter: setDex },
                  { label: 'CON', value: con, setter: setConst },
                  { label: 'INT', value: int, setter: setInt },
                  { label: 'WIS', value: wis, setter: setWis },
                  { label: 'CHA', value: cha, setter: setCha },
                ].map((ability) => (
                  <div key={ability.label} className="space-y-2">
                    <Label className="text-center block">{ability.label}</Label>
                    <Input
                      type="number"
                      value={ability.value}
                      onChange={(e) => ability.setter(e.target.value)}
                      className="text-center"
                    />
                    <div className="text-center text-sm text-primary font-mono">
                      ({calculateModifier(ability.value)})
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label htmlFor="saves">Saving Throws</Label>
                  <Input
                    id="saves"
                    type="text"
                    value={saves}
                    onChange={(e) => setSaves(e.target.value)}
                    placeholder="Dex +4, Wis +2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Skills</Label>
                  <Input
                    id="skills"
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="Stealth +6, Perception +2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Properties */}
          <Card variant="fantasy">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Additional Properties
              </CardTitle>
              <CardDescription>Resistances, immunities, senses, and languages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="resistances">Damage Resistances</Label>
                  <Input
                    id="resistances"
                    type="text"
                    value={resistances}
                    onChange={(e) => setResistances(e.target.value)}
                    placeholder="Fire, Cold"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="immunities">Damage Immunities</Label>
                  <Input
                    id="immunities"
                    type="text"
                    value={immunities}
                    onChange={(e) => setImmunities(e.target.value)}
                    placeholder="Poison"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senses">Senses</Label>
                  <Input
                    id="senses"
                    type="text"
                    value={senses}
                    onChange={(e) => setSenses(e.target.value)}
                    placeholder="Darkvision 60 ft., Passive Perception 12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="languages">Languages</Label>
                  <Input
                    id="languages"
                    type="text"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    placeholder="Common, Goblin"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Traits */}
          <Card variant="fantasy">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Traits
                  </CardTitle>
                  <CardDescription>Special abilities and passive features</CardDescription>
                </div>
                <Button type="button" variant="primary" size="sm" onClick={addTrait}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Trait
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {traits.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No traits added yet. Click &quot;Add Trait&quot; to add one.
                </p>
              ) : (
                <div className="space-y-4">
                  {traits.map((trait, index) => (
                    <div key={index} className="bg-muted/50 rounded-lg p-4 border border-border">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <Input
                          type="text"
                          value={trait.name}
                          onChange={(e) => updateTrait(index, 'name', e.target.value)}
                          className="flex-1 font-semibold"
                          placeholder="Trait Name"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTrait(index)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        value={trait.description}
                        onChange={(e) => updateTrait(index, 'description', e.target.value)}
                        rows={2}
                        placeholder="Description (use <DiceNotation value='DC 15' /> for dice)"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card variant="fantasy">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Swords className="h-5 w-5 text-primary" />
                    Actions
                  </CardTitle>
                  <CardDescription>Attacks and action-economy abilities</CardDescription>
                </div>
                <Button type="button" variant="primary" size="sm" onClick={addAction}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Action
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {actions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No actions added yet. Click &quot;Add Action&quot; to add one.
                </p>
              ) : (
                <div className="space-y-4">
                  {actions.map((action, index) => (
                    <div key={index} className="bg-muted/50 rounded-lg p-4 border border-border">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <Input
                          type="text"
                          value={action.name}
                          onChange={(e) => updateAction(index, 'name', e.target.value)}
                          className="flex-1 font-semibold"
                          placeholder="Action Name"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAction(index)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        value={action.description}
                        onChange={(e) => updateAction(index, 'description', e.target.value)}
                        rows={2}
                        placeholder="Description (e.g., Melee Attack: <DiceNotation value='+5' /> to hit, Hit: <DiceNotation value='1d8+3' /> damage)"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading || !name}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creating Monster...
                </>
              ) : (
                'Create Monster'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.push(`/admin/campaigns/${campaignId}`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
