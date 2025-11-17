export interface DiceRoll {
  id: string
  formula: string
  result: number
  rolls: number[]
  modifier: number
  timestamp: number
  isCritical?: boolean
  isMaxDamage?: boolean
  advantage?: boolean
  disadvantage?: boolean
  droppedRoll?: number
}

export function rollDice(formula: string, options?: { advantage?: boolean; disadvantage?: boolean }): DiceRoll {
  // Remove all spaces
  const cleanFormula = formula.replace(/\s+/g, '')

  // Parse dice formula: XdY+Z or XdY-Z or dY+Z or XdY or dY
  const match = cleanFormula.match(/^(\d+)?d(\d+)(([+\-])(\d+))?$/i)

  if (!match) {
    throw new Error(`Invalid dice formula: ${formula}`)
  }

  const count = parseInt(match[1] || '1', 10)
  const sides = parseInt(match[2], 10)
  const modifierSign = match[4] || '+'
  const modifierValue = parseInt(match[5] || '0', 10)
  const modifier = modifierSign === '-' ? -modifierValue : modifierValue

  // Handle advantage/disadvantage for d20 rolls
  const hasAdvantage = options?.advantage && sides === 20 && count === 1
  const hasDisadvantage = options?.disadvantage && sides === 20 && count === 1

  // Roll the dice
  const rolls: number[] = []
  let droppedRoll: number | undefined

  if (hasAdvantage || hasDisadvantage) {
    // Roll 2d20 for advantage/disadvantage
    const roll1 = Math.floor(Math.random() * 20) + 1
    const roll2 = Math.floor(Math.random() * 20) + 1

    if (hasAdvantage) {
      rolls.push(Math.max(roll1, roll2))
      droppedRoll = Math.min(roll1, roll2)
    } else {
      rolls.push(Math.min(roll1, roll2))
      droppedRoll = Math.max(roll1, roll2)
    }
  } else {
    // Normal rolls
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1)
    }
  }

  const rollSum = rolls.reduce((sum, roll) => sum + roll, 0)
  const result = rollSum + modifier

  // Check for critical (all d20s are 20)
  const isCritical = sides === 20 && rolls.every(r => r === 20)

  // Check for max damage (all dice rolled max)
  const isMaxDamage = rolls.every(r => r === sides)

  return {
    id: `${Date.now()}-${Math.random()}`,
    formula: cleanFormula,
    result,
    rolls,
    modifier,
    timestamp: Date.now(),
    isCritical,
    isMaxDamage,
    advantage: hasAdvantage,
    disadvantage: hasDisadvantage,
    droppedRoll
  }
}

export function parseDiceFormula(formula: string): {
  count: number
  sides: number
  modifier: number
} | null {
  const cleanFormula = formula.replace(/\s+/g, '')
  const match = cleanFormula.match(/^(\d+)?d(\d+)(([+\-])(\d+))?$/i)

  if (!match) return null

  const count = parseInt(match[1] || '1', 10)
  const sides = parseInt(match[2], 10)
  const modifierSign = match[4] || '+'
  const modifierValue = parseInt(match[5] || '0', 10)
  const modifier = modifierSign === '-' ? -modifierValue : modifierValue

  return { count, sides, modifier }
}
