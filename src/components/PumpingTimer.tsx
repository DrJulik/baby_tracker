import type { BreastSide } from '../types'

interface PumpingTimerProps {
  isOpen: boolean
  isRunning: boolean
  isPaused: boolean
  side: BreastSide
  formattedTime: string
  leftAmount: number
  rightAmount: number
  totalAmount: number
  lastSide?: BreastSide
  onStart: (side: BreastSide) => void
  onPause: () => void
  onResume: () => void
  onSwitchSide: () => void
  onSetAmount: (side: BreastSide, amount: number) => void
  onStop: () => void
  onCancel: () => void
  onClose: () => void
}

export function PumpingTimer({
  isOpen,
  isRunning,
  isPaused,
  side,
  formattedTime,
  leftAmount,
  rightAmount,
  totalAmount,
  lastSide,
  onStart,
  onPause,
  onResume,
  onSwitchSide,
  onSetAmount,
  onStop,
  onCancel,
  onClose,
}: PumpingTimerProps) {
  if (!isOpen) return null

  const suggestedSide: BreastSide = lastSide === 'left' ? 'right' : 'left'

  const quickAmounts = [10, 20, 30, 50, 80, 100]

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
            <span>🥛</span> Pumping
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
                    ? 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700'
                    : 'bg-muted text-ink border-line hover:bg-hover'
                }`}
              >
                ◀️ Left
              </button>
              <button
                onClick={() => onStart('right')}
                className={`py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-200 cursor-pointer border-2 ${
                  suggestedSide === 'right'
                    ? 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700'
                    : 'bg-muted text-ink border-line hover:bg-hover'
                }`}
              >
                Right ▶️
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Current Side Display */}
            <div className="bg-muted rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-ink-soft">Current side</span>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={onSwitchSide}
                  className="flex items-center gap-4 px-6 py-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-300 dark:border-purple-700 cursor-pointer hover:scale-105 transition-transform"
                >
                  <span className={`text-2xl transition-opacity ${side === 'left' ? 'opacity-100' : 'opacity-30'}`}>
                    ◀️
                  </span>
                  <span className="font-semibold text-purple-800 dark:text-purple-300 capitalize">
                    {side}
                  </span>
                  <span className={`text-2xl transition-opacity ${side === 'right' ? 'opacity-100' : 'opacity-30'}`}>
                    ▶️
                  </span>
                </button>
              </div>
              <p className="text-center text-xs text-ink-soft mt-2">
                Tap to switch sides
              </p>
            </div>

            {/* Amount Inputs */}
            <div className="mb-4">
              <p className="text-sm text-ink-soft mb-3">Amounts pumped (ml):</p>
              <div className="grid grid-cols-2 gap-4">
                {/* Left side */}
                <div className={`rounded-xl p-3 border-2 transition-colors ${
                  side === 'left' 
                    ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20' 
                    : 'border-line bg-muted'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span>◀️</span>
                    <span className="text-sm font-medium text-ink">Left</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={leftAmount || ''}
                    placeholder="0"
                    onChange={(e) => onSetAmount('left', Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-lg border border-line bg-card-solid text-ink text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 transition-all"
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {quickAmounts.slice(0, 3).map((amount) => (
                      <button
                        key={amount}
                        onClick={() => onSetAmount('left', leftAmount + amount)}
                        className="flex-1 px-2 py-1 rounded text-xs font-medium bg-card-solid text-ink-soft hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 transition-colors cursor-pointer"
                      >
                        +{amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right side */}
                <div className={`rounded-xl p-3 border-2 transition-colors ${
                  side === 'right' 
                    ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20' 
                    : 'border-line bg-muted'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span>▶️</span>
                    <span className="text-sm font-medium text-ink">Right</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={rightAmount || ''}
                    placeholder="0"
                    onChange={(e) => onSetAmount('right', Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-lg border border-line bg-card-solid text-ink text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 transition-all"
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {quickAmounts.slice(0, 3).map((amount) => (
                      <button
                        key={amount}
                        onClick={() => onSetAmount('right', rightAmount + amount)}
                        className="flex-1 px-2 py-1 rounded text-xs font-medium bg-card-solid text-ink-soft hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 transition-colors cursor-pointer"
                      >
                        +{amount}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Total */}
              {totalAmount > 0 && (
                <div className="mt-3 text-center text-sm text-ink-soft">
                  Total: <span className="font-bold text-ink">{totalAmount} ml</span>
                </div>
              )}
            </div>

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
