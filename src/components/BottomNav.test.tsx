import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import BottomNav from './BottomNav'

describe('BottomNav', () => {
  it('marks the active tab and reports tab changes', () => {
    const onChange = vi.fn()
    render(<BottomNav active="home" onChange={onChange} todayCount={2} />)
    expect(screen.getByText('ثبت روزانه').closest('button')).toHaveAttribute('aria-current', 'page')
    fireEvent.click(screen.getByText('تنظیمات'))
    expect(onChange).toHaveBeenCalledWith('settings')
  })
})
