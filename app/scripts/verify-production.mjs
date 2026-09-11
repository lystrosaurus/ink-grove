import assert from 'node:assert/strict'
import { chromium } from '@playwright/test'
import { readFile } from 'node:fs/promises'

const catalog = JSON.parse(
  await readFile(new URL('../src/generated/catalog.json', import.meta.url), 'utf8'),
)
const base = new URL(process.argv[2] || 'http://127.0.0.1:4173')
const dist = new URL('../dist/', import.meta.url)
const index = await readFile(new URL('index.html', dist), 'utf8')
const entry = index.match(/<script[^>]+src="([^"]+)"/)?.[1]
assert.ok(entry, 'production entry must exist')

const browser = await chromium.launch({ channel: 'msedge', headless: true })
try {
  const page = await browser.newPage()
  const failures = []
  const external = []
  page.on('pageerror', (error) => failures.push(error.message))
  page.on('request', (request) => {
    if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== base.origin) {
      external.push(request.url())
    }
  })
  await page.goto(base.href, { waitUntil: 'domcontentloaded' })
  if ((await page.title()) === '风险提醒') {
    const visit = page.getByText('确定访问', { exact: true })
    await visit.waitFor({ timeout: 10_000 })
    await visit.click()
    await page.locator('main h1').first().waitFor()
    failures.length = 0
    external.length = 0
  }
  for (const path of ['/', '/explore', '/journeys/personal-growth', '/create']) {
    const response = await page.goto(new URL(path, base).href)
    assert.equal(response.status(), 200)
    await page.locator('main h1').first().waitFor()
    assert.equal(await page.locator('script[type="module"]').getAttribute('src'), entry)
  }
  for (const artifact of catalog.artifacts.filter((item) => item.artifact.renderer === 'html')) {
    const response = await page.goto(new URL(`/artifact/${artifact.slug}`, base).href)
    assert.equal(response.status(), 200)
    await page.frameLocator('iframe').locator('body').waitFor()
    const body = await page.frameLocator('iframe').locator('body').innerText()
    assert.ok(body.length > 200, artifact.id)
    assert.doesNotMatch(body, /cite/, artifact.id)
    assert.equal(await page.locator('iframe').getAttribute('sandbox'), 'allow-scripts')
    const source = await readFile(new URL(artifact.artifact.src.slice(1), dist), 'utf8')
    const expectedTitle = await page.evaluate(
      (html) => new DOMParser().parseFromString(html, 'text/html').title,
      source,
    )
    assert.equal(await page.frames()[1].title(), expectedTitle, artifact.id)
  }
  await page.goto(new URL('/artifact/clear-thinking-lab', base).href)
  const lab = page.frameLocator('iframe')
  await lab.getByRole('button', { name: '填入一个读书会示例', exact: true }).click()
  await lab.getByRole('button', { name: '生成我的行动卡', exact: true }).click()
  assert.ok((await lab.getByLabel('可选择复制的行动卡').inputValue()).length > 100)
  assert.deepEqual(failures, [])
  assert.deepEqual(external, [])
  console.log(
    `Production smoke passed at ${base.origin}: matching build entry, SPA deep links, ${catalog.artifacts.filter((item) => item.artifact.renderer === 'html').length} HTML titles and sandboxes, interactive lab, no browser errors or external resource requests.`,
  )
} finally {
  await browser.close()
}
