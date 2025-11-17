'use client'

import { useState } from 'react'
import { useDiceStore } from '@/lib/stores/diceStore'
import { rollDice } from '@/lib/utils/rollDice'
import { motion, AnimatePresence } from 'framer-motion'

export function DiceWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [customFormula, setCustomFormula] = useState('')
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 })
  const [contextMenuFormula, setContextMenuFormula] = useState('')
  const { history, favorites, addRoll, clearHistory, toggleFavorite, showWidget } = useDiceStore()

  if (!showWidget) return null

  const handleRoll = (formula: string, options?: { advantage?: boolean; disadvantage?: boolean }) => {
    try {
      const result = rollDice(formula, options)
      addRoll(result)
      setCustomFormula('')
      setShowContextMenu(false)
    } catch (error) {
      console.error('Failed to roll dice:', error)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, formula: string) => {
    e.preventDefault()
    // Only show context menu for d20 rolls
    if (formula.includes('d20') || formula === '1d20') {
      setContextMenuFormula(formula)
      setContextMenuPos({ x: e.clientX, y: e.clientY })
      setShowContextMenu(true)
    }
  }

  const handleCustomRoll = () => {
    if (customFormula.trim()) {
      handleRoll(customFormula.trim())
    }
  }

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-purple-gradient shadow-lg
                   flex items-center justify-center text-2xl hover:shadow-xl hover:shadow-purple-500/50
                   transition-shadow duration-200"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Dice Roller"
      >
        🎲
      </motion.button>

      {/* Widget Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 z-50 w-80 max-h-[600px] overflow-hidden
                       bg-gray-900 border-2 border-purple-500 rounded-xl shadow-2xl shadow-purple-500/50"
          >
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-bold text-purple-400">Dice Roller</h3>
              <p className="text-xs text-gray-400 mt-1">
                Click any dice notation on the page to roll!
              </p>
            </div>

            {/* Quick Roll Buttons */}
            <div className="p-4 border-b border-gray-800">
              <p className="text-xs text-gray-500 mb-2">Right-click d20 for adv/dis</p>
              <div className="grid grid-cols-5 gap-2">
                {favorites.map((formula) => (
                  <button
                    key={formula}
                    onClick={() => handleRoll(formula)}
                    onContextMenu={(e) => handleContextMenu(e, formula)}
                    className="px-3 py-2 rounded bg-purple-500/20 hover:bg-purple-500/40
                             text-sm font-mono transition-colors duration-200"
                  >
                    {formula}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Roll Input */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customFormula}
                  onChange={(e) => setCustomFormula(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomRoll()}
                  placeholder="e.g., 2d6+3"
                  className="flex-1 px-3 py-2 rounded bg-gray-800 border border-gray-700
                           focus:border-purple-500 focus:outline-none text-sm font-mono"
                />
                <button
                  onClick={handleCustomRoll}
                  className="px-4 py-2 rounded bg-purple-500 hover:bg-purple-600
                           transition-colors duration-200 font-semibold text-sm"
                >
                  Roll
                </button>
              </div>
            </div>

            {/* Roll History */}
            <div className="p-4 max-h-60 overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold text-gray-400">History</h4>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No rolls yet!</p>
              ) : (
                <div className="space-y-2">
                  {history.slice(0, 10).map((roll) => (
                    <div
                      key={roll.id}
                      className={`p-2 rounded bg-gray-800 ${
                        roll.isCritical ? 'ring-2 ring-yellow-500' : ''
                      } ${roll.isMaxDamage ? 'ring-2 ring-green-500' : ''}`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-sm text-purple-400">{roll.formula}</span>
                          {roll.advantage && (
                            <span className="text-green-400 text-xs px-1 bg-green-500/20 rounded">ADV</span>
                          )}
                          {roll.disadvantage && (
                            <span className="text-red-400 text-xs px-1 bg-red-500/20 rounded">DIS</span>
                          )}
                        </div>
                        <span className="font-bold text-lg">{roll.result}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Rolls: {roll.rolls.join(', ')}
                        {roll.droppedRoll !== undefined && (
                          <span className="text-gray-600 italic ml-1">{roll.droppedRoll}</span>
                        )}
                        {roll.modifier !== 0 && ` (${roll.modifier >= 0 ? '+' : ''}${roll.modifier})`}
                      </div>
                      {roll.isCritical && (
                        <div className="text-xs text-yellow-500 mt-1">⭐ CRITICAL!</div>
                      )}
                      {roll.isMaxDamage && !roll.isCritical && (
                        <div className="text-xs text-green-500 mt-1">💯 MAX DAMAGE!</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {showContextMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[10000]"
              onClick={() => setShowContextMenu(false)}
              onContextMenu={(e) => e.preventDefault()}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: 'fixed',
                left: contextMenuPos.x,
                top: contextMenuPos.y,
                zIndex: 10001,
              }}
              className="bg-gray-900 border-2 border-purple-500 rounded-lg shadow-2xl shadow-purple-500/50
                         py-1 min-w-[160px] overflow-hidden"
            >
              <button
                onClick={() => handleRoll(contextMenuFormula)}
                className="w-full px-4 py-2 text-left text-white hover:bg-purple-500/20
                           transition-colors duration-150 flex items-center gap-2"
              >
                <span className="text-gray-400">🎲</span>
                Normal Roll
              </button>

              <button
                onClick={() => handleRoll(contextMenuFormula, { advantage: true })}
                className="w-full px-4 py-2 text-left text-green-400 hover:bg-green-500/20
                           transition-colors duration-150 flex items-center gap-2"
              >
                <span className="text-green-400">⬆</span>
                Advantage
              </button>

              <button
                onClick={() => handleRoll(contextMenuFormula, { disadvantage: true })}
                className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/20
                           transition-colors duration-150 flex items-center gap-2"
              >
                <span className="text-red-400">⬇</span>
                Disadvantage
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
