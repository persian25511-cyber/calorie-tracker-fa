import type { Food, FoodUnit, Macro } from '../data/iranianFoods'

/* ───────────────────────────── normalization ───────────────────────────── */

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'
const DIGIT_MAP: Record<string, string> = {}
for (let i = 0; i < 10; i++) {
  DIGIT_MAP[PERSIAN_DIGITS[i]] = String(i)
  DIGIT_MAP[ARABIC_DIGITS[i]] = String(i)
}

/** Convert Persian (۰-۹) and Arabic-Indic (٠-٩) digits to ASCII digits. */
export function toEnglishDigits(input: string): string {
  return input.replace(/[۰-۹٠-٩]/g, (ch) => DIGIT_MAP[ch] ?? ch)
}

/** Convert ASCII digits to Persian digits for display. */
export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)])
}

/**
 * Canonical key for matching: ZWNJ becomes a space, Arabic yeh/kehh and
 * diacritics are folded, whitespace is collapsed. This makes
 * «قورمه سبزی», «قورمه\u200cسبزی» and «قورمه سبزی» compare equal.
 */
export function normalizePersian(input: string): string {
  return input
    .replace(/[\u200c\u200d]/g, ' ')
    .replace(/[\u064b-\u065f\u0670\u0640]/g, '')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim()
}

const normalizeCompact = (s: string) => normalizePersian(s).replace(/\s/g, '')

/* ───────────────────────────── number words ────────────────────────────── */

const NUMBER_WORDS: Record<string, number> = {
  صفر: 0,
  یک: 1,
  یکی: 1,
  یه: 1,
  'یکم': 1,
  دو: 2,
  دوتا: 2,
  سه: 3,
  چهار: 4,
  چار: 4,
  پنج: 5,
  شش: 6,
  شیش: 6,
  هفت: 7,
  هشت: 8,
  نه: 9,
  ده: 10,
  نصف: 0.5,
  نصفه: 0.5,
  نیم: 0.5,
  نیمه: 0.5,
}

function parseNumberToken(token: string): number | null {
  if (/^\d+(\.\d+)?$/.test(token)) return Number(token)
  if (/^\d+\/\d+$/.test(token)) {
    const [a, b] = token.split('/').map(Number)
    return b === 0 ? null : a / b
  }
  return NUMBER_WORDS[token] ?? null
}

const HALF_PATTERN = new RegExp(
  `(${Object.keys(NUMBER_WORDS)
    .filter((w) => NUMBER_WORDS[w] !== 0.5)
    .join('|')}|\\d+(?:\\.\\d+)?)\\s*و\\s*نیم`,
  'g',
)

/** «یک و نیم» → 1.5, «2 و نیم» → 2.5 — done before splitting on «و». */
function expandHalfExpressions(text: string): string {
  return text.replace(HALF_PATTERN, (_all, word: string) => {
    const n = parseNumberToken(word)
    return n === null ? word : String(n + 0.5)
  })
}

/* ───────────────────────────── units ───────────────────────────────────── */

type UnitKey = { key: string; name: string; tokens: number }

const UNIT_DEFS: Array<{ key: string; names: string[] }> = [
  { key: 'قاشق غذاخوری', names: ['قاشق غذاخوری', 'قاشق غذا خوری', 'قاشق خوراکی'] },
  { key: 'قاشق چایخوری', names: ['قاشق چایخوری', 'قاشق چای خوری'] },
  { key: 'کف دست', names: ['کف دست', 'کفدست'] },
  { key: 'کفگیر', names: ['کفگیر', 'کف گیر', 'ملاقه'] },
  { key: 'برش', names: ['برش'] },
  { key: 'برگ', names: ['برگ'] },
  { key: 'لیوان', names: ['لیوان', 'استکان'] },
  { key: 'پیاله', names: ['پیاله'] },
  { key: 'کاسه', names: ['کاسه'] },
  { key: 'عدد', names: ['عدد', 'دانه', 'تا'] },
  { key: 'سیخ', names: ['سیخ'] },
  { key: 'تکه', names: ['تکه', 'قطعه'] },
  { key: 'مشت', names: ['مشت', 'مشتی'] },
  { key: 'کیلو', names: ['کیلو', 'کیلوگرم'] },
  { key: 'قاشق', names: ['قاشق'] },
  { key: 'گرم', names: ['گرم', 'g', 'gr'] },
]

export const UNIT_KEYS: UnitKey[] = UNIT_DEFS.flatMap(({ key, names }) =>
  names.map((name) => ({ key, name: normalizePersian(name), tokens: normalizePersian(name).split(' ').length })),
).sort((a, b) => b.tokens - a.tokens || b.name.length - a.name.length)

/** Global units plus any household unit defined by a food in the database. */
function buildUnitCandidates(foods: Food[]): UnitKey[] {
  const map = new Map<string, UnitKey>()
  for (const key of UNIT_KEYS) map.set(key.name, key)
  for (const food of foods) {
    for (const unit of food.units) {
      for (const name of [unit.name, ...(unit.aliases ?? [])]) {
        const normalized = normalizePersian(name)
        if (!normalized || map.has(normalized)) continue
        map.set(normalized, {
          key: normalized,
          name: normalized,
          tokens: normalized.split(' ').length,
        })
      }
    }
  }
  return [...map.values()].sort((a, b) => b.tokens - a.tokens || b.name.length - a.name.length)
}

/* ───────────────────────────── food matching ───────────────────────────── */

