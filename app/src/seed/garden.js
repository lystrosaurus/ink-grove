import { readStoredJson, preserveStoredData, writeStoredJson } from '../core/storage.js'

export const SEED_STORAGE_KEY = 'seed-grove:garden:v1'
// Keep the storage key stable so existing local records can be read without a destructive move.
const LEGACY_AGES = ['6-8', '9-11', '12-15']
const MAX_BYTES = 1024 * 1024
const forbidden = new Set(['__proto__', 'constructor', 'prototype'])
const check = (condition, message) => {
  if (!condition) throw new Error(message)
}
function object(value, fields) {
  check(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      [Object.prototype, null].includes(Object.getPrototypeOf(value)),
    '记录格式不正确。',
  )
  check(
    Object.keys(value).every((key) => !forbidden.has(key) && fields.includes(key)),
    '记录包含不支持的字段，请保留原始备份。',
  )
}
function text(value, max = 600) {
  check(typeof value === 'string' && value.length <= max, `文字最多 ${max} 个字符。`)
  return value
}
function isoDate(value) {
  check(
    typeof value === 'string' &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
      Number.isFinite(Date.parse(value)) &&
      new Date(value).toISOString() === value,
    '记录日期不正确。',
  )
  return value
}

// Bind reference validation to the canonical Seed catalog, never to the adult catalog.
export function createSeedGardenModel({ seedIds }) {
  const knownSeeds = new Set(seedIds)
  function emptySeedGarden() {
    return { schemaVersion: 2, product: 'seed-grove', revision: 0, events: [] }
  }
  function validateEvent(value, legacy = false) {
    object(value, [
      'id',
      'seedId',
      'questionId',
      'kind',
      'note',
      'source',
      'at',
      ...(legacy ? ['age'] : []),
    ])
    check(
      typeof value.id === 'string' && /^[a-z0-9][a-z0-9-]{0,79}$/.test(value.id),
      '成长记录标识不正确。',
    )
    check(
      typeof value.seedId === 'string' &&
        typeof value.questionId === 'string' &&
        ((knownSeeds.has(value.seedId) && value.questionId === '') ||
          (value.seedId === '' && /^q[1-8]$/.test(value.questionId))),
      '这条记录没有对应的小种子或思考问题。',
    )
    check(['discovery', 'real-life'].includes(value.kind), '不支持这种成长记录。')
    check(['child', 'parent'].includes(value.source), '记录来源不正确。')
    if (legacy) check(LEGACY_AGES.includes(value.age), '旧版记录的阅读年龄不正确。')
    return {
      id: value.id,
      seedId: value.seedId,
      questionId: value.questionId,
      kind: value.kind,
      note: text(value.note),
      source: value.source,
      at: isoDate(value.at),
    }
  }
  function validateSeedGarden(value) {
    const legacy = value?.schemaVersion === 1
    object(value, ['schemaVersion', 'product', 'revision', 'events', ...(legacy ? ['age'] : [])])
    check(
      [1, 2].includes(value.schemaVersion) && value.product === 'seed-grove',
      '这不是支持的 Seed Grove 备份版本。',
    )
    check(
      Number.isSafeInteger(value.revision) &&
        value.revision >= 0 &&
        value.revision < Number.MAX_SAFE_INTEGER,
      '记录版本不正确。',
    )
    if (legacy) check(LEGACY_AGES.includes(value.age), '旧版备份的阅读年龄不正确。')
    check(
      Array.isArray(value.events) && value.events.length <= 1000,
      '最多保留 1000 条成长记录，请先导出备份。',
    )
    const events = value.events.map((event) => validateEvent(event, legacy))
    check(new Set(events.map((event) => event.id)).size === events.length, '备份含有重复记录。')
    return {
      schemaVersion: 2,
      product: 'seed-grove',
      revision: value.revision,
      events,
    }
  }
  function exportSeedGarden(garden) {
    const raw = JSON.stringify(validateSeedGarden(garden), null, 2)
    check(new TextEncoder().encode(raw).byteLength <= MAX_BYTES, '备份不能超过 1 MB。')
    return raw
  }
  function loadSeedGarden(storage) {
    let raw = null
    try {
      raw = storage?.getItem(SEED_STORAGE_KEY) ?? null
      const result = readStoredJson(storage, SEED_STORAGE_KEY, {
        maxBytes: MAX_BYTES,
        validate: validateSeedGarden,
      })
      return {
        garden: result.value ?? emptySeedGarden(),
        raw: result.raw,
        warning: null,
        unreadable: false,
      }
    } catch {
      return {
        garden: emptySeedGarden(),
        raw,
        unreadable: true,
        warning: '暂时读不到成长记录。原始数据会保留，可以到家长小角落导出。',
      }
    }
  }
  function commitSeedGarden(storage, current, next) {
    try {
      const garden = validateSeedGarden({ ...next, revision: current.garden.revision + 1 })
      const raw = exportSeedGarden(garden)
      check(storage && typeof storage.getItem === 'function', '浏览器存储暂不可用。')
      if ((storage.getItem(SEED_STORAGE_KEY) ?? null) !== current.raw) {
        const error = new Error(
          '另一页面更新了记录。当前文字已保留，请先复制，再重新载入最新记录。',
        )
        error.code = 'STORAGE_CONFLICT'
        throw error
      }
      if (current.unreadable) preserveStoredData(storage, SEED_STORAGE_KEY)
      writeStoredJson(storage, SEED_STORAGE_KEY, raw, { expectedRaw: current.raw })
      return { garden, raw, warning: null, saved: true, unreadable: false }
    } catch (error) {
      return {
        ...current,
        saved: false,
        conflict: error?.code === 'STORAGE_CONFLICT',
        warning: `没有保存，原来的记录还在。${error?.name === 'QuotaExceededError' ? '浏览器空间不足，请先导出备份。' : error?.message || '浏览器暂时无法保存。'}`,
      }
    }
  }
  function createGrowthEvent(input) {
    return validateEvent({
      id: `growth-${crypto.randomUUID()}`,
      seedId: input.seedId ?? '',
      questionId: input.questionId ?? '',
      kind: input.kind,
      note: input.note ?? '',
      source: input.source ?? 'child',
      at: new Date().toISOString(),
    })
  }
  return {
    emptySeedGarden,
    validateSeedGarden,
    loadSeedGarden,
    commitSeedGarden,
    createGrowthEvent,
    exportSeedGarden,
  }
}
