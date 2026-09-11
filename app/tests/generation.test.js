import assert from 'node:assert/strict'
import test from 'node:test'
import { createGenerationService, generationService } from '../src/lib/generation.js'
import { createArtifact, emptyGarden, exportGarden, validateGarden } from '../src/lib/garden.js'

const source = (title) =>
  createArtifact({ title, body: `# ${title}\n\n已有的理解。`, topics: ['反馈'] })
const result = () => ({
  schemaVersion: 1,
  title: '从理解到行动',
  subtitle: '用反馈连接思考与练习',
  renderer: 'html',
  body: '<!doctype html><html><body><h1>反馈，让理解发生改变</h1></body></html>',
  artifactType: 'synthesis',
  topics: ['学习'],
  concepts: ['反馈', '行动'],
  visualStyle: 'feedback-laboratory',
})
const provider = (generate) => ({ id: 'test-provider', generate })
const failsWith = (code) => (error) => error.name === 'GenerationError' && error.code === code

test('the default AI boundary is local, unconfigured, and cannot start a generation', async () => {
  assert.deepEqual(generationService.getStatus(), { configured: false, mode: 'local' })
  await assert.rejects(
    generationService.generate({ prompt: '一个想法' }),
    failsWith('NOT_CONFIGURED'),
  )
})

test('invalid provider configuration is rejected before it can be treated as connected', () => {
  for (const invalid of [{}, { id: 'provider' }, { id: '', generate() {} }]) {
    assert.throws(() => createGenerationService(invalid), failsWith('INVALID_PROVIDER'))
  }
})

test('generation snapshots only selected knowledge and defaults to AI-chosen expression', async () => {
  const artifacts = [source('认知'), source('练习'), source('未选中的私有想法')]
  const original = structuredClone(artifacts)
  let received
  const service = createGenerationService(
    provider(async (request) => {
      received = structuredClone(request)
      request.sources[0].title = '适配器修改了自己的副本'
      request.sources[0].concepts.push('修改副本')
      return result()
    }),
  )
  const draft = await service.generate(
    { prompt: '  反馈是什么？  ', sourceIds: artifacts.slice(0, 2).map((a) => a.id) },
    { artifacts },
  )
  assert.deepEqual(service.getStatus(), { configured: true, mode: 'ai', provider: 'test-provider' })
  assert.equal(received.schemaVersion, 1)
  assert.equal(received.prompt, '反馈是什么？')
  assert.equal(received.expression, 'auto')
  assert.deepEqual(
    received.sources.map((a) => a.id),
    artifacts.slice(0, 2).map((a) => a.id),
  )
  assert.equal(received.sources[0].artifact.content, artifacts[0].artifact.content)
  assert.deepEqual(artifacts, original)
  assert.notEqual(draft.id, artifacts[0].id)
})

test('a generated draft uses the existing manifest, persistence and connection contract', async () => {
  const artifacts = [source('认知'), source('练习')]
  const sourceIds = artifacts.map((a) => a.id)
  const service = createGenerationService(provider(async () => result()))
  const draft = await service.generate({ prompt: '形成新的理解', sourceIds }, { artifacts })
  assert.equal(draft.schemaVersion, 1)
  assert.match(draft.id, /^local-/)
  assert.equal(draft.slug, draft.id)
  assert.equal(draft.artifact.renderer, 'html')
  assert.equal(draft.artifact.content, result().body)
  assert.deepEqual(draft.concepts, ['反馈', '行动'])
  assert.equal(draft.visualStyle, 'feedback-laboratory')
  assert.equal(draft.provenance.generatedBy, 'ai')
  assert.deepEqual(draft.provenance.derivedFrom, sourceIds)
  assert.deepEqual(
    draft.provenance.sources,
    sourceIds.map((id) => `artifact:${id}`),
  )
  assert.deepEqual(
    draft.connections.map((edge) => edge.target),
    sourceIds,
  )
  assert.equal(artifacts.length, 2, 'generation must not publish or change the source catalog')
  const garden = { ...emptyGarden(), artifacts: [draft] }
  assert.deepEqual(validateGarden(JSON.parse(exportGarden(garden))), garden)
})

test('invalid requests never reach the provider, including unknown source IDs', async () => {
  let calls = 0
  const service = createGenerationService(
    provider(async () => {
      calls++
      return result()
    }),
  )
  for (const request of [
    null,
    {},
    { prompt: '' },
    { prompt: 'x'.repeat(4001) },
    { prompt: '想法', expression: 'unknown' },
    { prompt: '想法', sourceIds: ['missing'] },
    { prompt: '想法', sourceIds: 'not-an-array' },
  ]) {
    await assert.rejects(service.generate(request, { artifacts: [] }), failsWith('INVALID_REQUEST'))
  }
  assert.equal(calls, 0)
})

