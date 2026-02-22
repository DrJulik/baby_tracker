import { useState, useEffect, useCallback, useRef } from 'react'
import type { BreastSide, PumpingRound } from '../types'

interface TimerState {
  isRunning: boolean
  isPaused: boolean
  side: BreastSide
  startTime: Date | null
  // Track elapsed time for the timer
  elapsedSeconds: number
  lastTickTime: number // timestamp of last tick for persistence
  // Track amounts per side
  leftAmount: number
  rightAmount: number
}

const STORAGE_KEY = 'pumpingTimer'

export function usePumpingTimer() {
  const [state, setState] = useState<TimerState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // If there was an active timer, calculate elapsed time
      if (parsed.isRunning && parsed.lastTickTime && !parsed.isPaused) {
        const now = Date.now()
        const additionalSeconds = Math.floor((now - parsed.lastTickTime) / 1000)
        return {
          ...parsed,
          startTime: parsed.startTime ? new Date(parsed.startTime) : null,
          elapsedSeconds: (parsed.elapsedSeconds || 0) + additionalSeconds,
          lastTickTime: now,
        }
      }
      return { 
        ...parsed, 
        startTime: parsed.startTime ? new Date(parsed.startTime) : null,
      }
    }
    return {
      isRunning: false,
      isPaused: false,
      side: 'left' as BreastSide,
      startTime: null,
      elapsedSeconds: 0,
      lastTickTime: 0,
      leftAmount: 0,
      rightAmount: 0,
    }
  })

  const intervalRef = useRef<number | null>(null)

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  // Timer tick: compute elapsed from startTime so time stays correct when app is backgrounded (e.g. phone locked)
  useEffect(() => {
    if (state.isRunning && !state.isPaused && state.startTime) {
      intervalRef.current = window.setInterval(() => {
        setState(prev => ({
          ...prev,
          elapsedSeconds: Math.floor((Date.now() - prev.startTime!.getTime()) / 1000),
          lastTickTime: Date.now(),
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
  }, [state.isRunning, state.isPaused, state.startTime])

  const start = useCallback((side: BreastSide) => {
    setState({
      isRunning: true,
      isPaused: false,
      side,
      startTime: new Date(),
      elapsedSeconds: 0,
      lastTickTime: Date.now(),
      leftAmount: 0,
      rightAmount: 0,
    })
  }, [])

  const pause = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: true,
      elapsedSeconds: prev.startTime
        ? Math.floor((Date.now() - prev.startTime.getTime()) / 1000)
        : prev.elapsedSeconds,
    }))
  }, [])

  const resume = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: false,
      startTime: new Date(Date.now() - prev.elapsedSeconds * 1000),
      lastTickTime: Date.now(),
    }))
  }, [])

  const switchSide = useCallback(() => {
    setState(prev => ({
      ...prev,
      side: prev.side === 'left' ? 'right' : 'left',
    }))
  }, [])

  const setAmount = useCallback((side: BreastSide, amount: number) => {
    setState(prev => ({
      ...prev,
      [side === 'left' ? 'leftAmount' : 'rightAmount']: Math.max(0, amount),
    }))
  }, [])

  const stop = useCallback(() => {
    const currentElapsed =
      state.startTime && !state.isPaused
        ? Math.floor((Date.now() - state.startTime.getTime()) / 1000)
        : state.elapsedSeconds
    const rounds: PumpingRound[] = []
    if (state.leftAmount > 0) {
      rounds.push({ side: 'left', amount: state.leftAmount })
    }
    if (state.rightAmount > 0) {
      rounds.push({ side: 'right', amount: state.rightAmount })
    }

    const totalAmount = state.leftAmount + state.rightAmount

    const result = {
      duration: currentElapsed,
      amount: totalAmount,
      startTime: state.startTime,
      rounds,
      side: state.side, // last side used
    }

    setState({
      isRunning: false,
      isPaused: false,
      side: 'left',
      startTime: null,
      elapsedSeconds: 0,
      lastTickTime: 0,
      leftAmount: 0,
      rightAmount: 0,
    })
    localStorage.removeItem(STORAGE_KEY)
    return result
  }, [state.elapsedSeconds, state.leftAmount, state.rightAmount, state.startTime, state.side, state.isPaused])

  const cancel = useCallback(() => {
    setState({
      isRunning: false,
      isPaused: false,
      side: 'left',
      startTime: null,
      elapsedSeconds: 0,
      lastTickTime: 0,
      leftAmount: 0,
      rightAmount: 0,
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
    elapsedSeconds: state.elapsedSeconds,
    side: state.side,
    startTime: state.startTime,
    leftAmount: state.leftAmount,
    rightAmount: state.rightAmount,
    totalAmount: state.leftAmount + state.rightAmount,
    formattedTime: formatTime(state.elapsedSeconds),
    start,
    pause,
    resume,
    switchSide,
    setAmount,
    stop,
    cancel,
  }
}
