// Product-neutral mechanics. Products own validation, keys and user-facing messages.
export function readStoredJson(storage, key, { maxBytes, validate }) {
  if (!storage || typeof storage.getItem !== 'function') throw new Error('浏览器存储暂不可用。')
  const raw = storage.getItem(key) ?? null
  if (raw === null) return { raw, value: null }
  if (
    typeof raw !== 'string' ||
    raw.length > maxBytes ||
    new TextEncoder().encode(raw).byteLength > maxBytes
  )
    throw new Error('保存的数据过大，无法读取。')
  return { raw, value: validate(JSON.parse(raw)) }
}

export function preserveStoredData(storage, key) {
  if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function')
    throw new Error('浏览器存储暂不可用。')
  const original = storage.getItem(key)
  if (original === null || original === undefined) return
  if (typeof original !== 'string') throw new Error('原始数据格式异常。')
  const recovery = storage.getItem(`${key}:recovery`)
  if (recovery !== null && recovery !== undefined && recovery !== original)
    throw new Error('已有另一份恢复备份，请先导出并处理原始数据后再保存。')
  if (recovery === null || recovery === undefined) storage.setItem(`${key}:recovery`, original)
}

export function writeStoredJson(storage, key, payload, options = {}) {
  if (!storage || typeof storage.setItem !== 'function') throw new Error('浏览器存储暂不可用。')
  if ('expectedRaw' in options && (storage.getItem(key) ?? null) !== options.expectedRaw) {
    const error = new Error('另一页面更新了记录，请先保留当前文字，再重新载入最新记录。')
    error.code = 'STORAGE_CONFLICT'
    throw error
  }
  storage.setItem(key, payload)
}
