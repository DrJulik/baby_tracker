export type EventType = 'diaper' | 'pee' | 'poop' | 'breastfeeding' | 'bottle' | 'sleep' | 'pumping'

export type BreastSide = 'left' | 'right'

export interface FeedingRound {
  side: BreastSide
  duration: number // in seconds
}

export interface PumpingRound {
  side: BreastSide
  amount: number // in ml
}

export interface BabyEvent {
  id: string
  type: EventType
  timestamp: Date
  notes?: string
  // Duration-based events (breastfeeding, sleep, pumping)
  duration?: number // total duration in seconds
  // Breastfeeding-specific fields
  side?: BreastSide // last side used
  rounds?: FeedingRound[] // detailed breakdown by side
  // Bottle feeding and pumping
  amount?: number // total amount in ml
  // Pumping-specific fields
  pumpingRounds?: PumpingRound[] // breakdown by side for pumping
}

export interface EventConfig {
  emoji: string
  label: string
  color: string
}

export const eventConfig: Record<EventType, EventConfig> = {
  diaper: { emoji: '🧷', label: 'Diaper Change', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  pee: { emoji: '💧', label: 'Pee', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  poop: { emoji: '💩', label: 'Poop', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  breastfeeding: { emoji: '🤱', label: 'Breastfeeding', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  bottle: { emoji: '🍼', label: 'Bottle', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  sleep: { emoji: '😴', label: 'Sleep', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  pumping: { emoji: '🥛', label: 'Pumping', color: 'bg-purple-100 text-purple-800 border-purple-200' },
}

export const EVENT_TYPES = Object.keys(eventConfig) as EventType[]

// Event types that support quick-add (no timer needed)
export const QUICK_ADD_TYPES: EventType[] = ['diaper', 'pee', 'poop', 'bottle']

// Event types that use a timer
export const TIMER_TYPES: EventType[] = ['breastfeeding', 'sleep', 'pumping']
