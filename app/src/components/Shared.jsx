import { useEffect, useRef } from 'react'
import {
  ArrowUpRight,
  ArrowRight,
  Sprout,
  X,
  Heart,
  Network,
  Plus,
  Leaf,
  MoveUpRight,
} from 'lucide-react'
import { Link, useGrove, artifactUrl, TYPE_EN } from '../context.jsx'

export function Brand({ compact = false }) {
  return (
    <Link to="/" className="brand" aria-label="Ink Grove 首页">
      <span className="brand-mark">
        <Sprout size={24} strokeWidth={1.5} />
      </span>
      <span>Ink Grove{!compact && <small>墨蕴成林 · 视觉知识花园</small>}</span>
    </Link>
  )
}

export function SectionHead({
  eyebrow,
  title,
  description,
  to,
  action = '探索全部作品',
  children,
}) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {to ? (
        <Link className="text-link" to={to}>
          {action}
          <ArrowUpRight size={17} />
        </Link>
      ) : (
        children
      )}
    </div>
  )
}

export function ArtifactCard({ artifact, compact = false, index = 0 }) {
  const { garden, toggleFavorite } = useGrove()
  const saved = garden.favorites.includes(artifact.id)
  return (
    <article
      className={`artifact-card ${compact ? 'compact' : ''}`}
      style={{ '--card-order': index }}
    >
      <Link
        to={artifactUrl(artifact)}
        className="artifact-cover"
        aria-label={`探索${artifact.title}`}
      >
        {artifact.cover ? (
          <img src={artifact.cover} alt={`${artifact.title} · 视觉作品封面`} loading="lazy" />
        ) : (
          <div className={`local-cover ${artifact.artifactType}`}>
            <span>
              {artifact.artifactType === 'synthesis' ? <Network size={36} /> : <Leaf size={36} />}
            </span>
            <strong>{artifact.title}</strong>
            <small>
              {artifact.artifactType === 'synthesis'
                ? 'CONNECTED UNDERSTANDING'
                : 'A SEED OF THOUGHT'}
            </small>
          </div>
        )}
        <span className="cover-enter">
          <ArrowUpRight size={19} />
        </span>
      </Link>
      <div className="card-caption">
        <span className="artifact-type">
          <i />
          {TYPE_EN[artifact.artifactType] || 'ARTIFACT'}
          <span>{artifact.artifact.renderer.toUpperCase()}</span>
        </span>
        <button
          className={`icon-button save-button ${saved ? 'saved' : ''}`}
          onClick={() => toggleFavorite(artifact.id)}
          aria-label={`${saved ? '取消收藏' : '收藏'}${artifact.title}`}
          aria-pressed={saved}
        >
          <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <h3>
        <Link to={artifactUrl(artifact)}>{artifact.title}</Link>
      </h3>
      <p>{artifact.subtitle}</p>
      <div className="card-topics">
        {artifact.topics.slice(0, 3).map((topic) => (
          <Link key={topic} to={`/explore?topic=${encodeURIComponent(topic)}`}>
            {topic}
          </Link>
        ))}
        <span className="visual-style">{artifact.visualStyle?.replaceAll('-', ' ')}</span>
      </div>
      {garden.visits[artifact.id]?.progress > 0 && (
        <div
          className="card-progress"
          title={`探索进度 ${Math.round(garden.visits[artifact.id].progress * 100)}%`}
        >
          <span style={{ width: `${garden.visits[artifact.id].progress * 100}%` }} />
        </div>
      )}
    </article>
  )
}

export function EmptyState({ title, description, action, onAction, to, icon: Icon = Sprout }) {
  return (
    <div className="empty-state">
      <span>
        <Icon size={35} strokeWidth={1.3} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action &&
        (to ? (
          <Link className="button primary" to={to}>
            {action}
            <ArrowRight size={16} />
          </Link>
        ) : (
          <button className="button primary" onClick={onAction}>
            {action}
          </button>
        ))}
    </div>
  )
}

export function Modal({ title, onClose, children, className = '', description }) {
  const ref = useRef(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const previous = document.activeElement
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusables = () =>
      [
        ...ref.current.querySelectorAll(
          'button:not(:disabled), input:not(:disabled), textarea, select, a[href], [tabindex="0"]',
        ),
      ].filter((el) => el.getClientRects().length)
    ;(ref.current.querySelector('[data-autofocus]') || focusables()[0] || ref.current).focus()
    const keydown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        closeRef.current()
      }
      if (event.key === 'Tab') {
        const list = focusables(),
          first = list[0],
          last = list.at(-1)
        if (!list.length) {
          event.preventDefault()
          return
        }
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    ref.current.addEventListener('keydown', keydown)
    const node = ref.current
    return () => {
      document.body.style.overflow = oldOverflow
      node.removeEventListener('keydown', keydown)
      previous?.focus()
    }
  }, [])
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className={`modal ${className}`}
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button className="icon-button" onClick={onClose} aria-label="关闭">
            <X size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}

