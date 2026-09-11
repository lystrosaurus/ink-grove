import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Search,
  Plus,
  ArrowUpRight,
  Sprout,
  Menu,
  X,
  Download,
  Upload,
  Check,
  AlertCircle,
  Moon,
  Sun,
  Monitor,
  Route,
  Network,
  ArrowRight,
} from 'lucide-react'
import catalog from './generated/catalog.json'
import { GroveContext, Link, artifactUrl } from './context.jsx'
import {
  buildConnections,
  commitGarden,
  emptyGarden,
  exportGarden,
  loadGarden,
  searchArtifacts,
  STORAGE_KEY,
  validateGarden,
} from './lib/garden.js'
import { Brand, Modal, EmptyState } from './components/Shared.jsx'
import Home from './pages/Home.jsx'
import Explore from './pages/Explore.jsx'
import Collections from './pages/Collections.jsx'
import Connections, { ConceptPage } from './pages/Connections.jsx'
import ArtifactView from './pages/ArtifactView.jsx'
import Create from './pages/Create.jsx'
import Journeys from './pages/Journeys.jsx'
import { useTheme } from './lib/theme.js'

function initialState() {
  try {
    return loadGarden(window.localStorage)
  } catch {
    return {
      garden: emptyGarden(),
      warning: '浏览器暂时无法保存数据；你仍可探索作品，并导出本次创作。',
    }
  }
}

