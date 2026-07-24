import { useEffect, useState } from 'react'

// Evénement standard non encore dans les types DOM par défaut de TypeScript.
interface IBeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function useAndroidInstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState<IBeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredEvent(e as IBeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const promptInstall = async () => {
    if (!deferredEvent) return
    await deferredEvent.prompt()
    await deferredEvent.userChoice
    setDeferredEvent(null)
  }

  return { canInstall: !!deferredEvent, promptInstall }
}
