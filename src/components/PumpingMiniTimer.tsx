import type { BreastSide } from '../types'

interface PumpingMiniTimerProps {
  isVisible: boolean
  isPaused: boolean
  side: BreastSide
  formattedTime: string
  totalAmount: number
  onClick: () => void
  onStop: () => void
  offsetIndex?: number
}

export function PumpingMiniTimer({
  isVisible,
  isPaused,
  side,
  formattedTime,
  totalAmount,
  onClick,
  onStop,
  offsetIndex = 0,
}: PumpingMiniTimerProps) {
  if (!isVisible) return null

  // Each timer is ~48px tall, add 56px offset per index for spacing
  const bottomOffset = 24 + (offsetIndex * 56)

  return (
    <div 
      className="fixed right-24 z-20 animate-slide-up transition-all duration-300"
      style={{ bottom: `${bottomOffset}px` }}
    >
      <div 
        className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-purple-100 dark:bg-purple-900/50 border-2 border-purple-300 dark:border-purple-700 shadow-lg cursor-pointer hover:scale-105 transition-transform"
        onClick={onClick}
      >
        <span className="text-lg">🥛</span>
        <span className="font-mono font-bold text-purple-800 dark:text-purple-300">
          {formattedTime}
        </span>
        <span className="text-purple-600 dark:text-purple-400 text-xs capitalize">
          {side === 'left' ? '◀' : '▶'}
        </span>
        {totalAmount > 0 && (
          <span className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-1.5 py-0.5 rounded-full">
            {totalAmount}ml
          </span>
        )}
        {isPaused && (
          <span className="text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded-full">
            ⏸
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onStop()
          }}
          className="w-7 h-7 rounded-full bg-purple-500 text-white flex items-center justify-center hover:bg-purple-600 transition-colors text-sm"
          aria-label="Stop and save"
        >
          ✓
        </button>
      </div>
    </div>
  )
}
