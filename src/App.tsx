import { useEffect, useMemo, useState } from 'react'
import { Flame } from 'lucide-react'
import Analytics from './components/Analytics'
import BottomNav, { type Tab } from './components/BottomNav'
import Dashboard from './components/Dashboard'
import FoodBank from './components/FoodBank'
import QuickLog from './components/QuickLog'
import SettingsPanel from './components/SettingsPanel'
import type { Food } from './data/iranianFoods'
import { dateKey, fa, jalaliDate } from './utils/format'
import {
  initialState,
  loadState,
  parseBackup,
  saveState,
  type AppState,
  type Goals,
  type MealEntry,
  type MealItem,
  type MealType,
} from './utils/storage'
import type { ParsedItem } from './utils/persianFoodParser'

const DEFAULT_SUGGESTIONS = [
  'یک کفگیر برنج کته و یک کفگیر قورمه سبزی',
  'دو عدد تخم مرغ آبپز و یک کف دست نان سنگک',
  'یک کاسه ماست و یک قاشق غذاخوری عسل',
  'نصف لیوان دوغ و دو عدد خرما',
]

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export default function App() {
  const [state, setState] = useState<AppState>(loadState)
  const [tab, setTab] = useState<Tab>('home')
  const [toast, setToast] = useState('')

  useEffect(() => saveState(state), [state])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  const todayCount = state.entries.filter((e) => e.date === dateKey()).length

  const suggestions = useMemo(() => {
    const fromHistory = state.entries
      .filter((e) => e.items.length > 1)
      .slice(0, 8)
      .map((e) =>
        e.items
          .map((i) => `${fa(i.quantity)} ${i.unit} ${i.foodName}`)
          .join(' و '),
      )
    return Array.from(new Set([...fromHistory, ...DEFAULT_SUGGESTIONS])).slice(0, 8)
  }, [state.entries])

  const handleLog = (parsed: ParsedItem[], meal: MealType) => {
    const grouped = new Map<string, MealItem>()
    for (const p of parsed) {
      const key = `${p.foodId}|${p.unit}`
      const prev = grouped.get(key)
      if (prev) {
        prev.quantity += p.quantity
        prev.grams += p.grams
        prev.kcal += p.kcal
        prev.protein += p.protein
        prev.carbs += p.carbs
        prev.fat += p.fat
      } else {
        grouped.set(key, {
          foodId: p.foodId,
          foodName: p.foodName,
          quantity: p.quantity,
          unit: p.unit,
          unitGrams: p.unitGrams,
          grams: p.grams,
          kcal: p.kcal,
          protein: p.protein,
          carbs: p.carbs,
          fat: p.fat,
        })
      }
    }
    const items = [...grouped.values()]
    const entry: MealEntry = {
      id: newId(),
      date: dateKey(),
      meal,
      items,
      loggedAt: Date.now(),
    }
    setState((prev) => ({ ...prev, entries: [entry, ...prev.entries] }))
    const total = items.reduce((s, i) => s + i.kcal, 0)
    setToast(`✅ ${meal} ثبت شد · ${fa(total)} کیلوکالری`)
  }

  const handleRepeat = (entry: MealEntry) => {
    handleLog(
      entry.items.map((i) => ({ ...i, id: newId() }) as ParsedItem),
      entry.meal,
    )
  }

  const handleDelete = (id: string) => {
    setState((prev) => ({ ...prev, entries: prev.entries.filter((e) => e.id !== id) }))
    setToast('وعده حذف شد')
  }

  const handleSaveFood = (food: Food) => {
    setState((prev) => ({
      ...prev,
      foods: prev.foods.some((f) => f.id === food.id)
        ? prev.foods.map((f) => (f.id === food.id ? food : f))
        : [...prev.foods, food],
    }))
    setToast(`غذای «${food.name}» ذخیره شد`)
  }

  const handleDeleteFood = (id: string) => {
    setState((prev) => ({ ...prev, foods: prev.foods.filter((f) => f.id !== id) }))
    setToast('غذا حذف شد')
  }

  const handleImport = (text: string) => setState(parseBackup(text))

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="border-b border-[var(--border)] bg-[#101012]/80 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between lg:max-w-4xl">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[rgba(255,159,69,.14)] text-[var(--cal)]">
              <Flame size={19} fill="currentColor" strokeWidth={1.5} />
            </span>
            <div>
              <h1 className="text-sm font-extrabold leading-tight">کالری‌شمار روزمره</h1>
              <p className="num text-[10px] text-[var(--muted)]">{jalaliDate()}</p>
            </div>
          </div>
          <span className="rounded-full border border-[var(--border)] bg-[#161618] px-2.5 py-1 text-[10px] text-[#B8B8C0]">
            غذاهای ایرانی · واحدهای خانگی
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-3 pt-4 pb-28 sm:px-4 lg:max-w-4xl safe-bottom">
        {tab === 'home' && (
          <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
            <QuickLog foods={state.foods} suggestions={suggestions} onLog={handleLog} />
            <Dashboard
              state={state}
              onDelete={handleDelete}
              onRepeat={handleRepeat}
              onSettings={() => setTab('settings')}
            />
          </div>
        )}
        {tab === 'analytics' && <Analytics state={state} />}
        {tab === 'foods' && (
          <FoodBank foods={state.foods} onSave={handleSaveFood} onDelete={handleDeleteFood} />
        )}
        {tab === 'settings' && (
          <SettingsPanel
            state={state}
            onGoals={(goals: Goals) => setState((prev) => ({ ...prev, goals }))}
            onImport={handleImport}
            onReset={() => setState(initialState())}
            notify={setToast}
          />
        )}
      </main>

      {toast && (
        <div className="toast-in fixed right-1/2 bottom-24 z-40 w-max max-w-[90vw] translate-x-1/2 rounded-xl border border-[var(--border)] bg-[#1C1C20] px-4 py-2 text-center text-xs shadow-2xl">
          {toast}
        </div>
      )}

      <BottomNav active={tab} onChange={setTab} todayCount={todayCount} />
    </div>
  )
}
