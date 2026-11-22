import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import SettingsPanel from './SettingsPanel'
import { initialState } from '../utils/storage'

const setup = () => {
  const onGoals = vi.fn()
  const onImport = vi.fn()
  const onReset = vi.fn()
  const notify = vi.fn()
  render(<SettingsPanel state={initialState()} onGoals={onGoals} onImport={onImport} onReset={onReset} notify={notify} />)
  return { onGoals, onImport, onReset, notify }
}

describe('SettingsPanel', () => {
  it('edits goals with Persian digits converted back to numbers', () => {
    const { onGoals } = setup()
    const field = screen.getByDisplayValue('۲۰۰۰')
    fireEvent.change(field, { target: { value: '۲۲۰۰' } })
    expect(onGoals).toHaveBeenCalledWith(expect.objectContaining({ kcal: 2200 }))
  })

  it('exports JSON without throwing', () => {
    const { notify } = setup()
    const create = vi.fn(() => 'blob:test')
    Object.defineProperty(URL, 'createObjectURL', { value: create, configurable: true })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    fireEvent.click(screen.getByRole('button', { name: /خروجی JSON/ }))
    expect(create).toHaveBeenCalled()
    expect(notify).toHaveBeenCalled()
    click.mockRestore()
  })

  it('resets only after confirmation', () => {
    const { onReset } = setup()
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    fireEvent.click(screen.getByRole('button', { name: /بازنشانی کامل/ }))
    expect(onReset).not.toHaveBeenCalled()
    confirm.mockReturnValue(true)
    fireEvent.click(screen.getByRole('button', { name: /بازنشانی کامل/ }))
    expect(onReset).toHaveBeenCalled()
    confirm.mockRestore()
  })
})
