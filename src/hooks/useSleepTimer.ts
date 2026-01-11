import { useState, useEffect, useCallback, useRef } from 'react'

interface TimerState {
  isRunning: boolean
  startTime: Date | null
  elapsedSeconds: number
}

const STORAGE_KEY = 'sleepTimer'

export function useSleepTimer() {
  const [state, setState] = useState<TimerState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // If there was an active timer, calculate elapsed time
      if (parsed.isRunning && parsed.startTime) {
        const startTime = new Date(parsed.startTime)
        const now = new Date()
        const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000)
        return {
          isRunning: true,
          startTime,
          elapsedSeconds,
        }
      }
      return { 
        ...parsed, 
        startTime: parsed.startTime ? new Date(parsed.startTime) : null 
      }
    }
    return {
      isRunning: false,
      startTime: null,
      elapsedSeconds: 0,
    }
  })

  const intervalRef = useRef<number | null>(null)

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  // Timer tick
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = window.setInterval(() => {
        if (state.startTime) {
          const now = new Date()
          const elapsed = Math.floor((now.getTime() - state.startTime.getTime()) / 1000)
          setState(prev => ({ ...prev, elapsedSeconds: elapsed }))
        }
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [state.isRunning, state.startTime])

  const start = useCallback(() => {
    const now = new Date()
    setState({
      isRunning: true,
      startTime: now,
      elapsedSeconds: 0,
    })
  }, [])

  const stop = useCallback(() => {
    const result = {
      duration: state.elapsedSeconds,
      startTime: state.startTime,
    }
    setState({
      isRunning: false,
      startTime: null,
      elapsedSeconds: 0,
    })
    localStorage.removeItem(STORAGE_KEY)
    return result
  }, [state.elapsedSeconds, state.startTime])

  const cancel = useCallback(() => {
    setState({
      isRunning: false,
      startTime: null,
      elapsedSeconds: 0,
    })
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return {
    isRunning: state.isRunning,
    elapsedSeconds: state.elapsedSeconds,
    startTime: state.startTime,
    formattedTime: formatTime(state.elapsedSeconds),
    start,
    stop,
    cancel,
  }
}

