import { useState } from 'react'
import { ArrowLeft, Check, Flame, Smartphone } from 'lucide-react'
import { fa } from '../utils/format'

type Props = { onDone: (kcal: number) => void }

export default function Onboarding({ onDone }: Props) {
  const [step, setStep] = useState(0)
  const [goal, setGoal] = useState('2000')

  const finish = () => onDone(Math.max(800, Number(goal) || 2000))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" role="dialog" aria-modal="true" aria-label="راهنمای آغازین">
      <div className="card w-full max-w-sm p-6">
        <div className="mb-4 flex items-center gap-2 text-[var(--cal)]">
          <Flame size={20} />
          <span className="text-sm font-extrabold">کالری‌شمار روزمره</span>
        </div>

        {step === 0 && (
          <div>
            <h2 className="text-base font-bold">هدف روزانهٔ شما چقدر است؟</h2>
            <p className="mt-1 text-xs leading-6 text-[var(--muted)]">
              میتوانید بعداً از تنظیمات آن را تغییر دهید.
            </p>
            <label className="mt-4 block">
              <span className="mb-1 block text-[11px] text-[var(--muted)]">کیلوکالری در روز</span>
              <input
                className="field num text-lg"
                dir="rtl"
                inputMode="numeric"
                value={fa(goal)}
                onChange={(e) => setGoal(e.target.value.replace(/[^\d]/g, ''))}
                aria-label="هدف کالری روزانه"
              />
            </label>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-base font-bold">غذایتان را بنویسید، ما میفهمیم</h2>
            <p className="mt-2 text-xs leading-7 text-[var(--muted)]">
              مثلاً بنویسید: «دو کفگیر قورمه سبزی و یک کف دست سنگک». واحدهای خانگی مانند کفگیر، کف دست، قاشق غذاخوری و لیوان را خودمان میشناسیم.
            </p>
            <p className="card-soft num mt-3 p-3 text-center text-xs text-[#D4D4D8]">
              دو کفگیر قورمه سبزی و یک کف دست سنگک
            </p>
          </div>
        )}

        {step === 2 && (
          <div>
            <Smartphone size={26} className="text-[var(--cal)]" />
            <h2 className="mt-2 text-base font-bold">همیشه همراهتان باشد</h2>
            <p className="mt-1 text-xs leading-7 text-[var(--muted)]">
              از منوی مرورگر «افزودن به صفحه اصلی» را انتخاب کنید تا بدون اینترنت هم کار کند. دادههای شما فقط روی گوشی شماست.
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center gap-2">
          {step > 0 && (
            <button type="button" onClick={() => setStep(step - 1)} className="btn-ghost p-2" aria-label="مرحلهٔ قبل">
              <ArrowLeft size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={() => (step === 2 ? finish() : setStep(step + 1))}
            className="btn-primary flex flex-1 items-center justify-center gap-1.5 text-sm"
          >
            {step === 2 ? <><Check size={15} /> شروع میکنم</> : 'بعدی'}
          </button>
        </div>
        <button type="button" onClick={() => setStep(2)} className="mt-2 w-full text-[11px] text-[var(--muted)]">
          رد کردن راهنما
        </button>
      </div>
    </div>
  )
}
