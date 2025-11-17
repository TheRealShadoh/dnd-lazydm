import { VTTState } from '@/types/vtt'

const VTT_STORAGE_PREFIX = 'vtt_state_'

export function getVTTStorageKey(mapImageUrl: string): string {
  // Create a unique key based on the map image URL
  return `${VTT_STORAGE_PREFIX}${encodeURIComponent(mapImageUrl)}`
}

export function saveVTTState(state: VTTState): void {
  try {
    const key = getVTTStorageKey(state.mapImageUrl)
    localStorage.setItem(key, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save VTT state:', error)
  }
}

export function loadVTTState(mapImageUrl: string): VTTState | null {
  try {
    const key = getVTTStorageKey(mapImageUrl)
    const stored = localStorage.getItem(key)
    if (stored) {
      return JSON.parse(stored) as VTTState
    }
  } catch (error) {
    console.error('Failed to load VTT state:', error)
  }
  return null
}

export function clearVTTState(mapImageUrl: string): void {
  try {
    const key = getVTTStorageKey(mapImageUrl)
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Failed to clear VTT state:', error)
  }
}

export function getAllVTTStates(): string[] {
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(VTT_STORAGE_PREFIX)) {
        keys.push(key)
      }
    }
    return keys
  } catch (error) {
    console.error('Failed to get VTT states:', error)
    return []
  }
}
