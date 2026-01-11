import type { BreastSide } from '../types'

interface MiniTimerProps {
  isVisible: boolean
  isPaused: boolean
  side: BreastSide
  formattedTime: string
  onClick: () => void
  onStop: () => void
  offsetIndex?: number
}

export function MiniTimer({
  isVisible,
  isPaused,
  side,
  formattedTime,
  onClick,
  onStop,
  offsetIndex = 0,
}: MiniTimerProps) {
  if (!isVisible) return null

  // Each timer is ~48px tall, add 56px offset per index for spacing
  const bottomOffset = 24 + (offsetIndex * 56)

  return (
    <div 
      className="fixed right-24 z-20 animate-slide-up transition-all duration-300"
      style={{ bottom: `${bottomOffset}px` }}
    >
      <div 
        className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-rose-100 dark:bg-rose-900/50 border-2 border-rose-300 dark:border-rose-700 shadow-lg cursor-pointer hover:scale-105 transition-transform"
        onClick={onClick}
      >
        <span className="text-lg">🤱</span>
        <span className="font-mono font-bold text-rose-800 dark:text-rose-300">
          {formattedTime}
        </span>
        <span className="text-rose-600 dark:text-rose-400 text-xs capitalize">
          {side === 'left' ? '◀' : '▶'}
        </span>
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
          className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors text-sm"
          aria-label="Stop and save"
        >
          ✓
        </button>
      </div>
    </div>
  )
}
