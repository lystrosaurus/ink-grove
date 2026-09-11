import test from 'node:test'
import assert from 'node:assert/strict'
import {
  STORAGE_KEY,
  emptyGarden,
  loadGarden,
  saveGarden,
  commitGarden,
  validateGarden,
  searchArtifacts,
  buildConnections,
  createArtifact,
  exportGarden,
} from '../src/lib/garden.js'

const initial = () => ({
  schemaVersion: 1,
  favorites: [],
  visits: {},
  collections: [],
  artifacts: [],
})
const localArtifact = (overrides = {}) => ({
  schemaVersion: 1,
  id: 'local-example',
  slug: 'local-example',
  title: '我的认知花园',
  subtitle: '保留中文',
  artifactType: 'idea',
  sourceType: 'personal',
  author: '我',
  topics: ['自定义主题'],
  concepts: ['反馈'],
  visualStyle: 'personal',
  related: ['book-a'],
  connections: [{ target: 'book-a', type: 'derived-from', label: '思考来源', concept: '' }],
  artifact: { renderer: 'markdown', content: '# 我的思考\n\n认真生活。' },
  cover: '',
  createdAt: '2026-09-11T06:00:00.000Z',
  provenance: { generatedBy: 'human', sources: [], derivedFrom: ['book-a'] },
  ...overrides,
})
const gardenWith = (artifact = localArtifact()) => ({ ...initial(), artifacts: [artifact] })

test('empty gardens have independent mutable containers', () => {
  const first = emptyGarden()
  first.favorites.push('book-a')
  assert.deepEqual(emptyGarden(), initial())
})

test('search requires every word across Chinese title, author, topic and concept fields', () => {
  const artifacts = [
    {
      id: 'a',
      title: '认知觉醒',
      subtitle: '注意力',
      author: '周岭',
      topics: ['成长'],
      concepts: ['反馈'],
      sourceType: 'book',
      artifactType: 'book',
    },
    {
      id: 'b',
      title: '认知觉醒笔记',
      author: '我',
      topics: ['成长'],
      concepts: ['行动'],
      artifactType: 'idea',
    },
    {
      id: 'c',
      title: 'The Garden',
      subtitle: 'SYSTEMS',
      author: 'Ada',
      topics: ['Design'],
      concepts: ['Feedback'],
      sourceType: 'personal',
      artifactType: 'system',
    },
  ]
  assert.deepEqual(
    searchArtifacts(artifacts, '认知 成长 周岭 反馈').map((a) => a.id),
    ['a'],
  )
  assert.deepEqual(
    searchArtifacts(artifacts, ' garden SYSTEMS personal ').map((a) => a.id),
    ['c'],
  )
  assert.deepEqual(searchArtifacts(artifacts, '认知 未出现'), [])
})

test('search combines type and user-defined topic filters without mutating the catalog', () => {
  const artifacts = [
    { id: 'a', title: 'Beta', artifactType: 'idea', topics: ['自由主题'], createdAt: '2024-01-01' },
    {
      id: 'b',
      title: 'Alpha',
      artifactType: 'book',
      topics: ['自由主题'],
      createdAt: '2026-01-01',
    },
    {
      id: 'c',
      title: 'Gamma',
      artifactType: 'idea',
      topics: ['另一个主题'],
      createdAt: '2025-01-01',
    },
  ]
  assert.deepEqual(
    searchArtifacts(artifacts, '', { type: 'idea', topic: '自由主题' }).map((a) => a.id),
    ['a'],
  )
  assert.deepEqual(
    searchArtifacts(artifacts, '', { sort: 'newest' }).map((a) => a.id),
    ['b', 'c', 'a'],
  )
  assert.deepEqual(
    searchArtifacts(artifacts, '', { sort: 'title' }).map((a) => a.id),
    ['b', 'a', 'c'],
  )
  assert.deepEqual(
    searchArtifacts(artifacts).map((a) => a.id),
    ['a', 'b', 'c'],
  )
  assert.deepEqual(
    artifacts.map((a) => a.id),
    ['a', 'b', 'c'],
  )
})

