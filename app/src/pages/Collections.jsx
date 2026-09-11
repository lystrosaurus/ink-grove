import { useState } from 'react'
import { ArrowLeft, ArrowUpRight, Plus, Heart, FolderOpen, X, Check, Trash2 } from 'lucide-react'
import { useGrove, Link } from '../context.jsx'
import { ArtifactCard, EmptyState, Modal } from '../components/Shared.jsx'

export default function Collections({ id }) {
  const { artifacts, garden, collections, updateGarden, notify, go } = useGrove()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const collection =
    id === 'favorites'
      ? {
          id: 'favorites',
          title: '心仪的思想',
          description: '那些让你停下脚步、想再读一次的作品。',
          artifactIds: garden.favorites,
        }
      : collections.find((item) => item.id === id)
  const owned = garden.collections.some((item) => item.id === id)
  if (id && !collection)
    return (
      <EmptyState
        title="还没有这个集合"
        description="回到集合，沿着另一个主题继续探索。"
        action="浏览集合"
        to="/collections"
      />
    )
  if (collection) {
    const items = collection.artifactIds
      .map((id) => artifacts.find((item) => item.id === id))
      .filter(Boolean)
    return (
      <div className="page-container">
        <Link to="/collections" className="back-link">
          <ArrowLeft size={16} />
          所有集合
        </Link>
        <div className="page-heading collection-heading">
          <div>
            <span className="eyebrow">A CURATED PATH · {items.length} ARTIFACTS</span>
            <h1>{collection.title}</h1>
            <p>{collection.description || collection.subtitle}</p>
          </div>
          {owned && (
            <div className="button-row">
              <button className="button secondary" onClick={() => setEditing(true)}>
                编辑集合
              </button>
              <button
                className="icon-button"
                aria-label="删除集合"
                onClick={() => setDeleting(true)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
        </div>
        {items.length ? (
          <div className="artifact-grid">
            {items.map((item) => (
              <ArtifactCard key={item.id} artifact={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="把有共鸣的思想，留在一起"
            description={
              owned ? '编辑集合，挑选第一件作品。' : '点击作品上的爱心，收藏值得再次相遇的思想。'
            }
            action={owned ? '选择作品' : '探索作品'}
            to={owned ? undefined : '/explore'}
            onAction={() => setEditing(true)}
          />
        )}
        {editing && <CollectionEditor collection={collection} onClose={() => setEditing(false)} />}{' '}
        {deleting && (
          <Modal
            title="移除这个集合？"
            description="集合中的作品仍会保留在花园里。"
            onClose={() => setDeleting(false)}
          >
            <div className="button-row">
              <button
                className="button danger"
                onClick={() => {
                  updateGarden((previous) => ({
                    ...previous,
                    collections: previous.collections.filter((item) => item.id !== id),
                  }))
                  setDeleting(false)
                  notify('集合已移除')
                  go('/collections')
                }}
              >
                确认移除
              </button>
              <button className="button secondary" onClick={() => setDeleting(false)}>
                保留集合
              </button>
            </div>
          </Modal>
        )}
      </div>
    )
  }
  return (
    <div className="page-container">
      <div className="page-heading with-action">
        <div>
          <span className="eyebrow">COLLECTIONS · PATHS THROUGH IDEAS</span>
          <h1>沿着一个主题，慢慢走。</h1>
          <p>把彼此呼应的作品放在一起，让零散的灵感成为一段完整的探索。</p>
        </div>
        <button className="button primary" onClick={() => setCreating(true)}>
          <Plus size={17} />
          创建集合
        </button>
      </div>
      <div className="collections-grid">
        <Link className="collection-card favorites-card" to="/collections/favorites">
          <div className="collection-art favorites-art">
            <Heart size={76} strokeWidth={0.7} />
            <span>THOUGHTS TO KEEP</span>
          </div>
          <div className="collection-caption">
            <span className="eyebrow">PERSONAL COLLECTION</span>
            <h2>
              心仪的思想
              <ArrowUpRight size={22} />
            </h2>
            <p>给触动你的想法，留一个安静的位置。</p>
            <small>{garden.favorites.length} 件作品 · 由你珍藏</small>
          </div>
        </Link>
        {collections.map((item, index) => (
          <Link key={item.id} className="collection-card" to={`/collections/${item.id}`}>
            <div
              className={`collection-art collection-art-${index % 3}`}
              style={{ '--collection-color': item.color || '#486653' }}
            >
              <div className="collection-stack">
                {item.artifactIds.slice(0, 3).map((id, i) => {
                  const a = artifacts.find((artifact) => artifact.id === id)
                  return (
                    <div className="stack-cover" style={{ '--stack-index': i }} key={id}>
                      {a?.cover ? <img src={a.cover} alt="" /> : <FolderOpen size={34} />}
                    </div>
                  )
                })}
              </div>
              <span>
                {item.artifactIds.length ? 'A CONNECTED COLLECTION' : 'ROOM FOR NEW IDEAS'}
              </span>
            </div>
            <div className="collection-caption">
              <span className="eyebrow">
                {garden.collections.some((c) => c.id === item.id)
                  ? 'YOUR COLLECTION'
                  : 'CURATED JOURNEY'}
              </span>
              <h2>
                {item.title}
                <ArrowUpRight size={22} />
              </h2>
              <p>{item.description || item.subtitle}</p>
              <small>
                {item.artifactIds.filter((id) => artifacts.some((a) => a.id === id)).length} 件作品
                · {garden.collections.some((c) => c.id === item.id) ? '我的集合' : '编辑精选'}
              </small>
            </div>
          </Link>
        ))}
        <button className="collection-new" onClick={() => setCreating(true)}>
          <span>
            <Plus size={30} strokeWidth={1} />
          </span>
          <strong>开辟一条自己的小径</strong>
          <p>一个问题、一种兴趣、一段探索。</p>
        </button>
      </div>
      {creating && <CollectionEditor onClose={() => setCreating(false)} />}
    </div>
  )
}

function CollectionEditor({ collection, onClose }) {
  const { artifacts, updateGarden, notify, go } = useGrove()
  const [title, setTitle] = useState(collection?.title || '')
  const [description, setDescription] = useState(collection?.description || '')
  const [selected, setSelected] = useState(collection?.artifactIds || [])
  function save(event) {
    event.preventDefault()
    if (!title.trim()) return
    const next = {
      id: collection?.id || `collection-${crypto.randomUUID()}`,
      title: title.trim(),
      description: description.trim(),
      artifactIds: selected,
      color: collection?.color || '#4c6851',
    }
    const saved = updateGarden((previous) => ({
      ...previous,
      collections: collection
        ? previous.collections.map((item) => (item.id === next.id ? next : item))
        : [...previous.collections, next],
    }))
    if (saved) notify(collection ? '集合已更新' : '新集合已种下')
    onClose()
    if (!collection) go(`/collections/${next.id}`)
  }
  return (
    <Modal
      title={collection ? '照料这个集合' : '开辟一条新的小径'}
      onClose={onClose}
      className="collection-modal"
    >
      <form onSubmit={save}>
        <label className="field-label">
          集合名称
          <input
            data-autofocus
            required
            maxLength={120}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="例如：关于更好地学习"
          />
        </label>
        <label className="field-label">
          写一句引言
          <textarea
            rows={2}
            maxLength={600}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="你想沿着这条小径，探索什么？"
          />
        </label>
        <div className="field-label">
          挑选作品<span className="muted">已选 {selected.length} 件</span>
        </div>
        <div className="collection-options">
          {artifacts.map((item) => (
            <label key={item.id} className={selected.includes(item.id) ? 'selected' : ''}>
              <input
                type="checkbox"
                checked={selected.includes(item.id)}
                onChange={() =>
                  setSelected((previous) =>
                    previous.includes(item.id)
                      ? previous.filter((id) => id !== item.id)
                      : [...previous, item.id],
                  )
                }
              />
              {item.cover && <img src={item.cover} alt="" />}
              <span>{item.title}</span>
            </label>
          ))}
        </div>
        <button className="button primary full-width" type="submit">
          <Check size={16} />
          保存集合
        </button>
      </form>
    </Modal>
  )
}
