import { useEffect, useState } from 'react'

const THEME_KEY = 'ink-grove:theme'
export function useTheme() {
  const [preference, setPreference] = useState(() => {
    try {
      const value = localStorage.getItem(THEME_KEY)
      return ['light', 'dark', 'system'].includes(value) ? value : 'light'
    } catch {
      return 'light'
    }
  })
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      document.documentElement.dataset.theme =
        preference === 'system' ? (media.matches ? 'dark' : 'light') : preference
    }
    apply()
    media.addEventListener('change', apply)
    try {
      localStorage.setItem(THEME_KEY, preference)
    } catch {}
    return () => media.removeEventListener('change', apply)
  }, [preference])
  return {
    preference,
    cycleTheme: () =>
      setPreference((value) => ({ light: 'dark', dark: 'system', system: 'light' })[value]),
  }
}
