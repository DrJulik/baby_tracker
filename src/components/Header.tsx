import { DatePicker } from './DatePicker'

export type ViewMode = 'log' | 'stats'

interface HeaderProps {
  isDark: boolean
  onToggleTheme: () => void
  activeView: ViewMode
  onViewChange: (view: ViewMode) => void
  selectedDate: Date | null
  onDateChange: (date: Date | null) => void
}

export function Header({ isDark, onToggleTheme, activeView, onViewChange, selectedDate, onDateChange }: HeaderProps) {
  return (
    <header className="shrink-0 bg-surface border-b border-line transition-colors duration-300">
      <div className="mx-auto px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-ink tracking-tight">
              Baby Tracker
            </h1>
            <DatePicker selectedDate={selectedDate} onDateChange={onDateChange} />
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-muted rounded-full p-1 border border-line">
              <button
                onClick={() => onViewChange('log')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeView === 'log'
                    ? 'bg-ink text-surface shadow-sm'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                📋 Log
              </button>
              <button
                onClick={() => onViewChange('stats')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeView === 'stats'
                    ? 'bg-ink text-surface shadow-sm'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                📊 Stats
              </button>
            </div>
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="w-10 h-10 rounded-full bg-muted border border-line flex items-center justify-center text-lg hover:scale-110 active:scale-95 transition-all cursor-pointer"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
