import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Analytics from './Analytics'
import { dateKey, fa } from '../utils/format'
import { initialState } from '../utils/storage'

describe('Analytics', () => {
  it('computes the weekly average and macro split', () => {
    const today = new Date()
    const state = {
      ...initialState(),
      entries: [{
        id: 'e1', date: dateKey(today), meal: 'ناهار' as const, loggedAt: today.getTime(),
        items: [{ foodId: 'x', foodName: 'غذا', quantity: 1, unit: 'عدد', unitGrams: 100,
          grams: 100, kcal: 700, protein: 40, carbs: 60, fat: 30 }],
      }],
    }
    render(<Analytics state={state} />)
    expect(screen.getByText(/ترکیب درشت مغذی/)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(fa(100)))).toBeInTheDocument()
  })
})
