import { useState, useEffect } from 'react'
import type { EventType } from './types'
import { useEvents } from './hooks/useEvents'
import { useTheme } from './hooks/useTheme'
import { useBreastfeedingTimer } from './hooks/useBreastfeedingTimer'
import { useSleepTimer } from './hooks/useSleepTimer'
import { usePumpingTimer } from './hooks/usePumpingTimer'
import {
  Header,
  FilterBar,
  TimeSinceCards,
  EventList,
  AddEventModal,
  FloatingAddButton,
  BreastfeedingTimer,
  MiniTimer,
  SleepTimer,
  SleepMiniTimer,
  PumpingTimer,
  PumpingMiniTimer,
  StatsView,
} from './components'
import type { ViewMode } from './components'

function App() {
  const { 
    events, 
    addEvent, 
    addBreastfeedingEvent,
    addSleepEvent,
    addPumpingEvent,
    deleteEvent, 
    getLastEventByType,
    getLastBreastfeedingSide,
    getLastPumpingSide,
  } = useEvents()
  const { isDark, toggleTheme } = useTheme()
  const breastfeedingTimer = useBreastfeedingTimer()
  const sleepTimer = useSleepTimer()
  const pumpingTimer = usePumpingTimer()
  
  const [activeView, setActiveView] = useState<ViewMode>('log')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBreastfeedingTimerOpen, setIsBreastfeedingTimerOpen] = useState(false)
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState(false)
  const [isPumpingTimerOpen, setIsPumpingTimerOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Set<EventType>>(new Set())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()) // null = all time

  // Update current time every minute for "time since" display
  const [currentTime, setCurrentTime] = useState(new Date())
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const toggleFilter = (type: EventType) => {
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  // Filter by date first, then by event type
  const dateFilteredEvents = selectedDate
    ? events.filter(e => e.timestamp.toDateString() === selectedDate.toDateString())
    : events

  const filteredEvents = activeFilters.size === 0 
    ? dateFilteredEvents 
    : dateFilteredEvents.filter(e => activeFilters.has(e.type))

  // Get count for selected date (or today if all time)
  const getCountByTypeForDate = (type: EventType): number => {
    const targetDate = selectedDate || new Date()
    return events.filter(e => e.type === type && e.timestamp.toDateString() === targetDate.toDateString()).length
  }

  const handleStopBreastfeedingTimer = () => {
    const result = breastfeedingTimer.stop()
    if (result.startTime && result.duration > 0) {
      addBreastfeedingEvent(result.startTime, result.duration, result.side, result.rounds)
    }
    setIsBreastfeedingTimerOpen(false)
  }

  const handleStopSleepTimer = () => {
    const result = sleepTimer.stop()
    if (result.startTime && result.duration > 0) {
      addSleepEvent(result.startTime, result.duration)
    }
    setIsSleepTimerOpen(false)
  }

  const handleStopPumpingTimer = () => {
    const result = pumpingTimer.stop()
    if (result.startTime && result.duration > 0) {
      addPumpingEvent(result.startTime, result.duration, result.amount, result.side, result.rounds)
    }
    setIsPumpingTimerOpen(false)
  }

  const lastBreastfeedingSide = getLastBreastfeedingSide()
  const lastPumpingSide = getLastPumpingSide()

  return (
    <div className="min-h-dvh flex flex-col bg-surface transition-colors duration-300">
      <Header 
        isDark={isDark} 
        onToggleTheme={toggleTheme}
        activeView={activeView}
        onViewChange={setActiveView}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Filter Bar - only show on Log view when there are events */}
      {activeView === 'log' && events.length > 0 && (
        <FilterBar
          activeFilters={activeFilters}
          onFilterChange={toggleFilter}
          onClearFilters={() => setActiveFilters(new Set())}
          getCountByType={getCountByTypeForDate}
          selectedDate={selectedDate}
        />
      )}

      {/* Main Content */}
      {activeView === 'log' ? (
        <main className="flex-1 min-h-0 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4 mx-auto px-5 pb-10 pt-6 w-full">
          <div className="overflow-y-auto scrollbar-hide sm:pr-2">
            <EventList
              events={dateFilteredEvents}
              filteredEvents={filteredEvents}
              onDeleteEvent={deleteEvent}
            />
          </div>
          {events.length > 0 && (
            <div className="overflow-y-auto scrollbar-hide sm:pl-2">
              <TimeSinceCards
                getLastEventByType={getLastEventByType}
                currentTime={currentTime}
              />
            </div>
          )}
        </main>
      ) : (
        <main className="flex-1 overflow-y-auto scrollbar-hide mx-auto px-5 pt-6 w-full">
          <StatsView events={events} />
        </main>
      )}

      {/* Mini Timers (shown when timers are running but modals are closed) */}
      <SleepMiniTimer
        isVisible={sleepTimer.isRunning && !isSleepTimerOpen}
        formattedTime={sleepTimer.formattedTime}
        onClick={() => setIsSleepTimerOpen(true)}
        onStop={handleStopSleepTimer}
        offsetIndex={0}
      />

      <MiniTimer
        isVisible={breastfeedingTimer.isRunning && !isBreastfeedingTimerOpen}
        isPaused={breastfeedingTimer.isPaused}
        side={breastfeedingTimer.side}
        formattedTime={breastfeedingTimer.formattedTime}
        onClick={() => setIsBreastfeedingTimerOpen(true)}
        onStop={handleStopBreastfeedingTimer}
        offsetIndex={
          (sleepTimer.isRunning && !isSleepTimerOpen ? 1 : 0) +
          (pumpingTimer.isRunning && !isPumpingTimerOpen ? 1 : 0)
        }
      />

      <PumpingMiniTimer
        isVisible={pumpingTimer.isRunning && !isPumpingTimerOpen}
        isPaused={pumpingTimer.isPaused}
        side={pumpingTimer.side}
        formattedTime={pumpingTimer.formattedTime}
        totalAmount={pumpingTimer.totalAmount}
        onClick={() => setIsPumpingTimerOpen(true)}
        onStop={handleStopPumpingTimer}
        offsetIndex={sleepTimer.isRunning && !isSleepTimerOpen ? 1 : 0}
      />

      {/* FAB - only show on Log view */}
      {activeView === 'log' && (
        <FloatingAddButton 
          onQuickAdd={(type) => addEvent(type, new Date())}
          onOpenModal={() => setIsModalOpen(true)}
          onOpenBreastfeedingTimer={() => setIsBreastfeedingTimerOpen(true)}
          onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
          onOpenPumpingTimer={() => setIsPumpingTimerOpen(true)}
          isBreastfeedingTimerRunning={breastfeedingTimer.isRunning}
          isSleepTimerRunning={sleepTimer.isRunning}
          isPumpingTimerRunning={pumpingTimer.isRunning}
        />
      )}

      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddEvent={addEvent}
      />

      <BreastfeedingTimer
        isOpen={isBreastfeedingTimerOpen}
        isRunning={breastfeedingTimer.isRunning}
        isPaused={breastfeedingTimer.isPaused}
        side={breastfeedingTimer.side}
        formattedTime={breastfeedingTimer.formattedTime}
        formattedRoundTime={breastfeedingTimer.formattedCurrentRound}
        rounds={breastfeedingTimer.rounds}
        lastSide={lastBreastfeedingSide}
        onStart={breastfeedingTimer.start}
        onPause={breastfeedingTimer.pause}
        onResume={breastfeedingTimer.resume}
        onSwitchSide={breastfeedingTimer.switchSide}
        onStop={handleStopBreastfeedingTimer}
        onCancel={() => {
          breastfeedingTimer.cancel()
          setIsBreastfeedingTimerOpen(false)
        }}
        onClose={() => setIsBreastfeedingTimerOpen(false)}
      />

      <SleepTimer
        isOpen={isSleepTimerOpen}
        isRunning={sleepTimer.isRunning}
        formattedTime={sleepTimer.formattedTime}
        onStart={sleepTimer.start}
        onStop={handleStopSleepTimer}
        onCancel={() => {
          sleepTimer.cancel()
          setIsSleepTimerOpen(false)
        }}
        onClose={() => setIsSleepTimerOpen(false)}
      />

      <PumpingTimer
        isOpen={isPumpingTimerOpen}
        isRunning={pumpingTimer.isRunning}
        isPaused={pumpingTimer.isPaused}
        side={pumpingTimer.side}
        formattedTime={pumpingTimer.formattedTime}
        leftAmount={pumpingTimer.leftAmount}
        rightAmount={pumpingTimer.rightAmount}
        totalAmount={pumpingTimer.totalAmount}
        lastSide={lastPumpingSide}
        onStart={pumpingTimer.start}
        onPause={pumpingTimer.pause}
        onResume={pumpingTimer.resume}
        onSwitchSide={pumpingTimer.switchSide}
        onSetAmount={pumpingTimer.setAmount}
        onStop={handleStopPumpingTimer}
        onCancel={() => {
          pumpingTimer.cancel()
          setIsPumpingTimerOpen(false)
        }}
        onClose={() => setIsPumpingTimerOpen(false)}
      />
    </div>
  )
}

export default App
