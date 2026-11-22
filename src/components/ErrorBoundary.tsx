import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'

type Props = { children: ReactNode }
type State = { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('خطای غیرمنتظره:', error.message, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6 text-center">
        <div className="card max-w-sm p-6">
          <p className="text-3xl">⚠️</p>
          <h1 className="mt-2 text-base font-bold">مشکلی پیش آمد</h1>
          <p className="mt-1 text-xs leading-6 text-[var(--muted)]">
            دادههای شما دستنخورده باقی ماندهاند. بارگذاری مجدد صفحه معمولاً مشکل را حل میکند.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-primary mt-4 flex w-full items-center justify-center gap-2 text-sm"
          >
            <RotateCcw size={15} /> بارگذاری مجدد
          </button>
        </div>
      </div>
    )
  }
}
