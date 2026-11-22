import { describe, expect, it } from 'vitest'
import { fa, faInt, dateKey, jalaliDate, jalaliWeekday, shortWeekday } from './format'

describe('format helpers', () => {
  it('renders numbers with Persian digits and at most one decimal', () => {
    expect(fa(1234)).toBe('۱۲۳۴')
    expect(fa(12.34)).toBe('۱۲.۳')
    expect(faInt(12.9)).toBe('۱۳')
    expect(fa('2.5')).toBe('۲.۵')
  })

  it('uses Solar Hijri dates from fa-IR', () => {
    const d = new Date(2026, 10, 22, 12, 0, 0)
    expect(jalaliDate(d)).toContain('۱۴۰۵')
    expect(jalaliWeekday(d).length).toBeGreaterThan(1)
    expect(shortWeekday(d).length).toBeLessThanOrEqual(2)
  })

  it('builds local date keys without UTC drift', () => {
    expect(dateKey(new Date(2026, 0, 2, 23, 30))).toBe('2026-01-02')
    expect(dateKey(new Date(2026, 10, 22))).toBe('2026-11-22')
  })
})
