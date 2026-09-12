import {
  cp,
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { prepareArtifactHtml } from './build-content.mjs'

const WORKSPACE = fileURLToPath(new URL('../', import.meta.url))
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MVP_LAYERS = new Set([1, 2, 4, 5])
const validSlug = (value) => typeof value === 'string' && value.length <= 80 && SLUG.test(value)
const nonempty = (value) => typeof value === 'string' && value.trim().length > 0
const strings = (value, minimum = 0) =>
  Array.isArray(value) &&
  value.length >= minimum &&
  value.every(nonempty) &&
  new Set(value).size === value.length
function requireValue(condition, message) {
  if (!condition) throw new Error(message)
}
function contained(parent, child) {
  const part = relative(parent, child)
  return part !== '' && part !== '..' && !part.startsWith(`..${sep}`) && !isAbsolute(part)
}

// Reject junctions as well as symlinks, including every ancestor below the workspace.
async function unredirected(workspace, target, allowMissing = false) {
  const base = resolve(workspace)
  const absolute = resolve(target)
  requireValue(absolute === base || contained(base, absolute), `Path outside workspace: ${target}`)
  let current = base
  const parts = ['', ...relative(base, absolute).split(sep).filter(Boolean)]
  for (const part of parts) {
    if (part) current = resolve(current, part)
    try {
      requireValue(
        !(await lstat(current)).isSymbolicLink(),
        `Refusing redirected symbolic path: ${current}`,
      )
    } catch (error) {
      if (allowMissing && error.code === 'ENOENT') return
      throw error
    }
  }
  const [actualBase, actualTarget] = await Promise.all([realpath(base), realpath(absolute)])
  requireValue(
    actualTarget === actualBase || contained(actualBase, actualTarget),
    `Redirected path: ${target}`,
  )
}

async function localResource(url, id, seedRoot) {
  requireValue(
    typeof url === 'string' && url.startsWith(`/seeds/${id}/`) && !/[\\?#%]/.test(url),
    `Expected local seed path: ${id}: ${url}`,
  )
  const parts = url.slice('/seeds/'.length).split('/')
  requireValue(
    parts.every((part) => part && part !== '.' && part !== '..'),
    `Expected local seed path: ${id}: ${url}`,
  )
  const target = resolve(seedRoot, ...parts)
  requireValue(contained(resolve(seedRoot, id), target), `Expected local seed path: ${id}: ${url}`)
  try {
    await unredirected(dirname(dirname(seedRoot)), target)
    requireValue((await stat(target)).isFile(), `Resource must be a local seed file: ${url}`)
  } catch (error) {
    if (error.code === 'ENOENT') throw new Error(`Missing seed resource: ${url}`)
    throw error
  }
}

/** Validate complete manifests, their local resources, and their actual relationships. */
export async function validateSeedCatalog(catalog, root = resolve(WORKSPACE, 'content/seeds')) {
  const seedRoot = resolve(root)
  requireValue(catalog?.schemaVersion === 1, 'Seed catalog schemaVersion must be 1')
  requireValue(
    Array.isArray(catalog.seeds) && catalog.seeds.length > 0,
    'Seed catalog must contain seeds',
  )
  requireValue(
    Array.isArray(catalog.layers) && catalog.layers.length > 0,
    'Seed catalog must contain layers',
  )
  const layers = new Set()
  for (const layer of catalog.layers) {
    requireValue(
      MVP_LAYERS.has(layer.id) && !layers.has(layer.id),
      `Invalid or duplicate layer: ${layer.id}`,
    )
    for (const field of ['name', 'goal', 'description', 'color'])
      requireValue(nonempty(layer[field]), `Missing layer ${field}: ${layer.id}`)
    requireValue(/^#[a-f0-9]{6}$/i.test(layer.color), `Invalid layer color: ${layer.id}`)
    layers.add(layer.id)
  }
  const ids = new Set()
  const slugs = new Set()
  for (const seed of catalog.seeds) {
    requireValue(
      validSlug(seed?.id) && !ids.has(seed.id),
      `Invalid or duplicate seed id: ${seed?.id}`,
    )
    requireValue(
      validSlug(seed.slug) && !slugs.has(seed.slug),
      `Invalid or duplicate seed slug: ${seed.slug}`,
    )
    requireValue(seed.schemaVersion === 1, `Seed manifest schemaVersion must be 1: ${seed.id}`)
    requireValue(layers.has(seed.layer), `Unknown seed layer: ${seed.layer}`)
    requireValue(!Object.hasOwn(seed, 'age'), `Obsolete seed age category: ${seed.id}`)
    for (const field of ['title', 'subtitle', 'goal', 'type', 'parentPrompt', 'realLifePrompt'])
      requireValue(nonempty(seed[field]), `Missing ${field}: ${seed.id}`)
    for (const field of ['questions', 'skills'])
      requireValue(strings(seed[field], 1), `Invalid ${field}: ${seed.id}`)
    requireValue(
      Number.isInteger(seed.duration) && seed.duration > 0 && seed.duration <= 60,
      `Invalid duration: ${seed.id}`,
    )
    requireValue(strings(seed.related), `Invalid related: ${seed.id}`)
    requireValue(seed.artifact?.renderer === 'html', `Unsupported seed renderer: ${seed.id}`)
    requireValue(
      ['ai', 'human', 'hybrid'].includes(seed.provenance?.generatedBy) &&
        strings(seed.provenance.sources, 1) &&
        strings(seed.provenance.derivedFrom),
      `Invalid provenance: ${seed.id}`,
    )
    ids.add(seed.id)
    slugs.add(seed.slug)
  }
  for (const seed of catalog.seeds) {
    for (const id of seed.related)
      requireValue(
        id !== seed.id && ids.has(id),
        `Unknown or self related seed: ${seed.id} → ${id}`,
      )
    for (const id of seed.provenance.derivedFrom)
      requireValue(
        id !== seed.id && ids.has(id),
        `Unknown or self derived seed: ${seed.id} → ${id}`,
      )
    await localResource(seed.artifact.src, seed.id, seedRoot)
    await localResource(seed.cover, seed.id, seedRoot)
    requireValue(
      /\.html$/.test(seed.artifact.src) && /\.svg$/.test(seed.cover),
      `Expected HTML seed and SVG cover: ${seed.id}`,
    )
    for (const source of seed.provenance.sources) {
      requireValue(source.startsWith('file:'), `Expected actual local source: ${seed.id}`)
      const parts = source.slice(5).split('/')
      requireValue(
        parts.every((part) => part && part !== '.' && part !== '..') &&
          !/[\\?#%:]/.test(source.slice(5)),
        `Invalid source path: ${source}`,
      )
      const workspace = dirname(dirname(seedRoot))
      const target = resolve(workspace, ...parts)
      try {
        await unredirected(workspace, target)
        requireValue((await stat(target)).isFile(), `Missing source: ${source}`)
      } catch (error) {
        if (error.code === 'ENOENT') throw new Error(`Missing source: ${source}`)
        throw error
      }
    }
  }
  return catalog
}

async function checkTree(workspace, directory) {
  await unredirected(workspace, directory)
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    requireValue(!entry.isSymbolicLink(), `Refusing redirected symbolic seed resource: ${path}`)
    if (entry.isDirectory()) await checkTree(workspace, path)
    else requireValue(entry.isFile(), `Unsupported seed resource: ${path}`)
  }
}

/** workspace is injectable so validation and output safety can run against real fixture directories. */
export async function buildSeeds({ checkOnly = false, workspace = WORKSPACE } = {}) {
  workspace = resolve(workspace)
  const seedRoot = resolve(workspace, 'content/seeds')
  const catalogPath = resolve(workspace, 'content/seed-catalog.json')
  await unredirected(workspace, catalogPath)
  const index = JSON.parse(await readFile(catalogPath, 'utf8'))
  requireValue(Array.isArray(index.seeds), 'Seed catalog must contain seeds')
  const seeds = []
  for (const entry of index.seeds) {
    requireValue(validSlug(entry?.id), `Invalid seed index id: ${entry?.id}`)
    requireValue(!Object.hasOwn(entry, 'age'), `Obsolete seed index age category: ${entry.id}`)
    const manifest = resolve(seedRoot, entry.id, 'manifest.json')
    await unredirected(workspace, manifest)
    const seed = JSON.parse(await readFile(manifest, 'utf8'))
    requireValue(seed.id === entry.id, `Seed manifest id does not match directory: ${entry.id}`)
    seeds.push(seed)
  }
  const catalog = { schemaVersion: index.schemaVersion, layers: index.layers, seeds }
  await validateSeedCatalog(catalog, seedRoot)
  await unredirected(workspace, seedRoot)
  const indexedIds = new Set(seeds.map((seed) => seed.id))
  for (const entry of await readdir(seedRoot, { withFileTypes: true })) {
    requireValue(
      !entry.isSymbolicLink(),
      `Refusing redirected symbolic seed directory: ${entry.name}`,
    )
    if (entry.isDirectory())
      requireValue(indexedIds.has(entry.name), `Unindexed seed directory: ${entry.name}`)
  }
  for (const seed of seeds) await checkTree(workspace, resolve(seedRoot, seed.id))
  if (checkOnly) return catalog
  const publicRoot = resolve(workspace, 'app/public')
  const output = resolve(publicRoot, 'seeds')
  const generated = resolve(workspace, 'app/src/generated/seed-catalog.json')
  requireValue(
    contained(publicRoot, output) && relative(publicRoot, output) === 'seeds',
    'Unsafe Seed output directory',
  )
  await unredirected(workspace, output, true)
  await unredirected(workspace, generated, true)
  await mkdir(publicRoot, { recursive: true })
  await mkdir(dirname(generated), { recursive: true })
  // Recheck the exact cleanup target after preparing parent directories.
  await unredirected(workspace, output, true)
  await rm(output, { recursive: true, force: true })
  await mkdir(output)
  for (const seed of seeds) {
    await cp(resolve(seedRoot, seed.id), resolve(output, seed.id), {
      recursive: true,
      dereference: false,
    })
    const htmlPath = resolve(output, ...seed.artifact.src.slice('/seeds/'.length).split('/'))
    await writeFile(htmlPath, prepareArtifactHtml(await readFile(htmlPath, 'utf8')))
  }
  await writeFile(generated, `${JSON.stringify(catalog, null, 2)}\n`)
  return catalog
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const checkOnly = process.argv.includes('--check')
  buildSeeds({ checkOnly })
    .then((catalog) =>
      console.log(
        `${checkOnly ? 'Validated' : 'Built'} ${catalog.seeds.length} seeds in ${catalog.layers.length} regions.`,
      ),
    )
    .catch((error) => {
      console.error(error.message)
      process.exitCode = 1
    })
}
