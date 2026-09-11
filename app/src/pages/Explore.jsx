import { useMemo, useState } from 'react'
import { Search, Grid2X2, List, X, SlidersHorizontal } from 'lucide-react'
import { useGrove, TYPES } from '../context.jsx'
import { searchArtifacts } from '../lib/garden.js'
import { ArtifactCard, EmptyState } from '../components/Shared.jsx'

export default function Explore({ params }) {
  const { artifacts, go } = useGrove()
  const [query, setQuery] = useState(params.get('q') || '')
  const [type, setType] = useState(params.get('type') || 'all')
  const [topic, setTopic] = useState(params.get('topic') || 'all')
  const [sort, setSort] = useState('curated')
  const [layout, setLayout] = useState('grid')
  const topics = [...new Set(artifacts.flatMap((item) => item.topics))]
  const results = useMemo(
    () => searchArtifacts(artifacts, query, { type, topic, sort }),
    [artifacts, query, type, topic, sort],
  )
  function changeFilter(nextType, nextTopic, nextQuery = query) {
    setType(nextType)
    setTopic(nextTopic)
    setQuery(nextQuery)
    const search = new URLSearchParams()
    if (nextType !== 'all') search.set('type', nextType)
    if (nextTopic !== 'all') search.set('topic', nextTopic)
    if (nextQuery) search.set('q', nextQuery)
    window.history.replaceState({}, '', `/explore${search.size ? `?${search}` : ''}`)
  }
  return (
    <div className="page-container explore-page">
      <div className="page-heading">
        <span className="eyebrow">EXPLORE THE GROVE</span>
        <h1>好奇心，会带你去哪里？</h1>
        <p>不必急着寻找答案。沿着一个主题、一种表达，发现值得停留的思想。</p>
      </div>
      <div className="explore-top">
        <div className="type-tabs" role="group" aria-label="作品类型">
          {Object.entries(TYPES).map(([key, label]) => (
            <button
              key={key}
              onClick={() => changeFilter(key, topic)}
              className={type === key ? 'active' : ''}
              aria-pressed={type === key}
            >
              {label}
              {key === 'all' && <span>{artifacts.length}</span>}
            </button>
          ))}
        </div>
        <div className="search-field explore-search">
          <Search size={17} />
          <input
            aria-label="在作品中搜索"
            placeholder="搜索作品、概念、作者…"
            value={query}
            onChange={(event) => changeFilter(type, topic, event.target.value)}
          />
          {query && (
            <button onClick={() => changeFilter(type, topic, '')} aria-label="清空搜索">
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="topic-filter">
        <span>沿主题探索</span>
        <button
          className={topic === 'all' ? 'active' : ''}
          onClick={() => changeFilter(type, 'all')}
        >
          全部
        </button>
        {topics.map((item) => (
          <button
            key={item}
            onClick={() => changeFilter(type, item)}
            className={topic === item ? 'active' : ''}
            aria-pressed={topic === item}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="results-bar">
        <span>
          {results.length} 件知识作品
          {(topic !== 'all' || type !== 'all' || query) && (
            <button
              className="clear-filters"
              onClick={() => {
                changeFilter('all', 'all', '')
                window.history.replaceState({}, '', '/explore')
              }}
            >
              重置筛选
              <X size={12} />
            </button>
          )}
        </span>
        <div>
          <select
            aria-label="作品排序"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="curated">精选排序</option>
            <option value="newest">最新生长</option>
            <option value="title">标题顺序</option>
          </select>
          <span className="layout-buttons">
            <button
              aria-label="网格视图"
              aria-pressed={layout === 'grid'}
              onClick={() => setLayout('grid')}
              className={layout === 'grid' ? 'active' : ''}
            >
              <Grid2X2 size={16} />
            </button>
            <button
              aria-label="列表视图"
              aria-pressed={layout === 'list'}
              onClick={() => setLayout('list')}
              className={layout === 'list' ? 'active' : ''}
            >
              <List size={17} />
            </button>
          </span>
        </div>
      </div>
      {results.length ? (
        <div className={`artifact-grid ${layout === 'list' ? 'list-view' : ''}`}>
          {results.map((artifact, index) => (
            <ArtifactCard key={artifact.id} artifact={artifact} index={index} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="这片园地，等待新的种子"
          description="换一个筛选条件继续探索，或把你寻找的知识变成一份新作品。"
          action="清除筛选"
          onAction={() => {
            changeFilter('all', 'all', '')
          }}
        />
      )}
    </div>
  )
}
