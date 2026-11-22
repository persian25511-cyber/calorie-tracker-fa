import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
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
  it('navigates dates and opens the edit dialog', () => {
    const onSelectDate = vi.fn()
    const onEdit = vi.fn()
    const state = { ...initialState(), entries: [entry] }
    render(
      <Dashboard
        state={state}
        today={today}
        selectedDate={dateKey(today)}
        onSelectDate={onSelectDate}
        onDelete={vi.fn()}
        onRepeat={vi.fn()}
        onEdit={onEdit}
        onSettings={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'روز قبل' }))
    expect(onSelectDate).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: /ویرایش/ }))
    expect(onEdit).toHaveBeenCalledWith(entry)
  })

  it('renders the empty state', () => {
    render(<Dashboard state={initialState()} today={today} selectedDate={dateKey(today)} onSelectDate={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onRepeat={vi.fn()} onSettings={vi.fn()} />)
    expect(screen.getByText(/هنوز غذایی ثبت نکردهاید/)).toBeInTheDocument()
  })

  it('shows logged meals, calories and macro totals', () => {
    const state = { ...initialState(), entries: [entry] }
    render(<Dashboard state={state} today={today} selectedDate={dateKey(today)} onSelectDate={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onRepeat={vi.fn()} onSettings={vi.fn()} />)
    expect(screen.getByText('قورمه سبزی')).toBeInTheDocument()
    expect(screen.getAllByText(/۵۲۲/).length).toBeGreaterThan(0)
    expect(screen.getByText(/۱ وعده/)).toBeInTheDocument()
  })
})
