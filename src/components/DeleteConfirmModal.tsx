import type { BabyEvent } from '../types'
import { eventConfig } from '../types'

interface DeleteConfirmModalProps {
  event: BabyEvent | null
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmModal({ event, onConfirm, onCancel }: DeleteConfirmModalProps) {
  if (!event) return null

  const config = eventConfig[event.type]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
        aria-hidden
      />
      <div
        className="relative w-full max-w-sm mx-4 bg-card-solid rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up border-t border-line sm:border transition-colors duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${config.color}`}>
            {config.emoji}
          </div>
          <h2 id="delete-confirm-title" className="font-serif text-lg font-semibold text-ink">
            Delete this event?
          </h2>
        </div>
        <p className="text-sm text-ink-soft mb-6">
          This {config.label} entry will be removed. This can&apos;t be undone.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-medium text-ink bg-muted hover:bg-hover transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
