'use client'

import { Accordion, AccordionItem } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'

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
      <Accordion>
        {/* Basic Information */}
        <AccordionItem title="Basic Information" defaultOpen badge="Required">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={character.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Character Name"
                  className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg text-white
                             focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Class <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={character.class}
                  onChange={(e) => updateField('class', e.target.value)}
                  placeholder="Barbarian, Wizard, etc."
                  className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg text-white
                             focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Level</label>
                <input
                  type="number"
                  value={character.level}
                  onChange={(e) => updateField('level', parseInt(e.target.value) || 1)}
                  min="1"
                  max="20"
                  className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg text-white
                             focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Race/Species <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={character.race}
                  onChange={(e) => updateField('race', e.target.value)}
                  placeholder="Human, Elf, Dwarf, etc."
                  className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg text-white
                             focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Background</label>
                <input
                  type="text"
                  value={character.background}
                  onChange={(e) => updateField('background', e.target.value)}
                  placeholder="Soldier, Sage, etc."
                  className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg text-white
                             focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Alignment</label>
                <input
                  type="text"
                  value={character.alignment}
                  onChange={(e) => updateField('alignment', e.target.value)}
                  placeholder="Lawful Good, etc."
                  className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg text-white
                             focus:border-purple-500 focus:outline-none transition-colors"
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
              <label className="block text-sm font-semibold text-gray-300 mb-3">Ability Scores</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map((ability) => (
                  <div key={ability}>
                    <label className="block text-xs text-gray-400 mb-1 uppercase">{ability}</label>
                    <input
                      type="number"
                      value={character[ability]}
                      onChange={(e) => updateField(ability, parseInt(e.target.value) || 10)}
                      className="w-full px-2 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg text-white text-center
                                 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Combat Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Current HP</label>
                <input
                  type="number"
                  value={character.currentHp}
                  onChange={(e) => updateField('currentHp', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg text-white
                             focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Max HP</label>
                <input
                  type="number"
                  value={character.maxHp}
                  onChange={(e) => updateField('maxHp', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg text-white
                             focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">AC</label>
                <input
                  type="number"
                  value={character.ac}
                  onChange={(e) => updateField('ac', parseInt(e.target.value) || 10)}
                  className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg text-white
                             focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Initiative</label>
                <input
                  type="number"
                  value={character.initiative}
                  onChange={(e) => updateField('initiative', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg text-white
                             focus:border-purple-500 focus:outline-none transition-colors"
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
                  <label className="block text-xs text-gray-400 mb-1">{skill.label}</label>
                  <input
                    type="number"
                    value={character[skill.key as keyof ManualCharacterData] as number}
                    onChange={(e) => updateField(skill.key as keyof ManualCharacterData, parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-center
                               focus:border-purple-500 focus:outline-none transition-colors text-sm"
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
                <label className="block text-sm text-gray-400 mb-1">{save.label}</label>
                <input
                  type="number"
                  value={character[save.key as keyof ManualCharacterData] as number}
                  onChange={(e) => updateField(save.key as keyof ManualCharacterData, parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg text-white
                             focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
            ))}
          </div>
        </AccordionItem>

        {/* Equipment & Features */}
        <AccordionItem title="Equipment & Features">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Languages</label>
              <input
                type="text"
                value={character.languages}
                onChange={(e) => updateField('languages', e.target.value)}
                placeholder="Common, Elvish, etc."
                className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg text-white
                           focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Equipment</label>
              <textarea
                value={character.equipment}
                onChange={(e) => updateField('equipment', e.target.value)}
                placeholder="List equipment and items..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg text-white
                           focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Features & Traits</label>
              <textarea
                value={character.features}
                onChange={(e) => updateField('features', e.target.value)}
                placeholder="List racial traits, class features, etc..."
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg text-white
                           focus:border-purple-500 focus:outline-none transition-colors"
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
