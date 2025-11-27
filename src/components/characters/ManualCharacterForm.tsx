'use client'

import { Accordion, AccordionItem } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { SRDSuggestionInput } from '@/components/srd'
import { BookOpen } from 'lucide-react'
import Link from 'next/link'

interface ManualCharacterData {
  name: string
  class: string
  level: number
  race: string
  background: string
  alignment: string
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
  currentHp: number
  maxHp: number
  tempHp: number
  ac: number
  initiative: number
  speed: number
  proficiencyBonus: number
  inspiration: boolean
  strSave: number
  dexSave: number
  conSave: number
  intSave: number
  wisSave: number
  chaSave: number
  acrobatics: number
  animalHandling: number
  arcana: number
  athletics: number
  deception: number
  history: number
  insight: number
  intimidation: number
  investigation: number
  medicine: number
  nature: number
  perception: number
  performance: number
  persuasion: number
  religion: number
  sleightOfHand: number
  stealth: number
  survival: number
  passivePerception: number
  languages: string
  equipment: string
  features: string
}

interface ManualCharacterFormProps {
  character: ManualCharacterData
  onChange: (data: ManualCharacterData) => void
  onSubmit: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function ManualCharacterForm({
  character,
  onChange,
  onSubmit,
  onCancel,
  isLoading = false,
}: ManualCharacterFormProps) {
  const updateField = (field: keyof ManualCharacterData, value: any) => {
    onChange({ ...character, [field]: value })
  }

  return (
    <div className="space-y-3">
      {/* SRD Quick Links */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>Need help? Browse the SRD for reference</span>
        </div>
        <div className="flex gap-2">
          <Link href="/srd?type=races" target="_blank">
            <Button variant="ghost" size="sm">Races</Button>
          </Link>
          <Link href="/srd?type=classes" target="_blank">
            <Button variant="ghost" size="sm">Classes</Button>
          </Link>
          <Link href="/srd?type=backgrounds" target="_blank">
            <Button variant="ghost" size="sm">Backgrounds</Button>
          </Link>
        </div>
      </div>

      <Accordion>
        {/* Basic Information */}
        <AccordionItem title="Basic Information" defaultOpen badge="Required">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="mb-2">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  value={character.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Character Name"
                />
              </div>
              <SRDSuggestionInput
                type="classes"
                value={character.class}
                onChange={(value) => updateField('class', value)}
                label="Class"
                required
                placeholder="Barbarian, Wizard, etc."
              />
              <div>
                <Label className="mb-2">Level</Label>
                <Input
                  type="number"
                  value={character.level}
                  onChange={(e) => updateField('level', parseInt(e.target.value) || 1)}
                  min={1}
                  max={20}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SRDSuggestionInput
                type="races"
                value={character.race}
                onChange={(value) => updateField('race', value)}
                label="Race/Species"
                required
                placeholder="Human, Elf, Dwarf, etc."
              />
              <SRDSuggestionInput
                type="backgrounds"
                value={character.background}
                onChange={(value) => updateField('background', value)}
                label="Background"
                placeholder="Soldier, Sage, etc."
              />
              <div>
                <Label className="mb-2">Alignment</Label>
                <Input
                  type="text"
                  value={character.alignment}
                  onChange={(e) => updateField('alignment', e.target.value)}
                  placeholder="Lawful Good, etc."
                />
              </div>
            </div>
          </div>
        </AccordionItem>

        {/* Ability Scores & Combat Stats */}
        <AccordionItem title="Ability Scores & Combat Stats">
          <div className="space-y-4">
            {/* Ability Scores */}
            <div>
              <Label className="mb-3">Ability Scores</Label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map((ability) => (
                  <div key={ability}>
                    <label className="block text-xs text-muted-foreground mb-1 uppercase">{ability}</label>
                    <Input
                      type="number"
                      value={character[ability]}
                      onChange={(e) => updateField(ability, parseInt(e.target.value) || 10)}
                      className="text-center"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Combat Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="mb-2">Current HP</Label>
                <Input
                  type="number"
                  value={character.currentHp}
                  onChange={(e) => updateField('currentHp', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label className="mb-2">Max HP</Label>
                <Input
                  type="number"
                  value={character.maxHp}
                  onChange={(e) => updateField('maxHp', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label className="mb-2">AC</Label>
                <Input
                  type="number"
                  value={character.ac}
                  onChange={(e) => updateField('ac', parseInt(e.target.value) || 10)}
                />
              </div>
              <div>
                <Label className="mb-2">Initiative</Label>
                <Input
                  type="number"
                  value={character.initiative}
                  onChange={(e) => updateField('initiative', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        </AccordionItem>

        {/* Skills & Proficiencies */}
        <AccordionItem title="Skills & Proficiencies" badge="18 skills">
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: 'acrobatics', label: 'Acrobatics' },
                { key: 'animalHandling', label: 'Animal Handling' },
                { key: 'arcana', label: 'Arcana' },
                { key: 'athletics', label: 'Athletics' },
                { key: 'deception', label: 'Deception' },
                { key: 'history', label: 'History' },
                { key: 'insight', label: 'Insight' },
                { key: 'intimidation', label: 'Intimidation' },
                { key: 'investigation', label: 'Investigation' },
                { key: 'medicine', label: 'Medicine' },
                { key: 'nature', label: 'Nature' },
                { key: 'perception', label: 'Perception' },
                { key: 'performance', label: 'Performance' },
                { key: 'persuasion', label: 'Persuasion' },
                { key: 'religion', label: 'Religion' },
                { key: 'sleightOfHand', label: 'Sleight of Hand' },
                { key: 'stealth', label: 'Stealth' },
                { key: 'survival', label: 'Survival' },
              ].map((skill) => (
                <div key={skill.key}>
                  <label className="block text-xs text-muted-foreground mb-1">{skill.label}</label>
                  <Input
                    type="number"
                    value={character[skill.key as keyof ManualCharacterData] as number}
                    onChange={(e) => updateField(skill.key as keyof ManualCharacterData, parseInt(e.target.value) || 0)}
                    className="text-center text-sm py-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </AccordionItem>

        {/* Saving Throws */}
        <AccordionItem title="Saving Throws">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { key: 'strSave', label: 'Strength' },
              { key: 'dexSave', label: 'Dexterity' },
              { key: 'conSave', label: 'Constitution' },
              { key: 'intSave', label: 'Intelligence' },
              { key: 'wisSave', label: 'Wisdom' },
              { key: 'chaSave', label: 'Charisma' },
            ].map((save) => (
              <div key={save.key}>
                <label className="block text-sm text-muted-foreground mb-1">{save.label}</label>
                <Input
                  type="number"
                  value={character[save.key as keyof ManualCharacterData] as number}
                  onChange={(e) => updateField(save.key as keyof ManualCharacterData, parseInt(e.target.value) || 0)}
                />
              </div>
            ))}
          </div>
        </AccordionItem>

        {/* Equipment & Features */}
        <AccordionItem title="Equipment & Features">
          <div className="space-y-4">
            <div>
              <Label className="mb-2">Languages</Label>
              <Input
                type="text"
                value={character.languages}
                onChange={(e) => updateField('languages', e.target.value)}
                placeholder="Common, Elvish, etc."
              />
            </div>
            <div>
              <Label className="mb-2">Equipment</Label>
              <textarea
                value={character.equipment}
                onChange={(e) => updateField('equipment', e.target.value)}
                placeholder="List equipment and items..."
                rows={3}
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg
                           focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                           text-foreground font-ui resize-none"
              />
            </div>
            <div>
              <Label className="mb-2">Features & Traits</Label>
              <textarea
                value={character.features}
                onChange={(e) => updateField('features', e.target.value)}
                placeholder="List racial traits, class features, etc..."
                rows={4}
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg
                           focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                           text-foreground font-ui resize-none"
              />
            </div>
          </div>
        </AccordionItem>
      </Accordion>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={onSubmit}
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="flex-1"
        >
          Add Character
        </Button>
        <Button onClick={onCancel} variant="secondary" size="lg">
          Cancel
        </Button>
      </div>
    </div>
  )
}
