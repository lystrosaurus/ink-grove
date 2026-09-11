import assert from 'node:assert/strict'
import { chromium } from '@playwright/test'
import { readFile } from 'node:fs/promises'

const catalog = JSON.parse(
  await readFile(new URL('../src/generated/catalog.json', import.meta.url), 'utf8'),
)

const browser = await chromium.launch({ channel: 'msedge', headless: true })
try {
  const page = await browser.newPage()
  const failures = []
  const external = []
  page.on('pageerror', (error) => failures.push(error.message))
  page.on('request', (request) => {
    if (/^https?:/.test(request.url()) && new URL(request.url()).host !== '127.0.0.1:4173') {
      external.push(request.url())
    }
  })
  for (const path of ['/', '/explore', '/journeys/personal-growth', '/create']) {
    const response = await page.goto(`http://127.0.0.1:4173${path}`)
    assert.equal(response.status(), 200)
    await page.locator('main h1').first().waitFor()
  }
  for (const artifact of catalog.artifacts.filter((item) => item.artifact.renderer === 'html')) {
    const response = await page.goto(`http://127.0.0.1:4173/artifact/${artifact.slug}`)
    assert.equal(response.status(), 200)
    await page.frameLocator('iframe').locator('body').waitFor()
    const body = await page.frameLocator('iframe').locator('body').innerText()
    assert.ok(body.length > 200, artifact.id)
    assert.doesNotMatch(body, /cite/, artifact.id)
    assert.equal(await page.locator('iframe').getAttribute('sandbox'), 'allow-scripts')
  }
  assert.deepEqual(failures, [])
  assert.deepEqual(external, [])
  console.log(
    'Production smoke passed: SPA deep links, HTML sandbox, no browser errors or external resource requests.',
  )
} finally {
  await browser.close()
}
