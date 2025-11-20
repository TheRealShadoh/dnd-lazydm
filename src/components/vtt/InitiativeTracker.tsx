'use client'

import { Token } from '@/types/vtt'
import { useState } from 'react'

interface InitiativeTrackerProps {
  tokens: Token[]
  onUpdateToken: (tokenId: string, updates: Partial<Token>) => void
  selectedTokenId: string | null
  onTokenSelect: (tokenId: string | null) => void
  readOnly?: boolean
  userTokenIds?: string[]
}

export function InitiativeTracker({
  tokens,
  onUpdateToken,
  selectedTokenId,
  onTokenSelect,
  readOnly = false,
  userTokenIds,
}: InitiativeTrackerProps) {
  const [currentTurn, setCurrentTurn] = useState(0)
  const [roundNumber, setRoundNumber] = useState(1)

  // Filter tokens with initiative and sort by initiative (highest first)
  const combatants = tokens
    .filter((t) => t.initiative !== undefined && t.initiative !== null)
    .sort((a, b) => (b.initiative || 0) - (a.initiative || 0))

  const handleNextTurn = () => {
    if (combatants.length === 0) return

    if (currentTurn >= combatants.length - 1) {
      setCurrentTurn(0)
      setRoundNumber((prev) => prev + 1)
    } else {
      setCurrentTurn((prev) => prev + 1)
    }

    // Auto-select the next token
    const nextToken = combatants[(currentTurn + 1) % combatants.length]
    if (nextToken) {
      onTokenSelect(nextToken.id)
    }
  }

  const handlePrevTurn = () => {
    if (combatants.length === 0) return

    if (currentTurn <= 0) {
      setCurrentTurn(combatants.length - 1)
      setRoundNumber((prev) => Math.max(1, prev - 1))
    } else {
      setCurrentTurn((prev) => prev - 1)
    }

    // Auto-select the previous token
    const prevToken = combatants[currentTurn - 1 < 0 ? combatants.length - 1 : currentTurn - 1]
    if (prevToken) {
      onTokenSelect(prevToken.id)
    }
  }

  const handleReset = () => {
    setCurrentTurn(0)
    setRoundNumber(1)
  }

  if (combatants.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <h3 className="text-xl font-bold text-purple-400 mb-2">Initiative Tracker</h3>
        <p className="text-sm text-gray-400">
          No combatants with initiative. Add initiative to tokens to track combat.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-purple-400">Initiative Tracker</h3>
        <div className="text-sm text-gray-400">Round {roundNumber}</div>
      </div>

      {/* Combat Controls - Hidden in read-only mode */}
      {!readOnly && (
        <div className="flex gap-2">
          <button
            onClick={handlePrevTurn}
            className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-semibold transition"
          >
            ← Previous
          </button>
          <button
            onClick={handleNextTurn}
            className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-semibold transition"
          >
            Next Turn →
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-red-700 hover:bg-red-600 text-white rounded text-sm font-semibold transition"
            title="Reset to round 1"
          >
            Reset
          </button>
        </div>
      )}

      {/* Combatant List */}
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {combatants.map((token, index) => {
          const isCurrentTurn = index === currentTurn
          const isSelected = token.id === selectedTokenId
          const hpPercent =
            token.currentHp !== undefined && token.maxHp !== undefined && token.maxHp > 0
              ? (token.currentHp / token.maxHp) * 100
              : null

          return (
            <div
              key={token.id}
              onClick={() => onTokenSelect(token.id)}
              className={`p-2 rounded cursor-pointer transition ${
                isCurrentTurn
                  ? 'bg-purple-700 border border-purple-400'
                  : isSelected
                    ? 'bg-gray-700 border border-gray-500'
                    : 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {isCurrentTurn && <span className="text-purple-300 text-lg">▶</span>}
                  <span className="font-semibold text-white text-sm">
                    {token.name || token.label || `Token ${token.number || ''}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {token.ac !== undefined && (
                    <span className="px-2 py-0.5 bg-blue-900 text-blue-200 rounded text-xs font-semibold">
                      AC {token.ac}
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-purple-900 text-purple-200 rounded text-xs font-semibold">
                    Init {token.initiative}
                  </span>
                </div>
              </div>

              {/* HP Bar */}
              {hpPercent !== null && token.maxHp && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        hpPercent > 50
                          ? 'bg-green-500'
                          : hpPercent > 25
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.max(0, Math.min(100, hpPercent))}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-300 w-16 text-right">
                    {token.currentHp}/{token.maxHp}
                  </span>
                </div>
              )}

              {/* Conditions */}
              {token.conditions && token.conditions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {token.conditions.map((condition) => (
                    <span
                      key={condition}
                      className="px-1.5 py-0.5 bg-red-900 text-red-200 rounded text-xs"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Info */}
      <div className="pt-2 border-t border-gray-700 text-xs text-gray-500">
        💡 Click a combatant to select. Use Next/Previous to advance turns.
      </div>
    </div>
  )
}
