import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Network,
  GitMerge,
  X,
  Minus,
  Plus,
  RotateCcw,
} from 'lucide-react'
import { useGrove, Link, artifactUrl, RELATIONS, TYPES } from '../context.jsx'
import { ArtifactCard, EmptyState, SectionHead } from '../components/Shared.jsx'
import '../connections.css'

function graphLabel(title) {
  const letters = [...title]
  if (letters.length <= 12) return [title]
  return [
    letters.slice(0, 12).join(''),
    `${letters.slice(12, 24).join('')}${letters.length > 24 ? '…' : ''}`,
  ]
}

export default function Connections({ params }) {
  const { artifacts, connections, catalog } = useGrove()
  const [selected, setSelected] = useState(params.get('artifact') || 'all')
  const [relation, setRelation] = useState('all')
  const [view, setView] = useState('graph')
  const [zoom, setZoom] = useState(1)
  const canvasRef = useRef(null)
  const [canvasWidth, setCanvasWidth] = useState(870)
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setCanvasWidth(entry.contentRect.width))
    observer.observe(canvasRef.current)
    return () => observer.disconnect()
  }, [])
  const visibleEdges = connections.filter(
    (edge) =>
      (selected === 'all' || edge.source === selected || edge.target === selected) &&
      (relation === 'all' || edge.type === relation),
  )
  const activeIds = new Set(visibleEdges.flatMap((edge) => [edge.source, edge.target]))
  if (selected !== 'all') activeIds.add(selected)
  const current = artifacts.find((item) => item.id === selected)
  const frequency = [...new Set(artifacts.flatMap((item) => item.concepts))]
    .map((name) => ({ name, count: artifacts.filter((a) => a.concepts.includes(name)).length }))
    .sort((a, b) => b.count - a.count)
  const connectedIds = new Set(connections.flatMap((edge) => [edge.source, edge.target]))
  const islands = artifacts.filter((item) => !connectedIds.has(item.id))
  const graphArtifacts = artifacts.filter(
    (item) => activeIds.has(item.id) || (selected === 'all' && relation === 'all'),
  )
  const expanded = graphArtifacts.length > 10
  const columns = Math.max(2, Math.min(4, Math.floor(canvasWidth / 180)))
  const graphWidth = expanded ? columns * 200 : 870
  const graphHeight = expanded ? Math.ceil(graphArtifacts.length / columns) * 156 + 24 : 555
  const positions = new Map(
    graphArtifacts.map((item, index) => {
      if (expanded)
        return [
          item.id,
          { x: 100 + (index % columns) * 200, y: 44 + Math.floor(index / columns) * 156 },
        ]
      if (item.id === 'personal-growth-os') return [item.id, { x: 435, y: 274 }]
      const rest = graphArtifacts.filter((a) => a.id !== 'personal-growth-os')
      const angle =
        (rest.findIndex((a) => a.id === item.id) / rest.length) * Math.PI * 2 - Math.PI / 2
      return [item.id, { x: 435 + Math.cos(angle) * 305, y: 274 + Math.sin(angle) * 206 }]
    }),
  )
  return (
    <div className="page-container connections-page">
      <div className="page-heading">
        <span className="eyebrow">CONNECTIONS · IDEAS IN CONVERSATION</span>
        <h1>思想之间，正在发生什么？</h1>
        <p>理解不仅来自一件作品，也来自它与其他思想相遇的地方。</p>
      </div>
      <div className="connection-controls">
        <div className="segmented-control">
          <button className={view === 'graph' ? 'active' : ''} onClick={() => setView('graph')}>
            <Network size={16} />
            知识网络
          </button>
          <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
            连接列表
          </button>
        </div>
        <div>
          <select
            aria-label="按作品查看连接"
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
          >
            <option value="all">所有作品</option>
            {artifacts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
          <select
            aria-label="连接类型"
            value={relation}
            onChange={(event) => setRelation(event.target.value)}
          >
            <option value="all">所有连接类型</option>
            {[...new Set(connections.map((edge) => edge.type))].map((type) => (
              <option key={type} value={type}>
                {RELATIONS[type] || type}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="network-layout">
        <div className="network-canvas" ref={canvasRef}>
          {view === 'graph' ? (
            <>
              <div className="graph-topline">
                <span>THE LIVING NETWORK</span>
                <span>
                  {graphArtifacts.length} 节点 / {visibleEdges.length} 连接
                  {expanded && ' · 滚动浏览'}
                </span>
              </div>
              <div
                className={`graph-viewport${expanded ? ' is-expanded' : ''}`}
                role={expanded ? 'region' : undefined}
                aria-label={expanded ? '知识网络画布，可滚动浏览全部作品' : undefined}
                tabIndex={expanded ? 0 : undefined}
              >
                <svg
                  viewBox={`0 0 ${graphWidth} ${graphHeight}`}
                  className={`knowledge-graph${expanded ? ' is-expanded' : ''}`}
                  style={expanded ? { width: `${zoom * 100}%` } : undefined}
                  role="img"
                  aria-label="可交互知识关系图，点击作品节点查看它的连接"
                >
                  <defs>
                    <pattern id="graph-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="1" cy="1" r=".7" fill="#c5cbbf" />
                    </pattern>
                    <marker
                      id="edge-arrow"
                      markerWidth="6"
                      markerHeight="6"
                      refX="27"
                      refY="3"
                      orient="auto"
                    >
                      <path d="M0 0L6 3L0 6" fill="none" stroke="#9eaf99" />
                    </marker>
                  </defs>
                  <rect width={graphWidth} height={graphHeight} fill="url(#graph-dots)" />
                  <g
                    transform={
                      expanded
                        ? undefined
                        : `translate(435 275) scale(${zoom}) translate(-435 -275)`
                    }
                  >
                    {visibleEdges.map((edge) => {
                      const from = positions.get(edge.source),
                        to = positions.get(edge.target)
                      if (!from || !to) return null
                      return (
                        <g key={edge.id}>
                          <path
                            d={
                              expanded
                                ? `M${from.x} ${from.y} C${from.x} ${from.y + 60} ${to.x} ${to.y - 60} ${to.x} ${to.y}`
                                : `M${from.x} ${from.y} Q435 280 ${to.x} ${to.y}`
                            }
                            stroke={edge.type === 'contrasts' ? '#be8d72' : '#a4b49b'}
                            strokeWidth={selected === 'all' ? 1 : 1.7}
                            fill="none"
                            strokeDasharray={edge.type === 'contrasts' ? '5 5' : undefined}
                            opacity={selected === 'all' ? 0.55 : 0.85}
                            markerEnd="url(#edge-arrow)"
                          />
                          <title>{`${artifacts.find((a) => a.id === edge.source)?.title} → ${artifacts.find((a) => a.id === edge.target)?.title}：${edge.label}`}</title>
                        </g>
                      )
                    })}
                    {graphArtifacts.map((a) => {
                      const { x, y } = positions.get(a.id)
                      const central = a.id === 'personal-growth-os'
                      return (
                        <g
                          key={a.id}
                          className={`graph-node ${a.id === selected ? 'selected' : ''}`}
                          role="button"
                          tabIndex={0}
                          aria-label={`查看${a.title}的连接`}
                          onClick={() => setSelected(a.id === selected ? 'all' : a.id)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              setSelected(a.id === selected ? 'all' : a.id)
                            }
                          }}
                          transform={`translate(${x} ${y})`}
                        >
                          <title>{a.title}</title>
                          {expanded && (
                            <>
                              <rect x="-94" y="-38" width="188" height="140" fill="transparent" />
                              <rect
                                className="graph-label-background"
                                x="-94"
                                y="34"
                                width="188"
                                height="62"
                                rx="8"
                              />
                            </>
                          )}
                          <circle
                            r={central ? (expanded ? 30 : 44) : 27}
                            fill={central ? '#355442' : a.id === selected ? '#e5ecd9' : '#fafbf7'}
                            stroke={central ? '#355442' : '#a6b49a'}
                            strokeWidth={a.id === selected ? 2 : 1}
                          />
                          {central ? (
                            <>
                              <path
                                d="M0 15V-12M0 6C-17 6-15-9-15-9 0-10 0 6 0 6M0-2C0-18 16-20 16-20 18-4 0-2 0-2"
                                fill="none"
                                stroke="#d8e2c3"
                                strokeWidth="1.5"
                              />
                              {!expanded && (
                                <text y="64" textAnchor="middle" className="graph-title">
                                  {a.title}
                                </text>
                              )}
                            </>
                          ) : (
                            <>
                              <text
                                y="5"
                                textAnchor="middle"
                                fontSize="17"
                                fill="#516446"
                                fontFamily="serif"
                              >
                                {a.title.replace(/[《》]/g, '').slice(0, 1)}
                              </text>
                              {!expanded && (
                                <text y="47" textAnchor="middle" className="graph-title">
                                  {a.title}
                                </text>
                              )}
                            </>
                          )}
                          {expanded && (
                            <text y="49" textAnchor="middle" className="graph-title">
                              {graphLabel(a.title).map((line, index) => (
                                <tspan key={index} x="0" dy={index ? 18 : 0}>
                                  {line}
                                </tspan>
                              ))}
                            </text>
                          )}
                          <text
                            y={expanded ? 87 : central ? 83 : 65}
                            textAnchor="middle"
                            className="graph-type"
                          >
                            {TYPES[a.artifactType]} ·{' '}
                            {
                              connections.filter(
                                (edge) => edge.source === a.id || edge.target === a.id,
                              ).length
                            }{' '}
                            条连接
                          </text>
                        </g>
                      )
                    })}
                  </g>
                </svg>
              </div>
              <div className="graph-bottomline">
                <span>
                  <i />
                  作品节点
                  <span className="graph-line" />
                  思想关系{' '}
                  <span className="graph-hint">
                    {expanded ? '点击节点查看连接，滚动浏览作品' : '点击节点，让连接浮现'}
                  </span>
                </span>
                <div className="graph-zoom">
                  <button
                    aria-label="缩小关系图"
                    onClick={() => setZoom((z) => Math.max(0.65, z - 0.15))}
                  >
                    <Minus size={14} />
                  </button>
                  <button aria-label="重置关系图缩放" onClick={() => setZoom(1)}>
                    {Math.round(zoom * 100)}%
                  </button>
                  <button
                    aria-label="放大关系图"
                    onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="connection-list">
              {visibleEdges.length ? (
                visibleEdges.map((edge) => <Edge key={edge.id} edge={edge} />)
              ) : (
                <EmptyState
                  title="这里还没有连接"
                  description="试试其他关系类型，或从这件作品开始一次贯通。"
                />
              )}
            </div>
          )}
        </div>
        <aside className="network-sidebar">
          {current ? (
            <>
              <div className="sidebar-heading">
                <span className="eyebrow">SELECTED ARTIFACT</span>
                <button
                  className="icon-button"
                  aria-label="取消节点选择"
                  onClick={() => setSelected('all')}
                >
                  <X size={16} />
                </button>
              </div>
              {current.cover && <img className="node-cover" src={current.cover} alt="" />}
              <h2>{current.title}</h2>
              <p>{current.subtitle}</p>
              <Link className="text-link" to={artifactUrl(current)}>
                进入作品
                <ArrowUpRight size={16} />
              </Link>
              <div className="sidebar-divider" />
              <h3>{visibleEdges.length} 条思想连接</h3>
              <div className="node-relations">
                {visibleEdges.slice(0, 6).map((edge) => (
                  <Edge key={edge.id} edge={edge} compact />
                ))}
              </div>
              <Link
                className="button primary full-width"
                to={`/create?mode=synthesis&from=${current.id}`}
              >
                <GitMerge size={16} />
                由此开始贯通
              </Link>
            </>
          ) : (
            <>
              <span className="eyebrow">GARDEN OBSERVATIONS</span>
              <h2>连接中的新发现</h2>
              <p>让反复出现的概念，成为下一次探索的起点。</p>
              <h3>经常相遇的概念</h3>
              <div className="concept-frequency">
                {frequency.slice(0, 6).map(({ name, count }) => {
                  const concept = catalog.concepts.find((c) => c.name === name)
                  return (
                    <Link
                      key={name}
                      to={
                        concept
                          ? `/concept/${concept.id}`
                          : `/explore?q=${encodeURIComponent(name)}`
                      }
                    >
                      <span>{name}</span>
                      <span>
                        {count} 件作品
                        <ArrowUpRight size={12} />
                      </span>
                    </Link>
                  )
                })}
              </div>
              <div className="sidebar-note">
                <span className="tiny-spark">✳</span>
                <p>“反馈”不只是练习的结果，也是认知与行动之间的桥。</p>
              </div>
              {islands.length > 0 && (
                <div className="island-list">
                  <h3>{islands.length} 个等待连接的想法</h3>
                  {islands.map((a) => (
                    <Link key={a.id} to={artifactUrl(a)}>
                      {a.title}
                      <ArrowUpRight size={13} />
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </aside>
      </div>
      <section className="connection-synthesis">
        <SectionHead
          eyebrow="POSSIBLE SYNTHESIS"
          title="两个思想，可以长出什么？"
          description="沿着共同概念，把已有理解推进一步。"
        />
        <div className="synthesis-prompts">
          {[
            [
              '认知觉醒 × 刻意练习',
              '为什么“知道”，不会自动变成“能力”？',
              '注意力 · 反馈 · 学习',
              'cognitive-awakening,deliberate-practice',
            ],
            [
              '七个习惯 × 纳瓦尔宝典',
              '高效能与自由，如何同时发生？',
              '主动选择 · 原则 · 复利',
              'seven-habits,naval-almanack',
            ],
          ].map(([sources, title, topics, ids]) => (
            <Link
              className="synthesis-prompt"
              key={ids}
              to={`/create?mode=synthesis&from=${ids}&title=${encodeURIComponent(title)}`}
            >
              <span>{sources}</span>
              <h3>{title}</h3>
              <div>
                <small>{topics}</small>
                <span>
                  展开思考
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

function Edge({ edge, compact = false }) {
  const { artifacts } = useGrove()
  const source = artifacts.find((a) => a.id === edge.source),
    target = artifacts.find((a) => a.id === edge.target)
  return (
    <div className={`edge-row ${compact ? 'compact' : ''}`}>
      <div>
        <Link to={artifactUrl(source)}>{source.title}</Link>
        <span>
          {RELATIONS[edge.type] || edge.type}
          <ArrowRight size={13} />
        </span>
        <Link to={artifactUrl(target)}>{target.title}</Link>
      </div>
      <p>
        {edge.label}
        {edge.concept && <small>{edge.concept}</small>}
      </p>
    </div>
  )
}

export function ConceptPage({ id }) {
  const { catalog, artifacts } = useGrove()
  const concept = catalog.concepts.find((c) => c.id === id)
  if (!concept)
    return (
      <EmptyState
        title="这个概念还没有发芽"
        description="先探索已有的作品与连接。"
        action="探索知识网络"
        to="/connections"
      />
    )
  const items = artifacts.filter((a) => a.concepts.includes(concept.name))
  return (
    <div className="page-container">
      <Link className="back-link" to="/connections">
        ← 知识连接
      </Link>
      <div className="concept-heading">
        <span className="eyebrow">CONCEPT · A THREAD THROUGH IDEAS</span>
        <h1>
          {concept.name}
          <em>{concept.id.replaceAll('-', ' ')}</em>
        </h1>
        <p>{concept.description}</p>
        <div className="related-concepts">
          {concept.related
            ?.map((id) => catalog.concepts.find((c) => c.id === id))
            .filter(Boolean)
            .map((c) => (
              <Link key={c.id} to={`/concept/${c.id}`}>
                {c.name}
                <ArrowUpRight size={13} />
              </Link>
            ))}
        </div>
      </div>
      <SectionHead eyebrow="APPEARS IN" title={`在 ${items.length} 件作品中相遇`} />
      <div className="artifact-grid">
        {items.map((a) => (
          <ArtifactCard key={a.id} artifact={a} />
        ))}
      </div>
    </div>
  )
}
