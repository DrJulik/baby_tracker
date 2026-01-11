import type { EventType } from '../types'
import { eventConfig, EVENT_TYPES } from '../types'

interface FilterBarProps {
  activeFilters: Set<EventType>
  onFilterChange: (type: EventType) => void
  onClearFilters: () => void
  getCountByType: (type: EventType) => number
  selectedDate: Date | null
}

function getDateLabel(date: Date | null): string {
  if (!date) return 'in total'
  
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) return 'today'
  if (date.toDateString() === yesterday.toDateString()) return 'yesterday'
  
  return `on ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

export function FilterBar({ 
  activeFilters, 
  onFilterChange, 
  onClearFilters,
  getCountByType,
  selectedDate
}: FilterBarProps) {
  const dateLabel = getDateLabel(selectedDate)

  const summaryText: Record<EventType, (count: number) => string> = {
    diaper: (count) => `You changed diaper ${count} time${count !== 1 ? 's' : ''} ${dateLabel}`,
    pee: (count) => `Your baby peed ${count} time${count !== 1 ? 's' : ''} ${dateLabel}`,
    poop: (count) => `Your baby pooped ${count} time${count !== 1 ? 's' : ''} ${dateLabel}`,
    breastfeeding: (count) => `You breastfed ${count} time${count !== 1 ? 's' : ''} ${dateLabel}`,
    bottle: (count) => `You bottle fed ${count} time${count !== 1 ? 's' : ''} ${dateLabel}`,
    sleep: (count) => `Your baby slept ${count} time${count !== 1 ? 's' : ''} ${dateLabel}`,
    pumping: (count) => `You pumped ${count} time${count !== 1 ? 's' : ''} ${dateLabel}`,
  }

  return (
    <div className="shrink-0 bg-surface border-b border-line transition-colors duration-300">
      <div className="mx-auto px-5 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={onClearFilters}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeFilters.size === 0
                ? 'bg-ink text-surface shadow-sm'
                : 'bg-card border border-line text-ink-soft hover:bg-hover'
            }`}
          >
            All
          </button>
          {EVENT_TYPES.map(type => (
            <button
              key={type}
              onClick={() => onFilterChange(type)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeFilters.has(type)
                  ? `${eventConfig[type].color} border shadow-sm`
                  : 'bg-card border border-line text-ink-soft hover:bg-hover'
              }`}
            >
              <span>{eventConfig[type].emoji}</span>
              <span>{eventConfig[type].label}</span>
            </button>
          ))}
        </div>

        {/* Filter Summary */}
        {activeFilters.size > 0 && (
          <div className="mt-3 space-y-1">
            {Array.from(activeFilters).map(type => {
              const count = getCountByType(type)
              return (
                <p key={type} className="text-sm text-ink flex items-center gap-2">
                  <span>{eventConfig[type].emoji}</span>
                  <span>{summaryText[type](count)}</span>
                </p>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
