interface SleepTimerProps {
  isOpen: boolean
  isRunning: boolean
  formattedTime: string
  onStart: () => void
  onStop: () => void
  onCancel: () => void
  onClose: () => void
}

export function SleepTimer({
  isOpen,
  isRunning,
  formattedTime,
  onStart,
  onStop,
  onCancel,
  onClose,
}: SleepTimerProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={isRunning ? onClose : onCancel}
      />
      <div className="relative w-full max-w-sm mx-4 bg-card-solid rounded-3xl p-6 shadow-2xl animate-slide-up border border-line transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl font-semibold text-ink flex items-center gap-2">
            <span>😴</span> Sleep Tracking
          </h2>
          <button
            onClick={isRunning ? onClose : onCancel}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-ink-soft hover:bg-hover transition-colors cursor-pointer"
          >
            {isRunning ? '−' : '✕'}
          </button>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-8">
          <div className="text-6xl font-mono font-bold text-ink tracking-wider">
            {formattedTime}
          </div>
          {isRunning && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              <span className="text-ink-soft text-sm">Baby is sleeping...</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {!isRunning ? (
          <div className="space-y-3">
            <button
              onClick={onStart}
              className="w-full py-4 px-6 rounded-2xl bg-indigo-500 text-white font-semibold text-lg hover:bg-indigo-600 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🌙</span> Baby Fell Asleep
            </button>
            <p className="text-center text-xs text-ink-soft">
              Start tracking when your baby falls asleep
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={onStop}
              className="w-full py-4 px-6 rounded-2xl bg-linear-to-r from-accent to-accent-bold text-white font-semibold text-lg hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>☀️</span> Baby Woke Up
            </button>
            <button
              onClick={onCancel}
              className="w-full py-2 text-sm text-ink-soft hover:text-red-500 transition-colors cursor-pointer"
            >
              Cancel (don't save)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
