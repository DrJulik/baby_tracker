import type { BabyEvent, FeedingRound, PumpingRound } from '../types'
import { eventConfig } from '../types'
import { formatTime } from '../utils/formatters'

interface EventCardProps {
  event: BabyEvent
  index: number
  onDelete: (id: string) => void
}

function formatDurationMMSS(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatDurationHHMM(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

function aggregateRoundsBySide(rounds: FeedingRound[]): { left: number; right: number } {
  return rounds.reduce(
    (acc, round) => {
      acc[round.side] += round.duration
      return acc
    },
    { left: 0, right: 0 }
  )
}

function aggregatePumpingBySide(rounds: PumpingRound[]): { left: number; right: number } {
  return rounds.reduce(
    (acc, round) => {
      acc[round.side] += round.amount
      return acc
    },
    { left: 0, right: 0 }
  )
}

export function EventCard({ event, index, onDelete }: EventCardProps) {
  const isBreastfeeding = event.type === 'breastfeeding'
  const isBottle = event.type === 'bottle'
  const isSleep = event.type === 'sleep'
  const isPumping = event.type === 'pumping'
  const hasRounds = isBreastfeeding && event.rounds && event.rounds.length > 0
  const hasPumpingRounds = isPumping && event.pumpingRounds && event.pumpingRounds.length > 0
  const hasDuration = event.duration && event.duration > 0
  const hasAmount = (isBottle || isPumping) && event.amount && event.amount > 0

  // Aggregate time by side
  const sideTotals = hasRounds ? aggregateRoundsBySide(event.rounds!) : null
  const pumpingSideTotals = hasPumpingRounds ? aggregatePumpingBySide(event.pumpingRounds!) : null

  return (
    <div
      className="group bg-card backdrop-blur-sm rounded-2xl p-4 border border-line-soft shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${eventConfig[event.type].color} border`}>
          {eventConfig[event.type].emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium text-ink">
              {eventConfig[event.type].label}
            </span>
            <span className="text-sm text-ink-soft">
              {formatTime(event.timestamp)}
            </span>
          </div>
          
          {/* Breastfeeding details with rounds */}
          {isBreastfeeding && (hasRounds || hasDuration) && (
            <div className="mt-2 text-sm text-ink-soft">
              {sideTotals ? (
                <div className="flex items-center gap-3">
                  {sideTotals.left > 0 && (
                    <span className="flex items-center gap-1">
                      <span>◀️</span>
                      <span>{formatDurationMMSS(sideTotals.left)}</span>
                    </span>
                  )}
                  {sideTotals.right > 0 && (
                    <span className="flex items-center gap-1">
                      <span>▶️</span>
                      <span>{formatDurationMMSS(sideTotals.right)}</span>
                    </span>
                  )}
                  <span className="opacity-50">
                    (Total: {formatDurationMMSS(event.duration || 0)})
                  </span>
                </div>
              ) : hasDuration ? (
                <div className="flex items-center gap-2">
                  {event.side && (
                    <span className="flex items-center gap-1">
                      {event.side === 'left' ? '◀️' : '▶️'}
                      <span className="capitalize">{event.side}</span>
                    </span>
                  )}
                  <span>{formatDurationMMSS(event.duration!)}</span>
                </div>
              ) : null}
            </div>
          )}

          {/* Sleep duration */}
          {isSleep && hasDuration && (
            <div className="mt-2 text-sm text-ink-soft flex items-center gap-2">
              <span>Slept for</span>
              <span className="font-medium text-ink">{formatDurationHHMM(event.duration!)}</span>
            </div>
          )}

          {/* Bottle amount */}
          {isBottle && hasAmount && (
            <div className="mt-2 text-sm text-ink-soft flex items-center gap-2">
              <span className="font-medium text-ink">{event.amount} ml</span>
            </div>
          )}

          {/* Pumping details */}
          {isPumping && (hasPumpingRounds || hasAmount) && (
            <div className="mt-2 text-sm text-ink-soft">
              {pumpingSideTotals ? (
                <div className="flex items-center gap-3">
                  {pumpingSideTotals.left > 0 && (
                    <span className="flex items-center gap-1">
                      <span>◀️</span>
                      <span>{pumpingSideTotals.left} ml</span>
                    </span>
                  )}
                  {pumpingSideTotals.right > 0 && (
                    <span className="flex items-center gap-1">
                      <span>▶️</span>
                      <span>{pumpingSideTotals.right} ml</span>
                    </span>
                  )}
                  <span className="opacity-50">
                    (Total: {event.amount || 0} ml)
                  </span>
                </div>
              ) : hasAmount ? (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-ink">{event.amount} ml</span>
                  {hasDuration && (
                    <span className="opacity-50">
                      in {formatDurationMMSS(event.duration!)}
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          )}
          
          {event.notes && (
            <p className="text-sm text-ink-soft mt-1 truncate">
              {event.notes}
            </p>
          )}
        </div>
        <button
          onClick={() => onDelete(event.id)}
          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-ink-soft hover:text-red-500 transition-all duration-200 cursor-pointer"
          aria-label="Delete event"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}
