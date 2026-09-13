import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
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

test('editorial revisions preserve every user original against the pre-edit release hashes', async () => {
  const integrity = JSON.parse(
    await readFile(resolve(workspace, 'content/source-integrity.json'), 'utf8'),
  )
  const previous = JSON.parse(
    await readFile(resolve(workspace, 'artifacts/verification-1.3.json'), 'utf8'),
  )
  assert.deepEqual(
    integrity.files,
    previous.protectedFiles,
    'baseline hashes must not follow edited files',
  )
  for (const file of integrity.files) {
    const bytes = await readFile(resolve(workspace, file.path))
    assert.equal(
      createHash('sha256').update(bytes).digest('hex').toUpperCase(),
      file.sha256,
      file.path,
    )
  }
})

async function editorialRecords() {
  const files = (await readdir(resolve(workspace, 'content/reviews'))).filter((name) =>
    name.endsWith('.json'),
  )
  return (
    await Promise.all(
      files.map(async (name) =>
        JSON.parse(await readFile(resolve(workspace, 'content/reviews', name), 'utf8')),
      ),
    )
  ).flat()
}

test('every HTML material is indexed with a portable source path and preserved unless an edit is recorded', async () => {
  const catalog = JSON.parse(await readFile(resolve(workspace, 'content/catalog.json'), 'utf8'))
  const originals = (await readdir(resolve(workspace, 'materials')))
    .filter((name) => name.endsWith('.html'))
    .map((name) => `materials/${name}`)
    .sort()
  const indexed = []
  const records = await editorialRecords()
  const editorial = await readFile(resolve(workspace, 'content/EDITORIAL.md'), 'utf8')
  for (const entry of catalog.artifacts) {
    const manifest = JSON.parse(
      await readFile(resolve(workspace, 'content/artifacts', entry.id, 'manifest.json'), 'utf8'),
    )
    if (manifest.artifact.renderer !== 'html') continue
    const source = manifest.provenance.sources.find((item) => item.startsWith('file:'))?.slice(5)
    if (!source) {
      assert.equal(
        manifest.provenance.generatedBy,
        'ai',
        `${entry.id} needs an original or explicit AI provenance`,
      )
      if (manifest.artifactType === 'book') {
        const sources = manifest.provenance.sources.filter((source) => /^https:\/\//.test(source))
        assert.ok(
          new Set(sources).size >= 2,
          `${entry.id} needs public research sources for its book interpretation`,
        )
      } else {
        assert.ok(
          manifest.provenance.derivedFrom.length >= 2,
          `${entry.id} needs actual synthesis sources`,
        )
        for (const id of manifest.provenance.derivedFrom) {
          assert.ok(catalog.artifacts.some((artifact) => artifact.id === id))
          assert.ok(manifest.provenance.sources.includes(`artifact:${id}`))
        }
      }
      continue
    }
    assert.match(source, /^materials\/[^/]+\.html$/, `${entry.id} needs a portable material path`)
    indexed.push(source)
    const [original, copy] = await Promise.all([
      readFile(resolve(workspace, source)),
      readFile(resolve(workspace, 'content/artifacts', entry.id, 'index.html')),
    ])
    if (!original.equals(copy)) {
      const record = records.find((item) => item.id === entry.id)
      assert.equal(record?.kind, 'revised', `${entry.id} needs an explicit revision record`)
      assert.ok(record.changes.length >= 2, `${entry.id} needs concrete editorial reasons`)
      assert.equal(
        manifest.provenance.generatedBy,
        'hybrid',
        `${entry.id} must retain human and AI participation`,
      )
      assert.ok(
        editorial.includes(`content/artifacts/${entry.id}/index.html`),
        `${entry.id} needs a documented editorial change`,
      )
    }
  }
  assert.deepEqual(indexed.sort(), originals, 'every material HTML needs exactly one catalog entry')
})

test('the editorial inventory accounts for each published work and every work has a reading route', async () => {
  const catalog = JSON.parse(await readFile(resolve(workspace, 'content/catalog.json'), 'utf8'))
  const seedCatalog = JSON.parse(
    await readFile(resolve(workspace, 'content/seed-catalog.json'), 'utf8'),
  )
  const records = await editorialRecords()
  assert.equal(
    new Set(records.map((item) => item.id)).size,
    records.length,
    'each work has one editorial record',
  )
  for (const item of [...catalog.artifacts, ...seedCatalog.seeds]) {
    assert.ok(
      records.some((record) => record.id === item.id && record.summary && record.changes.length),
      `${item.id} needs its actual editorial review`,
    )
  }
  for (const item of catalog.artifacts) {
    assert.ok(
      catalog.collections.some((collection) => collection.artifactIds.includes(item.id)),
      `${item.id} is missing from the reading routes`,
    )
  }
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