test('connections preserve direction and distinct meanings while removing duplicates and dangling targets', () => {
  const artifacts = [
    {
      id: 'a',
      related: ['b', 'missing'],
      connections: [
        { target: 'b', type: 'supports', label: '支持', concept: '反馈' },
        { target: 'b', type: 'supports', label: '支持', concept: '反馈' },
        { target: 'b', type: 'contrasts', label: '对照', concept: '实践' },
        { target: 'b', type: 'supports', label: '另一个角度', concept: '反馈' },
        { target: 'missing', type: 'supports' },
      ],
    },
    { id: 'b', connections: [{ target: 'a', type: 'supports', label: '反向', concept: '反馈' }] },
    { id: 'c', related: ['a'] },
  ]
  const edges = buildConnections(artifacts)
  assert.equal(edges.length, 5)
  assert.equal(new Set(edges.map((e) => e.id)).size, 5)
  assert.deepEqual(
    edges.map(({ source, target, type, label, concept }) => ({
      source,
      target,
      type,
      label,
      concept,
    })),
    [
      { source: 'a', target: 'b', type: 'supports', label: '支持', concept: '反馈' },
      { source: 'a', target: 'b', type: 'contrasts', label: '对照', concept: '实践' },
      { source: 'a', target: 'b', type: 'supports', label: '另一个角度', concept: '反馈' },
      { source: 'b', target: 'a', type: 'supports', label: '反向', concept: '反馈' },
      { source: 'c', target: 'a', type: 'related', label: '相关知识', concept: '' },
    ],
  )
  assert.deepEqual(buildConnections(artifacts), edges)
})

test('creating local knowledge trims its title, preserves body, and records provenance', () => {
  const body = '# 原样内容\n\n  缩进与中文'
  const result = createArtifact({
    title: '  花园里的发现  ',
    subtitle: '新的联系',
    body,
    topics: ['我的主题', '我的主题'],
    derivedFrom: ['book-a'],
  })
  assert.match(result.id, /^local-/)
  assert.equal(result.slug, result.id)
  assert.equal(result.title, '花园里的发现')
  assert.deepEqual(result.artifact, { renderer: 'markdown', content: body })
  assert.deepEqual(result.topics, ['我的主题'])
  assert.deepEqual(result.related, ['book-a'])
  assert.deepEqual(result.connections, [
    { target: 'book-a', type: 'derived-from', label: '思考来源', concept: '' },
  ])
  assert.deepEqual(result.provenance, {
    generatedBy: 'human',
    sources: [],
    derivedFrom: ['book-a'],
  })
  assert.equal(result.sourceType, 'personal')
  assert.equal(result.author, '我')
  assert.ok(Number.isFinite(Date.parse(result.createdAt)))
  assert.equal(validateGarden(gardenWith(result)).artifacts[0].title, '花园里的发现')
  assert.notEqual(createArtifact({ title: '花园里的发现', body }).id, result.id)
})

test('creating knowledge rejects missing titles, bodies and unsupported renderers', () => {
  for (const input of [
    { title: '  ', body: '有效内容' },
    { title: '标题', body: '  ' },
    { title: '标题', body: '<p>内容</p>', renderer: 'script' },
    { title: '标题', body: '内容', topics: [123] },
    { title: '标题', body: '内容', artifactType: 'unknown' },
  ])
    assert.throws(() => createArtifact(input), /[\u4e00-\u9fff]/)
})

