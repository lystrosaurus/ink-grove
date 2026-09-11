import { useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  Sprout,
  Upload,
  FileText,
  GitMerge,
  Check,
  Eye,
  Pencil,
  X,
  Plus,
  Network,
} from 'lucide-react'
import { useGrove, Link, artifactUrl, TYPES } from '../context.jsx'
import { createArtifact } from '../lib/garden.js'
import ArtifactRenderer from '../components/ArtifactRenderer.jsx'

const DRAFT_KEY = 'ink-grove:draft:v1'

export default function Create({ params }) {
  const context = new URLSearchParams(params)
  context.sort()
  const draftKey = `${DRAFT_KEY}:/create?${context.toString()}`
  return <CreateEditor key={draftKey} params={params} draftKey={draftKey} />
}

function readDraft(key) {
  try {
    const value = JSON.parse(sessionStorage.getItem(key))
    if (
      !value ||
      !['mode', 'title', 'subtitle', 'body', 'renderer', 'artifactType', 'topics'].every(
        (field) => typeof value[field] === 'string',
      ) ||
      !Array.isArray(value.sources) ||
      !value.sources.every((id) => typeof id === 'string')
    )
      return null
    return value
  } catch {
    return null
  }
}

function persistDraft(key, draft) {
  try {
    sessionStorage.setItem(key, JSON.stringify(draft))
  } catch {}
}

