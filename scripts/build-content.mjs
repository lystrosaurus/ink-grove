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

const WORKSPACE = fileURLToPath(new URL('../', import.meta.url))
const RENDERERS = new Set(['html', 'markdown', 'svg', 'image'])
const TYPES = new Set(['book', 'idea', 'person', 'history', 'system', 'synthesis'])
const CONNECTIONS = new Set([
  'related',
  'extends',
  'contrasts',
  'supports',
  'applies',
  'derived-from',
  'synthesizes',
  'inspired-by',
])
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function requireValue(condition, message) {
  if (!condition) throw new Error(message)
}

function containedPath(parent, child) {
  const part = relative(parent, child)
  return part !== '' && part !== '..' && !part.startsWith(`..${sep}`) && !isAbsolute(part)
}

async function checkLocalResource(url, id, artifactRoot) {
  requireValue(
    typeof url === 'string' && url.startsWith(`/artifacts/${id}/`) && !/[\\?#%]/.test(url),
    `Expected local artifact path for ${id}: ${url}`,
  )
  const parts = url.slice('/artifacts/'.length).split('/')
  requireValue(
    parts.every((part) => part !== '' && part !== '.' && part !== '..'),
    `Expected local artifact path for ${id}: ${url}`,
  )
  const local = resolve(artifactRoot, ...parts)
  requireValue(
    containedPath(resolve(artifactRoot, id), local),
    `Expected local artifact path for ${id}: ${url}`,
  )
  try {
    const [info, canonicalRoot, canonicalFile] = await Promise.all([
      stat(local),
      realpath(artifactRoot),
      realpath(local),
    ])
    requireValue(
      info.isFile() && containedPath(canonicalRoot, canonicalFile),
      `Resource must be a local file: ${url}`,
    )
  } catch (error) {
    if (error.code === 'ENOENT') throw new Error(`Missing resource: ${url}`)
    throw error
  }
}

/** Validate the public content contract and every referenced local resource. */
export async function validateCatalog(
  catalog,
  artifactRoot = resolve(WORKSPACE, 'content/artifacts'),
) {
  requireValue(catalog?.schemaVersion === 1, 'Catalog schemaVersion must be 1')
  requireValue(
    Array.isArray(catalog.artifacts) && catalog.artifacts.length > 0,
    'Catalog must contain artifacts',
  )
  requireValue(
    Array.isArray(catalog.collections) && Array.isArray(catalog.concepts),
    'Catalog collections and concepts must be arrays',
  )
  const ids = new Set()
  const slugs = new Set()
  const conceptIds = new Set()
  const conceptNames = new Set()
  for (const concept of catalog.concepts) {
    requireValue(
      SLUG.test(concept.id) && !conceptIds.has(concept.id),
      `Invalid or duplicate concept id: ${concept.id}`,
    )
    requireValue(
      typeof concept.name === 'string' &&
        concept.name.trim() &&
        typeof concept.description === 'string' &&
        Array.isArray(concept.related),
      `Incomplete concept: ${concept.id}`,
    )
    conceptIds.add(concept.id)
    conceptNames.add(concept.name)
  }
  for (const artifact of catalog.artifacts) {
    requireValue(SLUG.test(artifact.id), `Invalid artifact id: ${artifact.id}`)
    requireValue(!ids.has(artifact.id), `Duplicate artifact id: ${artifact.id}`)
    requireValue(
      SLUG.test(artifact.slug) && !slugs.has(artifact.slug),
      `Invalid or duplicate slug: ${artifact.slug}`,
    )
    requireValue(artifact.schemaVersion === 1, `Manifest schemaVersion must be 1: ${artifact.id}`)
    requireValue(
      TYPES.has(artifact.artifactType),
      `Unsupported artifact type: ${artifact.artifactType}`,
    )
    requireValue(
      RENDERERS.has(artifact.artifact?.renderer),
      `Unsupported renderer: ${artifact.artifact?.renderer}`,
    )
    for (const field of ['title', 'subtitle', 'sourceType', 'author', 'visualStyle', 'createdAt']) {
      requireValue(
        typeof artifact[field] === 'string' && artifact[field].trim(),
        `Missing ${field}: ${artifact.id}`,
      )
    }
    requireValue(
      /^\d{4}-\d{2}-\d{2}$/.test(artifact.createdAt) &&
        Number.isFinite(Date.parse(artifact.createdAt)),
      `Invalid createdAt: ${artifact.id}`,
    )
    requireValue(typeof artifact.featured === 'boolean', `featured must be boolean: ${artifact.id}`)
    for (const field of ['topics', 'concepts', 'related']) {
      requireValue(
        Array.isArray(artifact[field]) &&
          artifact[field].every((value) => typeof value === 'string' && value.trim()),
        `Invalid ${field}: ${artifact.id}`,
      )
    }
    requireValue(Array.isArray(artifact.connections), `Invalid connections: ${artifact.id}`)
    requireValue(
      ['human', 'ai', 'hybrid'].includes(artifact.provenance?.generatedBy) &&
        Array.isArray(artifact.provenance.sources) &&
        Array.isArray(artifact.provenance.derivedFrom),
      `Invalid provenance: ${artifact.id}`,
    )
    ids.add(artifact.id)
    slugs.add(artifact.slug)
  }
  for (const artifact of catalog.artifacts) {
    for (const id of artifact.related)
      requireValue(ids.has(id), `Unknown related artifact: ${artifact.id} → ${id}`)
    for (const id of artifact.provenance.derivedFrom)
      requireValue(ids.has(id), `Unknown derived artifact: ${artifact.id} → ${id}`)
    for (const name of artifact.concepts)
      requireValue(conceptNames.has(name), `Unknown concept name: ${artifact.id} → ${name}`)
    for (const connection of artifact.connections) {
      requireValue(
        ids.has(connection.target),
        `Unknown connection target: ${artifact.id} → ${connection.target}`,
      )
      requireValue(
        CONNECTIONS.has(connection.type),
        `Unsupported connection type: ${connection.type}`,
      )
      requireValue(
        conceptIds.has(connection.concept),
        `Unknown connection concept: ${connection.concept}`,
      )
      requireValue(
        typeof connection.label === 'string' && connection.label.trim(),
        `Missing connection label: ${artifact.id}`,
      )
    }
    await checkLocalResource(artifact.artifact.src, artifact.id, artifactRoot)
    await checkLocalResource(artifact.cover, artifact.id, artifactRoot)
  }
  const collectionIds = new Set()
  for (const collection of catalog.collections) {
    requireValue(
      SLUG.test(collection.id) && !collectionIds.has(collection.id),
      `Invalid or duplicate collection id: ${collection.id}`,
    )
    collectionIds.add(collection.id)
    for (const field of ['title', 'subtitle', 'description', 'color'])
      requireValue(
        typeof collection[field] === 'string' && collection[field].trim(),
        `Missing collection ${field}: ${collection.id}`,
      )
    requireValue(
      Array.isArray(collection.artifactIds),
      `Invalid collection artifacts: ${collection.id}`,
    )
    for (const id of collection.artifactIds)
      requireValue(ids.has(id), `Unknown collection artifact: ${collection.id} → ${id}`)
  }
  for (const concept of catalog.concepts) {
    for (const id of concept.related)
      requireValue(conceptIds.has(id), `Unknown related concept: ${concept.id} → ${id}`)
  }
  return catalog
}

// Runs inside an opaque-origin sandbox. Parent window identity is checked on every message.
export const HTML_BRIDGE = `<script data-ink-grove-bridge>
(() => {
  if (window.parent === window) return;
  let parentOrigin = '*';
  try { parentOrigin = new URL(document.referrer).origin; } catch {}
  const send = data => window.parent.postMessage(data, parentOrigin);
  const maxScroll = () => Math.max(0, Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0) - window.innerHeight);
  let queued = false;
  let restored = false;
  let lastPointer = 0;
  const report = () => {
    queued = false;
    const max = maxScroll();
    send({ type: 'ink-grove:progress', progress: max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0 });
  };
  window.addEventListener('scroll', () => { if (restored && !queued) { queued = true; requestAnimationFrame(report); } }, { passive: true });
  window.addEventListener('mousemove', () => {
    const now = Date.now();
    if (now - lastPointer >= 500) { lastPointer = now; send({ type: 'ink-grove:pointer' }); }
  }, { passive: true });
  window.addEventListener('keydown', event => {
    const target = event.target;
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)))) return;
    if (event.key === 'f' || event.key === 'F' || event.key === 'Escape') {
      event.preventDefault();
      send({ type: 'ink-grove:keydown', key: event.key });
    }
  });
  window.addEventListener('message', event => {
    if (event.source !== window.parent || (parentOrigin !== '*' && event.origin !== parentOrigin)) return;
    const data = event.data;
    if (!data || data.type !== 'ink-grove:restore' || typeof data.progress !== 'number' || !Number.isFinite(data.progress)) return;
    const progress = Math.max(0, Math.min(1, data.progress));
    requestAnimationFrame(() => {
      window.scrollTo({ top: maxScroll() * progress, behavior: 'instant' });
      restored = true;
    });
  });
  if (document.readyState === 'complete') send({ type: 'ink-grove:ready' });
  else window.addEventListener('load', () => send({ type: 'ink-grove:ready' }), { once: true });
})();
</script>`

export function prepareArtifactHtml(source) {
  // Exported conversation citation IDs are not resolvable references in an independent HTML work.
  const html = source.replace(/cite[^]*/g, '')
  return /<\/body\s*>/i.test(html)
    ? html.replace(/<\/body\s*>/i, `${HTML_BRIDGE}\n</body>`)
    : `${html}\n${HTML_BRIDGE}`
}

async function checkSourceTree(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    requireValue(
      !entry.isSymbolicLink(),
      `Symlinks are not allowed in artifact content: ${entry.name}`,
    )
    if (entry.isDirectory()) await checkSourceTree(resolve(directory, entry.name))
  }
}

