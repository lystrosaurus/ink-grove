import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import catalog from '../generated/seed-catalog.json'
import { createSeedGardenModel, SEED_STORAGE_KEY } from './garden.js'

const SeedContext = createContext(null)
const model = createSeedGardenModel({ seedIds: catalog.seeds.map((seed) => seed.id) })
function storage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}
const currentLocation = () => window.location.pathname + window.location.search

export function SeedProvider({ children }) {
  const [snapshot, setSnapshot] = useState(() => model.loadSeedGarden(storage()))
  const saved = useRef(snapshot)
  const dirty = useRef(false)
  const [location, setLocation] = useState(currentLocation)
  const route = useRef(location)
  const historyIndex = useRef(0)
  const [notice, setNotice] = useState('')
  const setDirty = useCallback((value) => {
    dirty.current = Boolean(value)
  }, [])
  const accept = useCallback((next) => {
    saved.current = next
    setSnapshot(next)
  }, [])
  const commit = useCallback(
    (next, message) => {
      const result = model.commitSeedGarden(storage(), saved.current, next)
      accept(result)
      setNotice(result.saved ? message : '')
      if (result.saved) dirty.current = false
      return result.saved
    },
    [accept],
  )
  const report = useCallback((error) => {
    setSnapshot((previous) => ({
      ...previous,
      warning: error?.message || '这次没有保存，请保留当前文字。',
    }))
    setNotice('')
    return false
  }, [])
  const canLeave = useCallback(
    () => !dirty.current || window.confirm('还有没保存的发现。要离开吗？留在这里可以继续写。'),
    [],
  )
  const go = useCallback(
    (to) => {
      const target = new URL(to, window.location.href)
      if (target.origin !== window.location.origin || !/^\/seed(?:\/|$)/.test(target.pathname))
        return false
      const next = target.pathname + target.search
      if (next === route.current) return true
      if (!canLeave()) return false
      dirty.current = false
      historyIndex.current += 1
      window.history.pushState({ seedIndex: historyIndex.current }, '', next)
      route.current = next
      setLocation(next)
      setNotice('')
      window.scrollTo(0, 0)
      return true
    },
    [canLeave],
  )
  useEffect(() => {
    window.history.replaceState({ ...window.history.state, seedIndex: 0 }, '', window.location.href)
    let restoring = false
    const pop = (event) => {
      if (restoring) {
        restoring = false
        return
      }
      const nextIndex = Number.isInteger(event.state?.seedIndex) ? event.state.seedIndex : 0
      if (!canLeave()) {
        const distance = historyIndex.current - nextIndex
        if (distance) {
          restoring = true
          window.history.go(distance)
        } else window.history.replaceState({ seedIndex: historyIndex.current }, '', route.current)
        return
      }
      dirty.current = false
      historyIndex.current = nextIndex
      route.current = currentLocation()
      setLocation(route.current)
      setNotice('')
    }
    const sync = (event) => {
      if (event.key !== SEED_STORAGE_KEY && event.key !== null) return
      if (dirty.current) {
        setSnapshot((previous) => ({
          ...previous,
          warning: '另一页面更新了成长记录。这里的文字还在，请先复制，再重新载入最新记录。',
        }))
      } else accept(model.loadSeedGarden(storage()))
    }
    const beforeUnload = (event) => {
      if (dirty.current) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('popstate', pop)
    window.addEventListener('storage', sync)
    window.addEventListener('beforeunload', beforeUnload)
    return () => {
      window.removeEventListener('popstate', pop)
      window.removeEventListener('storage', sync)
      window.removeEventListener('beforeunload', beforeUnload)
    }
  }, [accept, canLeave])
  const value = {
    garden: snapshot.garden,
    warning: snapshot.warning,
    notice,
    location,
    go,
    setDirty,
    setAge(age) {
      if (age === saved.current.garden.age) return true
      if (!canLeave()) return false
      return commit({ ...saved.current.garden, age }, '换一种适合你的读法。')
    },
    recordEvent(input) {
      try {
        const event = model.createGrowthEvent(input, saved.current.garden.age)
        return commit(
          { ...saved.current.garden, events: [...saved.current.garden.events, event] },
          '这次发现，已经种在小花园里。',
        )
      } catch (error) {
        return report(error)
      }
    },
    restore(value) {
      try {
        if (!canLeave()) return false
        return commit(model.validateSeedGarden(value), '成长记录已经恢复。')
      } catch (error) {
        return report(error)
      }
    },
    clear: () =>
      canLeave() &&
      commit({ ...saved.current.garden, events: [] }, '本机的成长记录已清空，可以重新发现。'),
    exportData: () => model.exportSeedGarden(saved.current.garden),
    validateImport: (value) => model.validateSeedGarden(value),
    getRecovery({ previous = false } = {}) {
      try {
        if (!previous && saved.current.unreadable && saved.current.raw !== null)
          return saved.current.raw
        return storage()?.getItem(`${SEED_STORAGE_KEY}:recovery`) ?? null
      } catch {
        return saved.current.raw
      }
    },
  }
  return <SeedContext.Provider value={value}>{children}</SeedContext.Provider>
}

export const useSeed = () => useContext(SeedContext)
export function SeedLink({ to, onClick, children, ...props }) {
  const { go } = useSeed()
  return (
    <a
      {...props}
      href={to}
      onClick={(event) => {
        onClick?.(event)
        if (
          !event.defaultPrevented &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey &&
          event.button === 0 &&
          (!props.target || props.target === '_self')
        ) {
          event.preventDefault()
          go(to)
        }
      }}
    >
      {children}
    </a>
  )
}
