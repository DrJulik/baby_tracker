import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOSPrompt, setShowIOSPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already dismissed
    if (localStorage.getItem('pwa-install-dismissed')) {
      setDismissed(true)
      return
    }

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    // Check for iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone
    
    if (isIOS && !isInStandaloneMode) {
      // Delay showing iOS prompt slightly
      setTimeout(() => setShowIOSPrompt(true), 2000)
      return
    }

    // Listen for beforeinstallprompt (Android/Desktop Chrome)
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    setDeferredPrompt(null)
    setShowIOSPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Don't show if dismissed or no prompt available
  if (dismissed || (!deferredPrompt && !showIOSPrompt)) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-card-solid border border-line rounded-2xl shadow-lg p-4 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <div className="text-3xl">📲</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-ink text-base">
              Install Baby Tracker
            </h3>
            <p className="text-ink-soft text-sm mt-0.5">
              {showIOSPrompt 
                ? <>Tap <span className="inline-flex items-center"><ShareIcon /></span> then "Add to Home Screen"</>
                : 'Add to your home screen for the best experience'
              }
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 mt-3">
          {deferredPrompt && (
            <button
              onClick={handleInstall}
              className="flex-1 bg-accent hover:bg-accent-bold text-white font-medium py-2 px-4 rounded-xl transition-colors"
            >
              Install
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="flex-1 bg-muted hover:bg-hover text-ink-soft font-medium py-2 px-4 rounded-xl transition-colors"
          >
            {showIOSPrompt ? 'Got it' : 'Maybe Later'}
          </button>
        </div>
      </div>
    </div>
  )
}

// iOS Share icon
function ShareIcon() {
  return (
    <svg 
      className="w-4 h-4 mx-0.5 text-accent" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" 
      />
    </svg>
  )
}
