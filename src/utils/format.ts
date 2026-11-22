import { toPersianDigits } from './persianFoodParser'

/** Render any number with Persian numerals, keeping at most one decimal. */
export function fa(value: number | string): string {
  if (typeof value === 'string') return toPersianDigits(value)
  const rounded = Math.round(value * 10) / 10
  return toPersianDigits(Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1))
}

export function faInt(value: number): string {
  return toPersianDigits(Math.round(value))
}

/** Solar Hijri (Jalali) date, e.g. «۱ آذر ۱۴۰۵». */
export function jalaliDate(date = new Date()): string {
  return new Intl.DateTimeFormat('fa-IR', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(date)
}

export function jalaliWeekday(date = new Date()): string {
  return new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(date)
}

export function shortWeekday(date: Date): string {
  return new Intl.DateTimeFormat('fa-IR', { weekday: 'narrow' }).format(date)
}

/** Local YYYY-MM-DD key — avoids UTC day drift from toISOString(). */
export function dateKey(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function clockTime(ts: number): string {
  return new Intl.DateTimeFormat('fa-IR', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(ts))
}
