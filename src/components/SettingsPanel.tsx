import { useRef, useState, type ChangeEvent } from 'react'
import { Download, Info, RotateCcw, Upload } from 'lucide-react'
import { fa, dateKey } from '../utils/format'
import { toEnglishDigits } from '../utils/persianFoodParser'
import type { AppState, Goals } from '../utils/storage'

type Props = {
  state: AppState
  onGoals: (goals: Goals) => void
  onImport: (text: string) => void
  onReset: () => void
  notify: (message: string) => void
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const [raw, setRaw] = useState(String(value))
  const shown = raw === '' ? '' : fa(raw)
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-[var(--muted)]">{label}</span>
      <input
        className="field num text-sm"
        inputMode="numeric"
        dir="rtl"
        value={shown}
        onChange={(e) => {
          const clean = toEnglishDigits(e.target.value).replace(/[^\d.]/g, '')
          setRaw(clean)
          onChange(Number(clean) || 0)
        }}
      />
    </label>
  )
}

export default function SettingsPanel({ state, onGoals, onImport, onReset, notify }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `calorie-tracker-${dateKey()}.json`
    a.click()
    URL.revokeObjectURL(url)
    notify('نسخه پشتیبان دانلود شد')
  }

  const importJson = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      onImport(await file.text())
      notify('داده‌ها با موفقیت بازیابی شدند')
    } catch {
      notify('خواندن فایل پشتیبان ناموفق بود')
    }
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      <section className="card p-4">
        <h2 className="mb-3 text-sm font-bold">اهداف روزانه</h2>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="کالری (کیلوکالری)" value={state.goals.kcal} onChange={(v) => onGoals({ ...state.goals, kcal: v })} />
          <NumberField label="پروتئین (گرم)" value={state.goals.protein} onChange={(v) => onGoals({ ...state.goals, protein: v })} />
          <NumberField label="کربوهیدرات (گرم)" value={state.goals.carbs} onChange={(v) => onGoals({ ...state.goals, carbs: v })} />
          <NumberField label="چربی (گرم)" value={state.goals.fat} onChange={(v) => onGoals({ ...state.goals, fat: v })} />
        </div>
        <p className="mt-2 text-[10px] text-[var(--muted)]">تغییرات بلافاصله ذخیره و در نمودار اعمال می‌شوند.</p>
      </section>

      <section className="card p-4">
        <h2 className="mb-3 text-sm font-bold">پشتیبانگیری از داده‌ها</h2>
        <p className="mb-3 text-[11px] leading-6 text-[var(--muted)]">
          تمام اطلاعات روی همین دستگاه ذخیره می‌شوند. با خروجی JSON می‌توانید از داده‌هایتان پشتیبان بگیرید و در دستگاه دیگری بازیابی کنید.
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={exportJson} className="btn-ghost flex items-center gap-1.5 text-xs">
            <Download size={14} /> خروجی JSON
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost flex items-center gap-1.5 text-xs">
            <Upload size={14} /> بازیابی از فایل
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={importJson} />
        </div>
      </section>

      <section className="card p-4">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
          <Info size={15} className="text-[var(--cal)]" /> نصب روی گوشی
        </h2>
        <p className="text-[11px] leading-6 text-[var(--muted)]">
          در مرورگر کروم یا سافاری گزینه «افزودن به صفحه اصلی» را انتخاب کنید تا کالری‌شمار مثل یک اپلیکیشن اجرا شود. نیازی به اینترنت نیست.
        </p>
      </section>

      <section className="card p-4">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
          <Info size={15} className="text-[var(--cal)]" /> حریم خصوصی و ایمنی
        </h2>
        <p className="text-[11px] leading-7 text-[var(--muted)]">
          تمام دادهها فقط در همین مرورگر ذخیره میشوند و به هیچ سروری ارسال نمیشوند. هیچ ردیابی یا تحلیلی فعال نیست.
          مقادیر تغذیهای تقریبیاند و نباید به عنوان توصیهٔ پزشکی استفاده شوند.
        </p>
        <p className="mt-2 text-[11px] leading-6 text-[var(--muted)]">
          پیشنهاد میشود هر چند وقت یکبار از طریق «خروجی JSON» پشتیبان بگیرید.
        </p>
      </section>

      <section className="card p-4">
        <h2 className="mb-2 text-sm font-bold">بازنشانی</h2>
        <p className="mb-3 text-[11px] text-[var(--muted)]">همه وعده‌ها، غذاهای سفارشی و اهداف به حالت اولیه برمیگردند.</p>
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className="btn-ghost flex items-center gap-1.5 text-xs text-[#F19A9A]"
        >
          <RotateCcw size={14} /> بازنشانی کامل
        </button>
      </section>

      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" role="dialog" aria-modal="true" aria-label="تأیید بازنشانی">
          <div className="card w-full max-w-sm p-5">
            <h3 className="text-sm font-bold">همه دادهها حذف شوند؟</h3>
            <p className="mt-1 text-xs leading-6 text-[var(--muted)]">
              وعدهها، غذاهای سفارشی و اهداف به حالت اولیه برمیگردند. این کار قابل بازگشت نیست.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onReset()
                  setConfirmReset(false)
                  notify('دادهها بازنشانی شدند')
                }}
                className="btn-primary flex-1 text-xs"
              >
                بله، بازنشانی کن
              </button>
              <button type="button" onClick={() => setConfirmReset(false)} className="btn-ghost px-4 text-xs">
                لغو
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
