import { z } from 'zod'
import type { AppState } from './storage'

export const MAX_BACKUP_BYTES = 5_000_000

const nonNegative = z.number().refine((v) => Number.isFinite(v) && v >= 0, 'باید عددی غیرمنفی باشد')
const positive = z.number().refine((v) => Number.isFinite(v) && v > 0, 'باید عددی مثبت باشد')

export const macroSchema = z.object({
  kcal: nonNegative,
  protein: nonNegative,
  carbs: nonNegative,
  fat: nonNegative,
})

export const foodUnitSchema = z.object({
  name: z.string().min(1).max(80),
  grams: positive.max(10_000),
  aliases: z.array(z.string().max(80)).max(30).optional(),
})

export const foodCategorySchema = z.enum([
  'stew', 'rice_bread', 'kebab_protein', 'breakfast', 'dairy', 'drink', 'snack', 'soup', 'custom',
])

export const foodSchema = z.object({
  id: z.string().min(1).max(120),
  name: z.string().min(1).max(120),
  aliases: z.array(z.string().max(120)).max(40),
  category: foodCategorySchema,
  per100g: macroSchema,
  units: z.array(foodUnitSchema).min(1).max(20),
  defaultUnit: z.string().min(1).max(80),
  isCustom: z.boolean().optional(),
})

export const mealTypeSchema = z.enum(['صبحانه', 'ناهار', 'شام', 'میان وعده'])

export const mealItemSchema = z.object({
  foodId: z.string().min(1).max(120),
  foodName: z.string().min(1).max(120),
  quantity: positive.max(10_000),
  unit: z.string().min(1).max(80),
  unitGrams: positive.max(10_000),
  grams: nonNegative.max(1_000_000),
  kcal: nonNegative.max(1_000_000),
  protein: nonNegative.max(1_000_000),
  carbs: nonNegative.max(1_000_000),
  fat: nonNegative.max(1_000_000),
})

export const mealEntrySchema = z.object({
  id: z.string().min(1).max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاریخ نامعتبر است'),
  meal: mealTypeSchema,
  items: z.array(mealItemSchema).max(100),
  loggedAt: nonNegative,
})

export const goalsSchema = z.object({
  kcal: positive.max(100_000),
  protein: nonNegative.max(10_000),
  carbs: nonNegative.max(10_000),
  fat: nonNegative.max(10_000),
})

export const appStateSchema = z.object({
  version: z.literal(1),
  foods: z.array(foodSchema).min(1).max(500),
  entries: z.array(mealEntrySchema).max(10_000),
  goals: goalsSchema,
})

export type ParseResult = { ok: true; state: AppState } | { ok: false; error: string }

/** Structural + numeric validation before any untrusted JSON reaches the app. */
export function safeParseState(raw: string): ParseResult {
  if (raw.length > MAX_BACKUP_BYTES) {
    return { ok: false, error: 'فایل بیش از حد بزرگ است' }
  }
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'فایل JSON معتبر نیست' }
  }
  const result = appStateSchema.safeParse(json)
  if (!result.success) {
    return { ok: false, error: 'ساختار دادهها معتبر نیست' }
  }
  return { ok: true, state: result.data as AppState }
}