export function GardenIllustration() {
  const leaves = [
    [277, 145, -24, 1],
    [304, 130, 30, 0.8],
    [332, 95, 43, 0.8],
    [356, 113, 78, 0.8],
    [241, 163, -61, 0.8],
    [199, 183, -48, 0.8],
    [178, 206, -78, 0.7],
    [304, 190, 26, 0.7],
    [357, 185, 65, 1],
    [383, 155, 47, 0.85],
    [400, 196, 83, 0.7],
    [221, 235, -46, 0.7],
    [187, 278, -74, 0.8],
    [289, 274, 28, 0.8],
    [330, 246, 52, 0.7],
    [370, 286, 74, 0.8],
    [278, 335, -44, 0.8],
    [307, 337, 36, 0.8],
    [248, 366, -38, 0.8],
  ]
  return (
    <svg
      className="garden-illustration"
      viewBox="0 0 580 450"
      role="img"
      aria-label="知识树：从觉察与原则，生长出训练、能力、杠杆和自由"
    >
      <defs>
        <radialGradient id="garden-glow">
          <stop stopColor="#e6ebdc" stopOpacity=".85" />
          <stop offset="1" stopColor="#f8f7f3" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="leaf-shade" x2="1" y2="1">
          <stop stopColor="#65826a" />
          <stop offset="1" stopColor="#284d3d" />
        </linearGradient>
      </defs>
      <circle cx="290" cy="240" r="212" fill="url(#garden-glow)" />
      <g fill="none" stroke="#b9c7b7" strokeWidth=".6">
        <ellipse cx="290" cy="228" rx="190" ry="155" strokeDasharray="3 8" />
        <ellipse cx="290" cy="228" rx="126" ry="192" transform="rotate(-28 290 228)" />
        <ellipse cx="290" cy="228" rx="226" ry="95" transform="rotate(-27 290 228)" opacity=".6" />
      </g>
      <g stroke="#647d61" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M287 409C278 332 295 266 287 204S304 127 329 72" />
        <path d="M285 326C246 300 241 258 210 244M289 284C327 257 335 220 375 207M286 230C239 216 242 187 213 170M293 167C335 163 345 139 362 104M285 370C254 358 249 334 240 321" />
        <path
          d="M252 292l-43-9M265 310l41-21M306 270l31 1M337 227l-6-24M286 209l41-20M254 204l-44 7M305 137l-18-27"
          strokeWidth="1.2"
        />
      </g>
      <g fill="url(#leaf-shade)">
        {leaves.map(([x, y, angle, scale], i) => (
          <g
            key={i}
            transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}
            opacity={0.65 + (i % 3) * 0.12}
          >
            <path d="M0 30C-26 13-21-11 0-31C21-11 26 13 0 30Z" />
            <path
              d="M0 26V-24M0 5l-12-12M0 12l12-12"
              stroke="#d6ddc8"
              strokeWidth=".8"
              fill="none"
            />
          </g>
        ))}
      </g>
      <g fill="#6f896d">
        <circle cx="114" cy="198" r="4" />
        <circle cx="434" cy="150" r="4" />
        <circle cx="464" cy="284" r="4" />
        <circle cx="147" cy="339" r="4" />
        <circle cx="385" cy="378" r="4" />
      </g>
      <g stroke="#a5b6a2" strokeWidth=".7" fill="none">
        <path d="M117 198h52l36 18M433 151h-28l-23 29M462 283h-45l-47-30M150 339h40l36-37M382 378h-47l-33-31" />
      </g>
      {[
        [75, 180, '觉察', 'AWARENESS'],
        [420, 127, '原则', 'PRINCIPLES'],
        [446, 319, '训练', 'PRACTICE'],
        [90, 375, '连接', 'CONNECTION'],
        [367, 411, '自由', 'FREEDOM'],
      ].map(([x, y, cn, en]) => (
        <g key={en}>
          <text x={x} y={y} fill="#405b43" fontSize="13" fontFamily="serif">
            {cn}
          </text>
          <text x={x} y={y + 15} fill="#969f90" fontSize="7" letterSpacing="1.4">
            {en}
          </text>
        </g>
      ))}
      <path d="M236 420q52-9 102 0M252 427q38-6 74 0" stroke="#bac4ad" fill="none" />
      <text x="42" y="55" fill="#a8ac9c" fontSize="9" fontFamily="monospace" letterSpacing="2">
        FIG. 01 — A GROWING MIND
      </text>
      <g transform="translate(475 55)" stroke="#9eaa95" strokeWidth=".8">
        <path d="M-10 0h20M0-10v20M-6-6l12 12M-6 6L6-6" />
      </g>
    </svg>
  )
}

export function CollectionPicker({ artifact, onClose }) {
  const { collections, garden, updateGarden, notify } = useGrove()
  const custom = garden.collections
  const add = (id) => {
    updateGarden((previous) => ({
      ...previous,
      collections: previous.collections.map((collection) =>
        collection.id === id
          ? {
              ...collection,
              artifactIds: collection.artifactIds.includes(artifact.id)
                ? collection.artifactIds.filter((item) => item !== artifact.id)
                : [...collection.artifactIds, artifact.id],
            }
          : collection,
      ),
    }))
  }
  return (
    <Modal title="收进一个知识集合" description={artifact.title} onClose={onClose}>
      {custom.length ? (
        <div className="picker-list">
          {custom.map((collection) => (
            <label key={collection.id}>
              <input
                type="checkbox"
                checked={collection.artifactIds.includes(artifact.id)}
                onChange={() => add(collection.id)}
              />
              <span>
                <strong>{collection.title}</strong>
                <small>{collection.artifactIds.length} 件作品</small>
              </span>
            </label>
          ))}
        </div>
      ) : (
        <EmptyState
          title="为思想留一块园地"
          description="先创建一个集合，将彼此呼应的作品放在一起。"
        />
      )}
      <button
        className="button primary full-width"
        onClick={() => {
          const id = `collection-${crypto.randomUUID()}`
          updateGarden((previous) => ({
            ...previous,
            collections: [
              ...previous.collections,
              {
                id,
                title: `${artifact.topics[0] || '灵感'}手记`,
                description: '沿着一个主题，慢慢探索。',
                artifactIds: [artifact.id],
                color: '#4b6951',
              },
            ],
          }))
          notify('已创建集合并加入作品')
          onClose()
        }}
      >
        <Plus size={16} />
        创建集合并加入
      </button>
    </Modal>
  )
}
