import { useState, useEffect, useCallback, useRef } from 'react'
import type { BreastSide, FeedingRound } from '../types'

interface TimerState {
  isRunning: boolean
  isPaused: boolean
  side: BreastSide
  startTime: Date | null
  // Track rounds (each time you switch sides, complete the current round)
  rounds: FeedingRound[]
  currentRoundStart: number // timestamp when current round started
  currentRoundElapsed: number // seconds elapsed in current round
}

const STORAGE_KEY = 'breastfeedingTimer'

export function useBreastfeedingTimer() {
  const [state, setState] = useState<TimerState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // If there was an active timer, calculate elapsed time for current round
      if (parsed.isRunning && parsed.currentRoundStart && !parsed.isPaused) {
        const now = Date.now()
        const additionalSeconds = Math.floor((now - parsed.currentRoundStart) / 1000)
        return {
          ...parsed,
          startTime: parsed.startTime ? new Date(parsed.startTime) : null,
          currentRoundElapsed: (parsed.currentRoundElapsed || 0) + additionalSeconds,
          currentRoundStart: now,
        }
      }
      return { 
        ...parsed, 
        startTime: parsed.startTime ? new Date(parsed.startTime) : null,
        rounds: parsed.rounds || [],
      }
    }
    return {
      isRunning: false,
      isPaused: false,
      side: 'left' as BreastSide,
      startTime: null,
      rounds: [],
      currentRoundStart: 0,
      currentRoundElapsed: 0,
    }
  })

  const intervalRef = useRef<number | null>(null)

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  // Timer tick
  useEffect(() => {
    if (state.isRunning && !state.isPaused) {
      intervalRef.current = window.setInterval(() => {
        setState(prev => ({
          ...prev,
          currentRoundElapsed: prev.currentRoundElapsed + 1,
        }))
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
  }, [state.isRunning, state.isPaused])

  // Calculate total elapsed from all rounds + current round
  const totalElapsedSeconds = state.rounds.reduce((sum, r) => sum + r.duration, 0) + state.currentRoundElapsed

  const start = useCallback((side: BreastSide) => {
    setState({
      isRunning: true,
      isPaused: false,
      side,
      startTime: new Date(),
      rounds: [],
      currentRoundStart: Date.now(),
      currentRoundElapsed: 0,
    })
  }, [])

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: true }))
  }, [])

  const resume = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isPaused: false,
      currentRoundStart: Date.now(),
    }))
  }, [])

  const switchSide = useCallback(() => {
    setState(prev => {
      // Complete current round and start a new one
      const completedRound: FeedingRound = {
        side: prev.side,
        duration: prev.currentRoundElapsed,
      }
      const newSide: BreastSide = prev.side === 'left' ? 'right' : 'left'
      
      return {
        ...prev,
        side: newSide,
        rounds: [...prev.rounds, completedRound],
        currentRoundStart: Date.now(),
        currentRoundElapsed: 0,
      }
    })
  }, [])

  const stop = useCallback(() => {
    // Complete the current round
    const finalRound: FeedingRound = {
      side: state.side,
      duration: state.currentRoundElapsed,
    }
    const allRounds = [...state.rounds, finalRound].filter(r => r.duration > 0)
    
    const result = {
      duration: totalElapsedSeconds,
      side: state.side, // last side used
      startTime: state.startTime,
      rounds: allRounds,
    }
    
    setState({
      isRunning: false,
      isPaused: false,
      side: 'left',
      startTime: null,
      rounds: [],
      currentRoundStart: 0,
      currentRoundElapsed: 0,
    })
    localStorage.removeItem(STORAGE_KEY)
    return result
  }, [state.side, state.currentRoundElapsed, state.rounds, state.startTime, totalElapsedSeconds])

  const cancel = useCallback(() => {
    setState({
      isRunning: false,
      isPaused: false,
      side: 'left',
      startTime: null,
      rounds: [],
      currentRoundStart: 0,
      currentRoundElapsed: 0,
    })
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return {
    isRunning: state.isRunning,
    isPaused: state.isPaused,
    elapsedSeconds: totalElapsedSeconds,
    currentRoundSeconds: state.currentRoundElapsed,
    side: state.side,
    startTime: state.startTime,
    rounds: state.rounds,
    formattedTime: formatTime(totalElapsedSeconds),
    formattedCurrentRound: formatTime(state.currentRoundElapsed),
    start,
    pause,
    resume,
    switchSide,
    stop,
    cancel,
  }
}
