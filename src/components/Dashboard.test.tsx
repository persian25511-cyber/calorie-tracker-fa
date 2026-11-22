import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Dashboard from './Dashboard'
import { dateKey } from '../utils/format'
import { initialState, type MealEntry } from '../utils/storage'

const today = new Date(2026, 10, 22, 12, 0, 0)
const entry: MealEntry = {
  id: 'e1', date: dateKey(today), meal: 'ناهار', loggedAt: today.getTime(),
  items: [{
    foodId: 'ghormeh-sabzi', foodName: 'قورمه سبزی', quantity: 2, unit: 'کفگیر',
    unitGrams: 180, grams: 360, kcal: 522, protein: 22, carbs: 43, fat: 31,
  }],
}

describe('Dashboard', () => {
  it('renders the empty state', () => {
    render(<Dashboard state={initialState()} today={today} onDelete={vi.fn()} onRepeat={vi.fn()} onSettings={vi.fn()} />)
    expect(screen.getByText(/هنوز غذایی ثبت نکردهاید/)).toBeInTheDocument()
  })

  it('shows logged meals, calories and macro totals', () => {
    const state = { ...initialState(), entries: [entry] }
    render(<Dashboard state={state} today={today} onDelete={vi.fn()} onRepeat={vi.fn()} onSettings={vi.fn()} />)
    expect(screen.getByText('قورمه سبزی')).toBeInTheDocument()
    expect(screen.getAllByText(/۵۲۲/).length).toBeGreaterThan(0)
    expect(screen.getByText(/۱ وعده/)).toBeInTheDocument()
  })
})
