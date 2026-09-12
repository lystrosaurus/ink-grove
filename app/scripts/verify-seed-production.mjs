import assert from 'node:assert/strict'
import { readFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium, expect } from '@playwright/test'

const catalog = JSON.parse(
  await readFile(new URL('../src/generated/seed-catalog.json', import.meta.url), 'utf8'),
)
const base = new URL(process.argv[2] || 'http://127.0.0.1:4173')
const index = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
const entry = index.match(/<script[^>]+src="([^"]+)"/)?.[1]
assert.ok(entry, 'production entry must exist')
const browser = await chromium.launch({ channel: 'msedge', headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const failures = []
  const external = []
  page.on('pageerror', (error) => failures.push(error.message))
  page.on('request', (request) => {
    if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== base.origin)
      external.push(request.url())
  })
  await page.goto(new URL('/seed', base).href, { waitUntil: 'domcontentloaded' })
  if ((await page.title()) === '风险提醒') {
    const visit = page.getByText('确定访问', { exact: true })
    await visit.waitFor({ timeout: 10_000 })
    await visit.click()
    await page.locator('main h1').first().waitFor()
    failures.length = 0
    external.length = 0
  }
  const visit = async (path) => {
    const response = await page.goto(new URL(path, base).href)
    assert.equal(response.status(), 200)
    await page.locator('.seed-app main h1').first().waitFor()
    assert.equal(await page.locator('script[type="module"]').getAttribute('src'), entry)
    assert.equal(await page.locator('.site-header, .main-nav').count(), 0)
  }
  for (const path of [
    '/seed',
    '/seed/think',
    '/seed/growth',
    '/seed/parent',
    ...catalog.layers.map((layer) => `/seed/layer/${layer.id}`),
  ]) {
    await visit(path)
    await page.reload()
    await page.locator('.seed-app main h1').first().waitFor()
  }
  for (const seed of catalog.seeds) {
    await visit(`/seed/play/${seed.slug}`)
    const stories = new Set()
    for (const age of ['6-8', '9-11', '12-15']) {
      await page.getByLabel('阅读年龄').selectOption(age)
      const frame = page.frameLocator('iframe')
      await expect(page.locator('iframe')).toHaveAttribute('sandbox', 'allow-scripts')
      await expect(page.locator('iframe')).toHaveAttribute('src', new RegExp(`age=${age}`))
      await expect(frame.locator('h1')).toHaveText(seed.title)
      await expect(frame.locator('#story')).not.toHaveText('')
      stories.add(await frame.locator('#story').innerText())
      assert.ok((await frame.locator('body').innerText()).length > 100, seed.id)
    }
    assert.equal(stories.size, 3, `${seed.id}: age must change the actual story`)
  }
  await page.getByLabel('阅读年龄').selectOption('9-11')
  for (const seed of catalog.seeds) {
    await visit(`/seed/play/${seed.slug}`)
    const frame = page.frameLocator('iframe')
    if (seed.id === 'emotion-weather') {
      await frame.getByRole('button', { name: '☂ 下小雨', exact: true }).click()
      await frame.locator('#next').click()
      await frame.locator('#choices button').first().click()
      await frame.locator('#next').click()
      await frame.locator('#choices button').first().click()
      await expect(frame.locator('#reflection')).toBeVisible()
    } else if (seed.id === 'attention-detective') {
      await frame.locator('#tidy').click()
      const targets = frame.locator('.sample[data-target="true"]')
      for (let i = 0; i < (await targets.count()); i += 1) await targets.nth(i).click()
      await expect(frame.locator('#reflection')).toBeVisible()
    } else if (seed.id === 'time-store') {
      await frame.getByRole('button', { name: /玩游戏/ }).click()
      await frame.locator('#checkout').click()
      await expect(frame.locator('#result')).toContainText('这次留下：玩游戏')
    } else if (seed.id === 'just-right-challenge') {
      await frame.locator('#show-hint').click()
      await frame.getByRole('button', { name: '试试 15', exact: true }).click()
      await expect(frame.locator('#result')).toContainText('这一块接上了')
    } else if (seed.id === 'break-it-down') {
      await frame.locator('#split').click()
      for (let i = 0; i < 4; i += 1) await frame.locator('.step').nth(i).click()
      await expect(frame.locator('#reflection')).toBeVisible()
    } else if (seed.id === 'mistakes-are-clues') {
      await frame.locator('#test').click()
      await expect(frame.locator('#result')).toContainText('倾倒')
      await frame.locator('#width').focus()
      await frame.locator('#width').press('End')
      await frame.locator('#test').click()
      await expect(frame.locator('#result')).toContainText('保持站立')
      await expect(frame.locator('#log li')).toHaveCount(2)
    }
  }
  for (let number = 1; number <= 8; number += 1) {
    await visit(`/seed/think/q${number}`)
    await page.getByRole('group', { name: '试一试' }).getByRole('button').first().click()
    await expect(page.getByRole('button', { name: '换一个想法试试' })).toBeVisible()
    await page.getByRole('button', { name: '带回生活里' }).click()
    await expect(page.getByLabel('我想记下')).toBeVisible()
  }
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('seed-grove:garden:v1')).events.length,
    ),
    0,
    'Exploring must not create growth claims',
  )
  await page.getByLabel('我想记下').fill('我给现在和未来，各留了一点时间。')
  await page.getByRole('button', { name: '保存这片小叶子' }).click()
  await visit('/seed/growth')
  await expect(page.getByText('我给现在和未来，各留了一点时间。')).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  for (const path of ['/seed', '/seed/think', '/seed/parent', '/seed/play/mistakes-are-clues']) {
    await visit(path)
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      `mobile overflow: ${path}`,
    )
  }
  if (process.argv.includes('--capture')) {
    const directory = new URL('../../artifacts/screenshots/', import.meta.url)
    await mkdir(directory, { recursive: true })
    await page.evaluate(() => localStorage.removeItem('seed-grove:garden:v1'))
    await visit('/seed')
    await page.screenshot({
      path: fileURLToPath(new URL('seed-home-mobile.png', directory)),
      fullPage: true,
    })
    await page.setViewportSize({ width: 1440, height: 1000 })
    for (const [path, name] of [
      ['/seed', 'seed-home-desktop'],
      ['/seed/think', 'seed-think-desktop'],
      ['/seed/play/mistakes-are-clues', 'seed-feedback-desktop'],
      ['/seed/parent', 'seed-parent-desktop'],
    ]) {
      await visit(path)
      if (path.includes('/play/')) await page.frameLocator('iframe').locator('#story').waitFor()
      await page.screenshot({
        path: fileURLToPath(new URL(`${name}.png`, directory)),
        fullPage: true,
      })
    }
  }
  assert.deepEqual(failures, [])
  assert.deepEqual(external, [])
  console.log(
    `Seed production passed at ${base.origin}: matching build, 4 regions, 6 sandboxed Seed interactions × 3 actual age stories, 8 thinking interactions, local save/reload, mobile routes, no browser errors or external requests.`,
  )
} finally {
  await browser.close()
}
