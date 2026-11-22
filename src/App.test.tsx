import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the home screen and logs a meal end to end', () => {
    render(<App />)
    expect(screen.getByText('کالری‌شمار روزمره')).toBeInTheDocument()
    const input = screen.getByLabelText('غذاهای خورده شده را به فارسی بنویسید')
    fireEvent.change(input, { target: { value: 'یک لیوان شیر' } })
    fireEvent.click(screen.getByRole('button', { name: /ثبت وعده/ }))
    expect(screen.getAllByText('شیر').length).toBeGreaterThan(0)
    expect(screen.getByText(/ثبت شد/)).toBeInTheDocument()
  })
})