test('local HTML and SVG are stored inline and images accept only embedded image data', () => {
  for (const [renderer, body] of [
    ['html', '<main>花园</main>'],
    ['svg', '<svg xmlns="http://www.w3.org/2000/svg"></svg>'],
    ['image', 'data:image/png;base64,aGVsbG8='],
    ['image', 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='],
  ]) {
    const result = createArtifact({ title: '一件作品', body, renderer })
    assert.equal(result.artifact.content, body)
    assert.equal(validateGarden(gardenWith(result)).artifacts[0].artifact.renderer, renderer)
  }
  for (const [renderer, body] of [
    ['svg', '<script>alert(1)</script>'],
    ['image', 'https://example.com/image.png'],
    ['image', 'data:text/html;base64,aGVsbG8='],
    ['image', 'data:image/png;base64,***'],
  ])
    assert.throws(() => createArtifact({ title: '一件作品', renderer, body }))
})

test('local content limits count UTF-8 bytes and cap encoded image data', () => {
  assert.throws(() => createArtifact({ title: '过大', body: '汉'.repeat(700000) }), /大小|大|MB/)
  assert.throws(
    () =>
      createArtifact({
        title: '过大图片',
        renderer: 'image',
        body: `data:image/png;base64,${'a'.repeat(3 * 1024 * 1024)}`,
      }),
    /大小|大|MB/,
  )
})

test('a complete backup round-trips custom topics, collections, favorites and reading progress', () => {
  const garden = {
    ...gardenWith(),
    favorites: ['book-a', 'local-example'],
    visits: { 'book-a': { at: '2026-09-10T12:00:00.000Z', progress: 0.65 } },
    collections: [
      {
        id: 'collection-1',
        title: '自己的专题',
        description: '把知识串起来',
        artifactIds: ['book-a', 'local-example'],
        color: '#476650',
      },
    ],
  }
  const result = validateGarden(JSON.parse(exportGarden(garden)), { catalogIds: ['book-a'] })
  assert.deepEqual(result, garden)
  result.artifacts[0].topics.push('另一主题')
  assert.deepEqual(garden.artifacts[0].topics, ['自定义主题'])
})

test('imports reject unknown versions and malformed top-level containers', () => {
  for (const value of [
    null,
    [],
    {},
    { ...initial(), schemaVersion: 2 },
    { ...initial(), favorites: {} },
    { ...initial(), visits: [] },
    { ...initial(), artifacts: {} },
    { ...initial(), collections: {} },
    { ...initial(), favorites: [123] },
  ])
    assert.throws(() => validateGarden(value), /[\u4e00-\u9fff]/)
})

test('imports reject invalid visit values, impossible dates, and prototype keys', () => {
  for (const visit of [
    null,
    [],
    { at: 'not-a-date', progress: 0.5 },
    { at: '2026-02-30T06:00:00.000Z', progress: 0.5 },
    { at: '2026-09-11T06:00:00.000Z', progress: NaN },
    { at: '2026-09-11T06:00:00.000Z', progress: Infinity },
    { at: '2026-09-11T06:00:00.000Z', progress: 1.1 },
    { at: '2026-09-11T06:00:00.000Z', progress: -0.1 },
    { at: '2026-09-11T06:00:00.000Z', progress: '0.5' },
  ])
    assert.throws(() => validateGarden({ ...initial(), visits: { a: visit } }))
  const poisoned = JSON.parse(
    '{"schemaVersion":1,"favorites":[],"visits":{"__proto__":{"at":"2026-09-11T06:00:00.000Z","progress":0}},"collections":[],"artifacts":[]}',
  )
  assert.throws(() => validateGarden(poisoned))
})

test('imports reject malformed collections and duplicate collection identifiers', () => {
  const collection = {
    id: 'collection-1',
    title: '专题',
    description: '',
    artifactIds: ['book-a'],
    color: '#526747',
  }
  for (const collections of [
    [null],
    [{ ...collection, artifactIds: [null] }],
    [{ ...collection, title: {} }],
    [collection, { ...collection }],
    [{ ...collection, color: 'url(https://example.com/track)' }],
  ])
    assert.throws(() => validateGarden({ ...initial(), collections }))
})

test('imports validate every nested artifact object and list instead of trusting a valid title', () => {
  for (const override of [
    { artifact: null },
    { artifact: { renderer: 'markdown', content: {} } },
    { topics: [false] },
    { concepts: {} },
    { related: [null] },
    { connections: [null] },
    { connections: [{ target: {}, type: 'related' }] },
    { provenance: null },
    { provenance: { generatedBy: 'human', sources: {}, derivedFrom: [] } },
    { provenance: { generatedBy: 'human', sources: [], derivedFrom: [123] } },
    { createdAt: 'yesterday' },
    { author: {} },
    { sourceType: 'external' },
    { visualStyle: {} },
  ])
    assert.throws(() => validateGarden(gardenWith(localArtifact(override))))
})

test('imports reject duplicate local ids and collisions with the built-in catalog', () => {
  assert.throws(() =>
    validateGarden({ ...initial(), artifacts: [localArtifact(), localArtifact()] }),
  )
  assert.throws(() => validateGarden(gardenWith(), { catalogIds: ['local-example'] }))
})

test('imports reject arbitrary file URLs for artifact source and cover', () => {
  for (const override of [
    {
      artifact: {
        renderer: 'html',
        content: '<p>正文</p>',
        src: 'https://tracker.example/artifact.html',
      },
    },
    { artifact: { renderer: 'html', content: '<p>正文</p>', src: 'file:///C:/secret.html' } },
    { cover: 'https://tracker.example/pixel.gif' },
    { cover: 'javascript:alert(1)' },
    { cover: '/artifacts/untrusted.svg' },
  ])
    assert.throws(() => validateGarden(gardenWith(localArtifact(override))))
})

test('imports reject oversized strings and excessive list counts', () => {
  assert.throws(() =>
    validateGarden(
      gardenWith(
        localArtifact({
          artifact: { renderer: 'markdown', content: 'x'.repeat(2 * 1024 * 1024 + 1) },
        }),
      ),
    ),
  )
  assert.throws(() => validateGarden({ ...initial(), favorites: Array(10001).fill('book-a') }))
  assert.throws(() => validateGarden(gardenWith(localArtifact({ title: '字'.repeat(201) }))))
})

test('missing storage starts an empty garden and storage round-trips the real payload', () => {
  const entries = new Map()
  const storage = {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
  }
  assert.deepEqual(loadGarden(storage), { garden: initial(), warning: null })
  const garden = gardenWith()
  assert.equal(saveGarden(storage, garden), null)
  assert.ok(entries.has(STORAGE_KEY))
  assert.deepEqual(loadGarden(storage), { garden, warning: null })
})

test('corrupt and future-version storage return recoverable warnings without changing the saved bytes', () => {
  for (const raw of [
    '{bad json',
    JSON.stringify({ ...initial(), schemaVersion: 9 }),
    JSON.stringify({ ...initial(), favorites: [null] }),
  ]) {
    let saved = raw
    const result = loadGarden({
      getItem: () => saved,
      setItem: (_, next) => {
        saved = next
      },
    })
    assert.deepEqual(result.garden, initial())
    assert.match(result.warning, /[\u4e00-\u9fff]/)
    assert.equal(saved, raw)
  }
})

test('blocked storage and quota errors return Chinese warnings instead of escaping into the UI', () => {
  const blocked = {
    getItem: () => {
      throw new Error('SecurityError')
    },
  }
  assert.deepEqual(loadGarden(blocked).garden, initial())
  assert.match(loadGarden(blocked).warning, /[\u4e00-\u9fff]/)
  const storage = {
    setItem: () => {
      const error = new Error('quota')
      error.name = 'QuotaExceededError'
      throw error
    },
  }
  assert.match(saveGarden(storage, gardenWith()), /空间|容量|配额/)
  assert.match(saveGarden(null, gardenWith()), /[\u4e00-\u9fff]/)
})

test('invalid gardens cannot overwrite an existing storage payload or be exported', () => {
  let saved = 'previous backup'
  const storage = {
    setItem: (_, value) => {
      saved = value
    },
  }
  const invalid = { ...initial(), artifacts: [null] }
  assert.match(saveGarden(storage, invalid), /[\u4e00-\u9fff]/)
  assert.equal(saved, 'previous backup')
  assert.throws(() => exportGarden(invalid))
})

test('large valid inline images below the size limit remain importable', () => {
  const body = `data:image/png;base64,${'a'.repeat(2 * 1024 * 1024)}`
  const artifact = createArtifact({ title: '大幅作品', body, renderer: 'image' })
  assert.equal(validateGarden(gardenWith(artifact)).artifacts[0].artifact.content.length, 2097174)
})

test('collection colors reject invalid five-digit hex values', () => {
  assert.throws(() =>
    validateGarden({
      ...initial(),
      collections: [
        {
          id: 'collection-1',
          title: '颜色错误',
          description: '',
          artifactIds: [],
          color: '#12345',
        },
      ],
    }),
  )
})

test('unexpected thrown storage values still return a recoverable warning', () => {
  for (const thrown of [null, 'blocked', undefined]) {
    const result = loadGarden({
      getItem: () => {
        throw thrown
      },
    })
    assert.deepEqual(result.garden, initial())
    assert.match(result.warning, /[\u4e00-\u9fff]/)
  }
})

test('local slugs must match their ids so imported routes cannot shadow other works', () => {
  assert.throws(() =>
    validateGarden(gardenWith(localArtifact({ slug: 'book-a' })), { catalogIds: ['book-a'] }),
  )
  assert.throws(() =>
    validateGarden({
      ...initial(),
      artifacts: [
        localArtifact({ slug: 'shared-route' }),
        localArtifact({ id: 'local-second', slug: 'shared-route' }),
      ],
    }),
  )
})

test('local manifests require version 1 and preserve it through creation and export', () => {
  for (const schemaVersion of [undefined, 2, '1']) {
    assert.throws(() => validateGarden(gardenWith(localArtifact({ schemaVersion }))))
  }
  const artifact = createArtifact({ title: '有版本的作品', body: '保留作品格式版本' })
  assert.equal(artifact.schemaVersion, 1)
  assert.equal(JSON.parse(exportGarden(gardenWith(artifact))).artifacts[0].schemaVersion, 1)
  assert.equal(validateGarden(gardenWith(localArtifact())).artifacts[0].schemaVersion, 1)
})

test('local collections must use their own prefix to avoid reserved and catalog routes', () => {
  for (const collectionId of ['favorites', 'starter-reading', 'local-example']) {
    assert.throws(() =>
      validateGarden({
        ...initial(),
        collections: [
          {
            id: collectionId,
            title: '自己的专题',
            description: '',
            artifactIds: [],
            color: '#526747',
          },
        ],
      }),
    )
  }
})

function memoryStorage(values = [], beforeWrite = () => {}) {
  const entries = new Map(values)
  return {
    entries,
    getItem: (key) => entries.get(key) ?? null,
    setItem(key, value) {
      beforeWrite(key, value, entries)
      entries.set(key, value)
    },
  }
}

test('committing a normal edit persists the next garden and exposes a successful result', () => {
  const storage = memoryStorage()
  const current = initial()
  const next = gardenWith()
  assert.deepEqual(commitGarden(storage, current, next), {
    garden: next,
    warning: null,
    saved: true,
  })
  assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEY)), next)
  assert.equal(storage.getItem(`${STORAGE_KEY}:recovery`), null)
})

