'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { SpellSchoolBadge, SpellLevelBadge, PropertyBadge } from './shared'
import { Clock, Target, Sparkles, Timer, BookOpen, Repeat } from 'lucide-react'
import type { SRDSpell } from '@/lib/srd/models'

interface SpellCardProps {
  spell: SRDSpell
  variant?: 'full' | 'compact' | 'preview'
  className?: string
}

export function SpellCard({
  spell,
  variant = 'full',
  className = '',
}: SpellCardProps) {
  if (variant === 'preview') {
    return <SpellPreview spell={spell} className={className} />
  }

  if (variant === 'compact') {
    return <SpellCompact spell={spell} className={className} />
  }

  return (
    <Card variant="fantasy" className={`overflow-hidden ${className}`}>
      {/* Header */}
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <SpellLevelBadge level={spell.level} size="md" />
          {spell.school && <SpellSchoolBadge school={spell.school} size="md" />}
          {spell.ritual && (
            <PropertyBadge variant="info" size="md">
              <Repeat className="h-3 w-3 mr-1" />
              Ritual
            </PropertyBadge>
          )}
          {spell.concentration && (
            <PropertyBadge variant="warning" size="md">
              <Sparkles className="h-3 w-3 mr-1" />
              Concentration
            </PropertyBadge>
          )}
        </div>
        <CardTitle className="text-2xl font-display text-primary">
          {spell.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Spell Info Grid */}
        <div className="grid grid-cols-2 gap-3 py-3 border-y border-border">
          {spell.castingTime && (
            <InfoItem icon={<Clock className="h-4 w-4" />} label="Casting Time" value={spell.castingTime} />
          )}
          {spell.range && (
            <InfoItem icon={<Target className="h-4 w-4" />} label="Range" value={spell.range} />
          )}
          {spell.duration && (
            <InfoItem icon={<Timer className="h-4 w-4" />} label="Duration" value={spell.duration} />
          )}
          {spell.components && spell.components.length > 0 && (
            <InfoItem
              icon={<Sparkles className="h-4 w-4" />}
              label="Components"
              value={formatComponents(spell.components)}
            />
          )}
        </div>

        {/* Description */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            Description
          </h4>
          <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {spell.description}
          </div>
        </div>

        {/* At Higher Levels */}
        {spell.higherLevel && (
          <div className="bg-primary/5 -mx-6 px-6 py-4 border-t border-primary/20">
            <h4 className="text-sm font-semibold text-primary mb-2">At Higher Levels</h4>
            <p className="text-sm text-muted-foreground">{spell.higherLevel}</p>
          </div>
        )}

        {/* Classes */}
        {spell.classes && spell.classes.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Available To</h4>
            <div className="flex flex-wrap gap-1">
              {spell.classes.map((cls, idx) => (
                <PropertyBadge key={idx} variant="primary" size="sm">
                  {cls}
                </PropertyBadge>
              ))}
            </div>
          </div>
        )}

        {/* Source */}
        <div className="pt-2 border-t border-border">
          <PropertyBadge variant={spell.source === 'official' ? 'default' : 'primary'}>
            {spell.source === 'official' ? 'Official SRD' : 'Custom'}
          </PropertyBadge>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact version for search results
function SpellCompact({ spell, className }: { spell: SRDSpell; className?: string }) {
  return (
    <Card variant="fantasy" className={`p-4 hover:border-primary/50 transition-colors cursor-pointer ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{spell.name}</h3>
          <div className="flex flex-wrap gap-1 mt-1">
            <SpellLevelBadge level={spell.level} size="sm" />
            {spell.school && <SpellSchoolBadge school={spell.school} size="sm" />}
          </div>
        </div>
        <div className="flex gap-1">
          {spell.ritual && (
            <span className="text-info" title="Ritual">
              <Repeat className="h-4 w-4" />
            </span>
          )}
          {spell.concentration && (
            <span className="text-warning" title="Concentration">
              <Sparkles className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{spell.description}</p>
      {spell.classes && spell.classes.length > 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          {spell.classes.slice(0, 3).join(', ')}
          {spell.classes.length > 3 && ` +${spell.classes.length - 3} more`}
        </p>
      )}
    </Card>
  )
}

// Preview card for grid view
function SpellPreview({ spell, className }: { spell: SRDSpell; className?: string }) {
  return (
    <Card variant="fantasy" className={`overflow-hidden hover:border-primary/50 transition-all cursor-pointer ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <SpellLevelBadge level={spell.level} size="sm" />
          <div className="flex gap-1">
            {spell.ritual && (
              <span className="text-info" title="Ritual">
                <Repeat className="h-3 w-3" />
              </span>
            )}
            {spell.concentration && (
              <span className="text-warning" title="Concentration">
                <Sparkles className="h-3 w-3" />
              </span>
            )}
          </div>
        </div>
        <h3 className="font-semibold text-foreground truncate mb-1">{spell.name}</h3>
        {spell.school && <SpellSchoolBadge school={spell.school} size="sm" />}
        <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
          {spell.castingTime && <div>Cast: {spell.castingTime}</div>}
          {spell.range && <div>Range: {spell.range}</div>}
        </div>
      </div>
    </Card>
  )
}

// Helper Components
function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  )
}

function formatComponents(components: string[]): string {
  return components.join(', ')
}
