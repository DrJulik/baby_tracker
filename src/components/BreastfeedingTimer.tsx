import type { BreastSide, FeedingRound } from '../types'

interface BreastfeedingTimerProps {
  isOpen: boolean
  isRunning: boolean
  isPaused: boolean
  side: BreastSide
  formattedTime: string
  formattedRoundTime: string
  rounds: FeedingRound[]
  lastSide?: BreastSide
  onStart: (side: BreastSide) => void
  onPause: () => void
  onResume: () => void
  onSwitchSide: () => void
  onStop: () => void
  onCancel: () => void
  onClose: () => void
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function BreastfeedingTimer({
  isOpen,
  isRunning,
  isPaused,
  side,
  formattedTime,
  formattedRoundTime,
  rounds,
  lastSide,
  onStart,
  onPause,
  onResume,
  onSwitchSide,
  onStop,
  onCancel,
  onClose,
}: BreastfeedingTimerProps) {
  if (!isOpen) return null

  const suggestedSide: BreastSide = lastSide === 'left' ? 'right' : 'left'

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
            <span>🍼</span> Breastfeeding
          </h2>
          <button
            onClick={isRunning ? onClose : onCancel}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-ink-soft hover:bg-hover transition-colors cursor-pointer"
          >
            {isRunning ? '−' : '✕'}
          </button>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-6">
          <div className="text-6xl font-mono font-bold text-ink tracking-wider">
            {formattedTime}
          </div>
          {isRunning && (
            <div className="mt-2 text-ink-soft text-sm">
              {isPaused ? 'Paused' : 'Recording...'}
            </div>
          )}
        </div>

        {/* Side Selection / Display */}
        {!isRunning ? (
          <>
            {lastSide && (
              <p className="text-center text-sm text-ink-soft mb-3">
                Last session: <span className="font-medium capitalize">{lastSide}</span> side
                <span className="mx-2">•</span>
                Start with <span className="font-medium capitalize">{suggestedSide}</span>?
              </p>
            )}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => onStart('left')}
                className={`py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-200 cursor-pointer border-2 ${
                  suggestedSide === 'left'
                    ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700'
                    : 'bg-muted text-ink border-line hover:bg-hover'
                }`}
              >
                ◀️ Left
              </button>
              <button
                onClick={() => onStart('right')}
                className={`py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-200 cursor-pointer border-2 ${
                  suggestedSide === 'right'
                    ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700'
                    : 'bg-muted text-ink border-line hover:bg-hover'
                }`}
              >
                Right ▶️
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Current Round Display */}
            <div className="bg-muted rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-ink-soft">Current round</span>
                <span className="font-mono font-bold text-ink">{formattedRoundTime}</span>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={onSwitchSide}
                  className="flex items-center gap-4 px-6 py-3 rounded-xl bg-rose-100 dark:bg-rose-900/30 border-2 border-rose-300 dark:border-rose-700 cursor-pointer hover:scale-105 transition-transform"
                >
                  <span className={`text-2xl transition-opacity ${side === 'left' ? 'opacity-100' : 'opacity-30'}`}>
                    ◀️
                  </span>
                  <span className="font-semibold text-rose-800 dark:text-rose-300 capitalize">
                    {side}
                  </span>
                  <span className={`text-2xl transition-opacity ${side === 'right' ? 'opacity-100' : 'opacity-30'}`}>
                    ▶️
                  </span>
                </button>
              </div>
              <p className="text-center text-xs text-ink-soft mt-2">
                Tap to switch sides (starts new round)
              </p>
            </div>

            {/* Completed Rounds */}
            {rounds.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-ink-soft mb-2">Completed rounds:</p>
                <div className="flex flex-wrap gap-2">
                  {rounds.map((round, i) => (
                    <span 
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted text-xs text-ink"
                    >
                      {round.side === 'left' ? '◀️' : '▶️'}
                      {formatDuration(round.duration)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {isPaused ? (
                <button
                  onClick={onResume}
                  className="py-4 px-6 rounded-2xl bg-emerald-500 text-white font-semibold text-lg hover:bg-emerald-600 transition-colors cursor-pointer"
                >
                  ▶️ Resume
                </button>
              ) : (
                <button
                  onClick={onPause}
                  className="py-4 px-6 rounded-2xl bg-amber-500 text-white font-semibold text-lg hover:bg-amber-600 transition-colors cursor-pointer"
                >
                  ⏸️ Pause
                </button>
              )}
              <button
                onClick={onStop}
                className="py-4 px-6 rounded-2xl bg-linear-to-r from-accent to-accent-bold text-white font-semibold text-lg hover:shadow-lg transition-all cursor-pointer"
              >
                ⏹️ Save
              </button>
            </div>

            {/* Cancel */}
            <button
              onClick={onCancel}
              className="w-full mt-3 py-2 text-sm text-ink-soft hover:text-red-500 transition-colors cursor-pointer"
            >
              Cancel session
            </button>
          </>
        )}
      </div>
    </div>
  )
}
