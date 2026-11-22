import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import FoodBank from './FoodBank'
import { IRANIAN_FOODS } from '../data/iranianFoods'

const foods = [IRANIAN_FOODS[0], IRANIAN_FOODS.find((f) => f.id === 'nan-sangak')!]

describe('FoodBank', () => {
  it('lists foods and filters by search', () => {
    render(<FoodBank foods={foods} onSave={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('قورمه سبزی')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('جستجوی غذا'), { target: { value: 'سنگک' } })
    expect(screen.getByText('نان سنگک')).toBeInTheDocument()
    expect(screen.queryByText('قورمه سبزی')).not.toBeInTheDocument()
  })

  it('opens a new-food form and cancels it', () => {
    render(<FoodBank foods={foods} onSave={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /غذای جدید/ }))
    expect(screen.getByText('ذخیره غذا')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'لغو' }))
    expect(screen.queryByText('ذخیره غذا')).not.toBeInTheDocument()
  })

  it('opens the edit form for an existing food', () => {
    const onSave = vi.fn()
    render(<FoodBank foods={foods} onSave={onSave} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /ویرایش قورمه سبزی/ }))
    expect(screen.getByText('ویرایش: قورمه سبزی')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ذخیره غذا' })).toBeInTheDocument()
  })
})
