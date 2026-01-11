import type { BabyEvent } from '../types'
import { formatDate } from '../utils/formatters'
import { EventCard } from './EventCard'

interface EventListProps {
  events: BabyEvent[]
  filteredEvents: BabyEvent[]
  onDeleteEvent: (id: string) => void
}

export function EventList({ events, filteredEvents, onDeleteEvent }: EventListProps) {
  // Group events by date
  const groupedEvents = filteredEvents.reduce((groups, event) => {
    const dateKey = event.timestamp.toDateString()
    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(event)
    return groups
  }, {} as Record<string, BabyEvent[]>)

  if (events.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="text-6xl mb-4 animate-float">🌙</div>
        <h2 className="font-serif text-xl text-ink mb-2">No events yet</h2>
        <p className="text-ink-soft text-sm">
          Tap the + button to log your first event
        </p>
      </div>
    )
  }

  if (filteredEvents.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="font-serif text-xl text-ink mb-2">No matching events</h2>
        <p className="text-ink-soft text-sm">
          Try selecting different filters
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents).map(([dateKey, dayEvents]) => (
        <section key={dateKey} className="animate-fade-in">
          <h2 className="font-serif text-sm font-medium text-ink-soft mb-3 uppercase tracking-wider">
            {formatDate(new Date(dateKey))}
          </h2>
          <div className="space-y-2.5">
            {dayEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                index={index}
                onDelete={onDeleteEvent}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
