import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const output = fileURLToPath(new URL('../../artifacts/screenshots/', import.meta.url))
const base = new URL(process.argv[2] || 'http://127.0.0.1:5173')
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true })
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  })
  for (const [route, name] of [
    ['/', 'home-desktop'],
    ['/explore', 'explore-desktop'],
    ['/connections', 'connections-desktop'],
    ['/journeys/personal-growth', 'journey-desktop'],
    ['/create?mode=synthesis&from=cognitive-awakening,deliberate-practice', 'create-desktop'],
  ]) {
    await page.goto(new URL(route, base).href)
    await page.locator('main h1').first().waitFor()
    await page.evaluate(() => document.fonts.ready)
    await page.locator('img').evaluateAll(async (images) => {
      for (const image of images) image.loading = 'eager'
      await Promise.all(images.map((image) => image.decode()))
    })
    await page.screenshot({ path: `${output}${name}.png`, fullPage: true, animations: 'disabled' })
  }
  await page.goto(base.href)
  await page.getByRole('button', { name: '切换主题，当前浅色' }).click()
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: `${output}home-dark.png`, fullPage: true, animations: 'disabled' })
  await page.getByRole('button', { name: '切换主题，当前深色' }).click()
  await page.getByRole('button', { name: '切换主题，当前跟随系统' }).click()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({
    path: `${output}home-mobile.png`,
    fullPage: true,
    animations: 'disabled',
  })
  console.log(`Saved 7 screenshots to ${output}`)
} finally {
  await browser.close()
}