test('committing after an unreadable load backs up exact original bytes before replacing them', () => {
  const recoveryKey = `${STORAGE_KEY}:recovery`
  for (const raw of ['{bad json', JSON.stringify({ ...initial(), schemaVersion: 9 }), '']) {
    const storage = memoryStorage([[STORAGE_KEY, raw]], (key, value, entries) => {
      if (key === STORAGE_KEY) assert.equal(entries.get(recoveryKey), raw)
    })
    const next = gardenWith()
    const result = commitGarden(storage, initial(), next, { preserveUnreadable: true })
    assert.deepEqual(result, { garden: next, warning: null, saved: true })
    assert.equal(storage.getItem(recoveryKey), raw)
    assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEY)), next)
  }
})

test('recovery quota failures keep the original bytes and honor ordinary versus atomic edits', () => {
  const recoveryKey = `${STORAGE_KEY}:recovery`
  for (const atomic of [false, true]) {
    const storage = memoryStorage([[STORAGE_KEY, '{unreadable']], (key) => {
      if (key === recoveryKey)
        throw Object.assign(new Error('quota'), { name: 'QuotaExceededError' })
    })
    const current = initial()
    const next = gardenWith()
    const result = commitGarden(storage, current, next, { preserveUnreadable: true, atomic })
    assert.equal(result.garden, atomic ? current : next)
    assert.equal(result.saved, false)
    assert.match(result.warning, /备份/)
    assert.equal(storage.getItem(STORAGE_KEY), '{unreadable')
    assert.equal(storage.getItem(recoveryKey), null)
  }
})

