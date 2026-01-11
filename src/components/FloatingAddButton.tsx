import { useState } from 'react'
import type { EventType } from '../types'
import { eventConfig, QUICK_ADD_TYPES } from '../types'

interface FloatingAddButtonProps {
  onQuickAdd: (type: EventType) => void
  onOpenModal: () => void
  onOpenBreastfeedingTimer: () => void
  onOpenSleepTimer: () => void
  onOpenPumpingTimer: () => void
  isBreastfeedingTimerRunning: boolean
  isSleepTimerRunning: boolean
  isPumpingTimerRunning: boolean
}

export function FloatingAddButton({ 
  onQuickAdd, 
  onOpenModal, 
  onOpenBreastfeedingTimer,
  onOpenSleepTimer,
  onOpenPumpingTimer,
  isBreastfeedingTimerRunning,
  isSleepTimerRunning,
  isPumpingTimerRunning,
}: FloatingAddButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleQuickAdd = (type: EventType) => {
    onQuickAdd(type)
    setIsExpanded(false)
  }

  const handleBreastfeeding = () => {
    setIsExpanded(false)
    onOpenBreastfeedingTimer()
  }

  const handleSleep = () => {
    setIsExpanded(false)
    onOpenSleepTimer()
  }

  const handlePumping = () => {
    setIsExpanded(false)
    onOpenPumpingTimer()
  }

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Speed Dial Container */}
      <div className="fixed bottom-6 right-6 z-30">
        {/* Quick add buttons - positioned above the FAB */}
        {isExpanded && (
          <div className="absolute bottom-20 right-0 flex flex-col gap-3">
            {/* Quick add buttons for non-timer events */}
            {QUICK_ADD_TYPES.map((type, index) => (
              <button
                key={type}
                onClick={() => handleQuickAdd(type)}
                className="flex items-center justify-end gap-3 cursor-pointer group"
                style={{ 
                  animation: `slideUp 0.2s ease-out ${index * 0.05}s both`
                }}
              >
                <span className="bg-card-solid px-3 py-1.5 rounded-lg shadow-md text-sm font-medium text-ink opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity whitespace-nowrap border border-line">
                  {eventConfig[type].label}
                </span>
                <div className={`w-14 h-14 rounded-full ${eventConfig[type].color} border-2 shadow-lg flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition-transform`}>
                  {eventConfig[type].emoji}
                </div>
              </button>
            ))}
            
            {/* Breastfeeding - opens timer */}
            <button
              onClick={handleBreastfeeding}
              className="flex items-center justify-end gap-3 cursor-pointer group"
              style={{ 
                animation: `slideUp 0.2s ease-out ${QUICK_ADD_TYPES.length * 0.05}s both`
              }}
            >
              <span className="bg-card-solid px-3 py-1.5 rounded-lg shadow-md text-sm font-medium text-ink opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity whitespace-nowrap border border-line">
                {isBreastfeedingTimerRunning ? 'View Timer' : 'Start Feeding'}
              </span>
              <div className={`w-14 h-14 rounded-full ${eventConfig.breastfeeding.color} border-2 shadow-lg flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition-transform relative`}>
                {eventConfig.breastfeeding.emoji}
                {isBreastfeedingTimerRunning && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </div>
            </button>

            {/* Sleep - opens timer */}
            <button
              onClick={handleSleep}
              className="flex items-center justify-end gap-3 cursor-pointer group"
              style={{ 
                animation: `slideUp 0.2s ease-out ${(QUICK_ADD_TYPES.length + 1) * 0.05}s both`
              }}
            >
              <span className="bg-card-solid px-3 py-1.5 rounded-lg shadow-md text-sm font-medium text-ink opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity whitespace-nowrap border border-line">
                {isSleepTimerRunning ? 'View Sleep' : 'Start Sleep'}
              </span>
              <div className={`w-14 h-14 rounded-full ${eventConfig.sleep.color} border-2 shadow-lg flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition-transform relative`}>
                {eventConfig.sleep.emoji}
                {isSleepTimerRunning && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </div>
            </button>

            {/* Pumping - opens timer */}
            <button
              onClick={handlePumping}
              className="flex items-center justify-end gap-3 cursor-pointer group"
              style={{ 
                animation: `slideUp 0.2s ease-out ${(QUICK_ADD_TYPES.length + 2) * 0.05}s both`
              }}
            >
              <span className="bg-card-solid px-3 py-1.5 rounded-lg shadow-md text-sm font-medium text-ink opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity whitespace-nowrap border border-line">
                {isPumpingTimerRunning ? 'View Pumping' : 'Start Pumping'}
              </span>
              <div className={`w-14 h-14 rounded-full ${eventConfig.pumping.color} border-2 shadow-lg flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition-transform relative`}>
                {eventConfig.pumping.emoji}
                {isPumpingTimerRunning && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </div>
            </button>

            {/* Open full modal option */}
            <button
              onClick={() => {
                setIsExpanded(false)
                onOpenModal()
              }}
              className="flex items-center justify-end gap-3 cursor-pointer group"
              style={{ 
                animation: `slideUp 0.2s ease-out ${(QUICK_ADD_TYPES.length + 3) * 0.05}s both`
              }}
            >
              <span className="bg-card-solid px-3 py-1.5 rounded-lg shadow-md text-sm font-medium text-ink opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity whitespace-nowrap border border-line">
                More options...
              </span>
              <div className="w-14 h-14 rounded-full bg-muted border-2 border-line shadow-lg flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition-transform">
                ⚙️
              </div>
            </button>
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-16 h-16 rounded-full bg-linear-to-br from-accent to-accent-bold text-white shadow-lg shadow-orange-500/30 flex items-center justify-center text-3xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer ${isExpanded ? 'rotate-45' : ''}`}
          aria-label={isExpanded ? 'Close menu' : 'Add new event'}
        >
          <span className="relative -top-0.5">+</span>
        </button>
      </div>
    </>
  )
}
