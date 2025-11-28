/**
 * DM-to-Player Language-Aware Messaging System Types
 */

// Common D&D languages
export const DND_LANGUAGES = [
  'Common',
  'Dwarvish',
  'Elvish',
  'Giant',
  'Gnomish',
  'Goblin',
  'Halfling',
  'Orc',
  'Abyssal',
  'Celestial',
  'Draconic',
  'Deep Speech',
  'Infernal',
  'Primordial',
  'Sylvan',
  'Undercommon',
  'Thieves\' Cant',
  'Druidic',
] as const

export type DnDLanguage = (typeof DND_LANGUAGES)[number]

// Special language options
export const SPECIAL_LANGUAGES = {
  UNKNOWN: 'Unknown',
  CUSTOM: 'Custom',
} as const

export type LanguageOption = DnDLanguage | typeof SPECIAL_LANGUAGES.UNKNOWN | string

// Message recipient types
export type MessageRecipient =
  | { type: 'all' }
  | { type: 'player'; playerId: string }
  | { type: 'players'; playerIds: string[] }

// Campaign message
export interface CampaignMessage {
  id: string
  campaignId: string
  senderId: string // DM's user ID
  senderName: string
  recipients: MessageRecipient
  language: LanguageOption
  originalText: string
  timestamp: string
  read?: Record<string, boolean> // playerId -> read status
}

// Message as seen by a player (may be masked)
export interface PlayerMessage {
  id: string
  campaignId: string
  senderName: string
  language: LanguageOption
  text: string // Either original or masked
  isMasked: boolean
  timestamp: string
  read: boolean
}

// Player language profile (stored in campaign)
export interface PlayerLanguageProfile {
  playerId: string
  playerName: string
  languages: string[] // Case-insensitive matching
}

// Message composer state
export interface MessageComposerState {
  recipients: string[] // 'all' or player IDs
  language: LanguageOption
  customLanguage?: string
  message: string
}

// Garble characters for masked messages
export const GARBLE_CHARACTERS = [
  '⚚', '◊', '◇', '♦', '♢', '⬡', '⬢', '⎔', '⌘', '☍',
  '⚝', '✧', '✦', '⊛', '⊕', '⊗', '⊙', '⊚', '⋄', '⋆',
  '∿', '≈', '≋', '∽', '∼', '⌬', '⍟', '⎈', '⎊', '⏣',
]

// Utility functions

/**
 * Normalize a language string for case-insensitive comparison
 */
export function normalizeLanguage(language: string): string {
  return language.toLowerCase().trim()
}

/**
 * Check if a player knows a specific language (case-insensitive)
 */
export function playerKnowsLanguage(
  playerLanguages: string[],
  messageLanguage: LanguageOption
): boolean {
  // Unknown language means no one understands it
  if (messageLanguage === SPECIAL_LANGUAGES.UNKNOWN) {
    return false
  }

  const normalizedMessageLang = normalizeLanguage(messageLanguage)
  return playerLanguages.some(
    (lang) => normalizeLanguage(lang) === normalizedMessageLang
  )
}

/**
 * Generate a garbled version of text, preserving word lengths
 */
export function garbleText(text: string): string {
  return text
    .split(' ')
    .map((word) => {
      // Preserve punctuation at the end
      const punctuationMatch = word.match(/[.!?,;:'"]+$/)
      const punctuation = punctuationMatch ? punctuationMatch[0] : ''
      const cleanWord = punctuation ? word.slice(0, -punctuation.length) : word

      // Generate garbled characters matching the word length
      const garbled = Array.from({ length: cleanWord.length }, () => {
        const randomIndex = Math.floor(Math.random() * GARBLE_CHARACTERS.length)
        return GARBLE_CHARACTERS[randomIndex]
      }).join('')

      return garbled + punctuation
    })
    .join(' ')
}

/**
 * Process a message for a specific player based on their known languages
 */
export function processMessageForPlayer(
  message: CampaignMessage,
  playerLanguages: string[]
): PlayerMessage {
  const understands = playerKnowsLanguage(playerLanguages, message.language)

  return {
    id: message.id,
    campaignId: message.campaignId,
    senderName: message.senderName,
    language: message.language,
    text: understands ? message.originalText : garbleText(message.originalText),
    isMasked: !understands,
    timestamp: message.timestamp,
    read: false,
  }
}

/**
 * Generate a preview of how a message will appear to different players
 */
export interface MessagePreview {
  playerId: string
  playerName: string
  text: string
  understands: boolean
}

export function generateMessagePreviews(
  originalText: string,
  language: LanguageOption,
  players: PlayerLanguageProfile[]
): MessagePreview[] {
  return players.map((player) => {
    const understands = playerKnowsLanguage(player.languages, language)
    return {
      playerId: player.playerId,
      playerName: player.playerName,
      text: understands ? originalText : garbleText(originalText),
      understands,
    }
  })
}
