import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary'

function Broken(): ReactElement {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  it('shows a Persian fallback instead of a blank screen', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ErrorBoundary><Broken /></ErrorBoundary>)
    expect(screen.getByText('مشکلی پیش آمد')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /بارگذاری مجدد/ })).toBeInTheDocument()
    spy.mockRestore()
  })
})
