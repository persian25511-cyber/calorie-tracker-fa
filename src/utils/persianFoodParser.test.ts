import { describe, expect, it } from 'vitest'
import { IRANIAN_FOODS } from '../data/iranianFoods'
import {
  findFoodMatches,
  normalizePersian,
  parsePersianFood,
  toEnglishDigits,
  toPersianDigits,
} from './persianFoodParser'

const parse = (text: string) => parsePersianFood(text, IRANIAN_FOODS)
const food = (id: string) => IRANIAN_FOODS.find((f) => f.id === id)!

describe('digit and text normalization', () => {
  it('converts Persian and Arabic-Indic digits to ASCII', () => {
    expect(toEnglishDigits('۱۲۳ ٤٥٦ 789')).toBe('123 456 789')
  })

  it('renders Persian numerals for display', () => {
    expect(toPersianDigits(1405)).toBe('۱۴۰۵')
    expect(toPersianDigits('2.5')).toBe('۲.۵')
  })

  it('folds ZWNJ, yeh/kehh and Arabic variants', () => {
    expect(normalizePersian('قورمه\u200cسبزی')).toBe(normalizePersian('قورمه سبزی'))
    expect(normalizePersian('قَورمه سبزى')).toBe(normalizePersian('قورمه سبزی'))
    expect(normalizePersian('كفگير')).toBe('کفگیر')
    expect(normalizePersian('قورمه   سبزی')).toBe('قورمه سبزی')
  })
})

describe('quantity parsing', () => {
  it('parses Persian number words', () => {
    const [item] = parse('یک کاسه ماست')
    expect(item).toBeDefined()
    expect(item.quantity).toBe(1)
    expect(item.foodId).toBe('yogurt')
    expect(item.unit).toBe('کاسه')
  })

  it('parses colloquial «یه» and large word numbers', () => {
    expect(parse('یه عدد خرما')[0].quantity).toBe(1)
    expect(parse('چهار عدد خرما')[0].quantity).toBe(4)
    expect(parse('ده عدد بادام')[0].quantity).toBe(10)
  })

  it('parses Persian, Arabic and ASCII digits', () => {
    expect(parse('۲ لیوان شیر')[0].quantity).toBe(2)
    expect(parse('٢ لیوان شیر')[0].quantity).toBe(2)
    expect(parse('2 لیوان شیر')[0].quantity).toBe(2)
  })

  it('parses «نصف» and «نیم» as one half', () => {
    const half = parse('نصف لیوان دوغ')[0]
    expect(half.quantity).toBe(0.5)
    expect(half.foodId).toBe('doogh')
    expect(half.unit).toBe('لیوان')
    expect(half.kcal).toBe(Math.round((food('doogh').per100g.kcal * 125) / 100))

    const nim = parse('نیم کاسه آش رشته')[0]
    expect(nim.quantity).toBe(0.5)
    expect(nim.foodId).toBe('ash-reshteh')
  })

  it('parses «یک و نیم» before splitting on «و»', () => {
    const items = parse('یک و نیم کفگیر قورمه سبزی')
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(1.5)
    expect(items[0].foodId).toBe('ghormeh-sabzi')

    const [withHalf] = parse('دو و نیم عدد تخم مرغ')
    expect(withHalf.quantity).toBe(2.5)
  })

  it('parses fractional digits', () => {
    expect(parse('1/2 لیوان شیر')[0].quantity).toBe(0.5)
    expect(parse('1.5 کاسه ماست')[0].quantity).toBe(1.5)
  })
})

describe('household units', () => {
  it('recognizes «کف دست» as a two-word unit', () => {
    const [item] = parse('یک کف دست سنگک')
    expect(item.unit).toBe('کف دست')
    expect(item.unitGrams).toBe(45)
    expect(item.foodId).toBe('nan-sangak')
  })

  it('prefers «قاشق غذاخوری» over the shorter «قاشق»', () => {
    const [tbsp] = parse('یک قاشق غذاخوری عسل')
    expect(tbsp.unit).toBe('قاشق غذاخوری')
    expect(tbsp.unitGrams).toBe(21)

    const [tsp] = parse('دو قاشق چایخوری کره')
    expect(tsp.unit).toBe('قاشق چایخوری')
    expect(tsp.unitGrams).toBe(5)
  })

  it('handles ladle, skewer, slice, bowl and gram units', () => {
    expect(parse('دو کفگیر قیمه')[0].unit).toBe('کفگیر')
    expect(parse('یک سیخ جوجه کباب')[0].unit).toBe('سیخ')
    expect(parse('سه برش نان تست')[0].unit).toBe('برش')
    expect(parse('یک پیاله دوغ')[0].unit).toBe('پیاله')
    const [byWeight] = parse('۲۰۰ گرم چای ساده')
    expect(byWeight.unit).toBe('گرم')
    expect(byWeight.grams).toBe(200)
  })

  it('uses a food default unit when none is spoken', () => {
    const [item] = parse('دو خرما')
    expect(item.unit).toBe('عدد')
    expect(item.quantity).toBe(2)
    expect(item.grams).toBe(24)
  })
})

