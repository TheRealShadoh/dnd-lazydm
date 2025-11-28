'use client'

interface ChallengeRatingBadgeProps {
  cr: number
  showXP?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

// CR to XP mapping from D&D 5e rules
const CR_TO_XP: Record<number, number> = {
  0: 10,
  0.125: 25,
  0.25: 50,
  0.5: 100,
  1: 200,
  2: 450,
  3: 700,
  4: 1100,
  5: 1800,
  6: 2300,
  7: 2900,
  8: 3900,
  9: 5000,
  10: 5900,
  11: 7200,
  12: 8400,
  13: 10000,
  14: 11500,
  15: 13000,
  16: 15000,
  17: 18000,
  18: 20000,
  19: 22000,
  20: 25000,
  21: 33000,
  22: 41000,
  23: 50000,
  24: 62000,
  25: 75000,
  26: 90000,
  27: 105000,
  28: 120000,
  29: 135000,
  30: 155000,
}

function formatCR(cr: number): string {
  if (cr === 0.125) return '1/8'
  if (cr === 0.25) return '1/4'
  if (cr === 0.5) return '1/2'
  return cr.toString()
}

function formatXP(xp: number): string {
  return xp.toLocaleString()
}

function getCRColor(cr: number): string {
  if (cr <= 1) return 'bg-success/20 text-success border-success/30'
  if (cr <= 4) return 'bg-info/20 text-info border-info/30'
  if (cr <= 10) return 'bg-warning/20 text-warning border-warning/30'
  if (cr <= 17) return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  return 'bg-destructive/20 text-destructive border-destructive/30'
}

export function ChallengeRatingBadge({
  cr,
  showXP = true,
  className = '',
  size = 'md',
}: ChallengeRatingBadgeProps) {
  const xp = CR_TO_XP[cr] ?? 0
  const colorClasses = getCRColor(cr)

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg border font-semibold ${colorClasses} ${sizeClasses[size]} ${className}`}
    >
      <span>CR {formatCR(cr)}</span>
      {showXP && xp > 0 && (
        <span className="opacity-75 font-normal">({formatXP(xp)} XP)</span>
      )}
    </div>
  )
}
