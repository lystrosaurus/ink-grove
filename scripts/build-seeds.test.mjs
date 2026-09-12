import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, writeFile, rm, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve, relative, sep } from 'node:path'
import test from 'node:test'

async function builder() {
  const module = await import('./build-seeds.mjs').catch(() => null)
  assert.ok(module, 'Seed content builder must exist')
  return module
}

async function fixture(t) {
  const workspace = await mkdtemp(resolve(tmpdir(), 'seed-content-test-'))
  t.after(async () => {
    const part = relative(resolve(tmpdir()), workspace)
    assert.ok(part.startsWith('seed-content-test-') && !part.includes(sep))
    await rm(workspace, { recursive: true, force: true })
  })
  await mkdir(resolve(workspace, 'content/seeds/small-step'), { recursive: true })
  await mkdir(resolve(workspace, 'docs/design'), { recursive: true })
  await writeFile(resolve(workspace, 'docs/design/seed.md'), '# Source design')
  const seed = {
    schemaVersion: 1, id: 'small-step', slug: 'small-step', title: '小步', subtitle: '试试看',
    layer: 4, goal: '学会学习', age: ['6-8', '9-11', '12-15'], type: 'experiment', duration: 5,
    questions: ['下一步是什么？'], skills: ['learning'], parentPrompt: '一起观察结果。',
    realLifePrompt: '今天可以先试哪一步？',
    artifact: { renderer: 'html', src: '/seeds/small-step/index.html' },
    cover: '/seeds/small-step/cover.svg', related: [],
    provenance: { generatedBy: 'ai', sources: ['file:docs/design/seed.md'], derivedFrom: [] },
  }
  const catalog = { schemaVersion: 1, seeds: [seed], layers: [{ id: 4, name: '山谷', goal: '学习', description: '一步一步试', color: '#46788a' }] }
  await writeFile(resolve(workspace, 'content/seeds/small-step/manifest.json'), JSON.stringify(seed))
  await writeFile(resolve(workspace, 'content/seeds/small-step/index.html'), '<!doctype html><html lang="zh-CN"><body><button>试试</button></body></html>')
  await writeFile(resolve(workspace, 'content/seeds/small-step/cover.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>')
  await writeFile(resolve(workspace, 'content/seed-catalog.json'), JSON.stringify({ ...catalog, seeds: [{ id: 'small-step', title: '过时缓存' }] }))
  return { workspace, root: resolve(workspace, 'content/seeds'), catalog }
}

test('Seed manifests are authoritative and the build only adds the shared reading bridge to generated HTML', async (t) => {
  const { buildSeeds } = await builder()
  const { workspace } = await fixture(t)
  const sourcePath = resolve(workspace, 'content/seeds/small-step/index.html')
  const original = await readFile(sourcePath, 'utf8')
  await mkdir(resolve(workspace, 'app/public/artifacts'), { recursive: true })
  await writeFile(resolve(workspace, 'app/public/artifacts/keep.txt'), 'adult work')
  await buildSeeds({ workspace })
  const generated = JSON.parse(await readFile(resolve(workspace, 'app/src/generated/seed-catalog.json'), 'utf8'))
  assert.equal(generated.seeds[0].title, '小步')
  assert.equal(generated.seeds[0].parentPrompt, '一起观察结果。')
  assert.equal(await readFile(sourcePath, 'utf8'), original)
  assert.match(await readFile(resolve(workspace, 'app/public/seeds/small-step/index.html'), 'utf8'), /data-ink-grove-bridge/)
  assert.equal(await readFile(resolve(workspace, 'app/public/artifacts/keep.txt'), 'utf8'), 'adult work')
})

test('Seed validation rejects invalid identities, ages, regions, prompts and dangling relationships', async (t) => {
  const { validateSeedCatalog } = await builder()
  const { root, catalog } = await fixture(t)
  await validateSeedCatalog(catalog, root)
  const cases = [
    [(c) => c.seeds.push(structuredClone(c.seeds[0])), /duplicate.*id/i],
    [(c) => delete c.seeds[0].id, /Invalid or duplicate seed id/],
    [(c) => delete c.seeds[0].slug, /Invalid or duplicate seed slug/],
    [(c) => c.seeds[0].id = 'a'.repeat(81), /Invalid or duplicate seed id/],
    [(c) => c.seeds[0].slug = 'a'.repeat(81), /Invalid or duplicate seed slug/],
    [(c) => c.seeds.push({ ...structuredClone(c.seeds[0]), id: 'another-seed' }), /duplicate.*slug/i],
    [(c) => c.seeds[0].slug = '../escape', /slug/i],
    [(c) => c.seeds[0].layer = 3, /layer/i],
    [(c) => c.seeds[0].age = ['adult'], /age/i],
    [(c) => c.seeds[0].age = ['6-8', '6-8'], /age/i],
    [(c) => c.seeds[0].parentPrompt = ' ', /parentPrompt/],
    [(c) => c.seeds[0].realLifePrompt = '', /realLifePrompt/],
    [(c) => c.seeds[0].related = ['missing'], /related/i],
    [(c) => c.seeds[0].provenance.derivedFrom = ['missing'], /derived/i],
    [(c) => c.seeds[0].provenance.sources = ['file:docs/design/missing.md'], /source/i],
    [(c) => c.seeds[0].duration = 0, /duration/i],
    [(c) => c.layers.push(structuredClone(c.layers[0])), /layer/i],
  ]
  for (const [mutate, message] of cases) {
    const changed = structuredClone(catalog)
    mutate(changed)
    await assert.rejects(validateSeedCatalog(changed, root), message)
  }
})

test('the Seed index cannot silently omit a content directory', async (t) => {
  const { buildSeeds } = await builder()
  const { workspace, root } = await fixture(t)
  await mkdir(resolve(root, 'forgotten-seed'))
  await writeFile(resolve(root, 'forgotten-seed/index.html'), '<html><body>Unindexed work</body></html>')
  await assert.rejects(buildSeeds({ workspace, checkOnly: true }), /Unindexed seed directory/)
})

test('index identities must be explicit strings before resolving a manifest path', async (t) => {
  const { buildSeeds } = await builder()
  const { workspace, catalog } = await fixture(t)
  await writeFile(resolve(workspace, 'content/seed-catalog.json'), JSON.stringify({ ...catalog, seeds: [{}] }))
  await assert.rejects(buildSeeds({ workspace, checkOnly: true }), /Invalid seed index id/)
})

test('Seed resource paths cannot traverse, use a different seed or resolve outside their directory', async (t) => {
  const { validateSeedCatalog } = await builder()
  const { workspace, root, catalog } = await fixture(t)
  for (const src of ['/seeds/small-step/../index.html', '/seeds/other/index.html', '/seeds/small-step/%2e%2e/index.html', 'https://example.com/a.html', '/seeds/small-step/index.html?x=1']) {
    const changed = structuredClone(catalog)
    changed.seeds[0].artifact.src = src
    await assert.rejects(validateSeedCatalog(changed, root), /local seed path/i)
  }
  await mkdir(resolve(workspace, 'outside'))
  await writeFile(resolve(workspace, 'outside/index.html'), 'outside')
  await symlink(resolve(workspace, 'outside'), resolve(root, 'small-step/redirect'), 'junction')
  const changed = structuredClone(catalog)
  changed.seeds[0].artifact.src = '/seeds/small-step/redirect/index.html'
  await assert.rejects(validateSeedCatalog(changed, root), /redirect|symbolic|local seed/i)
})

test('Check-only validates without changing outputs and a failed build preserves existing outputs', async (t) => {
  const { buildSeeds } = await builder()
  const { workspace } = await fixture(t)
  await mkdir(resolve(workspace, 'app/public/seeds'), { recursive: true })
  await writeFile(resolve(workspace, 'app/public/seeds/keep.txt'), 'previous content')
  await buildSeeds({ workspace, checkOnly: true })
  assert.equal(await readFile(resolve(workspace, 'app/public/seeds/keep.txt'), 'utf8'), 'previous content')
  const path = resolve(workspace, 'content/seeds/small-step/manifest.json')
  const seed = JSON.parse(await readFile(path, 'utf8'))
  seed.related = ['missing']
  await writeFile(path, JSON.stringify(seed))
  await assert.rejects(buildSeeds({ workspace }), /related/i)
  assert.equal(await readFile(resolve(workspace, 'app/public/seeds/keep.txt'), 'utf8'), 'previous content')
})

test('A redirected generated directory is refused before cleanup', async (t) => {
  const { buildSeeds } = await builder()
  const { workspace } = await fixture(t)
  const outside = resolve(workspace, 'outside')
  await mkdir(outside)
  await writeFile(resolve(outside, 'keep.txt'), 'untouched')
  await mkdir(resolve(workspace, 'app/public'), { recursive: true })
  await symlink(outside, resolve(workspace, 'app/public/seeds'), 'junction')
  await assert.rejects(buildSeeds({ workspace }), /redirect|symbolic/i)
  assert.equal(await readFile(resolve(outside, 'keep.txt'), 'utf8'), 'untouched')
})
