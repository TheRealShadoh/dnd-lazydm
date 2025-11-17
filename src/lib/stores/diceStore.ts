import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { DiceRoll } from '../utils/rollDice'

const STORE_VERSION = 2 // Increment this to reset favorites

interface DiceState {
  version: number
  history: DiceRoll[]
  favorites: string[]
  soundEnabled: boolean
  showWidget: boolean

  addRoll: (roll: DiceRoll) => void
  clearHistory: () => void
  toggleFavorite: (formula: string) => void
  toggleSound: () => void
  toggleWidget: () => void
}

const defaultFavorites = ['1d4', '1d6', '1d8', '1d10', '1d20']

export const useDiceStore = create<DiceState>()(
  persist(
    (set, get) => ({
      version: STORE_VERSION,
      history: [],
      favorites: defaultFavorites,
      soundEnabled: true,
      showWidget: true,

      addRoll: (roll) =>
        set((state) => ({
          history: [roll, ...state.history].slice(0, 50), // Keep last 50 rolls
        })),

      clearHistory: () => set({ history: [] }),

      toggleFavorite: (formula) =>
        set((state) => {
          const exists = state.favorites.includes(formula)
          return {
            favorites: exists
              ? state.favorites.filter((f) => f !== formula)
              : [...state.favorites, formula],
          }
        }),

      toggleSound: () =>
        set((state) => ({
          soundEnabled: !state.soundEnabled,
        })),

      toggleWidget: () =>
        set((state) => ({
          showWidget: !state.showWidget,
        })),
    }),
    {
      name: 'dnd-dice-storage',
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: any, version: number) => {
        // If version is old, reset favorites to defaults
        if (version < STORE_VERSION) {
          return {
            ...persistedState,
            version: STORE_VERSION,
            favorites: defaultFavorites,
          }
        }
        return persistedState
      },
      partialize: (state) => ({
        version: state.version,
        history: state.history,
        favorites: state.favorites,
        soundEnabled: state.soundEnabled,
        showWidget: state.showWidget,
      }),
    }
  )
)
