import { useState, useEffect } from 'react'

const STORAGE_KEY = 'pwa-ios-install-dismissed'

function detectIosSafari() {
  const ua = navigator.userAgent.toLowerCase()
  const isIos =
    /iphone|ipad|ipod/.test(ua) ||
    // iPadOS 13+ se déclare Mac mais a un écran tactile
    (ua.includes('mac') && navigator.maxTouchPoints > 1)
  const isSafari = /safari/.test(ua) && !/chrome|crios|fxios|edgios/.test(ua)
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  return { isIos, isSafari, isStandalone }
}

export function useIosInstallPrompt() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const { isIos, isSafari, isStandalone } = detectIosSafari()
    const eligible = isIos && isSafari && !isStandalone
    if (eligible && !localStorage.getItem(STORAGE_KEY)) {
      setShow(true)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setShow(false)
  }

  const close = () => setShow(false)

  return { show, dismiss, close }
}
