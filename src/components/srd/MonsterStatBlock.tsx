'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { AbilityScoreGrid, ChallengeRatingBadge, PropertyBadge, SRDImage } from './shared'
import { Swords, Shield, Heart, Zap, Eye, MessageSquare } from 'lucide-react'
import type { SRDMonster } from '@/lib/srd/models'

// Helper to format speed - handles both string and object formats
function formatSpeed(speed: string | Record<string, number> | undefined): string {
  if (!speed) return '—'
  if (typeof speed === 'string') return speed

  // Handle object format like {walk: 30, swim: 40, fly: 60}
  const parts: string[] = []
  if ('walk' in speed) parts.push(`${speed.walk} ft.`)
  if ('swim' in speed) parts.push(`swim ${speed.swim} ft.`)
  if ('fly' in speed) parts.push(`fly ${speed.fly} ft.`)
  if ('burrow' in speed) parts.push(`burrow ${speed.burrow} ft.`)
  if ('climb' in speed) parts.push(`climb ${speed.climb} ft.`)
  if ('hover' in speed) parts.push(`hover ${speed.hover} ft.`)

  return parts.length > 0 ? parts.join(', ') : '—'
}

interface MonsterStatBlockProps {
  monster: SRDMonster
  variant?: 'full' | 'compact' | 'preview'
  className?: string
  showImage?: boolean
  onImageUpload?: (file: File) => void
}

