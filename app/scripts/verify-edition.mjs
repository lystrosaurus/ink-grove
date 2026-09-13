import assert from 'node:assert/strict'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium, expect } from '@playwright/test'

const base = new URL(process.argv[2] || 'http://127.0.0.1:4173')
const capture = process.argv.includes('--capture')
const groups = ['cognition', 'systems', 'life']
const cases = (
  await Promise.all(
    groups.map(async (group) =>
      JSON.parse(
        await readFile(
          new URL(`../../docs/research/edition-${group}-smoke.json`, import.meta.url),
          'utf8',
        ),
      ),
    ),
  )
).flat()
cases.push(
  {
    id: 'methods-with-boundaries',
    steps: [{ selector: '[data-situation="ruin"]', action: 'click' }],
    resultSelector: '#method-result',
    expectedText: '先限制损失',
  },
  {
    id: 'a-life-that-fits',
    steps: [
      { selector: '[data-promise="practice"]', action: 'click' },
      { selector: '[data-promise="project"]', action: 'click' },
    ],
    resultSelector: '#time-result',
    expectedText: '超出 10 分钟',
  },
  {
    id: 'shared-ground',
    steps: [{ selector: '[data-rule="rotation"]', action: 'click' }],
    resultSelector: '#rule-result',
    expectedText: '例外申请',
  },
)
assert.equal(cases.length, 26)
assert.equal(new Set(cases.map((item) => item.id)).size, 26)
const index = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
const entry = index.match(/<script[^>]+src="([^"]+)"/)?.[1]
assert.ok(entry)
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const results = []
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = [],
    external = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('request', (request) => {
    if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== base.origin)
      external.push(request.url())
  })
  await page.goto(base.href, { waitUntil: 'domcontentloaded' })
  if ((await page.title()) === '风险提醒') {
    await page.getByText('确定访问', { exact: true }).waitFor({ timeout: 15000 })
    await page.getByText('确定访问', { exact: true }).click()
    await page.locator('main h1').first().waitFor()
    errors.length = 0
    external.length = 0
  }
  await expect(page.locator('script[type="module"]')).toHaveAttribute('src', entry)
  await expect(page.locator('.reading-edition-essays .artifact-card')).toHaveCount(3)
  await expect(page.locator('.reading-edition-path')).toHaveCount(6)
  await page.getByRole('button', { name: '切换主题，当前浅色', exact: true }).click()
  await expect
    .poll(() =>
      page.locator('html').evaluate((element) => getComputedStyle(element).backgroundColor),
    )
    .toBe('rgb(24, 30, 25)')
  await expect
    .poll(() =>
      page
        .locator('.reading-edition-path')
        .first()
        .evaluate((element) => getComputedStyle(element).backgroundColor),
    )
    .toBe('rgb(24, 30, 25)')
  await page.getByRole('button', { name: '切换主题，当前深色', exact: true }).click()
  if (capture) {
    const directory = new URL('../../artifacts/screenshots/', import.meta.url)
    await mkdir(directory, { recursive: true })
    await page.evaluate(() => document.fonts.ready)
    await page.locator('img').evaluateAll(async (images) => {
      for (const picture of images) picture.loading = 'eager'
      await Promise.all(images.map((picture) => picture.decode()))
    })
    await page.evaluate(() => {
      document.activeElement?.blur()
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    })
    await page.screenshot({
      path: fileURLToPath(new URL('home-edition-desktop.png', directory)),
      fullPage: true,
    })
  }
  await page.locator('.reading-edition-path[href="/collections/learning-laboratory"]').click()
  await expect(page.locator('.artifact-card h3').filter({ hasText: '认知天性' })).toBeVisible()
  for (const item of cases) {
    await page.goto(new URL(`/artifact/${item.id}`, base).href, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('iframe')).toHaveAttribute('sandbox', 'allow-scripts')
    const work = page.frameLocator('iframe')
    await expect(work.locator('body')).not.toBeEmpty()
    // The shell's DOMContentLoaded does not wait for its lazily mounted iframe.
    // Streamed markup can expose controls before the work's final script binds them.
    await expect
      .poll(() => work.locator('html').evaluate((html) => html.ownerDocument.readyState), {
        timeout: 15000,
      })
      .toBe('complete')
    for (const step of item.steps) {
      const target = work.locator(step.selector)
      if (step.action === 'click') await target.click()
      else if (step.action === 'fill') await target.fill(step.value)
      else if (step.action === 'select') await target.selectOption(step.value)
      else if (step.action === 'press') await target.press(step.value)
      else throw new Error(`Unsupported smoke action: ${step.action}`)
    }
    await expect(work.locator(item.resultSelector)).toContainText(item.expectedText)
    await page.setViewportSize({ width: 390, height: 844 })
    assert.ok(
      await work.locator('html').evaluate((html) => html.scrollWidth <= window.innerWidth + 1),
      `${item.id}: mobile overflow`,
    )
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      `${item.id}: shell overflow`,
    )
    if (
      capture &&
      ['methods-with-boundaries', 'a-life-that-fits', 'shared-ground'].includes(item.id)
    ) {
      const url = new URL(`../../artifacts/screenshots/${item.id}-mobile.png`, import.meta.url)
      await work
        .locator('html')
        .evaluate((html) =>
          html.ownerDocument.defaultView.scrollTo({ top: 0, left: 0, behavior: 'instant' }),
        )
      await page.screenshot({ path: fileURLToPath(url) })
    }
    await page.setViewportSize({ width: 1440, height: 1000 })
    results.push({ id: item.id, interaction: true, mobile390: true })
    console.log(`Verified ${item.id}`)
  }
  const diagrams = ['learning-cycle', 'knowledge-landscape']
  await page.setViewportSize({ width: 320, height: 844 })
  for (const id of diagrams) {
    await page.goto(new URL(`/artifact/${id}`, base).href)
    const picture = page.locator('.image-artifact img')
    await expect.poll(() => picture.evaluate((img) => img.naturalWidth)).toBeGreaterThan(0)
    const fitted = await picture.evaluate((img) => img.getBoundingClientRect().width)
    for (let step = 0; step < 3; step++)
      await page.getByRole('button', { name: '放大图片', exact: true }).click()
    assert.ok(
      await picture.evaluate(
        (img, width) => img.getBoundingClientRect().width >= width * 3.9,
        fitted,
      ),
    )
    const region = page.getByRole('region', { name: '图片阅读区域', exact: true })
    await region.focus()
    await page.keyboard.press('ArrowRight')
    await expect.poll(() => region.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0)
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await page.getByRole('button', { name: '还原图片大小', exact: true }).click()
    await expect(page.getByRole('button', { name: '缩小图片', exact: true })).toBeDisabled()
  }
  assert.deepEqual(errors, [], 'no application or artifact errors')
  assert.deepEqual(external, [], 'no automatic external requests')
  const report = {
    base: base.href,
    checkedAt: new Date().toISOString(),
    entry,
    homeEssays: 3,
    problemRoutes: 6,
    darkPalette: true,
    diagrams: diagrams.map((id) => ({ id, zoom400: true, keyboardPan: true, mobile320: true })),
    works: results,
    errors,
    external,
  }
  const destination = process.env.INK_EDITION_REPORT
  if (destination) await writeFile(destination, JSON.stringify(report, null, 2) + '\n')
  console.log(
    JSON.stringify({
      base: base.href,
      interactions: results.length,
      mobileChecks: results.length,
      errors: errors.length,
      externalRequests: external.length,
    }),
  )
} finally {
  await browser.close()
}
