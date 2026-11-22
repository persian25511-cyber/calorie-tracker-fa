import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import QuickLog from './QuickLog'
import { IRANIAN_FOODS } from '../data/iranianFoods'
import type { ParsedItem } from '../utils/persianFoodParser'

const setup = () => {
  const onLog = vi.fn()
  render(<QuickLog foods={IRANIAN_FOODS} suggestions={[]} onLog={onLog} />)
  const input = screen.getByLabelText('غذاهای خورده شده را به فارسی بنویسید')
  fireEvent.change(input, { target: { value: 'دو کفگیر قورمه سبزی و یک کف دست سنگک' } })
  return { onLog, input }
}

describe('QuickLog', () => {
  it('shows live chips with Persian totals', () => {
    setup()
    expect(screen.getByText('قورمه سبزی')).toBeInTheDocument()
    expect(screen.getByText('نان سنگک')).toBeInTheDocument()
    expect(screen.getByText(/جمع:/).textContent).toContain('۶۳۵')
  })

  it('adjusts quantity and removes an item', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: /افزایش قورمه سبزی/ }))
    expect(screen.getByText(/جمع:/).textContent).toContain('۸۹۶')
    fireEvent.click(screen.getByRole('button', { name: /حذف نان سنگک/ }))
    expect(screen.queryByText('نان سنگک')).not.toBeInTheDocument()
    expect(screen.getByText(/جمع:/).textContent).toContain('۷۸۳')
  })

  it('submits the selected meal and clears the input', () => {
    const { onLog, input } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'شام' }))
    fireEvent.click(screen.getByRole('button', { name: /ثبت وعده/ }))
    expect(onLog).toHaveBeenCalledTimes(1)
    const [items, meal] = onLog.mock.calls[0] as [ParsedItem[], string]
    expect(meal).toBe('شام')
    expect(items.map((i) => i.foodId)).toEqual(['ghormeh-sabzi', 'nan-sangak'])
    expect(input).toHaveValue('')
  })

  it('shows a helpful message for unknown food and disables submit', () => {
    render(<QuickLog foods={IRANIAN_FOODS} suggestions={[]} onLog={vi.fn()} />)
    fireEvent.change(screen.getByLabelText('غذاهای خورده شده را به فارسی بنویسید'), {
      target: { value: 'کفگیر نامشخص' },
    })
    expect(screen.getByText(/غذایی شناسایی نشد/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ثبت وعده/ })).toBeDisabled()
  })
})