describe('multi-item sentences', () => {
  it('splits on «و» and matches the exact acceptance example', () => {
    const items = parse('دو کفگیر قورمه\u200cسبزی و یک کف دست سنگک')
    expect(items).toHaveLength(2)
    expect(items[0]).toMatchObject({ foodId: 'ghormeh-sabzi', quantity: 2, unit: 'کفگیر' })
    expect(items[1]).toMatchObject({ foodId: 'nan-sangak', quantity: 1, unit: 'کف دست' })
    expect(items[0].kcal).toBe(Math.round((145 * 360) / 100))
    expect(items[1].kcal).toBe(Math.round((250 * 45) / 100))
  })

  it('handles joined ZWNJ-free spelling too', () => {
    const items = parse('دو کفگیر قورمهسبزی و یک کف دست سنگک')
    expect(items).toHaveLength(2)
    expect(items.map((i) => i.foodId)).toEqual(['ghormeh-sabzi', 'nan-sangak'])
  })

  it('splits on +، , and new lines', () => {
    const items = parse('یک عدد سیب+دو عدد موز، نصف لیوان شیر')
    expect(items.map((i) => i.foodId)).toEqual(['apple', 'banana', 'milk'])
    const lines = parse('یک عدد سیب\nدو عدد موز\nیک لیوان دوغ')
    expect(lines).toHaveLength(3)
  })

  it('splits the three-item acceptance sentence', () => {
    const items = parse('دو کفگیر قورمه\u200cسبزی و یک کف دست سنگک و نصف لیوان دوغ')
    expect(items.map((i) => i.foodId)).toEqual(['ghormeh-sabzi', 'nan-sangak', 'doogh'])
    expect(items[2].quantity).toBe(0.5)
  })
})

describe('fuzzy matching and robustness', () => {
  it('recognizes custom household units from user-added foods', () => {
    const custom = {
      ...food('yogurt'),
      id: 'custom-soup',
      name: 'سوپ مخصوص من',
      aliases: ['سوپ من'],
      units: [{ name: 'کاسه کوچک', grams: 150 }],
      defaultUnit: 'کاسه کوچک',
      isCustom: true,
    }
    const items = parsePersianFood('یک کاسه کوچک سوپ مخصوص من', [...IRANIAN_FOODS, custom])
    expect(items).toHaveLength(1)
    expect(items[0].foodId).toBe('custom-soup')
    expect(items[0].unit).toBe('کاسه کوچک')
    expect(items[0].grams).toBe(150)
  })

  it('tolerates Arabic «ي» and «ك» in a full sentence', () => {
    const [item] = parse('دو كفگير قورمه سبزي')
    expect(item.foodId).toBe('ghormeh-sabzi')
    expect(item.unit).toBe('کفگیر')
  })

  it('finds foods by short common names', () => {
    expect(findFoodMatches('سنگک', IRANIAN_FOODS)[0].food.id).toBe('nan-sangak')
    expect(findFoodMatches('کته', IRANIAN_FOODS)[0].food.id).toBe('brinj-kateh')
    expect(findFoodMatches('چای', IRANIAN_FOODS)[0].food.id).toBe('sweet-tea')
  })

  it('returns nothing for empty or unknown input', () => {
    expect(parse('')).toEqual([])
    expect(parse('   ')).toEqual([])
    expect(parse('کفگیر')).toEqual([])
    expect(parse('چیزی که وجود ندارد')).toEqual([])
  })

  it('never returns negative or NaN macros', () => {
    for (const item of parse('دو کفگیر قورمه\u200cسبزی و نصف لیوان دوغ و سه عدد خرما')) {
      expect(Number.isFinite(item.kcal)).toBe(true)
      expect(item.kcal).toBeGreaterThanOrEqual(0)
      expect(item.protein).toBeGreaterThanOrEqual(0)
      expect(item.carbs).toBeGreaterThanOrEqual(0)
      expect(item.fat).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('food database', () => {
  it('ships at least 50 realistic Iranian foods', () => {
    expect(IRANIAN_FOODS.length).toBeGreaterThanOrEqual(50)
    expect(new Set(IRANIAN_FOODS.map((f) => f.id)).size).toBe(IRANIAN_FOODS.length)
  })

  it('gives every food a valid default unit and macros', () => {
    for (const f of IRANIAN_FOODS) {
      expect(f.units.length).toBeGreaterThan(0)
      expect(f.units.some((u) => u.name === f.defaultUnit)).toBe(true)
      expect(f.per100g.kcal).toBeGreaterThan(0)
      expect(f.per100g.protein + f.per100g.carbs + f.per100g.fat).toBeGreaterThan(0)
      for (const u of f.units) expect(u.grams).toBeGreaterThan(0)
    }
  })
})
