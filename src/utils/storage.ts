import { IRANIAN_FOODS, type Food } from '../data/iranianFoods'
import { appStateSchema, safeParseState } from './schema'

export type MealType = 'صبحانه' | 'ناهار' | 'شام' | 'میان وعده'
export const MEAL_TYPES: MealType[] = ['صبحانه', 'ناهار', 'شام', 'میان وعده']

export type MealItem = {
  foodId: string
  foodName: string
  quantity: number
  unit: string
  unitGrams: number
  grams: number
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export type MealEntry = {
  id: string
  date: string
  meal: MealType
  items: MealItem[]
  loggedAt: number
}

export type Goals = { kcal: number; protein: number; carbs: number; fat: number }

export type AppState = {
  version: 1
  foods: Food[]
  entries: MealEntry[]
  goals: Goals
}

const KEY = 'calorie-tracker:v1'

export const initialState = (): AppState => ({
  version: 1,
  foods: IRANIAN_FOODS,
  entries: [],
  goals: { kcal: 2000, protein: 100, carbs: 260, fat: 65 },
})

/**
 * Normalizes a validated state: seeded foods stay current while user edits
 * and custom dishes survive; missing goals fall back to defaults.
 */
export function migrateState(parsed: AppState): AppState {
  const seeded = IRANIAN_FOODS.map(
    (seed) => parsed.foods.find((f) => f.id === seed.id) ?? seed,
  )
  const custom = parsed.foods.filter((f) => !IRANIAN_FOODS.some((seed) => seed.id === f.id))
  const defaults = initialState().goals
  return {
    version: 1,
    foods: [...seeded, ...custom],
    entries: parsed.entries,
    goals: { ...defaults, ...parsed.goals },
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return initialState()
    const result = safeParseState(raw)
    if (!result.ok) return initialState()
    return migrateState(result.state)
  } catch {
    return initialState()
  }
}

/** Returns false when storage is full, disabled, or the state is invalid. */
export function saveState(state: AppState): boolean {
  if (!appStateSchema.safeParse(state).success) return false
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function parseBackup(text: string): AppState {
  const result = safeParseState(text)
  if (!result.ok) throw new Error(result.error)
  return migrateState(result.state)
}
