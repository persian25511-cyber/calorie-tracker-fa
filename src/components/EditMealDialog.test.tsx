import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import EditMealDialog from './EditMealDialog'
import { IRANIAN_FOODS } from '../data/iranianFoods'
import { dateKey } from '../utils/format'
import type { MealEntry } from '../utils/storage'

const entry: MealEntry = {
  id: 'e1', date: dateKey(new Date(2026, 10, 22)), meal: 'ناهار', loggedAt: 1,
  items: [{ foodId: 'ghormeh-sabzi', foodName: 'قورمه سبزی', quantity: 1, unit: 'کفگیر',
    unitGrams: 180, grams: 180, kcal: 261, protein: 11, carbs: 22, fat: 15 }],
}

describe('EditMealDialog', () => {
  it('recalculates macros when quantity changes and saves', () => {
    const onSave = vi.fn()
    render(<EditMealDialog entry={entry} foods={IRANIAN_FOODS} onSave={onSave} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /افزایش قورمه سبزی/ }))
    fireEvent.click(screen.getByRole('button', { name: /ذخیره تغییرات/ }))
    const saved = onSave.mock.calls[0][0] as MealEntry
    expect(saved.items[0].quantity).toBe(2)
    expect(saved.items[0].kcal).toBe(522)
  })

  it('can change the meal type and close', () => {
    const onClose = vi.fn()
    render(<EditMealDialog entry={entry} foods={IRANIAN_FOODS} onSave={vi.fn()} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'شام' }))
    fireEvent.click(screen.getByRole('button', { name: 'بستن' }))
    expect(onClose).toHaveBeenCalled()
  })
})
