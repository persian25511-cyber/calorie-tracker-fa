import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Flame } from 'lucide-react'
import BottomNav, { type Tab } from './components/BottomNav'
import Dashboard from './components/Dashboard'
import EditMealDialog from './components/EditMealDialog'
import Onboarding from './components/Onboarding'
import QuickLog from './components/QuickLog'
import type { Food } from './data/iranianFoods'
import { dateKey, fa, jalaliDate } from './utils/format'
import type { ParsedItem } from './utils/persianFoodParser'
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

const Analytics = lazy(() => import('./components/Analytics'))
const FoodBank = lazy(() => import('./components/FoodBank'))
const SettingsPanel = lazy(() => import('./components/SettingsPanel'))

const DEFAULT_SUGGESTIONS = [
  'یک کفگیر برنج کته و یک کفگیر قورمه سبزی',
  'دو عدد تخم مرغ آبپز و یک کف دست نان سنگک',
  'یک کاسه ماست و یک قاشق غذاخوری عسل',
  'نصف لیوان دوغ و دو عدد خرما',
]

const ONBOARD_KEY = 'calorie-tracker:onboarded'
const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

function Loading() {
  return (
    <div className="card p-8 text-center text-xs text-[var(--muted)]" role="status">
      در حال بارگذاری…
    </div>
  )
}

