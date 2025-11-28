'use client'

import { useState } from 'react'
import { useDiceStore } from '@/lib/stores/diceStore'
import { rollDice } from '@/lib/utils/rollDice'
import { motion, AnimatePresence } from 'framer-motion'
import { Dice6, ChevronUp, ChevronDown, Trash2, Star, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

export function DiceWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [customFormula, setCustomFormula] = useState('')
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 })
  const [contextMenuFormula, setContextMenuFormula] = useState('')
  const { history, favorites, addRoll, clearHistory, showWidget } = useDiceStore()

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
        className={cn(
          'fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full',
          'bg-gradient-to-br from-primary to-primary/80 shadow-lg',
          'flex items-center justify-center',
          'hover:shadow-xl hover:shadow-primary/30',
          'transition-shadow duration-200 border-2 border-primary/50'
        )}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Dice Roller"
      >
        <Dice6 className="w-7 h-7 text-primary-foreground" />
      </motion.button>

      {/* Widget Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              'fixed bottom-20 right-4 z-50 w-80 max-h-[600px] overflow-hidden',
              'bg-card border-2 border-primary/50 rounded-xl',
              'shadow-2xl shadow-primary/20'
            )}
          >
            {/* Header */}
            <div className="p-4 border-b border-border bg-card/95">
              <div className="flex items-center gap-2">
                <Dice6 className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold font-display text-primary">Dice Roller</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Click any dice notation on the page to roll!
              </p>
            </div>

            {/* Quick Roll Buttons */}
            <div className="p-4 border-b border-border">
              <p className="text-xs text-muted-foreground mb-2">Right-click d20 for adv/dis</p>
              <div className="grid grid-cols-5 gap-2">
                {favorites.map((formula) => (
                  <button
                    key={formula}
                    onClick={() => handleRoll(formula)}
                    onContextMenu={(e) => handleContextMenu(e, formula)}
                    className={cn(
                      'px-3 py-2 rounded-lg',
                      'bg-primary/10 hover:bg-primary/20',
                      'text-sm font-mono text-foreground',
                      'transition-colors duration-200',
                      'border border-primary/20 hover:border-primary/40'
                    )}
                  >
                    {formula}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Roll Input */}
            <div className="p-4 border-b border-border">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={customFormula}
                  onChange={(e) => setCustomFormula(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomRoll()}
                  placeholder="e.g., 2d6+3"
                  className="flex-1 font-mono"
                />
                <Button onClick={handleCustomRoll} variant="primary" size="sm">
                  Roll
                </Button>
              </div>
            </div>

            {/* Roll History */}
            <div className="p-4 max-h-60 overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold text-muted-foreground">History</h4>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No rolls yet!</p>
              ) : (
                <div className="space-y-2">
                  {history.slice(0, 10).map((roll) => (
                    <div
                      key={roll.id}
                      className={cn(
                        'p-3 rounded-lg bg-muted/50 border border-border',
                        roll.isCritical && 'ring-2 ring-warning bg-warning/5',
                        roll.isMaxDamage && !roll.isCritical && 'ring-2 ring-success bg-success/5'
                      )}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-primary">{roll.formula}</span>
                          {roll.advantage && (
                            <span className="text-success text-xs px-1.5 py-0.5 bg-success/20 rounded flex items-center gap-0.5">
                              <ChevronUp className="w-3 h-3" />
                              ADV
                            </span>
                          )}
                          {roll.disadvantage && (
                            <span className="text-destructive text-xs px-1.5 py-0.5 bg-destructive/20 rounded flex items-center gap-0.5">
                              <ChevronDown className="w-3 h-3" />
                              DIS
                            </span>
                          )}
                        </div>
                        <span className="font-bold font-display text-xl text-foreground">{roll.result}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Rolls: {roll.rolls.join(', ')}
                        {roll.droppedRoll !== undefined && (
                          <span className="line-through opacity-50 ml-1">{roll.droppedRoll}</span>
                        )}
                        {roll.modifier !== 0 && ` (${roll.modifier >= 0 ? '+' : ''}${roll.modifier})`}
                      </div>
                      {roll.isCritical && (
                        <div className="text-xs text-warning mt-1 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-warning" />
                          CRITICAL!
                        </div>
                      )}
                      {roll.isMaxDamage && !roll.isCritical && (
                        <div className="text-xs text-success mt-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          MAX DAMAGE!
                        </div>
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
              className={cn(
                'bg-card border-2 border-primary/50 rounded-lg',
                'shadow-2xl shadow-primary/20',
                'py-1 min-w-[160px] overflow-hidden'
              )}
            >
              <button
                onClick={() => handleRoll(contextMenuFormula)}
                className="w-full px-4 py-2 text-left text-foreground hover:bg-muted
                           transition-colors duration-150 flex items-center gap-2"
              >
                <Dice6 className="w-4 h-4 text-muted-foreground" />
                Normal Roll
              </button>

              <button
                onClick={() => handleRoll(contextMenuFormula, { advantage: true })}
                className="w-full px-4 py-2 text-left text-success hover:bg-success/10
                           transition-colors duration-150 flex items-center gap-2"
              >
                <ChevronUp className="w-4 h-4" />
                Advantage
              </button>

              <button
                onClick={() => handleRoll(contextMenuFormula, { disadvantage: true })}
                className="w-full px-4 py-2 text-left text-destructive hover:bg-destructive/10
                           transition-colors duration-150 flex items-center gap-2"
              >
                <ChevronDown className="w-4 h-4" />
                Disadvantage
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
