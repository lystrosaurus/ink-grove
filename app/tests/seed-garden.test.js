import test from 'node:test'
import assert from 'node:assert/strict'
import { SEED_STORAGE_KEY, createSeedGardenModel } from '../src/seed/garden.js'
const {
  emptySeedGarden,
  validateSeedGarden,
  loadSeedGarden,
  commitSeedGarden,
  createGrowthEvent,
  exportSeedGarden,
} = createSeedGardenModel({
  seedIds: [
    'emotion-weather',
    'attention-detective',
    'time-store',
    'just-right-challenge',
    'break-it-down',
    'mistakes-are-clues',
  ],
})

const store = (entries = {}) => {
  const data = new Map(Object.entries(entries))
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }
}
const event = (overrides = {}) => ({
  id: 'growth-one',
  seedId: 'mistakes-are-clues',
  questionId: '',
  kind: 'discovery',
  note: '底座宽一点，积木就站稳了。',
  source: 'child',
  at: '2026-09-12T08:00:00.000Z',
  ...overrides,
})

const legacyGarden = () => ({
  schemaVersion: 1,
  product: 'seed-grove',
  revision: 7,
  age: '6-8',
  events: [event({ age: '12-15' })],
})

test('a new garden and new exports have one experience without age fields', () => {
  const garden = emptySeedGarden()
  assert.deepEqual(garden, { schemaVersion: 2, product: 'seed-grove', revision: 0, events: [] })
  assert.deepEqual(JSON.parse(exportSeedGarden(garden)), garden)
})

test('valid legacy records migrate in memory without changing the stored original', () => {
  const original = JSON.stringify(legacyGarden())
  const storage = store({ [SEED_STORAGE_KEY]: original })
  const loaded = loadSeedGarden(storage)
  assert.equal(loaded.warning, null)
  assert.deepEqual(loaded.garden, {
    schemaVersion: 2,
    product: 'seed-grove',
    revision: 7,
    events: [event()],
  })
  assert.equal(storage.getItem(SEED_STORAGE_KEY), original)
  assert.deepEqual(JSON.parse(exportSeedGarden(legacyGarden())), loaded.garden)
  const saved = commitSeedGarden(storage, loaded, {
    ...loaded.garden,
    events: [...loaded.garden.events, event({ id: 'growth-new' })],
  })
  assert.equal(saved.saved, true)
  assert.equal(saved.garden.revision, 8)
  assert.deepEqual(saved.garden.events, [event(), event({ id: 'growth-new' })])
  assert.equal(JSON.parse(storage.getItem(SEED_STORAGE_KEY)).schemaVersion, 2)
})

test('legacy migration retains original bytes after failed writes and retries without losing old records', () => {
  const original = JSON.stringify(legacyGarden())
  const storage = store({
    [SEED_STORAGE_KEY]: original,
    [SEED_STORAGE_KEY + ':recovery']: 'older protected data',
  })
  const current = loadSeedGarden(storage)
  const write = storage.setItem
  storage.setItem = () => {
    throw new DOMException('full', 'QuotaExceededError')
  }
  const next = {
    ...current.garden,
    events: [...current.garden.events, event({ id: 'growth-new' })],
  }
  const failed = commitSeedGarden(storage, current, next)
  assert.equal(failed.saved, false)
  assert.equal(storage.getItem(SEED_STORAGE_KEY), original)
  assert.deepEqual(failed.garden.events, [event()])
  storage.setItem = write
  const retried = commitSeedGarden(storage, failed, next)
  assert.equal(retried.saved, true)
  assert.equal(retried.garden.events.length, 2)
  assert.equal(storage.getItem(SEED_STORAGE_KEY + ':recovery'), 'older protected data')
})

test('legacy migration validates the entire old contract before discarding age categorization', () => {
  for (const value of [
    { ...legacyGarden(), age: 'unknown' },
    { ...legacyGarden(), age: undefined },
    { ...legacyGarden(), events: [event({ age: 'unknown' })] },
    { ...legacyGarden(), events: [event()] },
    { ...legacyGarden(), events: [event({ age: '6-8', score: 100 })] },
    { ...emptySeedGarden(), age: '9-11' },
    { ...emptySeedGarden(), events: [event({ age: '9-11' })] },
  ])
    assert.throws(() => validateSeedGarden(value))
})

test('Seed backups round trip without reading or modifying the adult garden', () => {
  const adult = '{"schemaVersion":1,"favorites":["mindware"]}'
  const storage = store({ 'ink-grove:garden:v1': adult })
  const initial = loadSeedGarden(storage)
  assert.deepEqual(initial.garden.events, [])
  const next = { ...initial.garden, events: [event()] }
  const saved = commitSeedGarden(storage, initial, next)
  assert.equal(saved.saved, true)
  assert.equal(saved.garden.revision, 1)
  assert.equal(storage.getItem('ink-grove:garden:v1'), adult)
  assert.deepEqual(validateSeedGarden(JSON.parse(exportSeedGarden(saved.garden))), saved.garden)
  assert.equal(loadSeedGarden(storage).garden.events[0].note, '底座宽一点，积木就站稳了。')
})

test('failed storage writes never advance the revision or remove recorded discoveries', () => {
  const current = { ...emptySeedGarden(), events: [event()] }
  const raw = exportSeedGarden(current)
  const storage = store({ [SEED_STORAGE_KEY]: raw })
  const loaded = loadSeedGarden(storage)
  storage.setItem = () => {
    throw new DOMException('full', 'QuotaExceededError')
  }
  const result = commitSeedGarden(storage, loaded, emptySeedGarden())
  assert.equal(result.saved, false)
  assert.deepEqual(result.garden, current)
  assert.equal(storage.getItem(SEED_STORAGE_KEY), raw)
  assert.ok(result.warning)
})

