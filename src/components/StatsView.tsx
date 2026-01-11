import type { BabyEvent, EventType } from '../types'
import { eventConfig, EVENT_TYPES } from '../types'

interface StatsViewProps {
  events: BabyEvent[]
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

function formatHour(hour: number): string {
  if (hour === 0) return '12am'
  if (hour === 12) return '12pm'
  return hour < 12 ? `${hour}am` : `${hour - 12}pm`
}

export function StatsView({ events }: StatsViewProps) {
  const today = new Date()
  const todayStr = today.toDateString()
  
  // Get last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() - (6 - i))
    return date
  })

  // Today's counts by type
  const todayCounts = EVENT_TYPES.reduce((acc, type) => {
    acc[type] = events.filter(e => e.type === type && e.timestamp.toDateString() === todayStr).length
    return acc
  }, {} as Record<EventType, number>)

  // Weekly data by type
  const weeklyData = last7Days.map(date => {
    const dateStr = date.toDateString()
    const counts = EVENT_TYPES.reduce((acc, type) => {
      acc[type] = events.filter(e => e.type === type && e.timestamp.toDateString() === dateStr).length
      return acc
    }, {} as Record<EventType, number>)
    return {
      date,
      dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' }),
      ...counts,
      total: Object.values(counts).reduce((a, b) => a + b, 0),
    }
  })

  const maxDailyTotal = Math.max(...weeklyData.map(d => d.total), 1)

  // Breastfeeding stats
  const breastfeedingEvents = events.filter(e => e.type === 'breastfeeding' && e.duration)
  const avgFeedingDuration = breastfeedingEvents.length > 0
    ? Math.round(breastfeedingEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / breastfeedingEvents.length)
    : 0

  // Time between feedings (last 10 feedings)
  const recentFeedings = breastfeedingEvents.slice(0, 10)
  const feedingIntervals: number[] = []
  for (let i = 0; i < recentFeedings.length - 1; i++) {
    const interval = recentFeedings[i].timestamp.getTime() - recentFeedings[i + 1].timestamp.getTime()
    feedingIntervals.push(interval / (1000 * 60 * 60)) // hours
  }
  const avgHoursBetweenFeedings = feedingIntervals.length > 0
    ? (feedingIntervals.reduce((a, b) => a + b, 0) / feedingIntervals.length).toFixed(1)
    : null

  // Activity by hour of day (last 7 days)
  const hourlyActivity = Array(24).fill(0)
  const last7DaysEvents = events.filter(e => {
    const daysAgo = (today.getTime() - e.timestamp.getTime()) / (1000 * 60 * 60 * 24)
    return daysAgo <= 7
  })
  last7DaysEvents.forEach(e => {
    hourlyActivity[e.timestamp.getHours()]++
  })
  const maxHourly = Math.max(...hourlyActivity, 1)

  // Find peak hours
  const peakHour = hourlyActivity.indexOf(Math.max(...hourlyActivity))

  // Side preference (for breastfeeding)
  const leftCount = events.filter(e => e.type === 'breastfeeding' && e.side === 'left').length
  const rightCount = events.filter(e => e.type === 'breastfeeding' && e.side === 'right').length
  const totalSided = leftCount + rightCount

  // Sleep stats
  const sleepEvents = events.filter(e => e.type === 'sleep' && e.duration)
  const todaySleepEvents = sleepEvents.filter(e => e.timestamp.toDateString() === todayStr)
  const totalSleepToday = todaySleepEvents.reduce((sum, e) => sum + (e.duration || 0), 0)
  
  const avgSleepDuration = sleepEvents.length > 0
    ? Math.round(sleepEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / sleepEvents.length)
    : 0

  // Longest sleep stretch (last 7 days)
  const recentSleepEvents = sleepEvents.filter(e => {
    const daysAgo = (today.getTime() - e.timestamp.getTime()) / (1000 * 60 * 60 * 24)
    return daysAgo <= 7
  })
  const longestSleep = recentSleepEvents.length > 0
    ? Math.max(...recentSleepEvents.map(e => e.duration || 0))
    : 0

  // Pumping stats
  const pumpingEvents = events.filter(e => e.type === 'pumping' && e.amount)
  const todayPumpingEvents = pumpingEvents.filter(e => e.timestamp.toDateString() === todayStr)
  const totalPumpedToday = todayPumpingEvents.reduce((sum, e) => sum + (e.amount || 0), 0)
  
  const avgPumpingAmount = pumpingEvents.length > 0
    ? Math.round(pumpingEvents.reduce((sum, e) => sum + (e.amount || 0), 0) / pumpingEvents.length)
    : 0

  // Pumping side preference
  const pumpingLeftAmount = events.filter(e => e.type === 'pumping' && e.pumpingRounds)
    .reduce((sum, e) => {
      const leftRounds = (e.pumpingRounds || []).filter(r => r.side === 'left')
      return sum + leftRounds.reduce((s, r) => s + r.amount, 0)
    }, 0)
  const pumpingRightAmount = events.filter(e => e.type === 'pumping' && e.pumpingRounds)
    .reduce((sum, e) => {
      const rightRounds = (e.pumpingRounds || []).filter(r => r.side === 'right')
      return sum + rightRounds.reduce((s, r) => s + r.amount, 0)
    }, 0)
  const totalPumpingSided = pumpingLeftAmount + pumpingRightAmount

  if (events.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="font-serif text-xl text-ink mb-2">No stats yet</h2>
        <p className="text-ink-soft text-sm">
          Start logging events to see your stats
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
      {/* Today's Summary */}
      <section>
        <h2 className="font-serif text-sm font-medium text-ink-soft mb-3 uppercase tracking-wider">
          Today's Summary
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {EVENT_TYPES.map(type => (
            <div
              key={type}
              className={`rounded-2xl p-4 border ${eventConfig[type].color} transition-all duration-300`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{eventConfig[type].emoji}</span>
                <span className="font-medium text-sm">{eventConfig[type].label}</span>
              </div>
              <div className="text-3xl font-bold">
                {todayCounts[type]}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Weekly Chart */}
      <section>
        <h2 className="font-serif text-sm font-medium text-ink-soft mb-3 uppercase tracking-wider">
          Last 7 Days
        </h2>
        <div className="bg-card rounded-2xl p-4 border border-line-soft">
          <div className="flex items-end justify-between gap-2 h-32">
            {weeklyData.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-linear-to-t from-accent to-accent-bold rounded-t-lg transition-all duration-500"
                  style={{ 
                    height: `${(day.total / maxDailyTotal) * 100}%`,
                    minHeight: day.total > 0 ? '8px' : '0'
                  }}
                />
                <span className="text-xs text-ink-soft">{day.dayLabel}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-line-soft flex justify-between text-xs text-ink-soft">
            <span>Total events: {weeklyData.reduce((sum, d) => sum + d.total, 0)}</span>
            <span>Avg/day: {(weeklyData.reduce((sum, d) => sum + d.total, 0) / 7).toFixed(1)}</span>
          </div>
        </div>
      </section>

      {/* Breastfeeding Insights */}
      {breastfeedingEvents.length > 0 && (
        <section>
          <h2 className="font-serif text-sm font-medium text-ink-soft mb-3 uppercase tracking-wider">
            🍼 Breastfeeding Insights
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-2xl p-4 border border-line-soft">
              <div className="text-sm text-ink-soft mb-1">Avg Duration</div>
              <div className="text-2xl font-bold text-ink">
                {formatDurationMMSS(avgFeedingDuration)}
              </div>
            </div>
            {avgHoursBetweenFeedings && (
              <div className="bg-card rounded-2xl p-4 border border-line-soft">
                <div className="text-sm text-ink-soft mb-1">Avg Interval</div>
                <div className="text-2xl font-bold text-ink">
                  {avgHoursBetweenFeedings}h
                </div>
              </div>
            )}
            {totalSided > 0 && (
              <div className="bg-card rounded-2xl p-4 border border-line-soft col-span-2">
                <div className="text-sm text-ink-soft mb-2">Side Balance</div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">◀️</span>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-rose-400 transition-all duration-500"
                      style={{ width: `${(leftCount / totalSided) * 100}%` }}
                    />
                    <div 
                      className="h-full bg-sky-400 transition-all duration-500"
                      style={{ width: `${(rightCount / totalSided) * 100}%` }}
                    />
                  </div>
                  <span className="text-lg">▶️</span>
                </div>
                <div className="flex justify-between text-xs text-ink-soft mt-1">
                  <span>Left: {leftCount} ({Math.round((leftCount / totalSided) * 100)}%)</span>
                  <span>Right: {rightCount} ({Math.round((rightCount / totalSided) * 100)}%)</span>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Sleep Insights */}
      {sleepEvents.length > 0 && (
        <section>
          <h2 className="font-serif text-sm font-medium text-ink-soft mb-3 uppercase tracking-wider">
            😴 Sleep Insights
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-2xl p-4 border border-line-soft">
              <div className="text-sm text-ink-soft mb-1">Today's Sleep</div>
              <div className="text-2xl font-bold text-ink">
                {formatDurationHHMM(totalSleepToday)}
              </div>
              <div className="text-xs text-ink-soft mt-1">
                {todaySleepEvents.length} nap{todaySleepEvents.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="bg-card rounded-2xl p-4 border border-line-soft">
              <div className="text-sm text-ink-soft mb-1">Avg Duration</div>
              <div className="text-2xl font-bold text-ink">
                {formatDurationHHMM(avgSleepDuration)}
              </div>
            </div>
            {longestSleep > 0 && (
              <div className="bg-card rounded-2xl p-4 border border-line-soft col-span-2">
                <div className="text-sm text-ink-soft mb-1">Longest Stretch (7 days)</div>
                <div className="text-2xl font-bold text-ink flex items-center gap-2">
                  <span>🏆</span>
                  {formatDurationHHMM(longestSleep)}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Pumping Insights */}
      {pumpingEvents.length > 0 && (
        <section>
          <h2 className="font-serif text-sm font-medium text-ink-soft mb-3 uppercase tracking-wider">
            🥛 Pumping Insights
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-2xl p-4 border border-line-soft">
              <div className="text-sm text-ink-soft mb-1">Today's Total</div>
              <div className="text-2xl font-bold text-ink">
                {totalPumpedToday} ml
              </div>
              <div className="text-xs text-ink-soft mt-1">
                {todayPumpingEvents.length} session{todayPumpingEvents.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="bg-card rounded-2xl p-4 border border-line-soft">
              <div className="text-sm text-ink-soft mb-1">Avg per Session</div>
              <div className="text-2xl font-bold text-ink">
                {avgPumpingAmount} ml
              </div>
            </div>
            {totalPumpingSided > 0 && (
              <div className="bg-card rounded-2xl p-4 border border-line-soft col-span-2">
                <div className="text-sm text-ink-soft mb-2">Output by Side</div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">◀️</span>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-purple-400 transition-all duration-500"
                      style={{ width: `${(pumpingLeftAmount / totalPumpingSided) * 100}%` }}
                    />
                    <div 
                      className="h-full bg-violet-400 transition-all duration-500"
                      style={{ width: `${(pumpingRightAmount / totalPumpingSided) * 100}%` }}
                    />
                  </div>
                  <span className="text-lg">▶️</span>
                </div>
                <div className="flex justify-between text-xs text-ink-soft mt-1">
                  <span>Left: {pumpingLeftAmount}ml ({Math.round((pumpingLeftAmount / totalPumpingSided) * 100)}%)</span>
                  <span>Right: {pumpingRightAmount}ml ({Math.round((pumpingRightAmount / totalPumpingSided) * 100)}%)</span>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Activity Patterns */}
      <section>
        <h2 className="font-serif text-sm font-medium text-ink-soft mb-3 uppercase tracking-wider">
          Activity Patterns (7 days)
        </h2>
        <div className="bg-card rounded-2xl p-4 border border-line-soft">
          <div className="flex items-end gap-0.5 h-20 mb-2">
            {hourlyActivity.map((count, hour) => (
              <div
                key={hour}
                className="flex-1 bg-accent rounded-t transition-all duration-300 opacity-70 hover:opacity-100"
                style={{ 
                  height: `${(count / maxHourly) * 100}%`,
                  minHeight: count > 0 ? '4px' : '0'
                }}
                title={`${formatHour(hour)}: ${count} events`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-ink-soft">
            <span>12am</span>
            <span>6am</span>
            <span>12pm</span>
            <span>6pm</span>
            <span>12am</span>
          </div>
          <div className="mt-3 pt-3 border-t border-line-soft text-sm text-ink-soft">
            <span className="text-ink font-medium">Peak activity:</span> {formatHour(peakHour)}
          </div>
        </div>
      </section>
    </div>
  )
}