test('ordinary save failures keep the new work in memory while atomic imports keep current state', () => {
  for (const atomic of [false, true]) {
    const current = initial()
    const next = gardenWith()
    const original = JSON.stringify(current)
    const storage = memoryStorage([[STORAGE_KEY, original]], () => {
      throw Object.assign(new Error('quota'), { name: 'QuotaExceededError' })
    })
    const result = commitGarden(storage, current, next, { atomic })
    assert.equal(result.garden, atomic ? current : next)
    assert.equal(result.saved, false)
    assert.match(result.warning, /空间|容量|配额/)
    assert.equal(storage.getItem(STORAGE_KEY), original)
  }
})

test('an existing different recovery backup prevents overwriting either protected payload', () => {
  const recoveryKey = `${STORAGE_KEY}:recovery`
  for (const atomic of [false, true]) {
    const storage = memoryStorage([
      [STORAGE_KEY, '{new unreadable'],
      [recoveryKey, '{earlier unreadable'],
    ])
    const current = initial()
    const next = gardenWith()
    const result = commitGarden(storage, current, next, { preserveUnreadable: true, atomic })
    assert.equal(result.garden, atomic ? current : next)
    assert.equal(result.saved, false)
    assert.match(result.warning, /备份/)
    assert.equal(storage.getItem(STORAGE_KEY), '{new unreadable')
    assert.equal(storage.getItem(recoveryKey), '{earlier unreadable')
  }
})

