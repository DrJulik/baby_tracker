import type { BabyEvent, EventType, FeedingRound } from '../types'
import { eventConfig, EVENT_TYPES } from '../types'
import { formatTime, getTimeSince } from '../utils/formatters'

interface TimeSinceCardsProps {
  getLastEventByType: (type: EventType) => BabyEvent | undefined
  currentTime: Date
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

export function TimeSinceCards({ getLastEventByType, currentTime }: TimeSinceCardsProps) {
  return (
    <div className="mb-6 animate-fade-in">
      <h2 className="font-serif text-sm font-medium text-ink-soft mb-3 uppercase tracking-wider">
        Time Since Last
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {EVENT_TYPES.map(type => {
          const lastEvent = getLastEventByType(type)
          const isBreastfeeding = type === 'breastfeeding'
          const isSleep = type === 'sleep'
          const hasRounds = isBreastfeeding && lastEvent?.rounds && lastEvent.rounds.length > 0
          const sideTotals = hasRounds ? aggregateRoundsBySide(lastEvent!.rounds!) : null
          
          return (
            <div
              key={type}
              className={`rounded-2xl p-4 border ${eventConfig[type].color} transition-all duration-300`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{eventConfig[type].emoji}</span>
                <span className="font-medium text-sm">{eventConfig[type].label}</span>
              </div>
              <div className="text-lg font-semibold">
                {lastEvent ? getTimeSince(lastEvent.timestamp, currentTime) : '—'}
              </div>
              {lastEvent && (
                <div className="text-xs opacity-70 mt-1">
                  {formatTime(lastEvent.timestamp)}
                </div>
              )}
              {/* Breastfeeding-specific info */}
              {isBreastfeeding && lastEvent && (sideTotals || lastEvent.duration) && (
                <div className="mt-2 pt-2 border-t border-current/20 text-xs space-y-1">
                  {sideTotals ? (
                    <div className="flex items-center gap-2">
                      {sideTotals.left > 0 && (
                        <span className="flex items-center gap-0.5">
                          <span>◀️</span>
                          <span>{formatDurationMMSS(sideTotals.left)}</span>
                        </span>
                      )}
                      {sideTotals.right > 0 && (
                        <span className="flex items-center gap-0.5">
                          <span>▶️</span>
                          <span>{formatDurationMMSS(sideTotals.right)}</span>
                        </span>
                      )}
                    </div>
                  ) : lastEvent.side && (
                    <div className="flex items-center gap-1">
                      <span>{lastEvent.side === 'left' ? '◀️' : '▶️'}</span>
                      <span className="capitalize">{lastEvent.side}</span>
                    </div>
                  )}
                  {lastEvent.duration && (
                    <div className="opacity-70">
                      Total: {formatDurationMMSS(lastEvent.duration)}
                    </div>
                  )}
                </div>
              )}
              {/* Sleep-specific info */}
              {isSleep && lastEvent?.duration && (
                <div className="mt-2 pt-2 border-t border-current/20 text-xs">
                  <div className="opacity-70">
                    Slept: {formatDurationHHMM(lastEvent.duration)}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