test('providers cannot supply identities, external paths or fabricated provenance', async () => {
  const artifacts = [source('认知'), source('练习')]
  const input = { prompt: '形成新的理解', sourceIds: artifacts.map((a) => a.id) }
  for (const patch of [
    { id: artifacts[0].id },
    { slug: 'naval-almanack' },
    { artifact: { src: 'https://example.com/x' } },
    { provenance: { generatedBy: 'human' } },
    { sourceIds: ['unselected-source'] },
    { cover: 'javascript:alert(1)' },
  ]) {
    const service = createGenerationService(provider(async () => ({ ...result(), ...patch })))
    await assert.rejects(service.generate(input, { artifacts }), failsWith('INVALID_RESULT'))
  }
})

test('malformed source catalogs fail as request errors and source content uses an explicit field allowlist', async () => {
  const selected = source('认知')
  let calls = 0
  const service = createGenerationService(
    provider(async (request) => {
      calls++
      assert.deepEqual(request.sources[0].artifact, selected.artifact)
      return { ...result(), artifactType: 'idea' }
    }),
  )
  const input = { prompt: '理解反馈', sourceIds: [selected.id] }
  for (const artifacts of [
    [null, selected],
    [{ ...selected, artifact: null }],
    [{ ...selected, topics: [() => {}] }],
  ]) {
    await assert.rejects(service.generate(input, { artifacts }), failsWith('INVALID_REQUEST'))
  }
  assert.equal(calls, 0)
  await service.generate(input, {
    artifacts: [{ ...selected, artifact: { ...selected.artifact, privateMetadata: 'excluded' } }],
  })
  assert.equal(calls, 1)
})

test('malformed, future-version and oversized output is rejected by the manifest boundary', async () => {
  const artifacts = [source('认知'), source('练习')]
  const input = { prompt: '形成新的理解', sourceIds: artifacts.map((a) => a.id) }
  for (const output of [
    null,
    'not an object',
    { ...result(), schemaVersion: 2 },
    { ...result(), title: '' },
    { ...result(), concepts: [null] },
    { ...result(), renderer: 'react' },
    { ...result(), body: '知'.repeat(800000) },
  ]) {
    const service = createGenerationService(provider(async () => output))
    await assert.rejects(service.generate(input, { artifacts }), failsWith('INVALID_RESULT'))
  }
})

test('a synthesis cannot invent missing sources', async () => {
  const service = createGenerationService(provider(async () => result()))
  await assert.rejects(service.generate({ prompt: '贯通' }), failsWith('INVALID_RESULT'))
})

test('missing or undefined content fields cannot silently fall back to manual creation defaults', async () => {
  const artifacts = [source('认知'), source('练习')]
  const input = { prompt: '形成新的理解', sourceIds: artifacts.map((a) => a.id) }
  for (const field of Object.keys(result())) {
    for (const remove of [false, true]) {
      const output = result()
      if (remove) delete output[field]
      else output[field] = undefined
      const service = createGenerationService(provider(async () => output))
      await assert.rejects(
        service.generate(input, { artifacts }),
        failsWith('INVALID_RESULT'),
        field,
      )
    }
  }
})

test('cancellation before dispatch never invokes the provider', async () => {
  let calls = 0
  const controller = new AbortController()
  controller.abort()
  const service = createGenerationService(
    provider(async () => {
      calls++
      return result()
    }),
  )
  await assert.rejects(
    service.generate({ prompt: '想法' }, { signal: controller.signal }),
    failsWith('ABORTED'),
  )
  assert.equal(calls, 0)
})

test('in-flight cancellation rejects even when a future adapter ignores the signal', async () => {
  const controller = new AbortController()
  let receivedSignal
  const service = createGenerationService(
    provider((_request, { signal }) => {
      receivedSignal = signal
      return new Promise(() => {})
    }),
  )
  const pending = service.generate({ prompt: '想法' }, { signal: controller.signal })
  controller.abort()
  await assert.rejects(pending, failsWith('ABORTED'))
  assert.equal(receivedSignal, controller.signal)
})

test('provider failures expose a stable error instead of leaking upstream request details', async () => {
  const service = createGenerationService(
    provider(async () => {
      throw new Error('upstream confidential request detail')
    }),
  )
  await assert.rejects(service.generate({ prompt: '想法' }), (error) => {
    assert.equal(error.code, 'PROVIDER_ERROR')
    assert.doesNotMatch(error.message, /confidential/)
    return true
  })
})
