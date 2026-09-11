export const STORAGE_KEY = 'ink-grove:garden:v1'

const CONTENT_BYTES = 2 * 1024 * 1024
const IMAGE_BYTES = 3 * 1024 * 1024
const BACKUP_BYTES = 10 * 1024 * 1024
const ARTIFACT_TYPES = new Set(['book', 'idea', 'person', 'history', 'system', 'synthesis'])
const RENDERERS = new Set(['html', 'markdown', 'svg', 'image'])
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype'])
const encoder = new TextEncoder()

function fail(message) {
  throw new Error(message)
}

function record(value, label) {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    ![Object.prototype, null].includes(Object.getPrototypeOf(value))
  ) {
    fail(`${label}必须是对象。`)
  }
  if (Object.keys(value).some((key) => UNSAFE_KEYS.has(key))) fail(`${label}含有非法字段。`)
  return value
}

function list(value, label, max = 1000) {
  if (!Array.isArray(value)) fail(`${label}必须是数组。`)
  if (value.length > max) fail(`${label}数量过多，最多允许 ${max} 项。`)
  return value
}

function string(value, label, max = 1000, required = false) {
  if (typeof value !== 'string') fail(`${label}必须是文字。`)
  if (value.length > max) fail(`${label}过长，最多允许 ${max} 个字符。`)
  if (required && !value.trim()) fail(`${label}不能为空。`)
  return value
}

function id(value, label = '标识') {
  const result = string(value, label, 160, true)
  if (!/^[\p{L}\p{N}][\p{L}\p{N}._:-]*$/u.test(result) || UNSAFE_KEYS.has(result)) {
    fail(`${label}格式无效。`)
  }
  return result
}

function strings(value, label, max = 1000, itemMax = 160, identifiers = false) {
  return [
    ...new Set(
      list(value, label, max).map((item) =>
        identifiers ? id(item, label) : string(item, label, itemMax, true).trim(),
      ),
    ),
  ]
}

function date(value, label) {
  string(value, label, 40, true)
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.exec(
      value,
    )
  if (!match || !Number.isFinite(Date.parse(value))) fail(`${label}必须是有效的 ISO 日期。`)
  const [, year, month, day, hour, minute, second] = match.map(Number)
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > lastDay ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    fail(`${label}不是有效日期。`)
  }
  return value
}