test('unknown versions are protected byte for byte before a fresh local save', () => {
  const original = '{ "product": "seed-grove", "schemaVersion": 99, "private": "keep" }'
  const storage = store({ [SEED_STORAGE_KEY]: original })
  const loaded = loadSeedGarden(storage)
  assert.ok(loaded.warning)
  assert.equal(storage.getItem(SEED_STORAGE_KEY), original)
  const result = commitSeedGarden(storage, loaded, emptySeedGarden())
  assert.equal(result.saved, true)
  assert.equal(storage.getItem(SEED_STORAGE_KEY + ':recovery'), original)
})

test('an existing different recovery copy blocks overwriting unreadable data', () => {
  const storage = store({ [SEED_STORAGE_KEY]: 'broken', [SEED_STORAGE_KEY + ':recovery']: 'older' })
  const result = commitSeedGarden(storage, loadSeedGarden(storage), emptySeedGarden())
  assert.equal(result.saved, false)
  assert.equal(storage.getItem(SEED_STORAGE_KEY), 'broken')
  assert.equal(storage.getItem(SEED_STORAGE_KEY + ':recovery'), 'older')
})

test('a stale tab cannot erase a discovery saved by another tab', () => {
  const storage = store()
  const tabA = loadSeedGarden(storage)
  const tabB = loadSeedGarden(storage)
  assert.equal(commitSeedGarden(storage, tabB, { ...tabB.garden, events: [event()] }).saved, true)
  const result = commitSeedGarden(storage, tabA, {
    ...tabA.garden,
    events: [event({ id: 'growth-other' })],
  })
  assert.equal(result.saved, false)
  assert.equal(result.conflict, true)
  assert.equal(loadSeedGarden(storage).garden.events.length, 1)
})

test('validation rejects adult backups, bad references, duplicate events and fabricated measurements', () => {
  const bad = [
    { schemaVersion: 1, favorites: [], visits: {}, collections: [], artifacts: [] },
    { ...emptySeedGarden(), product: 'ink-grove' },
    { ...emptySeedGarden(), schemaVersion: 99 },
    { ...emptySeedGarden(), age: '3-5' },
    { ...emptySeedGarden(), revision: -1 },
    { ...emptySeedGarden(), events: [event({ seedId: 'adult-investing' })] },
    { ...emptySeedGarden(), events: [event({ questionId: 'q9', seedId: '' })] },
    { ...emptySeedGarden(), events: [event({ questionId: 'q2' })] },
    { ...emptySeedGarden(), events: [event({ kind: 'iq-score' })] },
    { ...emptySeedGarden(), events: [event({ at: '2026-02-30T08:00:00.000Z' })] },
    { ...emptySeedGarden(), events: [event({ note: 'a'.repeat(601) })] },
    { ...emptySeedGarden(), events: [event(), event()] },
  ]
  for (const value of bad) assert.throws(() => validateSeedGarden(value))
})

test('a growth event records the declared action without inferring skill attainment', () => {
  const created = createGrowthEvent({
    questionId: 'q2',
    kind: 'real-life',
    note: '先问了朋友。',
    source: 'parent',
  })
  assert.equal(created.seedId, '')
  assert.equal(created.questionId, 'q2')
  assert.equal(created.source, 'parent')
  assert.equal(created.kind, 'real-life')
  assert.equal(Object.hasOwn(created, 'age'), false)
  assert.deepEqual(
    Object.keys(created).sort(),
    ['at', 'id', 'kind', 'note', 'questionId', 'seedId', 'source'].sort(),
  )
  assert.throws(() => createGrowthEvent({ seedId: 'emotion-weather', kind: 'viewed' }))
})

test('oversized imports and unavailable storage keep the current state intact', () => {
  assert.throws(() =>
    exportSeedGarden({
      ...emptySeedGarden(),
      events: Array.from({ length: 1001 }, (_, i) => event({ id: `growth-${i}` })),
    }),
  )
  const loaded = loadSeedGarden(null)
  assert.ok(loaded.warning)
  assert.equal(commitSeedGarden(null, loaded, emptySeedGarden()).saved, false)
})

test('a quota failure remains retryable even when an older recovery copy exists', () => {
  const storage = store({
    [SEED_STORAGE_KEY]: exportSeedGarden(emptySeedGarden()),
    [SEED_STORAGE_KEY + ':recovery']: 'old damaged backup',
  })
  const current = loadSeedGarden(storage)
  const write = storage.setItem
  storage.setItem = () => {
    throw new DOMException('full', 'QuotaExceededError')
  }
  const failed = commitSeedGarden(storage, current, { ...current.garden, events: [event()] })
  assert.equal(failed.saved, false)
  storage.setItem = write
  const retried = commitSeedGarden(storage, failed, { ...current.garden, events: [event()] })
  assert.equal(retried.saved, true)
  assert.equal(storage.getItem(SEED_STORAGE_KEY + ':recovery'), 'old damaged backup')
})

test('unexpected thrown storage values produce a recoverable failure', () => {
  const storage = store()
  const current = loadSeedGarden(storage)
  storage.setItem = () => {
    throw null
  }
  const result = commitSeedGarden(storage, current, emptySeedGarden())
  assert.equal(result.saved, false)
  assert.ok(result.warning)
})
