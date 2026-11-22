import { describe, expect, it, vi } from 'vitest'
import { IRANIAN_FOODS } from '../data/iranianFoods'
import { dateKey } from './format'
import { initialState, loadState, migrateState, parseBackup, saveState, type AppState } from './storage'

const KEY = 'calorie-tracker:v1'

const sampleEntry = () => ({
  id: 'e1',
  date: dateKey(new Date(2026, 10, 22)),
  meal: 'ناهار' as const,
  loggedAt: Date.now(),
  items: [{
    foodId: 'ghormeh-sabzi', foodName: 'قورمه سبزی', quantity: 1, unit: 'کفگیر',
    unitGrams: 180, grams: 180, kcal: 261, protein: 11, carbs: 22, fat: 15,
  }],
})

describe('local persistence', () => {
  it('saves and loads a full state', () => {
    const state = { ...initialState(), entries: [sampleEntry()] }
    expect(saveState(state)).toBe(true)
    expect(loadState().entries).toEqual(state.entries)
  })

  it('falls back to defaults for missing or corrupt storage', () => {
    localStorage.removeItem(KEY)
    expect(loadState().entries).toEqual([])
    localStorage.setItem(KEY, '{broken')
    expect(loadState().foods.length).toBe(IRANIAN_FOODS.length)
  })

  it('keeps custom foods and user edits across migration', () => {
    const custom = { ...IRANIAN_FOODS[0], id: 'mine', name: 'خورشت من', isCustom: true }
    const migrated = migrateState({ ...initialState(), foods: [custom] })
    expect(migrated.foods).toHaveLength(IRANIAN_FOODS.length + 1)
    expect(migrated.foods.find((f) => f.id === 'mine')?.name).toBe('خورشت من')
  })

  it('validates before writing and reports storage failures', () => {
    const broken = { ...initialState(), goals: { ...initialState().goals, kcal: Number.NaN } } as AppState
    expect(saveState(broken)).toBe(false)

    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    expect(saveState(initialState())).toBe(false)
    spy.mockRestore()
  })

  it('imports a backup and rejects an invalid one', () => {
    const backup = JSON.stringify({ ...initialState(), entries: [sampleEntry()] })
    expect(parseBackup(backup).entries).toHaveLength(1)
    expect(() => parseBackup('{"version":9}')).toThrow()
  })
})
