import { useState, useEffect } from 'react'
import type { BabyEvent, EventType, BreastSide, FeedingRound, PumpingRound } from '../types'

const STORAGE_KEY = 'babyEvents'

// Fallback for crypto.randomUUID() - not supported in older mobile Safari
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

export function useEvents() {
  const [events, setEvents] = useState<BabyEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return parsed.map((e: BabyEvent) => ({ ...e, timestamp: new Date(e.timestamp) }))
    }
    return []
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  }, [events])

  const addEvent = (
    type: EventType, 
    timestamp: Date, 
    notes?: string,
    options?: { duration?: number; side?: BreastSide; rounds?: FeedingRound[]; amount?: number; pumpingRounds?: PumpingRound[] }
  ) => {
    const newEvent: BabyEvent = {
      id: generateId(),
      type,
      timestamp,
      notes: notes || undefined,
      duration: options?.duration,
      side: options?.side,
      rounds: options?.rounds,
      amount: options?.amount,
      pumpingRounds: options?.pumpingRounds,
    }
    setEvents(prev => {
      const updated = [...prev, newEvent]
      return updated.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    })
  }

  const addBreastfeedingEvent = (
    startTime: Date,
    duration: number,
    side: BreastSide,
    rounds: FeedingRound[],
    notes?: string
  ) => {
    addEvent('breastfeeding', startTime, notes, { duration, side, rounds })
  }

  const addSleepEvent = (
    startTime: Date,
    duration: number,
    notes?: string
  ) => {
    addEvent('sleep', startTime, notes, { duration })
  }

  const addPumpingEvent = (
    startTime: Date,
    duration: number,
    amount: number,
    side: BreastSide,
    pumpingRounds: PumpingRound[],
    notes?: string
  ) => {
    addEvent('pumping', startTime, notes, { duration, amount, side, pumpingRounds })
  }

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  const getLastEventByType = (type: EventType): BabyEvent | undefined => {
    return events.find(e => e.type === type)
  }

  const getTodayCountByType = (type: EventType): number => {
    const today = new Date().toDateString()
    return events.filter(e => e.type === type && e.timestamp.toDateString() === today).length
  }

  const getLastBreastfeedingSide = (): BreastSide | undefined => {
    const lastBreastfeeding = events.find(e => e.type === 'breastfeeding' && e.side)
    return lastBreastfeeding?.side
  }

  const getLastPumpingSide = (): BreastSide | undefined => {
    const lastPumping = events.find(e => e.type === 'pumping' && e.side)
    return lastPumping?.side
  }

  return {
    events,
    addEvent,
    addBreastfeedingEvent,
    addSleepEvent,
    addPumpingEvent,
    deleteEvent,
    getLastEventByType,
    getTodayCountByType,
    getLastBreastfeedingSide,
    getLastPumpingSide,
  }
}
