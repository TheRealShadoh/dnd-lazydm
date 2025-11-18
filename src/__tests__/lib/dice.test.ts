/**
 * Tests for dice rolling logic
 */

import { rollDice } from '@/lib/utils/rollDice'

describe('Dice Rolling', () => {
  describe('rollDice', () => {
    it('should roll a simple d20', () => {
      const result = rollDice('1d20')

      expect(result.result).toBeGreaterThanOrEqual(1)
      expect(result.result).toBeLessThanOrEqual(20)
      expect(result.rolls).toHaveLength(1)
      expect(result.formula).toBe('1d20')
    })

    it('should roll multiple dice', () => {
      const result = rollDice('3d6')

      expect(result.result).toBeGreaterThanOrEqual(3)
      expect(result.result).toBeLessThanOrEqual(18)
      expect(result.rolls).toHaveLength(3)
      result.rolls.forEach(roll => {
        expect(roll).toBeGreaterThanOrEqual(1)
        expect(roll).toBeLessThanOrEqual(6)
      })
    })

    it('should handle modifiers', () => {
      const result = rollDice('1d20+5')

      expect(result.result).toBeGreaterThanOrEqual(6)
      expect(result.result).toBeLessThanOrEqual(25)
      expect(result.modifier).toBe(5)
    })

    it('should handle negative modifiers', () => {
      const result = rollDice('1d20-2')

      expect(result.result).toBeGreaterThanOrEqual(-1)
      expect(result.result).toBeLessThanOrEqual(18)
      expect(result.modifier).toBe(-2)
    })

    it('should handle complex formulas', () => {
      const result = rollDice('2d6+3')

      expect(result.result).toBeGreaterThanOrEqual(5)
      expect(result.result).toBeLessThanOrEqual(15)
      expect(result.rolls).toHaveLength(2)
      expect(result.modifier).toBe(3)
    })

    it('should detect max damage rolls', () => {
      // Test that isMaxDamage property exists
      const result = rollDice('1d20')
      expect(typeof result.isMaxDamage).toBe('boolean')
    })

    it('should detect critical rolls', () => {
      // Test that isCritical property exists
      const result = rollDice('1d20')
      expect(typeof result.isCritical).toBe('boolean')
    })

    it('should handle advantage rolls', () => {
      const result = rollDice('1d20', { advantage: true })

      expect(result.advantage).toBe(true)
      expect(result.result).toBeGreaterThanOrEqual(1)
      expect(result.result).toBeLessThanOrEqual(20)
      expect(result.droppedRoll).toBeDefined()
    })

    it('should handle disadvantage rolls', () => {
      const result = rollDice('1d20', { disadvantage: true })

      expect(result.disadvantage).toBe(true)
      expect(result.result).toBeGreaterThanOrEqual(1)
      expect(result.result).toBeLessThanOrEqual(20)
      expect(result.droppedRoll).toBeDefined()
    })

    it('should handle edge cases', () => {
      // Single die
      const d1 = rollDice('1d1')
      expect(d1.result).toBe(1)

      // Large number of dice
      const manyDice = rollDice('10d6')
      expect(manyDice.rolls).toHaveLength(10)
      expect(manyDice.result).toBeGreaterThanOrEqual(10)
      expect(manyDice.result).toBeLessThanOrEqual(60)
    })

    it('should generate unique IDs and timestamps', () => {
      const result1 = rollDice('1d20')
      const result2 = rollDice('1d20')

      expect(result1.id).toBeTruthy()
      expect(result2.id).toBeTruthy()
      expect(result1.id).not.toBe(result2.id)
      expect(result1.timestamp).toBeLessThanOrEqual(result2.timestamp)
    })
  })
})
