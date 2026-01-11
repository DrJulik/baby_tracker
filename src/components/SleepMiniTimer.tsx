interface SleepMiniTimerProps {
  isVisible: boolean
  formattedTime: string
  onClick: () => void
  onStop: () => void
  offsetIndex?: number
}

export function SleepMiniTimer({
  isVisible,
  formattedTime,
  onClick,
  onStop,
  offsetIndex = 0,
}: SleepMiniTimerProps) {
  if (!isVisible) return null

  // Each timer is ~48px tall, add 56px offset per index for spacing
  const bottomOffset = 24 + (offsetIndex * 56)

  return (
    <div 
      className="fixed right-24 z-20 animate-slide-up transition-all duration-300"
      style={{ bottom: `${bottomOffset}px` }}
    >
      <div 
        className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border-2 border-indigo-300 dark:border-indigo-700 shadow-lg cursor-pointer hover:scale-105 transition-transform"
        onClick={onClick}
      >
        <span className="text-lg">😴</span>
        <span className="font-mono font-bold text-indigo-800 dark:text-indigo-300">
          {formattedTime}
        </span>
        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
        <button
          onClick={(e) => {
            e.stopPropagation()
            onStop()
          }}
          className="w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors text-sm"
          aria-label="Stop sleep tracking"
        >
          ☀️
        </button>
      </div>
    </div>
  )
}
