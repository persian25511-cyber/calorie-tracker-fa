import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, Flame } from 'lucide-react'
import { fa, faInt, jalaliDate, shortWeekday } from '../utils/format'
import type { AppState } from '../utils/storage'

type Props = { state: AppState }

export default function Analytics({ state }: Props) {
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setHours(12, 0, 0, 0)
      d.setDate(d.getDate() - (6 - i))
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const key = `${y}-${m}-${day}`
      const entries = state.entries.filter((e) => e.date === key)
      const kcal = entries.reduce((s, e) => s + e.items.reduce((a, it) => a + it.kcal, 0), 0)
      return { key, label: shortWeekday(d), kcal, fullDate: jalaliDate(d) }
    })
  }, [state.entries])

  const week = useMemo(() => {
    const keys = new Set(days.map((d) => d.key))
    const entries = state.entries.filter((e) => keys.has(e.date))
    const totals = entries.reduce(
      (acc, e) => {
        for (const it of e.items) {
          acc.protein += it.protein
          acc.carbs += it.carbs
          acc.fat += it.fat
        }
        return acc
      },
      { protein: 0, carbs: 0, fat: 0 },
    )
    const pk = totals.protein * 4
    const ck = totals.carbs * 4
    const fk = totals.fat * 9
    const sum = pk + ck + fk
    const pct = (v: number) => (sum > 0 ? Math.round((v / sum) * 100) : 0)
    return { ...totals, proteinPct: pct(pk), carbsPct: pct(ck), fatPct: pct(fk) }
  }, [days, state.entries])

  const average = days.length ? Math.round(days.reduce((s, d) => s + d.kcal, 0) / days.length) : 0

  return (
    <div className="space-y-4">
      <section className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <Activity size={16} className="text-[var(--cal)]" /> مصرف هفت روز گذشته
            </h2>
            <p className="num mt-0.5 text-[11px] text-[var(--muted)]">
              میانگین روزانه: {fa(average)} کیلوکالری
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted)]">
            <span className="inline-block h-0 w-4 border-t-2 border-dashed border-[var(--cal)]" />
            هدف روزانه
          </div>
        </div>

        <div className="h-[230px] w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={days} margin={{ top: 6, right: 4, left: -24, bottom: 0 }} barSize={22}>
              <CartesianGrid stroke="#26262A" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#8E8E96', fontSize: 11, fontFamily: 'Vazirmatn' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6E6E76', fontSize: 10, fontFamily: 'Vazirmatn' }}
                tickFormatter={(value: number) => fa(value)}
                axisLine={false}
                tickLine={false}
                width={46}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,.04)' }}
                contentStyle={{
                  background: '#1C1C20',
                  border: '1px solid #26262A',
                  borderRadius: 12,
                  color: '#fff',
                  fontFamily: 'Vazirmatn',
                  fontSize: 12,
                }}
                labelFormatter={(_label, payload) => String(payload?.[0]?.payload?.fullDate ?? '')}
                formatter={(value: unknown) => [`${fa(Number(value))} کیلوکالری`, 'مصرف']}
              />
              <ReferenceLine y={state.goals.kcal} stroke="var(--cal)" strokeDasharray="4 4" strokeOpacity={0.8} />
              <Bar dataKey="kcal" fill="var(--cal)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card p-4">
        <h2 className="mb-3 text-sm font-bold">ترکیب درشت مغذی‌ها</h2>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-[#26262A]">
          <div style={{ width: `${week.proteinPct}%`, background: 'var(--pro)' }} />
          <div style={{ width: `${week.carbsPct}%`, background: 'var(--carb)' }} />
          <div style={{ width: `${week.fatPct}%`, background: 'var(--fat)' }} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { label: 'پروتئین', pct: week.proteinPct, grams: week.protein, color: 'var(--pro)' },
            { label: 'کربوهیدرات', pct: week.carbsPct, grams: week.carbs, color: 'var(--carb)' },
            { label: 'چربی', pct: week.fatPct, grams: week.fat, color: 'var(--fat)' },
          ].map((m) => (
            <div key={m.label} className="card-soft p-2.5 text-center">
              <p className="text-[10px]" style={{ color: m.color }}>{m.label}</p>
              <p className="num text-base font-extrabold">{fa(m.pct)}٪</p>
              <p className="num text-[10px] text-[var(--muted)]">{faInt(m.grams)} گرم</p>
            </div>
          ))}
        </div>
        <p className="num mt-3 text-center text-[11px] text-[var(--muted)]">
          <Flame size={12} className="mb-0.5 inline text-[var(--cal)]" />{' '}
          بر اساس {fa(state.entries.length)} وعده ثبت شده
        </p>
      </section>
    </div>
  )
}
