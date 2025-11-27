'use client'

interface AbilityScores {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

interface AbilityScoreGridProps {
  abilities: AbilityScores
  savingThrows?: Record<string, number>
  className?: string
  compact?: boolean
}

const ABILITY_LABELS = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
} as const

function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

export function AbilityScoreGrid({
  abilities,
  savingThrows,
  className = '',
  compact = false,
}: AbilityScoreGridProps) {
  const abilityEntries = Object.entries(abilities) as [keyof AbilityScores, number][]

  if (compact) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {abilityEntries.map(([ability, score]) => {
          const modifier = calculateModifier(score)
          return (
            <div
              key={ability}
              className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded text-sm"
            >
              <span className="font-semibold text-muted-foreground">
                {ABILITY_LABELS[ability]}
              </span>
              <span className="text-foreground">{score}</span>
              <span className="text-primary font-mono text-xs">
                ({formatModifier(modifier)})
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-6 gap-2 ${className}`}>
      {abilityEntries.map(([ability, score]) => {
        const modifier = calculateModifier(score)
        const saveBonus = savingThrows?.[ability]
        const shortName = ABILITY_LABELS[ability]

        return (
          <div
            key={ability}
            className="flex flex-col items-center p-2 bg-muted/50 rounded-lg border border-border"
          >
            <span className="text-xs text-muted-foreground font-semibold mb-1">
              {shortName}
            </span>
            <span className="text-lg font-bold text-foreground">{score}</span>
            <span className="text-sm text-primary font-mono">
              {formatModifier(modifier)}
            </span>
            {saveBonus !== undefined && (
              <span className="text-xs text-success mt-1" title={`${shortName} Save`}>
                Save {formatModifier(saveBonus)}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
