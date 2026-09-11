import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const workspace = fileURLToPath(new URL('../', import.meta.url))
const builderPath = resolve(workspace, 'scripts/build-content.mjs')

test('the content build validates all artifacts before exposing application data', async () => {
  const result = spawnSync(process.execPath, [builderPath, '--check'], {
    cwd: workspace,
    encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr)
  const catalog = JSON.parse(await readFile(resolve(workspace, 'content/catalog.json'), 'utf8'))
  assert.ok(result.stdout.includes(`${catalog.artifacts.length} artifacts`))
})

test('duplicate ids, broken connections and nonlocal resources are rejected', async () => {
  const { validateCatalog } = await import('./build-content.mjs')
  const original = JSON.parse(await readFile(resolve(workspace, 'content/catalog.json'), 'utf8'))
  const artifactRoot = resolve(workspace, 'content/artifacts')
  const cases = [
    [
      (catalog) => catalog.artifacts.push(structuredClone(catalog.artifacts[0])),
      /Duplicate artifact id/,
    ],
    [
      (catalog) => catalog.artifacts[0].related.push('missing-artifact'),
      /Unknown related artifact/,
    ],
    [
      (catalog) =>
        catalog.artifacts[0].connections.push({
          target: 'missing-artifact',
          type: 'related',
          concept: 'attention',
          label: 'missing',
        }),
      /Unknown connection target/,
    ],
    [
      (catalog) => (catalog.artifacts[0].artifact.src = '/artifacts/../../index.html'),
      /local artifact path/,
    ],
    [
      (catalog) => (catalog.artifacts[0].cover = 'https://example.com/cover.svg'),
      /local artifact path/,
    ],
    [(catalog) => (catalog.artifacts[0].artifact.renderer = 'unknown'), /Unsupported renderer/],
    [
      (catalog) =>
        (catalog.artifacts[0].artifact.src = `/artifacts/${catalog.artifacts[0].id}/missing.html`),
      /Missing resource/,
    ],
    [
      (catalog) => catalog.collections[0].artifactIds.push('missing-artifact'),
      /Unknown collection artifact/,
    ],
    [(catalog) => catalog.concepts[0].related.push('missing-concept'), /Unknown related concept/],
  ]
  for (const [mutate, expected] of cases) {
    const catalog = structuredClone(original)
    mutate(catalog)
    await assert.rejects(validateCatalog(catalog, artifactRoot), expected)
  }
})

test('build preserves each protected root HTML byte for byte in the content source', async () => {
  const sources = {
    'cognitive-awakening': 'cognitive_awakening_editorial.html',
    'seven-habits': 'seven_habits_core_map.html',
    'deliberate-practice': 'deliberate_practice_lab_style.html',
    'deliberate-practice-modern': 'deliberate_practice_modern.html',
    'naval-almanack': 'naval_almanack_black_gold.html',
    'personal-growth-os': 'integrated_thinking_personal_os.html',
    'thinking-framework': 'thinking-framework-core-map.html',
  }
  for (const [id, name] of Object.entries(sources)) {
    const [source, copy] = await Promise.all([
      readFile(resolve(workspace, name)),
      readFile(resolve(workspace, 'content/artifacts', id, 'index.html')),
    ])
    assert.deepEqual(copy, source, `${id} must retain the complete original document`)
  }
})

test('every root HTML is indexed and unedited presentation copies retain the original bytes', async () => {
  const catalog = JSON.parse(await readFile(resolve(workspace, 'content/catalog.json'), 'utf8'))
  const originals = (await readdir(workspace)).filter((name) => name.endsWith('.html')).sort()
  const indexed = []
  const edited = new Set(['thinking-in-systems', 'intellectual-atlas'])
  for (const entry of catalog.artifacts) {
    const manifest = JSON.parse(
      await readFile(resolve(workspace, 'content/artifacts', entry.id, 'manifest.json'), 'utf8'),
    )
    if (manifest.artifact.renderer !== 'html') continue
    const source = manifest.provenance.sources.find((item) => item.startsWith('file:'))?.slice(5)
    assert.ok(source, `${entry.id} needs its original filename`)
    indexed.push(source)
    if (!edited.has(entry.id)) {
      assert.deepEqual(
        await readFile(resolve(workspace, source)),
        await readFile(resolve(workspace, 'content/artifacts', entry.id, 'index.html')),
      )
    }
  }
  assert.deepEqual(indexed.sort(), originals, 'every original HTML needs exactly one catalog entry')
})

test('HTML presentation removes unresolved citation tokens while preserving real references and interactions', async () => {
  const { prepareArtifactHtml } = await import('./build-content.mjs')
  const html =
    '<html><body><p>理解。citeturn123search0turn123search2</p><a href="https://example.com/source">来源</a><button onclick="this.textContent=\'完成\'">练习</button></body></html>'
  const prepared = prepareArtifactHtml(html)
  assert.doesNotMatch(prepared, /cite|turn123search/)
  assert.ok(prepared.includes('<p>理解。</p>'))
  assert.ok(prepared.includes('<a href="https://example.com/source">来源</a>'))
  assert.ok(prepared.includes('onclick="this.textContent='))
  assert.equal((prepared.match(/data-ink-grove-bridge/g) || []).length, 1)
})
