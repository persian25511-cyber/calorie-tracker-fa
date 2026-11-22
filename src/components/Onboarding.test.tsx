import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import Onboarding from './Onboarding'

describe('Onboarding', () => {
  it('walks through the three steps and saves the goal', () => {
    const onDone = vi.fn()
    render(<Onboarding onDone={onDone} />)
    expect(screen.getByText(/هدف روزانهٔ شما چقدر است/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'بعدی' }))
    expect(screen.getByText(/غذایتان را بنویسید/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'بعدی' }))
    fireEvent.click(screen.getByRole('button', { name: /شروع میکنم/ }))
    expect(onDone).toHaveBeenCalledWith(2000)
  })
})
