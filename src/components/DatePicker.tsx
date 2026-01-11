import { useState, useRef, useEffect } from 'react'

interface DatePickerProps {
  selectedDate: Date | null // null means "All time"
  onDateChange: (date: Date | null) => void
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.toDateString() === d2.toDateString()
}

function formatDateLabel(date: Date | null): string {
  if (!date) return 'All Time'
  
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (isSameDay(date, today)) return 'Today'
  if (isSameDay(date, yesterday)) return 'Yesterday'
  
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric' 
  })
}

export function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => selectedDate || new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const today = new Date()
  
  // Navigate to previous/next day
  const goToPrevDay = () => {
    if (!selectedDate) {
      onDateChange(today)
    } else {
      const prev = new Date(selectedDate)
      prev.setDate(prev.getDate() - 1)
      onDateChange(prev)
    }
  }

  const goToNextDay = () => {
    if (!selectedDate) return
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + 1)
    if (next <= today) {
      onDateChange(next)
    }
  }

  const goToToday = () => {
    onDateChange(new Date())
    setIsOpen(false)
  }

  const showAllTime = () => {
    onDateChange(null)
    setIsOpen(false)
  }

  // Calendar helpers
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const prevMonth = () => {
    setViewMonth(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    const next = new Date(year, month + 1, 1)
    if (next <= today) {
      setViewMonth(next)
    }
  }

  const selectDate = (day: number) => {
    const selected = new Date(year, month, day)
    if (selected <= today) {
      onDateChange(selected)
      setIsOpen(false)
    }
  }

  const canGoNext = selectedDate && !isSameDay(selectedDate, today)
  const canGoNextMonth = new Date(year, month + 1, 1) <= today

  return (
    <div className="relative" ref={containerRef}>
      {/* Date Display with Navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={goToPrevDay}
          className="p-1 rounded-lg text-ink-soft hover:text-ink hover:bg-hover transition-colors cursor-pointer"
          aria-label="Previous day"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={() => {
            setViewMonth(selectedDate || new Date())
            setIsOpen(!isOpen)
          }}
          className="flex items-center gap-2 px-2 py-1 rounded-lg text-sm text-ink-soft hover:text-ink hover:bg-hover transition-colors cursor-pointer"
        >
          <span>{formatDateLabel(selectedDate)}</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        
        {canGoNext && (
        <button
          onClick={goToNextDay}
          disabled={!canGoNext}
          className={`p-1 rounded-lg transition-colors cursor-pointer ${
            canGoNext 
              ? 'text-ink-soft hover:text-ink hover:bg-hover' 
              : 'text-ink-faint cursor-not-allowed'
          }`}
          aria-label="Next day"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        )}
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-card-solid rounded-2xl shadow-2xl border border-line p-4 min-w-[280px] animate-fade-in">
          {/* Quick Actions */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={goToToday}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                selectedDate && isSameDay(selectedDate, today)
                  ? 'bg-ink text-surface'
                  : 'bg-muted text-ink hover:bg-hover'
              }`}
            >
              Today
            </button>
            <button
              onClick={showAllTime}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                !selectedDate
                  ? 'bg-ink text-surface'
                  : 'bg-muted text-ink hover:bg-hover'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-hover transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-medium text-ink">
              {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={nextMonth}
              disabled={!canGoNextMonth}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                canGoNextMonth
                  ? 'text-ink-soft hover:text-ink hover:bg-hover'
                  : 'text-ink-faint cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-ink-soft py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the first of the month */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="w-9 h-9" />
            ))}
            
            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const date = new Date(year, month, day)
              const isToday = isSameDay(date, today)
              const isSelected = selectedDate && isSameDay(date, selectedDate)
              const isFuture = date > today

              return (
                <button
                  key={day}
                  onClick={() => !isFuture && selectDate(day)}
                  disabled={isFuture}
                  className={`w-9 h-9 rounded-full text-sm font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-linear-to-r from-accent to-accent-bold text-white shadow-md'
                      : isToday
                        ? 'bg-hover text-ink ring-2 ring-accent'
                        : isFuture
                          ? 'text-ink-faint cursor-not-allowed'
                          : 'text-ink hover:bg-hover'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
