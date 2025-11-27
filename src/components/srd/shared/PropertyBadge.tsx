'use client'

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'school'
  | 'type'
  | 'size'
  | 'rarity'

interface PropertyBadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
  size?: 'sm' | 'md'
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-muted text-muted-foreground border-border',
  primary: 'bg-primary/20 text-primary border-primary/30',
  secondary: 'bg-secondary/20 text-secondary-foreground border-secondary/30',
  success: 'bg-success/20 text-success border-success/30',
  warning: 'bg-warning/20 text-warning border-warning/30',
  danger: 'bg-destructive/20 text-destructive border-destructive/30',
  info: 'bg-info/20 text-info border-info/30',
  school: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  type: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  size: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  rarity: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

// Map spell schools to colors
const SCHOOL_COLORS: Record<string, string> = {
  abjuration: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  conjuration: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  divination: 'bg-slate-400/20 text-slate-300 border-slate-400/30',
  enchantment: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  evocation: 'bg-red-500/20 text-red-400 border-red-500/30',
  illusion: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  necromancy: 'bg-green-900/30 text-green-400 border-green-700/30',
  transmutation: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

// Map item rarities to colors
const RARITY_COLORS: Record<string, string> = {
  common: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  uncommon: 'bg-green-500/20 text-green-400 border-green-500/30',
  rare: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'very rare': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  legendary: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  artifact: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export function PropertyBadge({
  children,
  variant = 'default',
  className = '',
  size = 'sm',
}: PropertyBadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span
      className={`inline-flex items-center rounded border font-medium ${VARIANT_CLASSES[variant]} ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  )
}

// Specialized badge for spell schools
export function SpellSchoolBadge({
  school,
  className = '',
  size = 'sm',
}: {
  school: string
  className?: string
  size?: 'sm' | 'md'
}) {
  const normalizedSchool = school.toLowerCase()
  const colorClasses = SCHOOL_COLORS[normalizedSchool] || VARIANT_CLASSES.school
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span
      className={`inline-flex items-center rounded border font-medium capitalize ${colorClasses} ${sizeClasses} ${className}`}
    >
      {school}
    </span>
  )
}

// Specialized badge for spell levels
export function SpellLevelBadge({
  level,
  className = '',
  size = 'sm',
}: {
  level: number
  className?: string
  size?: 'sm' | 'md'
}) {
  const label = level === 0 ? 'Cantrip' : `${level}${getOrdinalSuffix(level)} Level`
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span
      className={`inline-flex items-center rounded border font-medium bg-primary/20 text-primary border-primary/30 ${sizeClasses} ${className}`}
    >
      {label}
    </span>
  )
}

// Specialized badge for item rarity
export function RarityBadge({
  rarity,
  className = '',
  size = 'sm',
}: {
  rarity: string
  className?: string
  size?: 'sm' | 'md'
}) {
  const normalizedRarity = rarity.toLowerCase()
  const colorClasses = RARITY_COLORS[normalizedRarity] || VARIANT_CLASSES.rarity
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span
      className={`inline-flex items-center rounded border font-medium capitalize ${colorClasses} ${sizeClasses} ${className}`}
    >
      {rarity}
    </span>
  )
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}
