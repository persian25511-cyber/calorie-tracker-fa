import { ChevronLeft, ChevronRight, Clock, Flame, Pencil, RotateCcw, Target, Trash2 } from 'lucide-react'
import { fa, clockTime, dateKey, jalaliDate, jalaliWeekday } from '../utils/format'
import { MEAL_TYPES, type AppState, type MealEntry } from '../utils/storage'
import ProgressRing from './ProgressRing'

type Props = {
  state: AppState
  today: Date
  selectedDate: string
  onSelectDate: (key: string) => void
  onDelete: (id: string) => void
  onRepeat: (entry: MealEntry) => void
  onEdit: (entry: MealEntry) => void
  onSettings: () => void
}

const MACROS = [
  { key: 'protein', label: 'پروتئین', color: 'var(--pro)', unit: 'g' },
  { key: 'carbs', label: 'کربوهیدرات', color: 'var(--carb)', unit: 'g' },
  { key: 'fat', label: 'چربی', color: 'var(--fat)', unit: 'g' },
] as const

export default function Dashboard({ state, today, selectedDate, onSelectDate, onDelete, onRepeat, onEdit, onSettings }: Props) {
  const todayEntries = state.entries.filter((e) => e.date === selectedDate)
  const [sy, sm, sd] = selectedDate.split('-').map(Number)
  const selected = new Date(sy, sm - 1, sd)

  const shiftDate = (days: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number)
    const next = new Date(y, m - 1, d + days)
    onSelectDate(dateKey(next))
  }

  const totals = todayEntries.reduce(
    (acc, e) => {
      for (const item of e.items) {
        acc.kcal += item.kcal
        acc.protein += item.protein
        acc.carbs += item.carbs
        acc.fat += item.fat
      }
      return acc
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  )

  return (
    <div className="space-y-4">
      <section className="card overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-2.5">
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => shiftDate(1)} aria-label="روز بعد" className="rounded-lg bg-[#1C1C20] p-1.5">
              <ChevronRight size={14} />
            </button>
            <label className="sr-only" htmlFor="log-date">تاریخ وعده</label>
            <input
              id="log-date"
              type="date"
              dir="ltr"
              value={selectedDate}
              onChange={(e) => e.target.value && onSelectDate(e.target.value)}
              className="field num !w-auto px-2 py-1 text-[11px]"
              aria-label="انتخاب تاریخ"
            />
            <button type="button" onClick={() => shiftDate(-1)} aria-label="روز قبل" className="rounded-lg bg-[#1C1C20] p-1.5">
              <ChevronLeft size={14} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => onSelectDate(dateKey(today))}
            className="rounded-full bg-[#1C1C20] px-2 py-1 text-[10px] text-[#B8B8C0]"
          >
            امروز
          </button>
          <button
            type="button"
            onClick={onSettings}
            className="flex items-center gap-1.5 rounded-full bg-[#1C1C20] px-2.5 py-1 text-[10px] text-[#B8B8C0]"
          >
            <Target size={12} />
            هدف: <span className="num">{fa(state.goals.kcal)}</span>
          </button>
        </div>
        <div className="px-4 pt-2 text-[11px] text-[var(--muted)]">
          {selectedDate === dateKey(today) ? jalaliWeekday(today) : 'تاریخ انتخابشده'} ·{' '}
          <span className="num">{jalaliDate(selected)}</span>
        </div>

        <div className="flex flex-col items-center gap-5 px-4 py-5 sm:flex-row sm:justify-around">
          <ProgressRing consumed={totals.kcal} target={state.goals.kcal} />
          <div className="w-full max-w-xs space-y-3">
            {MACROS.map((macro) => {
              const value = totals[macro.key]
              const goal = state.goals[macro.key]
              const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0
              return (
                <div key={macro.key}>
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="font-medium" style={{ color: macro.color }}>
                      {macro.label}
                    </span>
                    <span className="num text-[var(--muted)]">
                      {fa(value)} / {fa(goal)} گرم
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#26262A]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: macro.color }}
                    />
                  </div>
                </div>
              )
            })}
            <p className="num pt-1 text-center text-[11px] text-[var(--muted)] sm:text-right">
              <Flame size={12} className="mb-0.5 inline text-[var(--cal)]" />{' '}
              {fa(totals.kcal)} کیلوکالری مصرف شده
            </p>
          </div>
        </div>
      </section>

      <section aria-label="وعدههای امروز">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-sm font-bold">وعدههای امروز</h2>
          <span className="num text-[11px] text-[var(--muted)]">{fa(todayEntries.length)} وعده</span>
        </div>

        {todayEntries.length === 0 ? (
          <div className="card px-4 py-8 text-center">
            <p className="text-3xl">🍽️</p>
            <p className="mt-2 text-xs text-[var(--muted)]">
              هنوز غذایی ثبت نکردهاید. اولین وعده را بالا ثبت کنید.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {MEAL_TYPES.map((mealType) => {
              const mealEntries = todayEntries.filter((e) => e.meal === mealType)
              if (!mealEntries.length) return null
              return (
                <div key={mealType}>
                  <p className="mb-1.5 px-1 text-[11px] font-semibold text-[var(--muted)]">{mealType}</p>
                  <div className="space-y-2">
                    {mealEntries.map((entry) => {
                      const kcal = entry.items.reduce((s, i) => s + i.kcal, 0)
                      return (
                        <div key={entry.id} className="card-soft p-3">
                          <div className="flex items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[12px] font-medium">
                                {entry.items.map((i) => i.foodName).join(' · ')}
                              </p>
                              <p className="num mt-0.5 text-[10px] text-[var(--muted)]">
                                <Clock size={10} className="inline" /> {clockTime(entry.loggedAt)} ·{' '}
                                {entry.items.map((i) => `${fa(i.quantity)} ${i.unit}`).join('، ')}
                              </p>
                            </div>
                            <div className="num shrink-0 text-left text-xs font-bold text-[var(--cal)]">
                              {fa(kcal)}{' '}
                              <span className="text-[9px] font-normal text-[var(--muted)]">کالری</span>
                            </div>
                          </div>
                          <div className="mt-2 flex gap-1.5 border-t border-[var(--border)] pt-2">
                            <button
                              type="button"
                              onClick={() => onRepeat(entry)}
                              className="btn-ghost num flex items-center gap-1 px-2 py-1 text-[10px]"
                            >
                              <RotateCcw size={11} /> تکرار
                            </button>
                            <button
                              type="button"
                              onClick={() => onEdit(entry)}
                              className="btn-ghost flex items-center gap-1 px-2 py-1 text-[10px]"
                            >
                              <Pencil size={11} /> ویرایش
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(entry.id)}
                              aria-label="حذف وعده"
                              className="btn-ghost flex items-center gap-1 px-2 py-1 text-[10px] text-[#F19A9A]"
                            >
                              <Trash2 size={11} /> حذف
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