export default function App() {
  const [state, setState] = useState<AppState>(loadState)
  const [tab, setTab] = useState<Tab>('home')
  const [toast, setToast] = useState('')
  const [today, setToday] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => dateKey())
  const [undo, setUndo] = useState<{ entry: MealEntry; index: number } | null>(null)
  const [editing, setEditing] = useState<MealEntry | null>(null)
  const [foodPrefill, setFoodPrefill] = useState<string | null>(null)
  const [onboarding, setOnboarding] = useState(() => {
    try { return localStorage.getItem(ONBOARD_KEY) !== '1' } catch { return false }
  })
  const storageWarned = useRef(false)
  const stateRef = useRef(state)

  useEffect(() => { stateRef.current = state }, [state])

  useEffect(() => {
    const flush = () => saveState(stateRef.current)
    window.addEventListener('pagehide', flush)
    window.addEventListener('beforeunload', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      window.removeEventListener('beforeunload', flush)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!saveState(state) && !storageWarned.current) {
        storageWarned.current = true
        setToast('ذخیرهٔ محلی ممکن نیست. از تنظیمات پشتیبان بگیرید.')
      }
    }, 250)
    return () => window.clearTimeout(timer)
  }, [state])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!undo) return
    const timer = window.setTimeout(() => setUndo(null), 5000)
    return () => window.clearTimeout(timer)
  }, [undo])

  useEffect(() => {
    const onUpdate = () => setToast('نسخهٔ جدید موجود است، صفحه را بارگذاری مجدد کنید')
    window.addEventListener('app-update-available', onUpdate)
    return () => window.removeEventListener('app-update-available', onUpdate)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (dateKey(new Date()) !== dateKey(today)) {
        setToday(new Date())
        setSelectedDate(dateKey())
      }
    }, 60_000)
    return () => window.clearInterval(timer)
  }, [today])

  const todayCount = state.entries.filter((e) => e.date === dateKey(today)).length

  const suggestions = useMemo(() => {
    const fromHistory = state.entries
      .filter((e) => e.items.length > 1)
      .slice(0, 8)
      .map((e) => e.items.map((i) => `${fa(i.quantity)} ${i.unit} ${i.foodName}`).join(' و '))
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
          foodId: p.foodId, foodName: p.foodName, quantity: p.quantity,
          unit: p.unit, unitGrams: p.unitGrams, grams: p.grams, kcal: p.kcal,
          protein: p.protein, carbs: p.carbs, fat: p.fat,
        })
      }
    }
    const items = [...grouped.values()]
    const entry: MealEntry = { id: newId(), date: selectedDate, meal, items, loggedAt: Date.now() }
    setState((prev) => ({ ...prev, entries: [entry, ...prev.entries] }))
    const total = items.reduce((s, i) => s + i.kcal, 0)
    setToast(`✅ ${meal} ثبت شد · ${fa(total)} کیلوکالری`)
  }

  const handleRepeat = (entry: MealEntry) => {
    handleLog(entry.items.map((i) => ({ ...i, id: newId() }) as ParsedItem), entry.meal)
  }

  const handleDelete = (id: string) => {
    const index = state.entries.findIndex((e) => e.id === id)
    if (index < 0) return
    setUndo({ entry: state.entries[index], index })
    setState((prev) => ({ ...prev, entries: prev.entries.filter((e) => e.id !== id) }))
    setToast('وعده حذف شد')
  }

  const handleUndo = () => {
    if (!undo) return
    setState((prev) => {
      const entries = [...prev.entries]
      entries.splice(Math.min(undo.index, entries.length), 0, undo.entry)
      return { ...prev, entries }
    })
    setUndo(null)
    setToast('وعده بازگردانده شد')
  }

  const handleEditSave = (entry: MealEntry) => {
    setState((prev) => ({ ...prev, entries: prev.entries.map((e) => (e.id === entry.id ? entry : e)) }))
    setEditing(null)
    setToast('تغییرات ذخیره شد')
  }

  const handleSaveFood = (food: Food) => {
    setState((prev) => ({
      ...prev,
      foods: prev.foods.some((f) => f.id === food.id)
        ? prev.foods.map((f) => (f.id === food.id ? food : f))
        : [...prev.foods, food],
    }))
    setFoodPrefill(null)
    setToast(`غذای «${food.name}» ذخیره شد`)
  }

  const handleDeleteFood = (id: string) => {
    setState((prev) => ({ ...prev, foods: prev.foods.filter((f) => f.id !== id) }))
    setToast('غذا حذف شد')
  }

  const handleDefineFood = (name: string) => {
    setFoodPrefill(name)
    setTab('foods')
  }

  const finishOnboarding = (kcal: number) => {
    setState((prev) => ({ ...prev, goals: { ...prev.goals, kcal } }))
    try { localStorage.setItem(ONBOARD_KEY, '1') } catch { /* ignore */ }
    setOnboarding(false)
  }

  const handleImport = (text: string) => {
    setState(parseBackup(text))
    setToast('دادهها بازیابی شدند')
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="border-b border-[var(--border)] bg-[#101012]/80 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between lg:max-w-4xl">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[rgba(255,159,69,.14)] text-[var(--cal)]">
              <Flame size={19} fill="currentColor" strokeWidth={1.5} />
            </span>
            <div>
              <h1 className="text-sm font-extrabold leading-tight">کالریشمار روزمره</h1>
              <p className="num text-[10px] text-[var(--muted)]">{jalaliDate(today)}</p>
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
            <QuickLog foods={state.foods} suggestions={suggestions} onLog={handleLog} onDefineFood={handleDefineFood} />
            <Dashboard
              state={state}
              today={today}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onDelete={handleDelete}
              onRepeat={handleRepeat}
              onEdit={setEditing}
              onSettings={() => setTab('settings')}
            />
          </div>
        )}
        {tab === 'analytics' && (
          <Suspense fallback={<Loading />}><Analytics state={state} /></Suspense>
        )}
        {tab === 'foods' && (
          <Suspense fallback={<Loading />}>
            <FoodBank
              key={foodPrefill ?? 'foods'}
              foods={state.foods}
              onSave={handleSaveFood}
              onDelete={handleDeleteFood}
              initialName={foodPrefill ?? undefined}
            />
          </Suspense>
        )}
        {tab === 'settings' && (
          <Suspense fallback={<Loading />}>
            <SettingsPanel
              state={state}
              onGoals={(goals: Goals) => setState((prev) => ({ ...prev, goals }))}
              onImport={handleImport}
              onReset={() => { setState(initialState()); setToast('دادهها بازنشانی شدند') }}
              notify={setToast}
            />
          </Suspense>
        )}
      </main>

      {(toast || undo) && (
        <div className="toast-in fixed right-1/2 bottom-24 z-40 flex w-max max-w-[90vw] translate-x-1/2 items-center gap-2 rounded-xl border border-[var(--border)] bg-[#1C1C20] px-4 py-2 text-center text-xs shadow-2xl" role="status" aria-live="polite">
          <span>{toast}</span>
          {undo && (
            <button type="button" onClick={handleUndo} className="rounded-md bg-[var(--cal)] px-2 py-0.5 text-[10px] font-bold text-[#201303]">
              بازگردانی
            </button>
          )}
        </div>
      )}

      {editing && (
        <EditMealDialog entry={editing} foods={state.foods} onSave={handleEditSave} onClose={() => setEditing(null)} />
      )}
      {onboarding && <Onboarding onDone={finishOnboarding} />}

      <BottomNav active={tab} onChange={setTab} todayCount={todayCount} />
    </div>
  )
}
