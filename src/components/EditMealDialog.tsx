import { useState } from 'react'
import { Check, Minus, Plus, Trash2, X } from 'lucide-react'
import type { Food } from '../data/iranianFoods'
import { fa } from '../utils/format'
import { MEAL_TYPES, type MealEntry, type MealItem, type MealType } from '../utils/storage'

type Props = {
  entry: MealEntry
  foods: Food[]
  onSave: (entry: MealEntry) => void
  onClose: () => void
}

export default function EditMealDialog({ entry, foods, onSave, onClose }: Props) {
  const [meal, setMeal] = useState<MealType>(entry.meal)
  const [quantities, setQuantities] = useState<Record<number, number>>(
    Object.fromEntries(entry.items.map((item, i) => [i, item.quantity])),
  )
  const [removed, setRemoved] = useState<number[]>([])

  const recalculate = (item: MealItem, quantity: number): MealItem => {
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

  const save = () => {
    const items = entry.items
      .map((item, i) => recalculate(item, quantities[i] ?? item.quantity))
      .filter((_item, i) => !removed.includes(i))
    if (!items.length) return
    onSave({ ...entry, meal, items })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center" role="dialog" aria-modal="true" aria-label="ویرایش وعده">
      <div className="card max-h-[85vh] w-full max-w-md overflow-y-auto p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">ویرایش وعده</h2>
          <button type="button" onClick={onClose} aria-label="بستن" className="text-[var(--muted)]"><X size={18} /></button>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {MEAL_TYPES.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={meal === m}
              onClick={() => setMeal(m)}
              className={`rounded-full px-3 py-1 text-[11px] ${meal === m ? 'bg-[var(--cal)] text-[#201303]' : 'bg-[#1C1C20] text-[#A8A8B0]'}`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {entry.items.map((item, i) => {
            if (removed.includes(i)) return null
            const current = recalculate(item, quantities[i] ?? item.quantity)
            return (
              <div key={`${item.foodId}-${i}`} className="card-soft flex items-center gap-2 p-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{item.foodName}</p>
                  <p className="num text-[10px] text-[var(--muted)]">
                    {fa(current.quantity)} × {item.unit} · {fa(current.kcal)} کیلوکالری
                  </p>
                </div>
                <div className="flex items-center gap-0.5 rounded-lg bg-[#232328] p-0.5">
                  <button
                    type="button"
                    aria-label={`کاهش ${item.foodName}`}
                    onClick={() => setQuantities((q) => ({ ...q, [i]: Math.max(0.5, (q[i] ?? item.quantity) - 1) }))}
                    className="p-1.5"><Minus size={12} /></button>
                  <button
                    type="button"
                    aria-label={`افزایش ${item.foodName}`}
                    onClick={() => setQuantities((q) => ({ ...q, [i]: (q[i] ?? item.quantity) + 1 }))}
                    className="p-1.5"><Plus size={12} /></button>
                </div>
                <button
                  type="button"
                  aria-label={`حذف ${item.foodName}`}
                  onClick={() => setRemoved((r) => [...r, i])}
                  className="p-1.5 text-[#F19A9A]"><Trash2 size={13} /></button>
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={save} className="btn-primary flex flex-1 items-center justify-center gap-1.5 text-xs">
            <Check size={14} /> ذخیره تغییرات
          </button>
          <button type="button" onClick={onClose} className="btn-ghost px-4 text-xs">لغو</button>
        </div>
      </div>
    </div>
  )
}