test('an existing matching recovery is reused without writing over the backup', () => {
  const recoveryKey = `${STORAGE_KEY}:recovery`
  const raw = '{unreadable'
  const storage = memoryStorage(
    [
      [STORAGE_KEY, raw],
      [recoveryKey, raw],
    ],
    (key) => {
      if (key === recoveryKey) throw new Error('existing recovery must not be rewritten')
    },
  )
  const next = gardenWith()
  assert.deepEqual(commitGarden(storage, initial(), next, { preserveUnreadable: true }), {
    garden: next,
    warning: null,
    saved: true,
  })
  assert.equal(storage.getItem(recoveryKey), raw)
  assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEY)), next)
})

test('a failed primary save after a successful recovery preserves both recoverable payloads', () => {
  const recoveryKey = `${STORAGE_KEY}:recovery`
  const raw = '{unreadable'
  const storage = memoryStorage([[STORAGE_KEY, raw]], (key) => {
    if (key === STORAGE_KEY) throw Object.assign(new Error('quota'), { name: 'QuotaExceededError' })
  })
  const current = initial()
  const result = commitGarden(storage, current, gardenWith(), {
    preserveUnreadable: true,
    atomic: true,
  })
  assert.equal(result.garden, current)
  assert.equal(result.saved, false)
  assert.equal(storage.getItem(STORAGE_KEY), raw)
  assert.equal(storage.getItem(recoveryKey), raw)
})

test('unavailable original storage blocks protected commits before any write', () => {
  const current = initial()
  const storage = memoryStorage()
  storage.getItem = () => {
    throw new Error('blocked')
  }
  const result = commitGarden(storage, current, gardenWith(), {
    preserveUnreadable: true,
    atomic: true,
  })
  assert.equal(result.garden, current)
  assert.equal(result.saved, false)
  assert.match(result.warning, /备份/)
  assert.equal(storage.entries.size, 0)
})
