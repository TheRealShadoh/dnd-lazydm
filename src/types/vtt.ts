export type TokenType = 'player' | 'monster' | 'custom'

export type CreatureSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan'

export interface Token {
  id: string
  x: number
  y: number
  size: CreatureSize
  type: TokenType
  color?: string
  number?: number
  imageUrl?: string
  label?: string
  playerId?: string // For future player import feature
}

export interface GridSettings {
  enabled: boolean
  size: number // Size in pixels
  snapToGrid: boolean
}

export interface VTTState {
  mapImageUrl: string
  tokens: Token[]
  gridSettings: GridSettings
  canvasWidth: number
  canvasHeight: number
}

// Size multipliers for creature sizes (in grid squares)
export const CREATURE_SIZE_MULTIPLIER: Record<CreatureSize, number> = {
  tiny: 0.5,
  small: 1,
  medium: 1,
  large: 2,
  huge: 3,
  gargantuan: 4,
}

// Default colors for tokens
export const TOKEN_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Orange
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky Blue
  '#F8B739', // Gold
  '#52B788', // Green
]
