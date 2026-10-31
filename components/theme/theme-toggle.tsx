'use client'

import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useThemeToggle } from '@/lib/theme/use-theme-toggle'

export function ThemeToggle({ className }: { className?: string }) {
  const { darkMode, toggleTheme } = useThemeToggle()
  return <button className={cn('theme-toggle', className)} type="button" onClick={toggleTheme} aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`} aria-pressed={darkMode}>{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
}