export async function buildContent({ checkOnly = false } = {}) {
  const artifactRoot = resolve(WORKSPACE, 'content/artifacts')
  const catalog = JSON.parse(await readFile(resolve(WORKSPACE, 'content/catalog.json'), 'utf8'))
  const manifests = []
  for (const entry of await readdir(artifactRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue
    const manifest = JSON.parse(
      await readFile(resolve(artifactRoot, entry.name, 'manifest.json'), 'utf8'),
    )
    requireValue(manifest.id === entry.name, `Manifest id must match its directory: ${entry.name}`)
    manifests.push(manifest)
  }
  const order = new Map(catalog.artifacts.map((artifact, index) => [artifact.id, index]))
  manifests.sort(
    (a, b) =>
      (order.get(a.id) ?? Infinity) - (order.get(b.id) ?? Infinity) || a.id.localeCompare(b.id),
  )
  requireValue(
    manifests.length === catalog.artifacts.length &&
      manifests.every((manifest) => order.has(manifest.id)),
    'Catalog artifact index does not match manifest directories',
  )
  const canonical = { ...catalog, artifacts: manifests }
  await validateCatalog(canonical, artifactRoot)
  for (const manifest of manifests) await checkSourceTree(resolve(artifactRoot, manifest.id))
  if (!checkOnly) {
    const output = resolve(WORKSPACE, 'app/public/artifacts')
    const expectedOutput = resolve(WORKSPACE, 'app', 'public', 'artifacts')
    requireValue(
      output === expectedOutput && containedPath(resolve(WORKSPACE), output),
      'Refusing to clear a path outside app/public/artifacts',
    )
    await mkdir(dirname(output), { recursive: true })
    const [canonicalWorkspace, canonicalParent] = await Promise.all([
      realpath(WORKSPACE),
      realpath(dirname(output)),
    ])
    requireValue(
      canonicalParent === resolve(canonicalWorkspace, 'app/public'),
      'Refusing to clear artifacts through a redirected app/public directory',
    )
    const outputInfo = await lstat(output).catch((error) => {
      if (error.code === 'ENOENT') return null
      throw error
    })
    requireValue(!outputInfo?.isSymbolicLink(), 'Refusing to clear an artifact output symlink')
    await rm(output, { recursive: true, force: true })
    await mkdir(output, { recursive: true })
    for (const manifest of manifests) {
      const destination = resolve(output, manifest.id)
      await cp(resolve(artifactRoot, manifest.id), destination, { recursive: true })
      if (manifest.artifact.renderer === 'html') {
        const htmlPath = resolve(output, manifest.artifact.src.slice('/artifacts/'.length))
        const html = await readFile(htmlPath, 'utf8')
        await writeFile(htmlPath, prepareArtifactHtml(html))
      }
    }
    const generated = resolve(WORKSPACE, 'app/src/generated/catalog.json')
    await mkdir(dirname(generated), { recursive: true })
    await writeFile(generated, `${JSON.stringify(canonical, null, 2)}\n`)
    await writeFile(
      resolve(dirname(generated), 'bridge.js'),
      `// Generated by scripts/build-content.mjs.\nexport default ${JSON.stringify(HTML_BRIDGE)};\n`,
    )
  }
  console.log(
    `${checkOnly ? 'Validated' : 'Built'} ${manifests.length} artifacts, ${canonical.collections.length} collections, ${canonical.concepts.length} concepts.`,
  )
  return canonical
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2)
  if (args.some((argument) => argument !== '--check')) {
    console.error('Usage: node scripts/build-content.mjs [--check]')
    process.exitCode = 1
  } else {
    buildContent({ checkOnly: args.includes('--check') }).catch((error) => {
      console.error(`Content build failed: ${error.message}`)
      process.exitCode = 1
    })
  }
}