export function MonsterStatBlock({
  monster,
  variant = 'full',
  className = '',
  showImage = true,
  onImageUpload,
}: MonsterStatBlockProps) {
  if (variant === 'preview') {
    return <MonsterPreview monster={monster} className={className} />
  }

  if (variant === 'compact') {
    return <MonsterCompact monster={monster} className={className} />
  }

  return (
    <Card variant="fantasy" className={`overflow-hidden ${className}`}>
      {/* Header */}
      <CardHeader className="pb-2">
        <div className="flex items-start gap-4">
          {showImage && (
            <SRDImage
              src={monster.imageUrl}
              alt={monster.name}
              type="monster"
              size="lg"
              showUploadButton={!!onImageUpload}
              onUpload={onImageUpload}
            />
          )}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-2xl font-display text-primary mb-1">
              {monster.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground italic">
              {monster.size} {monster.type}
              {monster.alignment && `, ${monster.alignment}`}
            </p>
            <div className="mt-2">
              <ChallengeRatingBadge cr={monster.challengeRating} />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Stats */}
        <div className="grid grid-cols-3 gap-3 py-3 border-y border-border">
          <StatItem icon={<Shield className="h-4 w-4" />} label="Armor Class" value={monster.ac} />
          <StatItem icon={<Heart className="h-4 w-4" />} label="Hit Points" value={monster.hp} />
          <StatItem icon={<Zap className="h-4 w-4" />} label="Speed" value={formatSpeed(monster.speed)} />
        </div>

        {/* Ability Scores */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">Ability Scores</h4>
          <AbilityScoreGrid
            abilities={monster.abilities}
            savingThrows={monster.savingThrows}
          />
        </div>

        {/* Skills */}
        {monster.skills && Object.keys(monster.skills).length > 0 && (
          <PropertySection title="Skills">
            {Object.entries(monster.skills).map(([skill, bonus]) => (
              <span key={skill} className="text-sm">
                {skill} {formatBonus(bonus)}
              </span>
            ))}
          </PropertySection>
        )}

        {/* Damage Properties */}
        {monster.damageResistances && monster.damageResistances.length > 0 && (
          <PropertySection title="Damage Resistances">
            <PropertyList items={monster.damageResistances} variant="warning" />
          </PropertySection>
        )}

        {monster.damageImmunities && monster.damageImmunities.length > 0 && (
          <PropertySection title="Damage Immunities">
            <PropertyList items={monster.damageImmunities} variant="success" />
          </PropertySection>
        )}

        {monster.damageVulnerabilities && monster.damageVulnerabilities.length > 0 && (
          <PropertySection title="Damage Vulnerabilities">
            <PropertyList items={monster.damageVulnerabilities} variant="danger" />
          </PropertySection>
        )}

        {monster.conditionImmunities && monster.conditionImmunities.length > 0 && (
          <PropertySection title="Condition Immunities">
            <PropertyList items={monster.conditionImmunities} variant="info" />
          </PropertySection>
        )}

        {/* Senses & Languages */}
        {monster.senses && monster.senses.length > 0 && (
          <PropertySection title="Senses" icon={<Eye className="h-4 w-4" />}>
            <span className="text-sm text-foreground">{monster.senses.join(', ')}</span>
          </PropertySection>
        )}

        {monster.languages && monster.languages.length > 0 && (
          <PropertySection title="Languages" icon={<MessageSquare className="h-4 w-4" />}>
            <span className="text-sm text-foreground">{monster.languages.join(', ')}</span>
          </PropertySection>
        )}

        {/* Traits */}
        {monster.traits && monster.traits.length > 0 && (
          <ActionSection title="Traits" items={monster.traits} />
        )}

        {/* Actions */}
        {monster.actions && monster.actions.length > 0 && (
          <ActionSection title="Actions" items={monster.actions} icon={<Swords className="h-4 w-4" />} />
        )}

        {/* Reactions */}
        {monster.reactions && monster.reactions.length > 0 && (
          <ActionSection title="Reactions" items={monster.reactions} />
        )}

        {/* Legendary Actions */}
        {monster.legendaryActions && monster.legendaryActions.length > 0 && (
          <ActionSection
            title="Legendary Actions"
            items={monster.legendaryActions}
            className="bg-primary/5 -mx-6 px-6 py-4 border-t border-primary/20"
          />
        )}

        {/* Source */}
        <div className="pt-2 border-t border-border">
          <PropertyBadge variant={monster.source === 'official' ? 'default' : 'primary'}>
            {monster.source === 'official' ? 'Official SRD' : 'Custom'}
          </PropertyBadge>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact version for search results
function MonsterCompact({ monster, className }: { monster: SRDMonster; className?: string }) {
  return (
    <Card variant="fantasy" className={`p-4 hover:border-primary/50 transition-colors cursor-pointer ${className}`}>
      <div className="flex items-center gap-3">
        <SRDImage src={monster.imageUrl} alt={monster.name} type="monster" size="sm" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{monster.name}</h3>
          <p className="text-xs text-muted-foreground">
            {monster.size} {monster.type}
          </p>
        </div>
        <ChallengeRatingBadge cr={monster.challengeRating} showXP={false} size="sm" />
      </div>
      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
        <span>AC {monster.ac}</span>
        <span>HP {monster.hp}</span>
        <span>{formatSpeed(monster.speed)}</span>
      </div>
    </Card>
  )
}

// Preview card for grid view
function MonsterPreview({ monster, className }: { monster: SRDMonster; className?: string }) {
  return (
    <Card variant="fantasy" className={`overflow-hidden hover:border-primary/50 transition-all cursor-pointer ${className}`}>
      <div className="aspect-square bg-muted/30 relative">
        {monster.imageUrl ? (
          <img
            src={monster.imageUrl}
            alt={monster.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <SRDImage src={null} alt={monster.name} type="monster" size="lg" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <ChallengeRatingBadge cr={monster.challengeRating} showXP={false} size="sm" />
        </div>
      </div>
      <CardContent className="p-3">
        <h3 className="font-semibold text-foreground truncate">{monster.name}</h3>
        <p className="text-xs text-muted-foreground truncate">
          {monster.size} {monster.type}
        </p>
        <div className="mt-2 flex gap-2 text-xs">
          <span className="text-info">AC {monster.ac}</span>
          <span className="text-destructive">HP {monster.hp}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper Components
function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="font-semibold text-foreground">{value}</div>
    </div>
  )
}

function PropertySection({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <h4 className="text-sm font-semibold text-muted-foreground">{title}</h4>
      </div>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  )
}

function PropertyList({
  items,
  variant = 'default',
}: {
  items: string[]
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}) {
  return (
    <>
      {items.map((item, idx) => (
        <PropertyBadge key={idx} variant={variant} size="sm">
          {item}
        </PropertyBadge>
      ))}
    </>
  )
}

function ActionSection({
  title,
  items,
  icon,
  className = '',
}: {
  title: string
  items: Array<{ name: string; description: string }>
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-primary">{icon}</span>}
        <h4 className="text-lg font-semibold font-display text-primary">{title}</h4>
      </div>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx}>
            <span className="font-semibold text-foreground italic">{item.name}.</span>{' '}
            <span className="text-sm text-muted-foreground">{item.description}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatBonus(bonus: number): string {
  return bonus >= 0 ? `+${bonus}` : `${bonus}`
}