function imageData(value, label) {
  string(value, label, IMAGE_BYTES, true)
  if (encoder.encode(value).byteLength > IMAGE_BYTES) fail(`${label}大小不能超过 3 MB。`)
  if (
    !/^data:image\/(?:png|jpeg|webp|gif|svg\+xml);base64,(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/i.test(
      value,
    ) ||
    value.endsWith(',')
  )
    fail(`${label}必须是内嵌的 PNG、JPEG、WebP、GIF 或 SVG 图片。`)
  return value
}

function inlineArtifact(value) {
  record(value, '作品内容')
  if (!RENDERERS.has(value.renderer)) fail('作品格式不受支持。')
  if (value.src !== undefined && value.src !== '')
    fail('本地作品不能引用外部文件地址，请使用内嵌内容。')
  const max = value.renderer === 'image' ? IMAGE_BYTES : CONTENT_BYTES
  const content = string(value.content, '作品内容', Infinity, true)
  if (content.length > max || encoder.encode(content).byteLength > max)
    fail(`作品内容大小不能超过 ${max / 1024 / 1024} MB。`)
  if (value.renderer === 'image') imageData(content, '图片')
  if (value.renderer === 'svg' && !/<svg(?:\s|>)/i.test(content))
    fail('SVG 内容必须包含 svg 元素。')
  return { renderer: value.renderer, content }
}

function normalizeArtifact(value) {
  record(value, '本地作品')
  if (value.schemaVersion !== 1) fail('本地作品必须使用版本 1 的作品格式。')
  const artifactId = id(value.id, '作品标识')
  if (!artifactId.startsWith('local-')) fail('本地作品标识必须以 local- 开头。')
  if (value.slug !== artifactId) fail('本地作品路径必须与作品标识一致，避免打开错误作品。')
  if (!ARTIFACT_TYPES.has(value.artifactType)) fail('作品类型不受支持。')
  if (value.sourceType !== 'personal') fail('本地作品来源必须是 personal。')
  record(value.provenance, '作品溯源')
  const connections = list(value.connections, '作品关系', 2000).map((connection) => {
    record(connection, '作品关系')
    return {
      target: id(connection.target, '关系目标'),
      type: string(connection.type, '关系类型', 80, true),
      label: string(connection.label ?? '', '关系说明', 200),
      concept: string(connection.concept ?? '', '关系概念', 200),
    }
  })
  const cover = string(value.cover, '作品封面', IMAGE_BYTES)
  if (cover) imageData(cover, '作品封面')
  return {
    schemaVersion: 1,
    id: artifactId,
    slug: artifactId,
    title: string(value.title, '作品标题', 200, true).trim(),
    subtitle: string(value.subtitle, '作品副标题', 1000),
    artifactType: value.artifactType,
    sourceType: 'personal',
    author: string(value.author, '作者', 200, true),
    topics: strings(value.topics, '作品主题', 100),
    concepts: strings(value.concepts, '作品概念', 200),
    visualStyle: string(value.visualStyle, '视觉风格', 120, true),
    related: strings(value.related, '相关作品', 2000, 160, true),
    connections,
    artifact: inlineArtifact(value.artifact),
    cover,
    createdAt: date(value.createdAt, '作品创建时间'),
    provenance: {
      generatedBy: string(value.provenance.generatedBy, '作品创建方式', 80, true),
      sources: strings(value.provenance.sources, '原始来源', 200, 2000),
      derivedFrom: strings(value.provenance.derivedFrom, '思考来源', 2000, 160, true),
    },
  }
}

function serialize(value) {
  let serialized
  try {
    serialized = JSON.stringify(value)
  } catch {
    fail('花园数据无法序列化，请检查备份格式。')
  }
  if (typeof serialized !== 'string') fail('花园数据格式无效。')
  if (serialized.length > BACKUP_BYTES || encoder.encode(serialized).byteLength > BACKUP_BYTES) {
    fail('花园备份总大小不能超过 10 MB。')
  }
  return serialized
}

export function emptyGarden() {
  return { schemaVersion: 1, favorites: [], visits: {}, collections: [], artifacts: [] }
}

export function validateGarden(value, { catalogIds = [] } = {}) {
  record(value, '花园备份')
  if (value.schemaVersion !== 1) fail('不支持此备份版本，请使用版本 1 的花园备份。')
  serialize(value)
  const artifacts = list(value.artifacts, '本地作品', 1000).map(normalizeArtifact)
  const artifactIds = new Set(strings(catalogIds, '内置作品标识', 10000, 160, true))
  for (const artifact of artifacts) {
    if (artifactIds.has(artifact.id)) fail(`作品标识重复：${artifact.id}。`)
    artifactIds.add(artifact.id)
  }
  record(value.visits, '阅读记录')
  const visitEntries = Object.entries(value.visits)
  if (visitEntries.length > 10000) fail('阅读记录数量过多。')
  const visits = {}
  for (const [artifactId, visit] of visitEntries) {
    id(artifactId, '阅读作品标识')
    record(visit, '阅读记录')
    if (
      typeof visit.progress !== 'number' ||
      !Number.isFinite(visit.progress) ||
      visit.progress < 0 ||
      visit.progress > 1
    )
      fail('阅读进度必须是 0 到 1 之间的有限数字。')
    visits[artifactId] = { at: date(visit.at, '阅读时间'), progress: visit.progress }
  }
  const collectionIds = new Set()
  const collections = list(value.collections, '专题集合', 200).map((collection) => {
    record(collection, '专题集合')
    const collectionId = id(collection.id, '专题标识')
    if (!collectionId.startsWith('collection-')) fail('本地专题标识必须以 collection- 开头。')
    if (collectionIds.has(collectionId)) fail(`专题标识重复：${collectionId}。`)
    collectionIds.add(collectionId)
    const color = string(collection.color, '专题颜色', 9, true)
    if (!/^#(?:[\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i.test(color))
      fail('专题颜色必须是十六进制颜色。')
    return {
      id: collectionId,
      title: string(collection.title, '专题标题', 200, true).trim(),
      description: string(collection.description, '专题说明', 4000),
      artifactIds: strings(collection.artifactIds, '专题作品', 10000, 160, true),
      color,
    }
  })
  return {
    schemaVersion: 1,
    favorites: strings(value.favorites, '收藏', 10000, 160, true),
    visits,
    collections,
    artifacts,
  }
}

export function loadGarden(storage) {
  try {
    if (!storage || typeof storage.getItem !== 'function') fail('浏览器存储暂不可用。')
    const raw = storage.getItem(STORAGE_KEY)
    if (raw === null || raw === undefined) return { garden: emptyGarden(), warning: null }
    if (
      typeof raw !== 'string' ||
      raw.length > BACKUP_BYTES ||
      encoder.encode(raw).byteLength > BACKUP_BYTES
    ) {
      fail('保存的数据过大，无法读取。')
    }
    return { garden: validateGarden(JSON.parse(raw)), warning: null }
  } catch (error) {
    const detail = error instanceof SyntaxError ? '数据格式损坏。' : error?.message
    return {
      garden: emptyGarden(),
      warning: `未能读取已保存的花园，原始数据已保留。${detail || ''}`,
    }
  }
}

export function saveGarden(storage, garden) {
  try {
    const payload = exportGarden(garden)
    if (!storage || typeof storage.setItem !== 'function') fail('浏览器存储暂不可用。')
    storage.setItem(STORAGE_KEY, payload)
    return null
  } catch (error) {
    if (error?.name === 'QuotaExceededError' || error?.code === 22 || error?.code === 1014) {
      return '浏览器存储空间不足，当前更改尚未保存。请先导出备份，再减少图片或作品内容。'
    }
    return `未能保存花园，当前更改尚未保存。${error?.message || '浏览器存储暂不可用。'}`
  }
}

export function commitGarden(
  storage,
  current,
  next,
  { preserveUnreadable = false, atomic = false } = {},
) {
  const failed = (warning) => ({ garden: atomic ? current : next, warning, saved: false })
  if (preserveUnreadable) {
    try {
      if (
        !storage ||
        typeof storage.getItem !== 'function' ||
        typeof storage.setItem !== 'function'
      ) {
        fail('浏览器存储暂不可用。')
      }
      const original = storage.getItem(STORAGE_KEY)
      if (original !== null && original !== undefined) {
        if (typeof original !== 'string') fail('原始数据格式异常。')
        const recoveryKey = `${STORAGE_KEY}:recovery`
        const recovery = storage.getItem(recoveryKey)
        if (recovery !== null && recovery !== undefined && recovery !== original) {
          fail('已有另一份恢复备份，请先导出并处理原始数据后再保存。')
        }
        if (recovery === null || recovery === undefined) storage.setItem(recoveryKey, original)
      }
    } catch (error) {
      return failed(
        `未能备份原始数据，已停止覆盖保存。${error?.message || '请先导出备份并检查浏览器存储空间。'}`,
      )
    }
  }
  const warning = saveGarden(storage, next)
  return warning ? failed(warning) : { garden: next, warning: null, saved: true }
}

export function searchArtifacts(
  artifacts,
  query = '',
  { type = 'all', topic = 'all', sort = 'curated' } = {},
) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  const matches = artifacts.filter((artifact) => {
    if (type !== 'all' && artifact.artifactType !== type) return false
    if (topic !== 'all' && !(artifact.topics || []).includes(topic)) return false
    const haystack = [
      artifact.title,
      artifact.subtitle,
      artifact.author,
      artifact.sourceType,
      ...(artifact.topics || []),
      ...(artifact.concepts || []),
    ]
      .join(' ')
      .toLocaleLowerCase()
    return words.every((word) => haystack.includes(word))
  })
  if (sort === 'title') matches.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'))
  if (sort === 'newest')
    matches.sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0))
  return matches
}

