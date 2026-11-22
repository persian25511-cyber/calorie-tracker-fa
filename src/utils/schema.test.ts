import { describe, expect, it } from 'vitest'
import { appStateSchema, safeParseState } from './schema'
import { initialState } from './storage'

const valid = () => JSON.stringify(initialState())

describe('state schema', () => {
  it('accepts a valid backup', () => {
    expect(appStateSchema.safeParse(initialState()).success).toBe(true)
    expect(safeParseState(valid()).ok).toBe(true)
  })

  it('rejects malformed JSON and oversized backups', () => {
    expect(safeParseState('{').ok).toBe(false)
    expect(safeParseState('x'.repeat(5_000_001)).ok).toBe(false)
  })

  it('rejects NaN, negative values, bad dates and unknown meal types', () => {
    const base = JSON.parse(valid())
    base.goals.kcal = null
    expect(safeParseState(JSON.stringify(base)).ok).toBe(false)

    const negative = JSON.parse(valid())
    negative.foods[0].per100g.kcal = -5
    expect(safeParseState(JSON.stringify(negative)).ok).toBe(false)

    const badDate = JSON.parse(valid())
    badDate.entries = [{ id: 'x', date: 'not-a-date', meal: 'ناهار', items: [], loggedAt: 1 }]
    expect(safeParseState(JSON.stringify(badDate)).ok).toBe(false)

    const badMeal = JSON.parse(valid())
    badMeal.entries = [{ id: 'x', date: '2026-11-22', meal: 'عصرانه', items: [], loggedAt: 1 }]
    expect(safeParseState(JSON.stringify(badMeal)).ok).toBe(false)
  })
})
