import { useState } from 'react'
import type { EventType, BreastSide, FeedingRound, PumpingRound } from '../types'
import { eventConfig, EVENT_TYPES } from '../types'
import { getLocalDateTimeString } from '../utils/formatters'

// Fallback for crypto.randomUUID() - not supported in older mobile Safari
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback: simple random ID
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

interface AddEventModalProps {
  isOpen: boolean
  onClose: () => void
  onAddEvent: (
    type: EventType, 
    timestamp: Date, 
    notes?: string,
    options?: { duration?: number; side?: BreastSide; rounds?: FeedingRound[]; amount?: number; pumpingRounds?: PumpingRound[] }
  ) => void
}

interface RoundInput {
  id: string
  side: BreastSide
  minutes: number
}

interface PumpingInput {
  id: string
  side: BreastSide
  amount: number
}

export function AddEventModal({ isOpen, onClose, onAddEvent }: AddEventModalProps) {
  const [selectedType, setSelectedType] = useState<EventType | null>(null)
  const [notes, setNotes] = useState('')
  const [useCustomTime, setUseCustomTime] = useState(false)
  const [customDateTime, setCustomDateTime] = useState('')
  
  // Sleep duration fields
  const [sleepHours, setSleepHours] = useState(0)
  const [sleepMinutes, setSleepMinutes] = useState(0)
  
  // Bottle amount
  const [bottleAmount, setBottleAmount] = useState(0)
  
  // Breastfeeding rounds
  const [rounds, setRounds] = useState<RoundInput[]>([
    { id: generateId(), side: 'left', minutes: 0 }
  ])

  // Pumping inputs
  const [pumpingInputs, setPumpingInputs] = useState<PumpingInput[]>([
    { id: generateId(), side: 'left', amount: 0 }
  ])
  const [pumpingDuration, setPumpingDuration] = useState(0) // in minutes

  const isBreastfeeding = selectedType === 'breastfeeding'
  const isBottle = selectedType === 'bottle'
  const isSleep = selectedType === 'sleep'
  const isPumping = selectedType === 'pumping'

  const handleClose = () => {
    setSelectedType(null)
    setNotes('')
    setUseCustomTime(false)
    setCustomDateTime('')
    setSleepHours(0)
    setSleepMinutes(0)
    setBottleAmount(0)
    setRounds([{ id: generateId(), side: 'left', minutes: 0 }])
    setPumpingInputs([{ id: generateId(), side: 'left', amount: 0 }])
    setPumpingDuration(0)
    onClose()
  }

  const addRound = () => {
    // Alternate side from the last round
    const lastSide = rounds[rounds.length - 1]?.side || 'left'
    const newSide: BreastSide = lastSide === 'left' ? 'right' : 'left'
    setRounds([...rounds, { id: generateId(), side: newSide, minutes: 0 }])
  }

  const removeRound = (id: string) => {
    if (rounds.length > 1) {
      setRounds(rounds.filter(r => r.id !== id))
    }
  }

  const updateRound = (id: string, field: 'side' | 'minutes', value: BreastSide | number) => {
    setRounds(rounds.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ))
  }

  // Pumping round helpers
  const addPumpingInput = () => {
    const lastSide = pumpingInputs[pumpingInputs.length - 1]?.side || 'left'
    const newSide: BreastSide = lastSide === 'left' ? 'right' : 'left'
    setPumpingInputs([...pumpingInputs, { id: generateId(), side: newSide, amount: 0 }])
  }

  const removePumpingInput = (id: string) => {
    if (pumpingInputs.length > 1) {
      setPumpingInputs(pumpingInputs.filter(p => p.id !== id))
    }
  }

  const updatePumpingInput = (id: string, field: 'side' | 'amount', value: BreastSide | number) => {
    setPumpingInputs(pumpingInputs.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ))
  }

  const handleSubmit = () => {
    if (!selectedType) return
    
    const eventTime = useCustomTime && customDateTime 
      ? new Date(customDateTime) 
      : new Date()
    
    if (isBreastfeeding) {
      // Filter out rounds with 0 duration
      const validRounds = rounds.filter(r => r.minutes > 0)
      
      if (validRounds.length > 0) {
        const feedingRounds: FeedingRound[] = validRounds.map(r => ({
          side: r.side,
          duration: r.minutes * 60 // Convert to seconds
        }))
        
        const totalDuration = feedingRounds.reduce((sum, r) => sum + r.duration, 0)
        const lastSide = feedingRounds[feedingRounds.length - 1].side
        
        onAddEvent(selectedType, eventTime, notes || undefined, {
          duration: totalDuration,
          side: lastSide,
          rounds: feedingRounds
        })
      } else {
        onAddEvent(selectedType, eventTime, notes || undefined)
      }
    } else if (isSleep) {
      const totalDurationSeconds = (sleepHours * 3600) + (sleepMinutes * 60)
      
      if (totalDurationSeconds > 0) {
        onAddEvent(selectedType, eventTime, notes || undefined, {
          duration: totalDurationSeconds
        })
      } else {
        onAddEvent(selectedType, eventTime, notes || undefined)
      }
    } else if (isBottle) {
      if (bottleAmount > 0) {
        onAddEvent(selectedType, eventTime, notes || undefined, {
          amount: bottleAmount
        })
      } else {
        onAddEvent(selectedType, eventTime, notes || undefined)
      }
    } else if (isPumping) {
      const validPumpingInputs = pumpingInputs.filter(p => p.amount > 0)
      
      if (validPumpingInputs.length > 0) {
        const pumpingRounds: PumpingRound[] = validPumpingInputs.map(p => ({
          side: p.side,
          amount: p.amount
        }))
        
        const totalAmount = pumpingRounds.reduce((sum, r) => sum + r.amount, 0)
        const lastSide = pumpingRounds[pumpingRounds.length - 1].side
        const durationSeconds = pumpingDuration * 60
        
        onAddEvent(selectedType, eventTime, notes || undefined, {
          duration: durationSeconds > 0 ? durationSeconds : undefined,
          amount: totalAmount,
          side: lastSide,
          pumpingRounds
        })
      } else {
        onAddEvent(selectedType, eventTime, notes || undefined)
      }
    } else {
      onAddEvent(selectedType, eventTime, notes || undefined)
    }
    
    handleClose()
  }

  // Calculate total breastfeeding time
  const totalBreastfeedingMinutes = rounds.reduce((sum, r) => sum + r.minutes, 0)
  
  // Calculate total pumping amount
  const totalPumpingAmount = pumpingInputs.reduce((sum, p) => sum + p.amount, 0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />
      <div className="relative w-full max-h-[90vh] overflow-y-auto bg-card-solid rounded-t-3xl sm:rounded-3xl p-6 pb-8 shadow-2xl animate-slide-up border-t border-line sm:border transition-colors duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl font-semibold text-ink">
            Log Event
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-ink-soft hover:bg-hover transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Event Type Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {EVENT_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                selectedType === type
                  ? `${eventConfig[type].color} border-current scale-[0.98]`
                  : 'bg-muted border-transparent hover:border-line'
              }`}
            >
              <div className="text-3xl mb-2">{eventConfig[type].emoji}</div>
              <div className={`font-medium text-sm ${selectedType === type ? '' : 'text-ink'}`}>
                {eventConfig[type].label}
              </div>
            </button>
          ))}
        </div>

        {/* When did it happen */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-ink mb-2">
            When did it happen?
          </label>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => {
                setUseCustomTime(false)
                setCustomDateTime('')
              }}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                !useCustomTime
                  ? 'bg-ink text-surface shadow-sm'
                  : 'bg-muted text-ink hover:bg-hover border border-line'
              }`}
            >
              ⏱️ Just now
            </button>
            <button
              onClick={() => {
                setUseCustomTime(true)
                setCustomDateTime(getLocalDateTimeString())
              }}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                useCustomTime
                  ? 'bg-ink text-surface shadow-sm'
                  : 'bg-muted text-ink hover:bg-hover border border-line'
              }`}
            >
              📅 Earlier
            </button>
          </div>
          {useCustomTime && (
            <input
              type="datetime-local"
              value={customDateTime}
              onChange={(e) => setCustomDateTime(e.target.value)}
              max={getLocalDateTimeString()}
              className="w-full px-4 py-3 rounded-xl border border-line bg-card-solid text-ink focus:outline-none focus:ring-2 focus:ring-accent-muted/50 focus:border-accent-muted transition-all cursor-pointer"
            />
          )}
        </div>

        {/* Breastfeeding Rounds */}
        {isBreastfeeding && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-ink mb-2">
              Feeding rounds (optional)
            </label>
            <div className="space-y-3">
              {rounds.map((round, index) => (
                <div key={round.id} className="flex items-center gap-2">
                  <span className="text-xs text-ink-soft w-4">{index + 1}.</span>
                  
                  {/* Side toggle */}
                  <div className="flex rounded-lg overflow-hidden border border-line">
                    <button
                      onClick={() => updateRound(round.id, 'side', 'left')}
                      className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                        round.side === 'left'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
                          : 'bg-muted text-ink-soft hover:bg-hover'
                      }`}
                    >
                      ◀️ L
                    </button>
                    <button
                      onClick={() => updateRound(round.id, 'side', 'right')}
                      className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                        round.side === 'right'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
                          : 'bg-muted text-ink-soft hover:bg-hover'
                      }`}
                    >
                      R ▶️
                    </button>
                  </div>
                  
                  {/* Duration input */}
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={round.minutes || ''}
                      placeholder="0"
                      onChange={(e) => updateRound(round.id, 'minutes', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-16 px-3 py-2 rounded-lg border border-line bg-card-solid text-ink text-center focus:outline-none focus:ring-2 focus:ring-accent-muted/50 focus:border-accent-muted transition-all"
                    />
                    <span className="text-sm text-ink-soft">min</span>
                  </div>
                  
                  {/* Remove button */}
                  {rounds.length > 1 && (
                    <button
                      onClick={() => removeRound(round.id)}
                      className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-ink-soft hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              
              {/* Add round button */}
              <button
                onClick={addRound}
                className="w-full py-2 rounded-lg border border-dashed border-line text-ink-soft hover:bg-muted hover:text-ink transition-colors cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                <span>+</span> Add another round
              </button>
              
              {/* Total */}
              {totalBreastfeedingMinutes > 0 && (
                <div className="text-sm text-ink-soft text-right">
                  Total: <span className="font-medium text-ink">{totalBreastfeedingMinutes} min</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sleep Duration */}
        {isSleep && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-ink mb-2">
              How long? (optional)
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={sleepHours || ''}
                    placeholder="0"
                    onChange={(e) => setSleepHours(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-3 rounded-xl border border-line bg-card-solid text-ink text-center focus:outline-none focus:ring-2 focus:ring-accent-muted/50 focus:border-accent-muted transition-all"
                  />
                  <span className="text-ink-soft text-sm">hrs</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={sleepMinutes || ''}
                    placeholder="0"
                    onChange={(e) => setSleepMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full px-4 py-3 rounded-xl border border-line bg-card-solid text-ink text-center focus:outline-none focus:ring-2 focus:ring-accent-muted/50 focus:border-accent-muted transition-all"
                  />
                  <span className="text-ink-soft text-sm">min</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottle Amount */}
        {isBottle && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-ink mb-2">
              Amount (optional)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="500"
                value={bottleAmount || ''}
                placeholder="0"
                onChange={(e) => setBottleAmount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-32 px-4 py-3 rounded-xl border border-line bg-card-solid text-ink text-center focus:outline-none focus:ring-2 focus:ring-accent-muted/50 focus:border-accent-muted transition-all"
              />
              <span className="text-ink-soft text-sm">ml</span>
            </div>
            {/* Quick amount buttons */}
            <div className="flex gap-2 mt-3">
              {[30, 60, 90, 120, 150].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setBottleAmount(amount)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    bottleAmount === amount
                      ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300'
                      : 'bg-muted text-ink-soft hover:bg-hover'
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pumping Inputs */}
        {isPumping && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-ink mb-2">
              Amounts pumped (optional)
            </label>
            <div className="space-y-3">
              {pumpingInputs.map((input, index) => (
                <div key={input.id} className="flex items-center gap-2">
                  <span className="text-xs text-ink-soft w-4">{index + 1}.</span>
                  
                  {/* Side toggle */}
                  <div className="flex rounded-lg overflow-hidden border border-line">
                    <button
                      onClick={() => updatePumpingInput(input.id, 'side', 'left')}
                      className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                        input.side === 'left'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                          : 'bg-muted text-ink-soft hover:bg-hover'
                      }`}
                    >
                      ◀️ L
                    </button>
                    <button
                      onClick={() => updatePumpingInput(input.id, 'side', 'right')}
                      className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                        input.side === 'right'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                          : 'bg-muted text-ink-soft hover:bg-hover'
                      }`}
                    >
                      R ▶️
                    </button>
                  </div>
                  
                  {/* Amount input */}
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="300"
                      value={input.amount || ''}
                      placeholder="0"
                      onChange={(e) => updatePumpingInput(input.id, 'amount', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-16 px-3 py-2 rounded-lg border border-line bg-card-solid text-ink text-center focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 transition-all"
                    />
                    <span className="text-sm text-ink-soft">ml</span>
                  </div>
                  
                  {/* Remove button */}
                  {pumpingInputs.length > 1 && (
                    <button
                      onClick={() => removePumpingInput(input.id)}
                      className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-ink-soft hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              
              {/* Add input button */}
              <button
                onClick={addPumpingInput}
                className="w-full py-2 rounded-lg border border-dashed border-line text-ink-soft hover:bg-muted hover:text-ink transition-colors cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                <span>+</span> Add another side
              </button>
              
              {/* Total */}
              {totalPumpingAmount > 0 && (
                <div className="text-sm text-ink-soft text-right">
                  Total: <span className="font-medium text-ink">{totalPumpingAmount} ml</span>
                </div>
              )}
            </div>

            {/* Duration (optional) */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-ink-soft mb-2">
                Duration (optional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={pumpingDuration || ''}
                  placeholder="0"
                  onChange={(e) => setPumpingDuration(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-20 px-3 py-2 rounded-lg border border-line bg-card-solid text-ink text-center focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 transition-all"
                />
                <span className="text-sm text-ink-soft">min</span>
              </div>
            </div>
          </div>
        )}

        {/* Notes Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-ink mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes..."
            className="w-full px-4 py-3 rounded-xl border border-line bg-card-solid text-ink placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-accent-muted/50 focus:border-accent-muted transition-all resize-none"
            rows={2}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedType}
          className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 cursor-pointer ${
            selectedType
              ? 'bg-linear-to-r from-accent to-accent-bold shadow-lg shadow-orange-500/20 hover:shadow-xl active:scale-[0.98]'
              : 'bg-muted text-ink-soft cursor-not-allowed'
          }`}
        >
          {selectedType ? `Log ${eventConfig[selectedType].label}` : 'Select an event type'}
        </button>
      </div>
    </div>
  )
}
