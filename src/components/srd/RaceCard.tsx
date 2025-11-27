'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PropertyBadge } from './shared'
import { Users, Footprints, MessageSquare, Sparkles } from 'lucide-react'
import type { SRDRace } from '@/lib/srd/models'

interface RaceCardProps {
  race: SRDRace
  variant?: 'full' | 'compact' | 'preview'
  className?: string
  onClick?: () => void
}

export function RaceCard({
  race,
  variant = 'full',
  className = '',
  onClick,
}: RaceCardProps) {
  if (variant === 'preview') {
    return <RacePreview race={race} className={className} onClick={onClick} />
  }

  if (variant === 'compact') {
    return <RaceCompact race={race} className={className} onClick={onClick} />
  }

  return (
    <Card variant="fantasy" className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-display text-primary">
              {race.name}
            </CardTitle>
            <PropertyBadge variant={race.source === 'official' ? 'default' : 'primary'} size="sm">
              {race.source === 'official' ? 'Official SRD' : 'Custom'}
            </PropertyBadge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Size & Speed */}
        <div className="grid grid-cols-2 gap-4 py-3 border-y border-border">
          {race.size && (
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Size</div>
              <div className="font-semibold text-foreground">{race.size}</div>
            </div>
          )}
          {race.speed && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                <Footprints className="h-3 w-3" />
                Speed
              </div>
              <div className="font-semibold text-foreground">{race.speed} ft.</div>
            </div>
          )}
        </div>

        {/* Ability Score Bonuses */}
        {race.abilityScoreBonuses && Object.keys(race.abilityScoreBonuses).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              Ability Score Increases
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(race.abilityScoreBonuses).map(([ability, bonus]) => (
                <div
                  key={ability}
                  className="px-3 py-2 bg-primary/10 rounded-lg border border-primary/20 text-center"
                >
                  <div className="text-xs text-muted-foreground uppercase">{ability.slice(0, 3)}</div>
                  <div className="text-lg font-bold text-primary">+{bonus}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {race.languages && race.languages.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Languages
            </h4>
            <div className="flex flex-wrap gap-1">
              {race.languages.map((lang) => (
                <PropertyBadge key={lang} variant="info" size="sm">
                  {lang}
                </PropertyBadge>
              ))}
            </div>
          </div>
        )}

        {/* Proficiencies */}
        {race.proficiencies && race.proficiencies.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Proficiencies</h4>
            <div className="flex flex-wrap gap-1">
              {race.proficiencies.map((prof) => (
                <PropertyBadge key={prof} variant="success" size="sm">
                  {prof}
                </PropertyBadge>
              ))}
            </div>
          </div>
        )}

        {/* Traits */}
        {race.traits && race.traits.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Racial Traits</h4>
            <ul className="space-y-1">
              {race.traits.map((trait, idx) => (
                <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{trait}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Description */}
        {race.description && (
          <div className="pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground leading-relaxed">{race.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RaceCompact({ race, className, onClick }: { race: SRDRace; className?: string; onClick?: () => void }) {
  return (
    <Card
      variant="fantasy"
      className={`p-4 hover:border-primary/50 transition-colors cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{race.name}</h3>
          <div className="text-xs text-muted-foreground">
            {race.size && <span>{race.size}</span>}
            {race.speed && <span className="ml-2">Speed: {race.speed} ft.</span>}
          </div>
        </div>
      </div>
      {race.abilityScoreBonuses && Object.keys(race.abilityScoreBonuses).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {Object.entries(race.abilityScoreBonuses).slice(0, 3).map(([ability, bonus]) => (
            <PropertyBadge key={ability} variant="primary" size="sm">
              {ability.slice(0, 3).toUpperCase()} +{bonus}
            </PropertyBadge>
          ))}
        </div>
      )}
    </Card>
  )
}

function RacePreview({ race, className, onClick }: { race: SRDRace; className?: string; onClick?: () => void }) {
  return (
    <Card
      variant="fantasy"
      className={`p-4 hover:border-primary/50 transition-all cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <Users className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-foreground truncate">{race.name}</h3>
      </div>
      <div className="text-xs text-muted-foreground mb-2">
        {race.size && <span>{race.size}</span>}
        {race.speed && <span className="ml-2">{race.speed} ft.</span>}
      </div>
      {race.abilityScoreBonuses && Object.keys(race.abilityScoreBonuses).length > 0 && (
        <div className="flex flex-wrap gap-1">
          {Object.entries(race.abilityScoreBonuses).map(([ability, bonus]) => (
            <PropertyBadge key={ability} variant="primary" size="sm">
              {ability.slice(0, 3).toUpperCase()} +{bonus}
            </PropertyBadge>
          ))}
        </div>
      )}
    </Card>
  )
}
