import { IRANIAN_FOODS, type Food } from '../data/iranianFoods'

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

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return initialState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    if (parsed.version !== 1 || !Array.isArray(parsed.entries)) return initialState()
    const storedFoods = Array.isArray(parsed.foods) ? parsed.foods : []
    // Keep seeded foods up to date while preserving edits and custom dishes.
    const foods: Food[] = [
      ...IRANIAN_FOODS.map((seed) => storedFoods.find((f) => f.id === seed.id) ?? seed),
      ...storedFoods.filter((f) => !IRANIAN_FOODS.some((seed) => seed.id === f.id)),
    ]
    return {
      version: 1,
      foods,
      entries: parsed.entries,
      goals: { ...initialState().goals, ...(parsed.goals ?? {}) },
    }
  } catch {
    return initialState()
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage full or disabled — the app still works in memory */
  }
}

export function parseBackup(text: string): AppState {
  const parsed = JSON.parse(text) as Partial<AppState>
  if (parsed.version !== 1 || !Array.isArray(parsed.entries) || !Array.isArray(parsed.foods)) {
    throw new Error('فایل پشتیبان معتبر نیست')
  }
  return {
    version: 1,
    foods: parsed.foods,
    entries: parsed.entries,
    goals: { ...initialState().goals, ...(parsed.goals ?? {}) },
  }
}