export default function App() {
  const { preference, cycleTheme } = useTheme()
  const ThemeIcon = preference === 'dark' ? Moon : preference === 'system' ? Monitor : Sun
  const [location, setLocation] = useState(() => window.location.pathname + window.location.search)
  const [initial] = useState(initialState)
  const [garden, setGarden] = useState(initial.garden)
  const gardenRef = useRef(garden)
  const [storageWarning, setStorageWarning] = useState(initial.warning)
  const unreadableStorage = useRef(Boolean(initial.warning))
  const unsavedChanges = useRef(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dataOpen, setDataOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef()
  const notify = useCallback((message, error = false) => {
    clearTimeout(toastTimer.current)
    setToast({ message, error })
    toastTimer.current = setTimeout(() => setToast(null), error ? 6500 : 3200)
  }, [])
  const go = useCallback((to) => {
    if (window.location.pathname + window.location.search !== to)
      window.history.pushState({}, '', to)
    setLocation(to)
    setSearchOpen(false)
    setMenuOpen(false)
    window.scrollTo(0, 0)
  }, [])
  useEffect(() => {
    const pop = () => {
      setLocation(window.location.pathname + window.location.search)
      setMenuOpen(false)
      setSearchOpen(false)
    }
    const key = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((value) => !value)
      }
    }
    const sync = (event) => {
      if (event.key === STORAGE_KEY) {
        if (unsavedChanges.current) {
          setStorageWarning('另一标签页更新了花园。已保留此页面尚未保存的创作，请先导出备份。')
          return
        }
        const next = initialState()
        setGarden(next.garden)
        gardenRef.current = next.garden
        unreadableStorage.current = Boolean(next.warning)
        setStorageWarning(next.warning)
      }
    }
    const beforeUnload = (event) => {
      if (unsavedChanges.current) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('popstate', pop)
    window.addEventListener('keydown', key)
    window.addEventListener('storage', sync)
    window.addEventListener('beforeunload', beforeUnload)
    return () => {
      window.removeEventListener('popstate', pop)
      window.removeEventListener('keydown', key)
      window.removeEventListener('storage', sync)
      window.removeEventListener('beforeunload', beforeUnload)
      clearTimeout(toastTimer.current)
    }
  }, [])
  const updateGarden = useCallback(
    (updater, options = {}) => {
      const next = typeof updater === 'function' ? updater(gardenRef.current) : updater
      let result
      try {
        result = commitGarden(window.localStorage, gardenRef.current, next, {
          preserveUnreadable: unreadableStorage.current,
          ...options,
        })
      } catch {
        result = {
          garden: options.atomic ? gardenRef.current : next,
          warning: '无法保存到浏览器，请导出备份以保留本次修改。',
          saved: false,
        }
      }
      gardenRef.current = result.garden
      setGarden(result.garden)
      setStorageWarning(result.warning)
      if (result.saved) unsavedChanges.current = false
      else if (!options.atomic) unsavedChanges.current = true
      if (result.saved) unreadableStorage.current = false
      if (result.warning) notify(result.warning, true)
      return result.saved
    },
    [notify],
  )
  const artifacts = useMemo(() => [...catalog.artifacts, ...garden.artifacts], [garden.artifacts])
  const collections = useMemo(
    () => [...catalog.collections, ...garden.collections],
    [garden.collections],
  )
  const connections = useMemo(() => buildConnections(artifacts), [artifacts])
  const toggleFavorite = useCallback(
    (id) => {
      const exists = gardenRef.current.favorites.includes(id)
      const saved = updateGarden((previous) => ({
        ...previous,
        favorites: exists
          ? previous.favorites.filter((item) => item !== id)
          : [...previous.favorites, id],
      }))
      if (saved) notify(exists ? '已从心仪作品中移除' : '已收藏，让这个想法留在花园里')
    },
    [updateGarden, notify],
  )
  const recordVisit = useCallback(
    (id, progress) => {
      if (
        !catalog.artifacts.some((item) => item.id === id) &&
        !gardenRef.current.artifacts.some((item) => item.id === id)
      )
        return
      updateGarden((previous) => ({
        ...previous,
        visits: {
          ...previous.visits,
          [id]: {
            at: new Date().toISOString(),
            progress: Math.min(1, Math.max(0, progress ?? previous.visits[id]?.progress ?? 0)),
          },
        },
      }))
    },
    [updateGarden],
  )
  const url = new URL(location, window.location.origin)
  const segments = url.pathname
    .split('/')
    .filter(Boolean)
    .map((segment) => {
      try {
        return decodeURIComponent(segment)
      } catch {
        return segment
      }
    })
  const page = segments[0] || 'home'
  const artifact =
    page === 'artifact'
      ? artifacts.find((item) => item.slug === segments[1] || item.id === segments[1])
      : null
  useEffect(() => {
    const titles = {
      home: '视觉知识花园',
      explore: '探索作品',
      collections: '知识集合',
      connections: '知识连接',
      create: '种下一个新想法',
      journeys: '知识旅程',
      concept: '概念花园',
    }
    document.title = `${artifact?.title || titles[page] || '未找到的路径'} · Ink Grove`
  }, [page, artifact?.title])
  const context = {
    catalog,
    garden,
    gardenRef,
    artifacts,
    collections,
    connections,
    updateGarden,
    toggleFavorite,
    recordVisit,
    notify,
    go,
    openSearch: () => setSearchOpen(true),
  }
  const isArtifact = page === 'artifact' && artifact
  return (
    <GroveContext.Provider value={context}>
      {!isArtifact && (
        <>
          <a className="skip-link" href="#main">
            跳到主要内容
          </a>
          <header className="site-header">
            <div className="header-inner">
              <Brand />
              <nav className={menuOpen ? 'main-nav open' : 'main-nav'} aria-label="主导航">
                {[
                  ['/', '花园', 'home'],
                  ['/explore', '探索', 'explore'],
                  ['/collections', '集合', 'collections'],
                  ['/connections', '连接', 'connections'],
                ].map(([to, label, key]) => (
                  <Link
                    key={to}
                    to={to}
                    className={page === key ? 'active' : ''}
                    aria-current={page === key ? 'page' : undefined}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
              <div className="header-actions">
                <button
                  className="header-search"
                  onClick={() => setSearchOpen(true)}
                  aria-label="搜索作品"
                >
                  <Search size={17} />
                  <span>寻找灵感</span>
                  <kbd>Ctrl K</kbd>
                </button>
                <Link className="button primary create-nav" to="/create">
                  <Plus size={16} />
                  创造<span>新知</span>
                </Link>
                <button
                  className="icon-button mobile-menu"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-label={menuOpen ? '关闭导航' : '展开导航'}
                  aria-expanded={menuOpen}
                >
                  {menuOpen ? <X size={21} /> : <Menu size={21} />}
                </button>
              </div>
            </div>
          </header>
        </>
      )}
      {storageWarning && !isArtifact && (
        <div className="storage-warning" role="alert">
          <AlertCircle size={16} />
          <span>{storageWarning}</span>
          <button onClick={() => setDataOpen(true)}>导出备份</button>
        </div>
      )}
      <main id="main" className={isArtifact ? 'reader-main' : 'site-main'}>
        {page === 'home' && <Home />}
        {page === 'explore' && <Explore key={url.search} params={url.searchParams} />}
        {page === 'collections' && <Collections id={segments[1]} />}
        {page === 'connections' && <Connections params={url.searchParams} />}
        {page === 'concept' && <ConceptPage id={segments[1]} />}
        {page === 'create' && <Create key={url.search} params={url.searchParams} />}
        {page === 'journeys' && <Journeys id={segments[1]} />}
        {isArtifact && <ArtifactView key={artifact.id} artifact={artifact} />}
        {((page === 'artifact' && !artifact) ||
          ![
            'home',
            'explore',
            'collections',
            'connections',
            'concept',
            'create',
            'artifact',
            'journeys',
          ].includes(page)) && (
          <EmptyState
            title="这条小径，还没有长出作品"
            description="或许它已被移走。回到花园，寻找下一份灵感。"
            action="返回花园"
            to="/"
          />
        )}
      </main>
      {!isArtifact && (
        <footer className="site-footer">
          <div>
            <Brand compact />
            <span>让知识拥有最适合它自己的形态。</span>
          </div>
          <div>
            <button
              className="theme-toggle"
              onClick={cycleTheme}
              aria-label={`切换主题，当前${{ light: '浅色', dark: '深色', system: '跟随系统' }[preference]}`}
            >
              <ThemeIcon size={14} />
              {{ light: '浅色', dark: '深色', system: '跟随系统' }[preference]}
            </button>
            <Link className="footer-journey" to="/journeys">
              探索旅程
            </Link>
            <span className="footer-live">
              <i />
              一座持续生长的花园
            </span>
            <button onClick={() => setDataOpen(true)}>
              我的花园数据
              <ArrowUpRight size={13} />
            </button>
            <span className="footer-year">© {new Date().getFullYear()} Ink Grove</span>
          </div>
        </footer>
      )}
      {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} />}
      {dataOpen && <DataDialog onClose={() => setDataOpen(false)} />}
      {toast && (
        <div className={`toast ${toast.error ? 'error' : ''}`} role="status">
          {toast.error ? <AlertCircle size={17} /> : <Check size={17} />}
          {toast.message}
        </div>
      )}
    </GroveContext.Provider>
  )
}

function SearchDialog({ onClose }) {
  const { artifacts, catalog } = useGroveImport()
  const [query, setQuery] = useState('')
  const [activeResult, setActiveResult] = useState(0)
  const { go } = useGroveImport()
  useEffect(() => setActiveResult(0), [query])
  const results = searchArtifacts(artifacts, query).slice(0, 8)
  const concepts = catalog.concepts
    .filter(
      (concept) =>
        query &&
        `${concept.name} ${concept.id} ${concept.description}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .slice(0, 5)
  return (
    <Modal title="沿着好奇心，找一个入口" className="search-modal" onClose={onClose}>
      <div className="search-field large">
        <Search size={21} />
        <input
          data-autofocus
          placeholder="搜索作品、主题、概念…"
          aria-label="搜索关键词"
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              setActiveResult((index) => Math.min(results.length - 1, index + 1))
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault()
              setActiveResult((index) => Math.max(0, index - 1))
            }
            if (event.key === 'Enter' && results[activeResult]) {
              event.preventDefault()
              go(artifactUrl(results[activeResult]))
            }
          }}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <kbd>ESC</kbd>
      </div>
      {!query && (
        <div className="search-suggestions">
          <span>从一个概念开始</span>
          {['注意力', '成长', '反馈', '自由'].map((word) => (
            <button key={word} onClick={() => setQuery(word)}>
              {word}
            </button>
          ))}
        </div>
      )}
      {concepts.length > 0 && (
        <div className="search-concepts">
          <span>CONCEPTS</span>
          {concepts.map((concept) => (
            <Link key={concept.id} to={`/concept/${concept.id}`}>
              {concept.name}
            </Link>
          ))}
        </div>
      )}
      <div className="search-results">
        {results.length ? (
          results.map((item, index) => (
            <Link
              className={`search-result ${activeResult === index ? 'keyboard-active' : ''}`}
              key={item.id}
              to={artifactUrl(item)}
            >
              {item.cover ? (
                <img src={item.cover} alt="" />
              ) : (
                <span className="search-placeholder">
                  <Sprout />
                </span>
              )}
              <span>
                <strong>{item.title}</strong>
                <small>{item.subtitle}</small>
              </span>
              <ArrowUpRight size={18} />
            </Link>
          ))
        ) : (
          <EmptyState
            title="还没找到这个想法"
            description="试试更短的词，或把它种成一份新作品。"
            action="创造新知"
            to={`/create?title=${encodeURIComponent(query)}`}
          />
        )}
      </div>
      <div className="command-actions">
        <Link to="/create">
          <Plus size={13} />
          创造新知
        </Link>
        <Link to="/connections">
          <Network size={13} />
          探索知识网络
        </Link>
        <Link to="/journeys">
          <Route size={13} />
          开始一段旅程
        </Link>
      </div>
      <div className="search-bottom">
        <span>{query ? `${results.length} 个相关作品` : '每一个问题，都是生长的起点。'}</span>
        <span>ESC 关闭</span>
      </div>
    </Modal>
  )
}

// Keep the dialogs on the same context as the routed pages.
import { useGrove as useGroveImport } from './context.jsx'

function DataDialog({ onClose }) {
  const { garden, artifacts, updateGarden, notify } = useGroveImport()
  const input = useRef(null)
  const [pending, setPending] = useState(null)
  const [error, setError] = useState('')
  const [recovery] = useState(() => {
    try {
      const backup = localStorage.getItem(`${STORAGE_KEY}:recovery`)
      if (backup) return backup
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw && loadGarden(localStorage).warning) return raw
      return null
    } catch {
      return null
    }
  })
  function downloadRecovery() {
    const blob = new Blob([recovery], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `ink-grove-recovery-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    setTimeout(() => URL.revokeObjectURL(link.href), 1000)
  }
  function download() {
    try {
      const blob = new Blob([exportGarden(garden)], { type: 'application/json' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `ink-grove-${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      setTimeout(() => URL.revokeObjectURL(link.href), 1000)
      notify('花园备份已导出')
    } catch (error) {
      setError(error.message)
    }
  }
  async function prepare(event) {
    setError('')
    setPending(null)
    const file = event.target.files[0]
    event.target.value = ''
    if (!file) return
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('备份文件不能超过 10 MB')
      setPending(
        validateGarden(JSON.parse(await file.text()), {
          catalogIds: artifacts
            .filter((item) => !item.id.startsWith('local-'))
            .map((item) => item.id),
        }),
      )
    } catch (error) {
      setError(`未导入：${error.message}`)
    }
  }
  return (
    <Modal
      title="照料你的花园"
      description="收藏、集合与新作品保存在当前浏览器。定期导出，让灵感有一份备份。"
      onClose={onClose}
    >
      <div className="data-stats">
        <span>
          <strong>{garden.favorites.length}</strong>心仪作品
        </span>
        <span>
          <strong>{garden.collections.length}</strong>我的集合
        </span>
        <span>
          <strong>{garden.artifacts.length}</strong>我的创作
        </span>
      </div>
      <button className="button primary full-width" onClick={download}>
        <Download size={17} />
        导出花园备份
      </button>
      <button className="button secondary full-width" onClick={() => input.current.click()}>
        <Upload size={17} />
        从备份恢复
      </button>
      <input type="file" accept=".json,application/json" hidden ref={input} onChange={prepare} />
      {recovery && (
        <button className="button secondary full-width" onClick={downloadRecovery}>
          <Download size={17} />
          下载被保护的原始数据
        </button>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {pending && (
        <div className="import-confirm">
          <h3>备份已读取，等待恢复</h3>
          <p>
            {pending.artifacts.length} 件创作、{pending.collections.length} 个集合、
            {pending.favorites.length} 个收藏。恢复会替换当前浏览器的花园数据。
          </p>
          <div className="button-row">
            <button
              className="button primary"
              onClick={() => {
                if (updateGarden(pending, { atomic: true })) {
                  notify('花园已恢复')
                  onClose()
                }
              }}
            >
              确认恢复
            </button>
            <button className="button secondary" onClick={() => setPending(null)}>
              取消
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
