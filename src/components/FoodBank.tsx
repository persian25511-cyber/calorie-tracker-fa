import { useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import {
  CATEGORY_LABELS,
  type Food,
  type FoodCategory,
  type FoodUnit,
} from '../data/iranianFoods'
import { fa } from '../utils/format'
import { findFoodMatches } from '../utils/persianFoodParser'

type Props = {
  foods: Food[]
  onSave: (food: Food) => void
  onDelete: (id: string) => void
  initialName?: string
}

type Draft = {
  id: string
  name: string
  aliases: string
  category: FoodCategory
  kcal: string
  protein: string
  carbs: string
  fat: string
  units: { name: string; grams: string }[]
  defaultUnit: string
  isCustom: boolean
}

const emptyDraft = (): Draft => ({
  id: `custom-${Date.now()}`,
  name: '',
  aliases: '',
  category: 'custom',
  kcal: '',
  protein: '',
  carbs: '',
  fat: '',
  units: [{ name: '', grams: '' }],
  defaultUnit: '',
  isCustom: true,
})

const toDraft = (food: Food): Draft => ({
  id: food.id,
  name: food.name,
  aliases: food.aliases.join('، '),
  category: food.category,
  kcal: String(food.per100g.kcal),
  protein: String(food.per100g.protein),
  carbs: String(food.per100g.carbs),
  fat: String(food.per100g.fat),
  units: food.units.map((u) => ({ name: u.name, grams: String(u.grams) })),
  defaultUnit: food.defaultUnit,
  isCustom: Boolean(food.isCustom),
})

export default function FoodBank({ foods, onSave, onDelete, initialName }: Props) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<FoodCategory | 'all'>('all')
  const [draft, setDraft] = useState<Draft | null>(() => initialName ? { ...emptyDraft(), name: initialName } : null)
  const [error, setError] = useState('')

  const results = useMemo(() => {
    let list = query.trim() ? findFoodMatches(query, foods, 100).map((r) => r.food) : [...foods]
    if (category !== 'all') list = list.filter((f) => f.category === category)
    return list
  }, [query, category, foods])

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d))

  const save = () => {
    if (!draft) return
    const units: FoodUnit[] = draft.units
      .map((u) => ({ name: u.name.trim(), grams: Number(u.grams) }))
      .filter((u) => u.name && u.grams > 0)
    if (!draft.name.trim() || !units.length || !(Number(draft.kcal) > 0)) {
      setError('نام غذا، کالری و حداقل یک واحد با وزن معتبر وارد کنید.')
      return
    }
    onSave({
      id: draft.id,
      name: draft.name.trim(),
      aliases: draft.aliases.split(/[،,\n]/).map((a) => a.trim()).filter(Boolean),
      category: draft.category,
      per100g: {
        kcal: Number(draft.kcal) || 0,
        protein: Number(draft.protein) || 0,
        carbs: Number(draft.carbs) || 0,
        fat: Number(draft.fat) || 0,
      },
      units,
      defaultUnit: units.some((u) => u.name === draft.defaultUnit) ? draft.defaultUnit : units[0].name,
      isCustom: draft.isCustom,
    })
    setDraft(null)
    setError('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-sm font-bold">بانک غذاها</h2>
          <p className="num text-[11px] text-[var(--muted)]">{fa(foods.length)} غذا موجود</p>
        </div>
        <button
          type="button"
          onClick={() => { setDraft(emptyDraft()); setError('') }}
          className="btn-primary flex items-center gap-1.5 px-3 py-2 text-xs"
        >
          <Plus size={14} /> غذای جدید
        </button>
      </div>

      {draft && (
        <section className="card space-y-3 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">{draft.isCustom ? 'غذای جدید' : `ویرایش: ${draft.name}`}</h3>
            <button type="button" onClick={() => setDraft(null)} aria-label="بستن" className="text-[var(--muted)]">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="col-span-2 block">
              <span className="mb-1 block text-[11px] text-[var(--muted)]">نام غذا</span>
              <input className="field text-xs" value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="مثلاً: خورشت مخصوص مادربزرگ" />
            </label>
            <label className="col-span-2 block">
              <span className="mb-1 block text-[11px] text-[var(--muted)]">نام‌های دیگر (با کاما جدا کنید)</span>
              <input className="field text-xs" value={draft.aliases} onChange={(e) => set('aliases', e.target.value)} placeholder="خورشت مخصوص، خورشت مادربزرگ" />
            </label>
            <label className="col-span-2 block">
              <span className="mb-1 block text-[11px] text-[var(--muted)]">دسته</span>
              <select className="field text-xs" value={draft.category} onChange={(e) => set('category', e.target.value as FoodCategory)}>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </label>
            {(['kcal', 'protein', 'carbs', 'fat'] as const).map((key) => (
              <label key={key} className="block">
                <span className="mb-1 block text-[11px] text-[var(--muted)]">
                  {{ kcal: 'کالری', protein: 'پروتئین (g)', carbs: 'کربوهیدرات (g)', fat: 'چربی (g)' }[key]} / ۱۰۰ گرم
                </span>
                <input
                  className="field num text-xs"
                  type="number"
                  min="0"
                  step="0.1"
                  value={draft[key]}
                  onChange={(e) => set(key, e.target.value)}
                />
              </label>
            ))}
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11px] text-[var(--muted)]">واحدهای خانگی</span>
              <button
                type="button"
                onClick={() => set('units', [...draft.units, { name: '', grams: '' }])}
                className="flex items-center gap-1 text-[11px] text-[var(--cal)]"
              >
                <Plus size={12} /> واحد دیگر
              </button>
            </div>
            <div className="space-y-2">
              {draft.units.map((unit, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className="field num text-xs"
                    placeholder="نام واحد (مثلاً کفگیر)"
                    value={unit.name}
                    onChange={(e) => {
                      const units = [...draft.units]
                      units[i] = { ...unit, name: e.target.value }
                      set('units', units)
                    }}
                  />
                  <input
                    className="field num w-20 text-xs"
                    type="number"
                    min="1"
                    placeholder="گرم"
                    value={unit.grams}
                    onChange={(e) => {
                      const units = [...draft.units]
                      units[i] = { ...unit, grams: e.target.value }
                      set('units', units)
                    }}
                  />
                  {draft.units.length > 1 && (
                    <button
                      type="button"
                      aria-label="حذف واحد"
                      onClick={() => set('units', draft.units.filter((_, j) => j !== i))}
                      className="text-[#F19A9A]"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-[11px] text-[var(--muted)]">واحد پیشفرض</span>
            <select className="field text-xs" value={draft.defaultUnit} onChange={(e) => set('defaultUnit', e.target.value)}>
              <option value="">انتخاب واحد</option>
              {draft.units.filter((u) => u.name).map((u) => (
                <option key={u.name} value={u.name}>{u.name}</option>
              ))}
            </select>
          </label>

          {error && <p className="text-[11px] text-[#F19A9A]">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={save} className="btn-primary flex-1 text-xs">ذخیره غذا</button>
            <button type="button" onClick={() => setDraft(null)} className="btn-ghost px-4 text-xs">لغو</button>
          </div>
        </section>
      )}

      <div className="relative">
        <Search size={16} className="absolute top-1/2 right-3 -translate-y-1/2 text-[var(--muted)]" />
        <input
          className="field num ps-3 pe-9 text-xs"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجوی غذا، مثلاً قورمه یا سنگک"
          aria-label="جستجوی غذا"
        />
      </div>

      <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
        {(['all', ...Object.keys(CATEGORY_LABELS)] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setCategory(key as FoodCategory | 'all')}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] ${
              category === key ? 'bg-[var(--cal)] text-[#201303] font-bold' : 'bg-[#1C1C20] text-[#A8A8B0]'
            }`}
          >
            {key === 'all' ? 'همه' : CATEGORY_LABELS[key as FoodCategory]}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {results.length === 0 && (
          <p className="card p-4 text-center text-xs text-[var(--muted)]">غذایی پیدا نشد.</p>
        )}
        {results.map((food) => (
          <div key={food.id} className="card-soft p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-bold">{food.name}</p>
                <p className="text-[10px] text-[var(--muted)]">{CATEGORY_LABELS[food.category]}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  aria-label={`ویرایش ${food.name}`}
                  onClick={() => { setDraft(toDraft(food)); setError('') }}
                  className="rounded-lg bg-[#232328] p-1.5 text-[#B8B8C0]"
                >
                  <Pencil size={13} />
                </button>
                {food.isCustom && (
                  <button
                    type="button"
                    aria-label={`حذف ${food.name}`}
                    onClick={() => onDelete(food.id)}
                    className="rounded-lg bg-[#232328] p-1.5 text-[#F19A9A]"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
            <div className="num mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[#B8B8C0]">
              <span>{fa(food.per100g.kcal)} کالری</span>
              <span className="text-[var(--pro)]">پ: {fa(food.per100g.protein)}</span>
              <span className="text-[var(--carb)]">ک: {fa(food.per100g.carbs)}</span>
              <span className="text-[var(--fat)]">چ: {fa(food.per100g.fat)}</span>
              <span className="text-[var(--muted)]">هر ۱۰۰ گرم</span>
              <span className="text-[var(--muted)]">{food.source ?? 'تخمینی'}</span>
            </div>
            <div className="num mt-1.5 flex flex-wrap gap-1.5">
              {food.units.map((u) => (
                <span key={u.name} className="rounded-md bg-[#232328] px-2 py-0.5 text-[10px] text-[#B8B8C0]">
                  {u.name}: {fa(u.grams)} گرم
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