export function buildConnections(artifacts) {
  const ids = new Set(artifacts.map((artifact) => artifact.id))
  const seen = new Set()
  const edges = []
  const add = (source, connection) => {
    if (!connection || !ids.has(connection.target) || source === connection.target) return
    const edge = {
      source,
      target: connection.target,
      type: connection.type || 'related',
      label: connection.label || '相关知识',
      concept: connection.concept || '',
    }
    const key = JSON.stringify([edge.source, edge.target, edge.type, edge.label, edge.concept])
    if (seen.has(key)) return
    seen.add(key)
    edges.push({ id: `edge-${encodeURIComponent(key)}`, ...edge })
  }
  for (const artifact of artifacts) {
    const connections = artifact.connections || []
    for (const connection of connections) add(artifact.id, connection)
    const explicitTargets = new Set(connections.map((connection) => connection?.target))
    for (const target of artifact.related || []) {
      if (!explicitTargets.has(target)) add(artifact.id, { target })
    }
  }
  return edges
}

export function createArtifact(
  {
    title,
    subtitle = '',
    body,
    renderer = 'markdown',
    artifactType = 'idea',
    topics = [],
    derivedFrom = [],
  },
  existingArtifacts = [],
) {
  const ids = new Set(existingArtifacts.map((artifact) => artifact.id))
  let artifactId
  do {
    artifactId = `local-${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}`
  } while (ids.has(artifactId))
  const normalizedTopics = strings(topics, '作品主题', 100)
  const origins = strings(derivedFrom, '思考来源', 2000, 160, true)
  return normalizeArtifact({
    schemaVersion: 1,
    id: artifactId,
    slug: artifactId,
    title,
    subtitle,
    artifactType,
    sourceType: 'personal',
    author: '我',
    topics: normalizedTopics,
    concepts: [...normalizedTopics],
    visualStyle: 'personal',
    related: origins,
    connections: origins.map((target) => ({
      target,
      type: 'derived-from',
      label: '思考来源',
      concept: '',
    })),
    artifact: { renderer, content: body },
    cover: '',
    createdAt: new Date().toISOString(),
    provenance: { generatedBy: 'human', sources: [], derivedFrom: origins },
  })
}

export function exportGarden(garden) {
  return serialize(validateGarden(garden))
}
