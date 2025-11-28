'use client'

import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import { X } from 'lucide-react'

export interface MonsterFilterValues {
  crMin?: number
  crMax?: number
  size?: string
  monsterType?: string
}

interface MonsterFiltersProps {
  values: MonsterFilterValues
  onChange: (values: MonsterFilterValues) => void
  onClear: () => void
}

const SIZES = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan']

const MONSTER_TYPES = [
  'Aberration',
  'Beast',
  'Celestial',
  'Construct',
  'Dragon',
  'Elemental',
  'Fey',
  'Fiend',
  'Giant',
  'Humanoid',
  'Monstrosity',
  'Ooze',
  'Plant',
  'Undead',
]

const CR_OPTIONS = [
  { value: 0, label: '0' },
  { value: 0.125, label: '1/8' },
  { value: 0.25, label: '1/4' },
  { value: 0.5, label: '1/2' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8' },
  { value: 9, label: '9' },
  { value: 10, label: '10' },
  { value: 11, label: '11' },
  { value: 12, label: '12' },
  { value: 13, label: '13' },
  { value: 14, label: '14' },
  { value: 15, label: '15' },
  { value: 16, label: '16' },
  { value: 17, label: '17' },
  { value: 18, label: '18' },
  { value: 19, label: '19' },
  { value: 20, label: '20' },
  { value: 21, label: '21' },
  { value: 22, label: '22' },
  { value: 23, label: '23' },
  { value: 24, label: '24' },
  { value: 25, label: '25' },
  { value: 26, label: '26' },
  { value: 27, label: '27' },
  { value: 28, label: '28' },
  { value: 29, label: '29' },
  { value: 30, label: '30' },
]

export function MonsterFilters({ values, onChange, onClear }: MonsterFiltersProps) {
  const hasFilters = values.crMin !== undefined || values.crMax !== undefined || values.size || values.monsterType

  const updateFilter = (key: keyof MonsterFilterValues, value: any) => {
    onChange({ ...values, [key]: value || undefined })
  }

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Monster Filters</h3>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* CR Range */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="cr-min" className="text-xs">CR Min</Label>
          <select
            id="cr-min"
            value={values.crMin ?? ''}
            onChange={(e) => updateFilter('crMin', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Any</option>
            {CR_OPTIONS.map((cr) => (
              <option key={cr.value} value={cr.value}>{cr.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="cr-max" className="text-xs">CR Max</Label>
          <select
            id="cr-max"
            value={values.crMax ?? ''}
            onChange={(e) => updateFilter('crMax', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Any</option>
            {CR_OPTIONS.map((cr) => (
              <option key={cr.value} value={cr.value}>{cr.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Size */}
      <div className="space-y-1">
        <Label htmlFor="size" className="text-xs">Size</Label>
        <select
          id="size"
          value={values.size ?? ''}
          onChange={(e) => updateFilter('size', e.target.value)}
          className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Any Size</option>
          {SIZES.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      {/* Type */}
      <div className="space-y-1">
        <Label htmlFor="monster-type" className="text-xs">Type</Label>
        <select
          id="monster-type"
          value={values.monsterType ?? ''}
          onChange={(e) => updateFilter('monsterType', e.target.value)}
          className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Any Type</option>
          {MONSTER_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
