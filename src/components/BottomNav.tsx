import { BarChart3, Home, Settings, UtensilsCrossed } from 'lucide-react'
import { fa } from '../utils/format'
import type { MealEntry } from '../utils/storage'

export type Tab = 'home' | 'analytics' | 'foods' | 'settings'

const ITEMS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'ثبت روزانه', icon: Home },
  { id: 'analytics', label: 'روند هفتگی', icon: BarChart3 },
  { id: 'foods', label: 'بانک غذاها', icon: UtensilsCrossed },
  { id: 'settings', label: 'تنظیمات', icon: Settings },
]

type Props = {
  active: Tab
  onChange: (tab: Tab) => void
  todayCount: number
}

export default function BottomNav({ active, onChange, todayCount }: Props) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-2xl items-stretch lg:max-w-4xl justify-around border-t border-[var(--border)] bg-[#101012]/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
      style={{ minHeight: '4.5rem' }}
    >
      {ITEMS.map(({ id, label, icon: Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-current={isActive ? 'page' : undefined}
            className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[11px] transition-colors ${
              isActive ? 'text-[var(--cal)]' : 'text-[#7E7E87]'
            }`}
          >
            <span className={`rounded-xl px-4 py-1 ${isActive ? 'bg-[rgba(255,159,69,.13)]' : ''}`}>
              <Icon size={21} strokeWidth={isActive ? 2.4 : 1.9} />
            </span>
            <span className="font-medium">{label}</span>
            {id === 'home' && todayCount > 0 && (
              <span className="num absolute top-1 right-[calc(50%-1.6rem)] rounded-full bg-[var(--cal)] px-1.5 text-[9px] font-extrabold text-[#201303]">
                {fa(todayCount)}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}

export type { MealEntry }
