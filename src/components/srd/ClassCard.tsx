'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PropertyBadge } from './shared'
import { Shield, Heart, Swords, Wand2, BookOpen } from 'lucide-react'
import type { SRDClass } from '@/lib/srd/models'

interface ClassCardProps {
  cls: SRDClass
  variant?: 'full' | 'compact' | 'preview'
  className?: string
  onClick?: () => void
}

export function ClassCard({
  cls,
  variant = 'full',
  className = '',
  onClick,
}: ClassCardProps) {
  if (variant === 'preview') {
    return <ClassPreview cls={cls} className={className} onClick={onClick} />
  }

  if (variant === 'compact') {
    return <ClassCompact cls={cls} className={className} onClick={onClick} />
  }

  return (
    <Card variant="fantasy" className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-display text-primary">
              {cls.name}
            </CardTitle>
            <PropertyBadge variant={cls.source === 'official' ? 'default' : 'primary'} size="sm">
              {cls.source === 'official' ? 'Official SRD' : 'Custom'}
            </PropertyBadge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Hit Dice */}
        {cls.hitDice && (
          <div className="flex items-center gap-4 py-3 border-y border-border">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-destructive" />
              <div>
                <div className="text-xs text-muted-foreground">Hit Dice</div>
                <div className="font-bold text-foreground text-lg">{cls.hitDice}</div>
              </div>
            </div>
          </div>
        )}

        {/* Saving Throws */}
        {cls.savingThrowProficiencies && cls.savingThrowProficiencies.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Saving Throw Proficiencies</h4>
            <div className="flex flex-wrap gap-2">
              {cls.savingThrowProficiencies.map((save) => (
                <div
                  key={save}
                  className="px-3 py-2 bg-info/10 rounded-lg border border-info/20 text-center"
                >
                  <div className="text-sm font-semibold text-info">{save}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Armor Proficiencies */}
        {cls.armorProficiencies && cls.armorProficiencies.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Armor Proficiencies
            </h4>
            <div className="flex flex-wrap gap-1">
              {cls.armorProficiencies.map((armor) => (
                <PropertyBadge key={armor} variant="default" size="sm">
                  {armor}
                </PropertyBadge>
              ))}
            </div>
          </div>
        )}

        {/* Weapon Proficiencies */}
        {cls.weaponProficiencies && cls.weaponProficiencies.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <Swords className="h-4 w-4" />
              Weapon Proficiencies
            </h4>
            <div className="flex flex-wrap gap-1">
              {cls.weaponProficiencies.map((weapon) => (
                <PropertyBadge key={weapon} variant="warning" size="sm">
                  {weapon}
                </PropertyBadge>
              ))}
            </div>
          </div>
        )}

        {/* Skill Choices */}
        {cls.skillChoices && cls.skillChoices.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Skill Choices
            </h4>
            <div className="flex flex-wrap gap-1">
              {cls.skillChoices.map((skill) => (
                <PropertyBadge key={skill} variant="success" size="sm">
                  {skill}
                </PropertyBadge>
              ))}
            </div>
          </div>
        )}

        {/* Spellcasting */}
        {cls.spellcastingAbility && (
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="text-sm font-semibold text-primary mb-1 flex items-center gap-1">
              <Wand2 className="h-4 w-4" />
              Spellcasting
            </h4>
            <p className="text-sm text-foreground">
              Spellcasting Ability: <span className="font-semibold">{cls.spellcastingAbility}</span>
            </p>
          </div>
        )}

        {/* Description */}
        {cls.description && (
          <div className="pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground leading-relaxed">{cls.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ClassCompact({ cls, className, onClick }: { cls: SRDClass; className?: string; onClick?: () => void }) {
  return (
    <Card
      variant="fantasy"
      className={`p-4 hover:border-primary/50 transition-colors cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{cls.name}</h3>
          {cls.hitDice && (
            <div className="text-xs text-muted-foreground">Hit Dice: {cls.hitDice}</div>
          )}
        </div>
        {cls.spellcastingAbility && (
          <span title="Spellcaster"><Wand2 className="h-4 w-4 text-primary" /></span>
        )}
      </div>
      {cls.savingThrowProficiencies && cls.savingThrowProficiencies.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {cls.savingThrowProficiencies.map((save) => (
            <PropertyBadge key={save} variant="info" size="sm">
              {save}
            </PropertyBadge>
          ))}
        </div>
      )}
    </Card>
  )
}

function ClassPreview({ cls, className, onClick }: { cls: SRDClass; className?: string; onClick?: () => void }) {
  return (
    <Card
      variant="fantasy"
      className={`p-4 hover:border-primary/50 transition-all cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground truncate">{cls.name}</h3>
        </div>
        {cls.spellcastingAbility && (
          <span title="Spellcaster"><Wand2 className="h-4 w-4 text-primary" /></span>
        )}
      </div>
      {cls.hitDice && (
        <div className="text-xs text-muted-foreground mb-2">
          <Heart className="h-3 w-3 inline mr-1" />
          {cls.hitDice}
        </div>
      )}
      {cls.savingThrowProficiencies && cls.savingThrowProficiencies.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {cls.savingThrowProficiencies.map((save) => (
            <PropertyBadge key={save} variant="info" size="sm">
              {save}
            </PropertyBadge>
          ))}
        </div>
      )}
    </Card>
  )
}