function CreateEditor({ params, draftKey }) {
  const { artifacts, garden, updateGarden, notify, go } = useGrove()
  const editing = garden.artifacts.find((a) => a.id === params.get('edit'))
  const [form, setForm] = useState(() => {
    const draft = readDraft(draftKey)
    return {
      mode:
        draft?.mode ??
        (editing?.artifactType === 'synthesis' || params.get('mode') === 'synthesis'
          ? 'synthesis'
          : params.get('mode') === 'import'
            ? 'import'
            : 'write'),
      title: draft?.title ?? editing?.title ?? params.get('title') ?? '',
      subtitle: draft?.subtitle ?? editing?.subtitle ?? '',
      body: draft?.body ?? editing?.artifact.content ?? '',
      renderer: draft?.renderer ?? editing?.artifact.renderer ?? 'markdown',
      artifactType: draft?.artifactType ?? editing?.artifactType ?? 'idea',
      topics: draft?.topics ?? editing?.topics.join('，') ?? '',
      sources: (
        draft?.sources ??
        editing?.provenance.derivedFrom ??
        (params.get('from') || '').split(',')
      ).filter((id) => artifacts.some((a) => a.id === id)),
    }
  })
  const formRef = useRef(form)
  const { mode, title, subtitle, body, renderer, artifactType, topics, sources } = form
  function setField(field, value) {
    const previous = formRef.current
    const next = {
      ...previous,
      [field]: typeof value === 'function' ? value(previous[field]) : value,
    }
    formRef.current = next
    persistDraft(draftKey, next)
    setForm(next)
  }
  const setMode = (value) => setField('mode', value),
    setTitle = (value) => setField('title', value)
  const setSubtitle = (value) => setField('subtitle', value),
    setBody = (value) => setField('body', value)
  const setRenderer = (value) => setField('renderer', value),
    setArtifactType = (value) => setField('artifactType', value)
  const setTopics = (value) => setField('topics', value),
    setSources = (value) => setField('sources', value)
  const [error, setError] = useState(''),
    [preview, setPreview] = useState(false),
    [filename, setFilename] = useState('')
  const fileInput = useRef(null)
  const selected = artifacts.filter((a) => sources.includes(a.id))
  const concepts = [...new Set(selected.flatMap((a) => a.concepts))]
    .map((name) => ({ name, count: selected.filter((a) => a.concepts.includes(name)).length }))
    .filter((c) => c.count > 1)
  function scaffold() {
    if (selected.length < 2) {
      setError('选择至少两件作品，让思想开始对话。')
      return
    }
    const question =
      title.trim() ||
      `${selected
        .slice(0, 2)
        .map((a) => a.title)
        .join('与')}：新的连接`
    if (!title.trim()) setTitle(question)
    setRenderer('markdown')
    setBody(
      `# ${question}\n\n> 这是一份个人贯通草稿。把作品放在一起，再写下你自己的判断。\n\n## 思想的起点\n\n${selected.map((a) => `### ${a.title}\n\n${a.subtitle}\n\n关键概念：${a.concepts.join('、')}。`).join('\n\n')}\n\n## 共同的线索\n\n${concepts.length ? concepts.map((c) => `- **${c.name}**：出现在 ${c.count} 个来源中。它在不同作品里，有哪些相同与不同的含义？`).join('\n') : '这些作品没有完全相同的概念标签。它们是否从不同角度回答同一个问题？'}\n\n## 我的新理解\n\n在这里写下你的发现：这些思想如何互相解释、补充或产生张力？\n\n## 一个可以验证的行动\n\n- 我准备尝试：\n- 我将观察的反馈：\n- 我会在何时回看：\n\n---\n\n来源：${selected.map((a) => `[${a.title}](${artifactUrl(a)})`).join(' · ')}`,
    )
    if (!topics) setTopics([...new Set(selected.flatMap((a) => a.topics))].slice(0, 4).join('，'))
    setError('')
    notify('已整理来源与共同概念，继续写下你的新理解')
  }
  async function importFile(event) {
    const file = event.target.files[0]
    event.target.value = ''
    if (!file) return
    setError('')
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error('作品文件不能超过 2 MB')
      const extension = file.name.split('.').at(-1).toLowerCase()
      const kind = {
        html: 'html',
        htm: 'html',
        md: 'markdown',
        markdown: 'markdown',
        txt: 'markdown',
        svg: 'svg',
        png: 'image',
        jpg: 'image',
        jpeg: 'image',
        webp: 'image',
        gif: 'image',
      }[extension]
      if (!kind) throw new Error('请选择 HTML、Markdown、SVG 或图片文件')
      const content =
        kind === 'image'
          ? await new Promise((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result)
              reader.onerror = () => reject(new Error('图片读取失败'))
              reader.readAsDataURL(file)
            })
          : await file.text()
      setRenderer(kind)
      setBody(content)
      setFilename(file.name)
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''))
      notify('作品已载入，可以预览并补充描述')
    } catch (error) {
      setError(error.message)
    }
  }
  function publish(event) {
    event.preventDefault()
    setError('')
    persistDraft(draftKey, formRef.current)
    try {
      if (mode === 'synthesis' && sources.length < 2)
        throw new Error('贯通作品需要至少两个知识来源')
      let artifact = createArtifact(
        {
          title,
          subtitle,
          body,
          renderer,
          artifactType: mode === 'synthesis' ? 'synthesis' : artifactType,
          topics: topics
            .split(/[,，、]/)
            .map((t) => t.trim())
            .filter(Boolean),
          derivedFrom: sources,
        },
        artifacts,
      )
      if (editing)
        artifact = {
          ...artifact,
          id: editing.id,
          slug: editing.slug,
          createdAt: editing.createdAt,
          author: editing.author,
          visualStyle: editing.visualStyle,
          concepts: [...new Set([...editing.concepts, ...artifact.concepts])].slice(0, 200),
          provenance: {
            ...artifact.provenance,
            generatedBy: editing.provenance.generatedBy,
            sources: editing.provenance.sources,
          },
        }
      const saved = updateGarden(
        (previous) => ({
          ...previous,
          artifacts: editing
            ? previous.artifacts.map((a) => (a.id === editing.id ? artifact : a))
            : [...previous.artifacts, artifact],
        }),
        { atomic: !editing },
      )
      if (!saved) {
        setError('作品尚未保存，请保留此编辑页，并在存储空间恢复后重试。')
        return
      }
      try {
        sessionStorage.removeItem(draftKey)
      } catch {}
      notify(editing ? '作品已更新' : '新的思想，已经在花园里生根')
      go(artifactUrl(artifact))
    } catch (error) {
      setError(error.message)
    }
  }
  const previewArtifact = {
    id: 'draft',
    title: title || '未命名的想法',
    subtitle,
    artifact: { renderer, content: body },
  }
  return (
    <div className="page-container create-page">
      <Link className="back-link" to="/explore">
        <ArrowLeft size={16} />
        回到花园
      </Link>
      <div className="page-heading">
        <span className="eyebrow">CREATE · PLANT A NEW IDEA</span>
        <h1>{editing ? '让这个想法，继续生长。' : '每一份新知，都从好奇开始。'}</h1>
        <p>写下一个想法，带入一份作品，或让已有的知识产生新的连接。</p>
      </div>
      <div className="create-layout">
        <form className="create-form" onSubmit={publish}>
          <div className="create-modes">
            {[
              ['write', '写下想法', Pencil],
              ['import', '带入作品', Upload],
              ['synthesis', '贯通思考', GitMerge],
            ].map(([id, label, Icon]) => (
              <button
                type="button"
                key={id}
                className={mode === id ? 'active' : ''}
                onClick={() => {
                  setMode(id)
                  setError('')
                }}
                aria-pressed={mode === id}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </div>
          <div className="create-fields">
            <label className="field-label">
              {mode === 'synthesis' ? '你想探讨什么问题？' : '给这个想法一个名字'}
              <input
                className="create-title"
                required
                maxLength={200}
                aria-label="作品标题"
                placeholder={
                  mode === 'synthesis'
                    ? '为什么知道很多，却依然没有进步？'
                    : '一个问题，一种思想，或一段新的理解…'
                }
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <label className="field-label">
              一句话描述
              <input
                maxLength={1000}
                placeholder="它关于什么？为什么值得探索？"
                value={subtitle}
                onChange={(event) => setSubtitle(event.target.value)}
              />
            </label>
            {mode === 'synthesis' && (
              <div className="source-selector">
                <div className="field-label">
                  让哪些思想相遇？<span>已选 {sources.length} 件</span>
                </div>
                <div className="source-options">
                  {artifacts
                    .filter((a) => a.id !== editing?.id)
                    .map((a) => (
                      <button
                        type="button"
                        key={a.id}
                        className={sources.includes(a.id) ? 'selected' : ''}
                        onClick={() =>
                          setSources((previous) =>
                            previous.includes(a.id)
                              ? previous.filter((id) => id !== a.id)
                              : [...previous, a.id],
                          )
                        }
                      >
                        {sources.includes(a.id) ? <Check size={13} /> : <Plus size={13} />}
                        <span>{a.title}</span>
                      </button>
                    ))}
                </div>
                {concepts.length > 0 && (
                  <div className="shared-concepts">
                    共同线索：
                    {concepts.map((c) => (
                      <span key={c.name}>{c.name}</span>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  className="button secondary"
                  onClick={scaffold}
                  disabled={selected.length < 2 || Boolean(body.trim())}
                >
                  <Network size={15} />
                  {body.trim() ? '已有内容，可继续编辑' : '整理贯通草稿'}
                </button>
                <small>根据所选作品整理来源与线索，再由你写下新的理解。</small>
              </div>
            )}
            {mode === 'import' && (
              <>
                <button
                  type="button"
                  className="file-drop"
                  onClick={() => fileInput.current.click()}
                >
                  <Upload size={30} strokeWidth={1} />
                  <strong>{filename || '选择一份作品，带进花园'}</strong>
                  <span>HTML · Markdown · SVG · PNG / JPG / WebP / GIF</span>
                  <small>每个文件最多 2 MB · 保留作品原有的视觉表达</small>
                </button>
                <input
                  hidden
                  ref={fileInput}
                  type="file"
                  accept=".html,.htm,.md,.markdown,.txt,.svg,.png,.jpg,.jpeg,.webp,.gif"
                  onChange={importFile}
                />
              </>
            )}
            <div className="editor-heading">
              <label className="field-label" htmlFor="artifact-body">
                {mode === 'synthesis' ? '写下你的新理解' : '作品内容'}
              </label>
              <div className="segmented-control">
                <button
                  type="button"
                  className={!preview ? 'active' : ''}
                  onClick={() => setPreview(false)}
                >
                  <Pencil size={13} />
                  编辑
                </button>
                <button
                  type="button"
                  className={preview ? 'active' : ''}
                  onClick={() => setPreview(true)}
                >
                  <Eye size={14} />
                  预览
                </button>
              </div>
            </div>
            {preview ? (
              <div className="editor-preview">
                {body ? (
                  <ArtifactRenderer artifact={previewArtifact} preview />
                ) : (
                  <div className="preview-empty">
                    <Sprout size={28} />
                    <p>写下一点内容，想法就会在这里展开。</p>
                  </div>
                )}
              </div>
            ) : renderer === 'image' ? (
              <div className="import-image-preview">
                <img src={body} alt="导入的作品" />
              </div>
            ) : (
              <textarea
                id="artifact-body"
                className="artifact-editor"
                required
                aria-label="作品内容"
                rows={13}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder={
                  '# 你的理解，从这里开始\n\n一个有意思的发现，一段值得展开的思考。\n\n## 然后呢？\n\n把线索连接起来，让思想形成自己的结构。'
                }
              />
            )}
            <div className="editor-foot">
              <span>
                {renderer.toUpperCase()}
                {renderer === 'markdown' ? ' · 支持标题、列表、引用、表格与链接' : ''}
              </span>
              <span>草稿保留在此标签页</span>
            </div>
            <div className="field-row">
              <label className="field-label">
                主题
                <input
                  maxLength={500}
                  placeholder="认知，成长，学习"
                  value={topics}
                  onChange={(event) => setTopics(event.target.value)}
                />
              </label>
              {mode !== 'synthesis' && (
                <label className="field-label">
                  知识类型
                  <select
                    value={artifactType}
                    onChange={(event) => setArtifactType(event.target.value)}
                  >
                    {Object.entries(TYPES)
                      .filter(([key]) => key !== 'all' && key !== 'synthesis')
                      .map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                  </select>
                </label>
              )}
            </div>
            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}
            <div className="publish-row">
              <span>
                <Sprout size={16} />
                准备好，让它成为花园的一部分。
              </span>
              <button className="button primary" type="submit">
                {editing ? '保存作品' : '种进花园'}
                <ArrowUpRight size={17} />
              </button>
            </div>
          </div>
        </form>
        <aside className="create-aside">
          <span className="seed-ornament">
            <Sprout size={49} strokeWidth={0.8} />
          </span>
          <span className="eyebrow">
            CONTENT IS FREE.
            <br />
            SYSTEM IS STABLE.
          </span>
          <h2>
            让内容，
            <br />
            决定自己的形态。
          </h2>
          <p>一份思想可以是文字，也可以是一张地图、一条时间线、一间实验室。</p>
          <p>你带来表达，花园让它被发现、被连接，并继续生长。</p>
          <div className="aside-divider" />
          <h3>从哪里开始？</h3>
          <ol>
            <li>先写清楚，你想理解什么。</li>
            <li>留下来源，让思考有迹可循。</li>
            <li>给它一个主题，等待新的连接。</li>
          </ol>
          <div className="create-note">
            <FileText size={18} />
            <p>当前支持个人创作与文件导入。AI 研究与生成尚未接入。</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