function editDistance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let cur = [i]
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    prev.splice(0, prev.length, ...cur)
  }
  return prev[b.length]
}

function similarity(a: string, b: string): number {
  if (!a.length || !b.length) return 0
  return 1 - editDistance(a, b) / Math.max(a.length, b.length)
}

export type FoodMatch = { food: Food; score: number }

/** Fuzzy, offline food lookup used by both the parser and the food bank search. */
export function findFoodMatches(query: string, foods: Food[], limit = 5): FoodMatch[] {
  const q = normalizePersian(query)
  if (!q) return []
  const qc = normalizeCompact(query)
  const results: FoodMatch[] = []

  for (const food of foods) {
    let best = 0
    for (const candidate of [food.name, ...food.aliases]) {
      const c = normalizePersian(candidate)
      const cc = normalizeCompact(candidate)
      let score = 0
      if (q === c) score = 1
      else if (qc === cc) score = 0.98
      else if (c.length >= 3 && q.includes(c)) score = 0.82 + (0.1 * c.length) / q.length
      else if (q.length >= 3 && c.includes(q)) score = 0.76 + (0.14 * q.length) / c.length
      else score = similarity(qc, cc) * 0.8
      if (score > best) best = score
    }
    if (best >= 0.6) results.push({ food, score: best })
  }
  return results.sort((a, b) => b.score - a.score).slice(0, limit)
}

/* ───────────────────────────── parsed result ───────────────────────────── */

export type ParsedItem = {
  id: string
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
  confidence: number
  raw: string
}

const round1 = (n: number) => Math.round(n * 10) / 10

function resolveUnit(food: Food, key: string): FoodUnit | undefined {
  const targets = UNIT_DEFS.find((d) => d.key === key)?.names ?? [key]
  return food.units.find((unit) =>
    [unit.name, ...(unit.aliases ?? [])].some((name) => targets.includes(normalizePersian(name))),
  )
}

function parseSegment(segment: string, foods: Food[], index: number, unitCandidates: UnitKey[]): ParsedItem | null {
  let tokens = normalizePersian(segment).split(' ').filter(Boolean)
  if (!tokens.length) return null

  let quantity = 1
  const quantities: number[] = []
  while (tokens.length) {
    const n = parseNumberToken(tokens[0])
    if (n === null) break
    quantities.push(n)
    tokens.shift()
  }
  if (quantities.length) quantity = quantities.reduce((a, b) => a + b, 0)

  // Longest unit phrase wins: «قاشق غذاخوری» before «قاشق», «کف دست» before «کف».
  let unitKey: string | null = null
  for (const candidate of unitCandidates) {
    const head = tokens.slice(0, candidate.tokens).join(' ')
    if (head === candidate.name) {
      unitKey = candidate.key
      tokens = tokens.slice(candidate.tokens)
      break
    }
  }

  const foodText = tokens.join(' ')
  if (!foodText) return null
  const match = findFoodMatches(foodText, foods, 1)[0]
  if (!match) return null
  const food = match.food

  const isWeight = unitKey === 'گرم' || unitKey === 'کیلو'
  const unitDef = isWeight ? undefined : resolveUnit(food, unitKey ?? food.defaultUnit)
  const unitGrams = unitKey === 'گرم' ? 1 : unitKey === 'کیلو' ? 1000 : (unitDef?.grams ?? food.units[0]?.grams ?? 100)
  const grams = round1(quantity * unitGrams)
  const factor = grams / 100
  const macro: Macro = food.per100g

  return {
    id: `${index}-${food.id}`,
    foodId: food.id,
    foodName: food.name,
    quantity,
    unit: isWeight ? (unitKey as string) : (unitDef?.name ?? food.defaultUnit),
    unitGrams,
    grams,
    kcal: Math.round(macro.kcal * factor),
    protein: round1(macro.protein * factor),
    carbs: round1(macro.carbs * factor),
    fat: round1(macro.fat * factor),
    confidence: match.score,
    raw: segment.trim(),
  }
}

/**
 * Parses a natural Persian logging sentence into structured food items.
 * Fully offline and deterministic — no network, no random IDs.
 */
export function parsePersianFood(input: string, foods: Food[]): ParsedItem[] {
  if (!input?.trim()) return []
  const results: ParsedItem[] = []
  const unitCandidates = buildUnitCandidates(foods)

  // Names such as «خورشت مرغ و آلو» contain «و»; protect them before splitting.
  const protectedNames = foods
    .flatMap((food) => [food.name, ...food.aliases])
    .map((name) => normalizePersian(name))
    .filter((name) => /\s+و\s+/.test(name))
  const placeholders = new Map<string, string>()

  // Split raw newlines first — normalizePersian collapses all whitespace.
  for (const line of input.split(/\r?\n+/)) {
    let text = expandHalfExpressions(toEnglishDigits(normalizePersian(line)))
    protectedNames.forEach((name, i) => {
      const token = `@@food${i}@@`
      if (text.includes(name)) {
        placeholders.set(token, name)
        text = text.split(name).join(token)
      }
    })
    const segments = text
      .split(/\s*\+\s*|[,،]|\s+و\s+/)
      .map((s) => {
        let restored = s
        for (const [token, name] of placeholders) restored = restored.split(token).join(name)
        return restored.trim()
      })
      .filter(Boolean)
    for (const segment of segments) {
      const item = parseSegment(segment, foods, results.length, unitCandidates)
      if (item) results.push(item)
    }
  }
  return results
}
