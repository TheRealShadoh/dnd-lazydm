'use client'

import { useState } from 'react'
import { useDiceStore } from '@/lib/stores/diceStore'
import { rollDice, parseDiceFormula } from '@/lib/utils/rollDice'
import { motion, AnimatePresence } from 'framer-motion'

interface DiceNotationProps {
  value: string
  className?: string
}

export function DiceNotation({ value, className = '' }: DiceNotationProps) {
  const { addRoll, soundEnabled } = useDiceStore()
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 })

  // Check if this is a DC value - if so, we'll roll a d20 when clicked
  const isDC = value.trim().toUpperCase().startsWith('DC')
  // Check if this is an attack bonus (like "+3" or "-2")
  const isAttackBonus = /^[+\-]\d+$/.test(value.trim())

  const handleClick = (options?: { advantage?: boolean; disadvantage?: boolean }) => {
    console.log('DiceNotation clicked! Value:', value, 'Options:', options)
    setShowContextMenu(false)

    try {
      let formulaToRoll = value

      // If it's a DC value, roll a d20 instead
      if (isDC) {
        formulaToRoll = '1d20'
        console.log('DC value detected, rolling d20')
      }
      // If it's an attack bonus like "+3", treat it as an attack roll (1d20+modifier)
      else if (isAttackBonus) {
        formulaToRoll = `1d20${value}`
        console.log('Attack bonus detected, rolling', formulaToRoll)
      }

      // Check if the formula is valid
      const parsed = parseDiceFormula(formulaToRoll)
      console.log('Parsed formula:', parsed)

      if (parsed === null) {
        console.warn('Invalid dice formula:', value)
        return
      }

      const result = rollDice(formulaToRoll, options)
      console.log('Roll result:', result)
      addRoll(result)

      if (soundEnabled) {
        // Play dice sound (you can add an audio file later)
        // new Audio('/sounds/dice-roll.mp3').play()
      }
    } catch (error) {
      console.error('Failed to roll dice:', error)
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenuPos({ x: e.clientX, y: e.clientY })
    setShowContextMenu(true)
  }

  // Close context menu when clicking elsewhere
  const handleClickOutside = () => {
    setShowContextMenu(false)
  }

  // Determine tooltip text
  let tooltipText = `Click to roll ${value}`
  if (isDC) {
    tooltipText = `Click to roll d20 vs ${value}`
  } else if (isAttackBonus) {
    tooltipText = `Click to roll 1d20${value} (attack roll)`
  }

  return (
    <>
      <motion.span
        className={`dice-notation ${className}`}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleClick()}
        onContextMenu={handleContextMenu}
        title={tooltipText}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
      >
        {value}
      </motion.span>

      {/* Context Menu */}
      <AnimatePresence>
        {showContextMenu && (
          <>
            {/* Backdrop to catch clicks */}
            <div
              className="fixed inset-0 z-[10000]"
              onClick={handleClickOutside}
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
                onClick={() => handleClick()}
                className="w-full px-4 py-2 text-left text-white hover:bg-purple-500/20
                           transition-colors duration-150 flex items-center gap-2"
              >
                <span className="text-gray-400">🎲</span>
                Normal Roll
              </button>

              <button
                onClick={() => handleClick({ advantage: true })}
                className="w-full px-4 py-2 text-left text-green-400 hover:bg-green-500/20
                           transition-colors duration-150 flex items-center gap-2"
              >
                <span className="text-green-400">⬆</span>
                Advantage
              </button>

              <button
                onClick={() => handleClick({ disadvantage: true })}
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
