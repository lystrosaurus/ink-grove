import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  Heart,
  Share2,
  Network,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  FolderPlus,
  Download,
  Pencil,
  Trash2,
  X,
  ArrowUpRight,
} from 'lucide-react'
import { useGrove, Link, artifactUrl, RELATIONS } from '../context.jsx'
import { CollectionPicker, Modal } from '../components/Shared.jsx'
import ArtifactRenderer from '../components/ArtifactRenderer.jsx'

export default function ArtifactView({ artifact }) {
  const {
    garden,
    gardenRef,
    artifacts,
    connections,
    toggleFavorite,
    recordVisit,
    notify,
    go,
    updateGarden,
  } = useGrove()
  const [focus, setFocus] = useState(false)
  const [visible, setVisible] = useState(true)
  const [panel, setPanel] = useState(null)
  const [progress, setProgress] = useState(garden.visits[artifact.id]?.progress || 0)
  const initialProgress = useRef(progress)
  const latestProgress = useRef(progress)
  const frameRef = useRef(null),
    scrollRef = useRef(null)
  const hideTimer = useRef(),
    saveTimer = useRef()
  const restored = useRef(false)
  const owned = garden.artifacts.some((item) => item.id === artifact.id)
  const saved = garden.favorites.includes(artifact.id)
  const related = connections.filter(
    (edge) => edge.source === artifact.id || edge.target === artifact.id,
  )
  const wake = useCallback(() => {
    setVisible(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setVisible(false), 2600)
  }, [])
  const onProgress = useCallback(
    (value) => {
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) return
      latestProgress.current = value
      setProgress(value)
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => recordVisit(artifact.id, latestProgress.current), 700)
    },
    [artifact.id, recordVisit],
  )
  const restore = useCallback(() => {
    if (artifact.artifact.renderer === 'html') {
      frameRef.current?.contentWindow?.postMessage(
        { type: 'ink-grove:restore', progress: initialProgress.current },
        '*',
      )
    } else if (scrollRef.current && !restored.current) {
      scrollRef.current.scrollTop =
        Math.max(0, scrollRef.current.scrollHeight - scrollRef.current.clientHeight) *
        initialProgress.current
    }
    restored.current = true
  }, [artifact.artifact.renderer])
  useEffect(() => {
    recordVisit(artifact.id, initialProgress.current)
    wake()
    const keyAction = (key) => {
      if (key.toLowerCase() === 'f') {
        setFocus((value) => !value)
        setPanel(null)
      } else if (key === 'Escape') {
        setFocus(false)
        setPanel(null)
        wake()
      }
    }
    const keydown = (event) => {
      if (event.defaultPrevented || event.repeat || event.ctrlKey || event.metaKey || event.altKey)
        return
      if (
        event.key !== 'Escape' &&
        (event.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName))
      )
        return
      if (['f', 'F', 'Escape'].includes(event.key)) {
        event.preventDefault()
        keyAction(event.key)
      }
    }
    const message = (event) => {
      if (
        !frameRef.current ||
        event.source !== frameRef.current.contentWindow ||
        !event.data ||
        typeof event.data !== 'object'
      )
        return
      const data = event.data
      if (data.type === 'ink-grove:ready') restore()
      if (data.type === 'ink-grove:pointer') wake()
      if (data.type === 'ink-grove:progress' && restored.current) onProgress(data.progress)
      if (data.type === 'ink-grove:keydown' && ['f', 'F', 'Escape'].includes(data.key))
        keyAction(data.key)
    }
    const flush = () => recordVisit(artifact.id, latestProgress.current)
    window.addEventListener('keydown', keydown)
    window.addEventListener('message', message)
    window.addEventListener('pagehide', flush)
    return () => {
      clearTimeout(hideTimer.current)
      clearTimeout(saveTimer.current)
      window.removeEventListener('keydown', keydown)
      window.removeEventListener('message', message)
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [artifact.id, onProgress, recordVisit, restore, wake])
  async function share() {
    if (owned) {
      setPanel('share')
      return
    }
    try {
      await navigator.clipboard.writeText(window.location.href)
      notify('作品链接已复制')
    } catch {
      setPanel('share')
    }
  }
  async function download() {
    try {
      const data = artifact.artifact
      let blob
      if (data.content !== undefined)
        blob =
          data.renderer === 'image'
            ? await (await fetch(data.content)).blob()
            : new Blob([data.content], {
                type: { html: 'text/html', markdown: 'text/markdown', svg: 'image/svg+xml' }[
                  data.renderer
                ],
              })
      else {
        const response = await fetch(data.src)
        if (!response.ok) throw new Error('下载失败，请重新尝试')
        blob = await response.blob()
      }
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      const imageExtension =
        {
          'image/png': 'png',
          'image/jpeg': 'jpg',
          'image/webp': 'webp',
          'image/gif': 'gif',
          'image/svg+xml': 'svg',
        }[blob.type] || 'png'
      link.download = `${artifact.slug}.${{ html: 'html', markdown: 'md', svg: 'svg', image: imageExtension }[data.renderer]}`
      link.click()
      setTimeout(() => URL.revokeObjectURL(link.href), 1000)
      notify('作品文件已导出')
    } catch (error) {
      notify(error.message, true)
    }
  }
  function remove() {
    const saved = updateGarden(
      (previous) => ({
        ...previous,
        artifacts: previous.artifacts
          .filter((a) => a.id !== artifact.id)
          .map((a) => ({
            ...a,
            related: a.related.filter((id) => id !== artifact.id),
            connections: a.connections.filter((edge) => edge.target !== artifact.id),
            provenance: {
              ...a.provenance,
              derivedFrom: a.provenance.derivedFrom.filter((id) => id !== artifact.id),
            },
          })),
        favorites: previous.favorites.filter((id) => id !== artifact.id),
        collections: previous.collections.map((c) => ({
          ...c,
          artifactIds: c.artifactIds.filter((id) => id !== artifact.id),
        })),
        visits: Object.fromEntries(
          Object.entries(previous.visits).filter(([id]) => id !== artifact.id),
        ),
      }),
      { atomic: true },
    )
    if (!saved) return
    go('/explore')
    notify('作品已从花园移除')
  }
  return (
    <div
      className={`reader-shell ${focus ? 'focus-mode' : ''} ${visible ? 'controls-visible' : ''}`}
      onMouseMove={wake}
    >
      {!focus && (
        <>
          <Link className="reader-back" to="/">
            <ArrowLeft size={16} />
            Ink Grove
          </Link>
          <div className="reader-toolbar" onFocus={wake}>
            <div className="reader-title">
              <strong>{artifact.title}</strong>
              <span>{Math.round(progress * 100)}% 探索进度</span>
            </div>
            <div className="reader-actions">
              <button
                className={`icon-button ${saved ? 'saved' : ''}`}
                aria-label={saved ? '取消收藏作品' : '收藏作品'}
                title="收藏作品"
                aria-pressed={saved}
                onClick={() => toggleFavorite(artifact.id)}
              >
                <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
              </button>
              <button className="icon-button" aria-label="分享作品" title="分享" onClick={share}>
                <Share2 size={18} />
              </button>
              <button
                className="icon-button"
                aria-label="查看作品连接"
                title="思想连接"
                onClick={() => setPanel(panel === 'connections' ? null : 'connections')}
              >
                <Network size={18} />
              </button>
              <span className="toolbar-divider" />
              <button
                className="icon-button"
                aria-label="进入专注模式"
                title="专注模式 · F"
                onClick={() => {
                  setFocus(true)
                  setPanel(null)
                }}
              >
                <Maximize2 size={18} />
              </button>
              <button
                className="icon-button"
                aria-label="更多作品操作"
                title="更多"
                onClick={() => setPanel(panel === 'more' ? null : 'more')}
              >
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>
          <div className="reader-progress">
            <span style={{ width: `${progress * 100}%` }} />
          </div>
        </>
      )}
      {focus && (
        <button
          className="focus-touch-exit"
          onClick={() => {
            setFocus(false)
            wake()
          }}
          aria-label="退出专注模式"
          title="退出专注 · Esc"
        >
          <Minimize2 size={18} />
        </button>
      )}
      <ArtifactRenderer
        artifact={artifact}
        frameRef={frameRef}
        scrollRef={scrollRef}
        onReady={restore}
        onScroll={() => {
          if (restored.current && scrollRef.current) {
            const el = scrollRef.current
            onProgress(
              el.scrollHeight > el.clientHeight
                ? el.scrollTop / (el.scrollHeight - el.clientHeight)
                : 0,
            )
          }
        }}
      />
      {panel === 'more' && !focus && (
        <div className="reader-menu">
          <button onClick={() => setPanel('collection')}>
            <FolderPlus size={16} />
            加入集合
          </button>
          <button onClick={download}>
            <Download size={16} />
            导出作品
          </button>
          <Link to={`/create?mode=synthesis&from=${artifact.id}`}>
            <Network size={16} />
            以此开始贯通
          </Link>
          {owned && (
            <>
              <Link to={`/create?edit=${artifact.id}`}>
                <Pencil size={16} />
                编辑作品
              </Link>
              <button className="danger-text" onClick={() => setPanel('delete')}>
                <Trash2 size={16} />
                删除作品
              </button>
            </>
          )}
          <div className="reader-provenance">
            <span>作品来源</span>
            <strong>{artifact.author}</strong>
            <p>
              {artifact.provenance.generatedBy === 'ai'
                ? 'AI 辅助创作'
                : artifact.sourceType === 'personal'
                  ? '个人创作'
                  : artifact.sourceType === 'synthesis'
                    ? '跨作品贯通'
                    : '原始视觉作品'}{' '}
              · {artifact.createdAt.slice(0, 10)}
            </p>
            <small>{artifact.visualStyle}</small>
            <button className="menu-dismiss" onClick={() => setPanel(null)}>
              收起
            </button>
          </div>
        </div>
      )}
      {panel === 'connections' && !focus && (
        <aside className="reader-connections">
          <div className="sidebar-heading">
            <span className="eyebrow">CONNECTED IDEAS</span>
            <button
              className="icon-button"
              aria-label="关闭连接面板"
              onClick={() => setPanel(null)}
            >
              <X size={18} />
            </button>
          </div>
          <h2>这份思想，通向哪里？</h2>
          {related.length ? (
            related.map((edge) => {
              const other = artifacts.find(
                (a) => a.id === (edge.source === artifact.id ? edge.target : edge.source),
              )
              return (
                <Link key={edge.id} className="reader-related" to={artifactUrl(other)}>
                  <span>
                    {RELATIONS[edge.type] || edge.type}
                    <ArrowUpRight size={14} />
                  </span>
                  <h3>{other.title}</h3>
                  <p>{edge.label}</p>
                </Link>
              )
            })
          ) : (
            <p>它是一个新想法。开始贯通，为它建立第一条连接。</p>
          )}
          <Link className="button secondary full-width" to={`/connections?artifact=${artifact.id}`}>
            查看知识网络
            <ArrowUpRight size={16} />
          </Link>
        </aside>
      )}
      {panel === 'collection' && (
        <CollectionPicker artifact={artifact} onClose={() => setPanel(null)} />
      )}
      {panel === 'share' && (
        <Modal
          title={owned ? '分享你的作品' : '分享这份思想'}
          description={
            owned
              ? '这是保存在当前浏览器的创作。导出作品文件，就能把它带给别人。'
              : '复制下面的链接，在当前运行此花园的设备上打开。'
          }
          onClose={() => setPanel(null)}
        >
          {owned ? (
            <button className="button primary" onClick={download}>
              <Download size={16} />
              导出作品文件
            </button>
          ) : (
            <input
              className="share-url"
              aria-label="作品链接"
              readOnly
              value={window.location.href}
              onFocus={(event) => event.target.select()}
            />
          )}
        </Modal>
      )}
      {panel === 'delete' && (
        <Modal
          title="移除这份作品？"
          description="这会同时移除它的收藏和集合引用。你可以先导出文件留存。"
          onClose={() => setPanel(null)}
        >
          <div className="button-row">
            <button className="button danger" onClick={remove}>
              确认移除
            </button>
            <button className="button secondary" onClick={download}>
              先导出作品
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
