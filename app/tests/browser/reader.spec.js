import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'

const catalog = JSON.parse(
  await readFile(new URL('../../../content/catalog.json', import.meta.url), 'utf8'),
)

test('HTML reader keeps its sandbox and restores focus and scrolling from inside the artifact', async ({
  page,
}) => {
  await page.goto('/artifact/cognitive-awakening')
  const frame = page.frameLocator('iframe')
  await expect(page.locator('iframe')).toHaveAttribute('sandbox', 'allow-scripts')
  await expect(frame.locator('body')).toContainText('认知觉醒')
  await frame.locator('body').click({ position: { x: 200, y: 200 } })
  await page.keyboard.press('f')
  await expect(page.locator('.reader-shell')).toHaveClass(/focus-mode/)
  await expect(page.getByRole('link', { name: 'Ink Grove', exact: true })).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(page.locator('.reader-shell')).not.toHaveClass(/focus-mode/)
  const child = page.frames()[1]
  await child.evaluate(() =>
    window.scrollTo({
      top: (document.documentElement.scrollHeight - innerHeight) * 0.48,
      behavior: 'instant',
    }),
  )
  await expect
    .poll(async () =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem('ink-grove:garden:v1')).visits['cognitive-awakening']
            .progress,
      ),
    )
    .toBeGreaterThan(0.45)
  await page.reload()
  await expect
    .poll(async () =>
      page
        .frames()[1]
        ?.evaluate(() => scrollY / (document.documentElement.scrollHeight - innerHeight)),
    )
    .toBeGreaterThan(0.45)
  await page.locator('body').dispatchEvent('mousemove')
  await expect(page.getByRole('button', { name: '进入专注模式' })).toBeVisible()
})

for (const artifact of catalog.artifacts.filter((item) => item.artifact.renderer === 'html')) {
  test(`built-in HTML ${artifact.id} reads without script errors, external resources or citation placeholders`, async ({
    page,
  }) => {
    const errors = []
    const external = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('request', (request) => {
      if (/^https?:/.test(request.url()) && new URL(request.url()).host !== '127.0.0.1:5173')
        external.push(request.url())
    })
    await page.goto(`/artifact/${artifact.slug}`)
    await expect(page.locator('iframe')).toBeVisible()
    await expect(page.locator('iframe')).toHaveAttribute('sandbox', 'allow-scripts')
    await expect
      .poll(() => page.frames()[1]?.evaluate(() => document.body.textContent.length))
      .toBeGreaterThan(200)
    await expect(page.frameLocator('iframe').locator('body')).not.toContainText('cite')
    expect(errors).toEqual([])
    expect(external).toEqual([])
  })
}

test('markdown, svg and image are independently rendered', async ({ page }) => {
  await page.goto('/artifact/attention-loop')
  await expect(page.locator('.markdown-content h1')).toBeVisible()
  await expect(page.locator('iframe')).toHaveCount(0)
  for (const id of ['learning-cycle', 'knowledge-landscape']) {
    await page.goto(`/artifact/${id}`)
    await expect(page.locator('.image-artifact img')).toBeVisible()
    await expect
      .poll(() => page.locator('.image-artifact img').evaluate((img) => img.naturalWidth))
      .toBeGreaterThan(0)
  }
})

test('unreadable future-version data is preserved before a reading visit writes new state', async ({
  page,
}) => {
  await page.goto('/')
  const raw = JSON.stringify({ schemaVersion: 2, secretThought: '未来版本的想法仍应保留' })
  await page.evaluate((raw) => localStorage.setItem('ink-grove:garden:v1', raw), raw)
  await page.reload()
  await expect(page.getByRole('alert')).toContainText('原始数据已保留')
  await page.goto('/artifact/seven-habits')
  await expect(page.locator('iframe')).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('ink-grove:garden:v1:recovery')))
    .toBe(raw)
})

test('imported HTML cannot access parent storage and keeps its own working interaction', async ({
  page,
}) => {
  await page.goto('/create')
  await page.getByRole('button', { name: '带入作品', exact: true }).click()
  const html =
    '<html><body><h1>独立交互测试</h1><button onclick="document.querySelector(\'h1\').textContent=\'交互仍然有效\'">改变标题</button><script>try { parent.localStorage.setItem("sandbox-escape", "bad") } catch { document.body.dataset.isolated="yes" }</script></body></html>'
  await page
    .locator('input[type=file]')
    .setInputFiles({ name: '独立交互.html', mimeType: 'text/html', buffer: Buffer.from(html) })
  await page.getByRole('button', { name: '种进花园' }).click()
  const frame = page.frameLocator('iframe')
  await expect(frame.locator('h1')).toHaveText('独立交互测试')
  await expect(frame.locator('body')).toHaveAttribute('data-isolated', 'yes')
  await frame.getByRole('button', { name: '改变标题' }).click()
  await expect(frame.locator('h1')).toHaveText('交互仍然有效')
  expect(await page.evaluate(() => localStorage.getItem('sandbox-escape'))).toBeNull()
  await page.keyboard.press('f')
  await expect(page.locator('.reader-shell')).toHaveClass(/focus-mode/)
  await page.keyboard.press('Escape')
  await expect(page.locator('.reader-shell')).not.toHaveClass(/focus-mode/)
})

test('touch devices always have a focus exit affordance', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  })
  const page = await context.newPage()
  await page.goto('http://127.0.0.1:5173/artifact/seven-habits')
  await page.getByRole('button', { name: '进入专注模式' }).click()
  await page.getByRole('button', { name: '退出专注模式' }).click()
  await expect(page.locator('.reader-shell')).not.toHaveClass(/focus-mode/)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await context.close()
})
