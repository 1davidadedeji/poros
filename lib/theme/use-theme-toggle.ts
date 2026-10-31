'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { prefersReducedMotion } from '@/lib/hooks/use-prefers-reduced-motion'
const STORAGE_KEY = 'poros-theme'
type ViewTransitionDocument = Document & { startViewTransition?: (callback: () => void) => { ready: Promise<void>; finished: Promise<void> } }
export function useThemeToggle() {
  const transitioning = useRef(false)
  const [darkMode, setDarkMode] = useState(false)
  useEffect(() => {
    const sync = () => setDarkMode(document.documentElement.dataset.theme === 'dark')
    try { document.documentElement.dataset.theme = localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light' } catch { /* Theme still works without browser storage. */ }
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    const storedTheme = (event: StorageEvent) => { if (event.key === STORAGE_KEY) { document.documentElement.dataset.theme = event.newValue === 'dark' ? 'dark' : 'light'; sync() } }
    window.addEventListener('storage', storedTheme)
    return () => { observer.disconnect(); window.removeEventListener('storage', storedTheme) }
  }, [])
  const toggleTheme = useCallback((event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
    if (transitioning.current) return
    const nextDark = document.documentElement.dataset.theme !== 'dark'
    const apply = () => { setDarkMode(nextDark); document.documentElement.dataset.theme = nextDark ? 'dark' : 'light' }
    try { localStorage.setItem(STORAGE_KEY, nextDark ? 'dark' : 'light') } catch { /* Optional persistence. */ }
    const doc = document as ViewTransitionDocument
    if (!doc.startViewTransition || prefersReducedMotion()) { apply(); return }
    const rect = event.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    transitioning.current = true
    const transition = doc.startViewTransition(() => flushSync(apply))
    transition.finished.finally(() => { transitioning.current = false }).catch(() => {})
    transition.ready.then(() => document.documentElement.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] }, { duration: 1100, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' })).catch(() => {})
  }, [])
  return { darkMode, toggleTheme }
}
