'use client'

import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import { X } from 'lucide-react'

export interface SpellFilterValues {
  level?: number
  school?: string
  spellClass?: string
  ritual?: boolean
  concentration?: boolean
}

interface SpellFiltersProps {
  values: SpellFilterValues
  onChange: (values: SpellFilterValues) => void
  onClear: () => void
}

const SPELL_LEVELS = [
  { value: 0, label: 'Cantrip' },
  { value: 1, label: '1st Level' },
  { value: 2, label: '2nd Level' },
  { value: 3, label: '3rd Level' },
  { value: 4, label: '4th Level' },
  { value: 5, label: '5th Level' },
  { value: 6, label: '6th Level' },
  { value: 7, label: '7th Level' },
  { value: 8, label: '8th Level' },
  { value: 9, label: '9th Level' },
]

const SCHOOLS = [
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
]

const SPELL_CLASSES = [
  'Bard',
  'Cleric',
  'Druid',
  'Paladin',
  'Ranger',
  'Sorcerer',
  'Warlock',
  'Wizard',
]

export function SpellFilters({ values, onChange, onClear }: SpellFiltersProps) {
  const hasFilters =
    values.level !== undefined ||
    values.school ||
    values.spellClass ||
    values.ritual ||
    values.concentration

  const updateFilter = (key: keyof SpellFilterValues, value: any) => {
    onChange({ ...values, [key]: value })
  }

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Spell Filters</h3>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Level */}
      <div className="space-y-1">
        <Label htmlFor="spell-level" className="text-xs">Level</Label>
        <select
          id="spell-level"
          value={values.level ?? ''}
          onChange={(e) => updateFilter('level', e.target.value !== '' ? parseInt(e.target.value) : undefined)}
          className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Any Level</option>
          {SPELL_LEVELS.map((lvl) => (
            <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
          ))}
        </select>
      </div>

      {/* School */}
      <div className="space-y-1">
        <Label htmlFor="spell-school" className="text-xs">School</Label>
        <select
          id="spell-school"
          value={values.school ?? ''}
          onChange={(e) => updateFilter('school', e.target.value || undefined)}
          className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Any School</option>
          {SCHOOLS.map((school) => (
            <option key={school} value={school}>{school}</option>
          ))}
        </select>
      </div>

      {/* Class */}
      <div className="space-y-1">
        <Label htmlFor="spell-class" className="text-xs">Class</Label>
        <select
          id="spell-class"
          value={values.spellClass ?? ''}
          onChange={(e) => updateFilter('spellClass', e.target.value || undefined)}
          className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Any Class</option>
          {SPELL_CLASSES.map((cls) => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      {/* Checkboxes */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={values.ritual ?? false}
            onChange={(e) => updateFilter('ritual', e.target.checked || undefined)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm text-foreground">Ritual Only</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={values.concentration ?? false}
            onChange={(e) => updateFilter('concentration', e.target.checked || undefined)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm text-foreground">Concentration Only</span>
        </label>
      </div>
    </div>
  )
}
