'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDiceStore } from '@/lib/stores/diceStore'
import type { DiceRoll } from '@/lib/utils/rollDice'

export function RollToast() {
  const { history } = useDiceStore()
  const [displayedRoll, setDisplayedRoll] = useState<DiceRoll | null>(null)
  const previousHistoryLength = useRef(0)
  const isInitialized = useRef(false)

  useEffect(() => {
    // On first mount, just initialize the ref without showing a toast
    if (!isInitialized.current) {
      previousHistoryLength.current = history.length
      isInitialized.current = true
      return
    }

    // Check if a new roll was added (only after initialization)
    if (history.length > previousHistoryLength.current && history.length > 0) {
      const latestRoll = history[0]

      // Only show toast if the roll was created within the last 2 seconds
      // This prevents showing old rolls from localStorage on page load
      const rollAge = Date.now() - latestRoll.timestamp
      if (rollAge < 2000) {
        setDisplayedRoll(latestRoll)

        // Auto-hide after 3 seconds
        const timer = setTimeout(() => {
          setDisplayedRoll(null)
        }, 3000)

        previousHistoryLength.current = history.length
        return () => clearTimeout(timer)
      }

      previousHistoryLength.current = history.length
    }

    // Update the ref if history shrinks (cleared)
    if (history.length < previousHistoryLength.current) {
      previousHistoryLength.current = history.length
    }
  }, [history])

  return (
    <AnimatePresence>
      {displayedRoll && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
          }}
          className="bg-gray-900/95 backdrop-blur-sm border-2 border-purple-500 rounded-2xl
                     shadow-2xl shadow-purple-500/50 p-8 min-w-[300px]"
        >
          {/* Close Button */}
          <button
            onClick={() => setDisplayedRoll(null)}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gray-800/50
                       hover:bg-gray-700 border border-purple-500/30 hover:border-purple-500
                       flex items-center justify-center transition-colors duration-200
                       text-gray-400 hover:text-white"
            title="Close (or wait 3s)"
          >
            ✕
          </button>

          <div className="text-center">
            {/* Formula with Advantage/Disadvantage tag */}
            <div className="text-purple-400 font-mono text-sm mb-2 flex items-center justify-center gap-2">
              <span>{displayedRoll.formula}</span>
              {displayedRoll.advantage && (
                <span className="text-green-400 text-xs px-2 py-0.5 bg-green-500/20 rounded border border-green-500/30">
                  ADV
                </span>
              )}
              {displayedRoll.disadvantage && (
                <span className="text-red-400 text-xs px-2 py-0.5 bg-red-500/20 rounded border border-red-500/30">
                  DIS
                </span>
              )}
            </div>

            {/* Result */}
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`text-6xl font-bold mb-2 ${
                displayedRoll.isCritical
                  ? 'text-yellow-400'
                  : displayedRoll.isMaxDamage
                  ? 'text-orange-400'
                  : 'text-white'
              }`}
            >
              {displayedRoll.result}
            </motion.div>

            {/* Individual rolls */}
            {displayedRoll.rolls.length > 0 && (
              <div className="text-gray-400 text-sm font-mono">
                [{displayedRoll.rolls.join(', ')}]
                {displayedRoll.droppedRoll !== undefined && (
                  <span className="text-gray-500 italic ml-1">
                    {displayedRoll.droppedRoll}
                  </span>
                )}
                {displayedRoll.modifier !== 0 && (
                  <span className="text-purple-400">
                    {' '}
                    {displayedRoll.modifier > 0 ? '+' : ''}
                    {displayedRoll.modifier}
                  </span>
                )}
              </div>
            )}

            {/* Special tags */}
            {displayedRoll.isCritical && (
              <div className="mt-2 text-yellow-400 font-bold text-sm">
                ⭐ CRITICAL!
              </div>
            )}
            {displayedRoll.isMaxDamage && !displayedRoll.isCritical && (
              <div className="mt-2 text-orange-400 font-bold text-sm">
                🔥 MAX DAMAGE!
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
