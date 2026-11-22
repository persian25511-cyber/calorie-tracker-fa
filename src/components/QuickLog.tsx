import { useEffect, useMemo, useState } from 'react'
import { Minus, Plus, Sparkles, X } from 'lucide-react'
import type { Food } from '../data/iranianFoods'
import { fa } from '../utils/format'
import { parsePersianFood, type ParsedItem } from '../utils/persianFoodParser'
import { MEAL_TYPES, type MealType } from '../utils/storage'

type Props = {
  foods: Food[]
  suggestions: string[]
  onLog: (items: ParsedItem[], meal: MealType) => void
}

function recalculate(item: ParsedItem, quantity: number, foods: Food[]): ParsedItem {
  const food = foods.find((f) => f.id === item.foodId)
  const grams = Math.round(quantity * item.unitGrams * 10) / 10
  const factor = grams / 100
  return {
    ...item,
    quantity,
    grams,
    kcal: Math.round((food?.per100g.kcal ?? 0) * factor),
    protein: Math.round((food?.per100g.protein ?? 0) * factor * 10) / 10,
    carbs: Math.round((food?.per100g.carbs ?? 0) * factor * 10) / 10,
    fat: Math.round((food?.per100g.fat ?? 0) * factor * 10) / 10,
  }
}

export default function QuickLog({ foods, suggestions, onLog }: Props) {
  const [input, setInput] = useState('')
  const [items, setItems] = useState<ParsedItem[]>([])
  const [meal, setMeal] = useState<MealType>('ناهار')

  useEffect(() => {
    setItems(parsePersianFood(input, foods))
  }, [input, foods])

  const total = useMemo(() => items.reduce((sum, i) => sum + i.kcal, 0), [items])

  const adjust = (index: number, delta: number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item
        const step = item.quantity % 1 === 0 ? 1 : 0.5
        const next = Math.max(0.5, Math.round((item.quantity + delta * step) * 10) / 10)
        return recalculate(item, next, foods)
      }),
    )
  }

  const submit = () => {
    if (!items.length) return
    onLog(items, meal)
    setInput('')
    setItems([])
  }

  return (
    <section className="card p-4" aria-label="ثبت سریع غذا">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-lg bg-[rgba(255,159,69,.14)] text-[var(--cal)]">
          <Sparkles size={16} />
        </span>
        <h2 className="text-sm font-bold">ثبت سریع غذا</h2>
        <span className="mr-auto text-[10px] text-[var(--muted)]">به زبان خودتان بنویسید</span>
      </div>

      <input
        className="field num text-[13px]"
        dir="rtl"
        lang="fa"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
        }}
        placeholder="مثلاً: دو کفگیر قورمه سبزی و یک کف دست سنگک"
        aria-label="غذاهای خورده شده را به فارسی بنویسید"
      />

      {suggestions.length > 0 && (
        <div className="no-scrollbar mt-2.5 flex gap-1.5 overflow-x-auto pb-0.5">
          {suggestions.map((s, i) => (
            <button
              key={`${s}-${i}`}
              type="button"
              onClick={() => setInput(s)}
              className="shrink-0 rounded-full border border-[var(--border)] bg-[#111113] px-2.5 py-1 text-[10px] text-[#B8B8C0] transition-colors hover:border-[#4A4A52]"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {input.trim() && (
        <div className="mt-3">
          {items.length > 0 ? (
            <>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] text-[var(--muted)]">پیش‌نمایش زنده</span>
                <span className="num text-[11px] font-bold text-[var(--cal)]">
                  جمع: {fa(total)} کیلوکالری
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map((item, i) => (
                  <div
                    key={item.id}
                    className="chip-in flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[#111113] py-1.5 pe-1.5 ps-2.5"
                  >
                    <div className="leading-tight">
                      <div className="text-[12px] font-semibold">{item.foodName}</div>
                      <div className="num text-[10px] text-[var(--muted)]">
                        {fa(item.quantity)} × {item.unit} · {fa(item.kcal)} کیلوکالری
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 rounded-lg bg-[#1C1C20] p-0.5">
                      <button
                        type="button"
                        aria-label={`کاهش ${item.foodName}`}
                        onClick={() => adjust(i, -1)}
                        className="rounded-md p-1 text-[#B8B8C0] hover:bg-[#2A2A30]"
                      >
                        <Minus size={12} />
                      </button>
                      <button
                        type="button"
                        aria-label={`افزایش ${item.foodName}`}
                        onClick={() => adjust(i, 1)}
                        className="rounded-md p-1 text-[#B8B8C0] hover:bg-[#2A2A30]"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label={`حذف ${item.foodName}`}
                      onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
                      className="rounded-md p-1 text-[#6E6E76] hover:bg-[#2A2A30] hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="rounded-xl border border-dashed border-[#33333A] px-3 py-2 text-[11px] text-[#9A9AA2]">
              غذایی شناسایی نشد. نام غذا و واحد خانگی را ساده بنویسید، مثلاً «یک لیوان شیر».
            </p>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {MEAL_TYPES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMeal(m)}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
              meal === m ? 'bg-[var(--cal)] text-[#201303]' : 'bg-[#1C1C20] text-[#A8A8B0]'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={!items.length}
        className="btn-primary mt-3 flex w-full items-center justify-center gap-2 text-sm disabled:cursor-not-allowed disabled:bg-[#2A2A30] disabled:text-[#6E6E76]"
      >
        <Plus size={16} strokeWidth={2.6} />
        ثبت وعده
      </button>
    </section>
  )
}

export type { ParsedItem }
