import { createArtifact, emptyGarden, validateGarden } from './garden.js'

const EXPRESSIONS = new Set([
  'auto',
  'knowledge-map',
  'visual-essay',
  'timeline',
  'system-diagram',
  'comparison',
  'interactive-story',
])
const OUTPUT_FIELDS = new Set([
  'schemaVersion',
  'title',
  'subtitle',
  'body',
  'renderer',
  'artifactType',
  'topics',
  'concepts',
  'visualStyle',
])

export class GenerationError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'GenerationError'
    this.code = code
  }
}

function requireValue(condition, code, message) {
  if (!condition) throw new GenerationError(code, message)
}

function plainObject(value) {
  return (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    [Object.prototype, null].includes(Object.getPrototypeOf(value))
  )
}

function prepareRequest(input, artifacts) {
  requireValue(plainObject(input), 'INVALID_REQUEST', '请提供一个创作问题。')
  requireValue(
    typeof input.prompt === 'string' && input.prompt.trim() && input.prompt.length <= 4000,
    'INVALID_REQUEST',
    '创作问题不能为空，且不能超过 4000 个字符。',
  )
  const expression = input.expression ?? 'auto'
  requireValue(EXPRESSIONS.has(expression), 'INVALID_REQUEST', '不支持这种表达偏好。')
  requireValue(
    Array.isArray(artifacts) && artifacts.every(plainObject),
    'INVALID_REQUEST',
    '作品目录格式无效。',
  )
  const ids = input.sourceIds ?? []
  requireValue(
    Array.isArray(ids) && ids.length <= 20 && ids.every((id) => typeof id === 'string'),
    'INVALID_REQUEST',
    '请选择最多 20 件有效的来源作品。',
  )
  const sourceIds = [...new Set(ids)]
  const sources = sourceIds.map((id) => {
    const source = artifacts.find((artifact) => artifact.id === id)
    requireValue(source, 'INVALID_REQUEST', '所选来源作品不存在，请重新选择。')
    requireValue(
      plainObject(source.artifact) &&
        ['html', 'markdown', 'svg', 'image'].includes(source.artifact.renderer) &&
        (typeof source.artifact.content === 'string' || typeof source.artifact.src === 'string'),
      'INVALID_REQUEST',
      '来源作品的内容格式无效。',
    )
    return {
      id: source.id,
      title: source.title,
      subtitle: source.subtitle,
      author: source.author,
      topics: source.topics,
      concepts: source.concepts,
      artifact: {
        renderer: source.artifact.renderer,
        ...(typeof source.artifact.content === 'string'
          ? { content: source.artifact.content }
          : { src: source.artifact.src }),
      },
    }
  })
  // The adapter receives its own copy, without visits, favorites or unrelated personal knowledge.
  const request = structuredClone({
    schemaVersion: 1,
    prompt: input.prompt.trim(),
    expression,
    sources,
  })
  requireValue(
    new TextEncoder().encode(JSON.stringify(request)).byteLength <= 10 * 1024 * 1024,
    'INVALID_REQUEST',
    '选定的来源内容超过 10 MB，请减少来源数量。',
  )
  return { request, sourceIds }
}

function assembleDraft(output, sourceIds, artifacts, providerId) {
  requireValue(
    plainObject(output) &&
      output.schemaVersion === 1 &&
      [...OUTPUT_FIELDS].every((key) => Object.hasOwn(output, key) && output[key] !== undefined) &&
      Object.keys(output).every((key) => OUTPUT_FIELDS.has(key)),
    'INVALID_RESULT',
    '生成结果不符合版本 1 的作品契约。',
  )
  requireValue(
    output.artifactType !== 'synthesis' || sourceIds.length >= 2,
    'INVALID_RESULT',
    '贯通作品需要至少两个实际选定的来源。',
  )
  try {
    const artifact = createArtifact(
      {
        title: output.title,
        subtitle: output.subtitle,
        body: output.body,
        renderer: output.renderer,
        artifactType: output.artifactType,
        topics: output.topics,
        derivedFrom: sourceIds,
      },
      artifacts,
    )
    return validateGarden({
      ...emptyGarden(),
      artifacts: [
        {
          ...artifact,
          author: `AI 辅助创作 · ${providerId}`,
          concepts: output.concepts,
          visualStyle: output.visualStyle,
          provenance: {
            generatedBy: 'ai',
            sources: sourceIds.map((id) => `artifact:${id}`),
            derivedFrom: sourceIds,
          },
        },
      ],
    }).artifacts[0]
  } catch {
    throw new GenerationError('INVALID_RESULT', '生成结果的内容、格式或大小不符合现有作品要求。')
  }
}

function abortError() {
  return new GenerationError('ABORTED', '已取消本次生成，未保存任何作品。')
}

async function callProvider(generate, request, signal) {
  let onAbort
  try {
    if (!signal) return await generate(request, { signal })
    return await new Promise((resolve, reject) => {
      onAbort = () => reject(abortError())
      signal.addEventListener('abort', onAbort, { once: true })
      if (signal.aborted) {
        onAbort()
        return
      }
      Promise.resolve(generate(request, { signal })).then(resolve, reject)
    })
  } finally {
    if (onAbort) signal.removeEventListener('abort', onAbort)
  }
}

/** A reserved provider boundary. It never fetches, reads credentials, or publishes a draft. */
export function createGenerationService(provider = null) {
  requireValue(
    provider === null ||
      (plainObject(provider) &&
        typeof provider.generate === 'function' &&
        typeof provider.id === 'string' &&
        /^[a-z0-9][a-z0-9-]{0,79}$/.test(provider.id)),
    'INVALID_PROVIDER',
    '生成适配器需要有效的 id 和 generate 方法。',
  )
  const providerId = provider?.id
  const generate = provider?.generate.bind(provider)
  return {
    getStatus: () =>
      provider
        ? { configured: true, mode: 'ai', provider: providerId }
        : { configured: false, mode: 'local' },
    async generate(input, { artifacts = [], signal } = {}) {
      requireValue(provider, 'NOT_CONFIGURED', 'AI 自动创作尚未连接，请使用本地创作或导入作品。')
      if (signal?.aborted) throw abortError()
      requireValue(
        !signal ||
          (typeof signal.addEventListener === 'function' &&
            typeof signal.removeEventListener === 'function'),
        'INVALID_REQUEST',
        '取消信号格式无效。',
      )
      let prepared
      try {
        prepared = prepareRequest(input, artifacts)
      } catch (error) {
        if (error instanceof GenerationError) throw error
        throw new GenerationError('INVALID_REQUEST', '作品目录无法转换为有效的生成请求。')
      }
      const { request, sourceIds } = prepared
      let output
      try {
        output = await callProvider(generate, request, signal)
      } catch (error) {
        if (signal?.aborted || error?.code === 'ABORTED') throw abortError()
        throw new GenerationError('PROVIDER_ERROR', '生成服务暂时无法完成请求，请稍后重试。')
      }
      if (signal?.aborted) throw abortError()
      return assembleDraft(output, sourceIds, artifacts, providerId)
    },
  }
}

export const generationService = createGenerationService()
