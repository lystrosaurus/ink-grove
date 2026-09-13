import { test, expect } from '@playwright/test'

const imageWidth = (page) =>
  page.locator('.image-artifact img').evaluate((image) => image.getBoundingClientRect().width)

for (const width of [320, 390]) {
  test(`SVG diagrams can reach readable scale and scroll within a ${width}px reader`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/artifact/learning-cycle')
    const image = page.locator('.image-artifact img')
    await expect(image).toBeVisible()
    const fittedWidth = await imageWidth(page)
    expect(fittedWidth).toBeLessThanOrEqual(width)

    const enlarge = page.getByRole('button', { name: '放大图片', exact: true })
    await expect(enlarge).toBeVisible()
    for (let step = 0; step < 3; step++) {
      await enlarge.focus()
      await page.keyboard.press('Enter')
    }
    await expect(enlarge).toBeDisabled()
    await expect.poll(() => imageWidth(page)).toBeGreaterThan(fittedWidth * 3.9)
    expect(await imageWidth(page)).toBeLessThanOrEqual(fittedWidth * 4.1)

    const viewport = page.getByRole('region', { name: '图片阅读区域', exact: true })
    await viewport.focus()
    await page.keyboard.press('ArrowRight')
    await expect.poll(() => viewport.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0)
    await page.keyboard.press('PageDown')
    await expect.poll(() => viewport.evaluate((node) => node.scrollTop)).toBeGreaterThan(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)

    await page.getByRole('button', { name: '缩小图片', exact: true }).click()
    await expect.poll(() => imageWidth(page)).toBeLessThan(fittedWidth * 3.1)
    await page.getByRole('button', { name: '还原图片大小', exact: true }).focus()
    await page.keyboard.press('Space')
    await expect.poll(() => imageWidth(page)).toBeLessThanOrEqual(fittedWidth + 1)
    await expect(page.getByRole('button', { name: '缩小图片', exact: true })).toBeDisabled()
    await expect.poll(() => viewport.evaluate((node) => node.scrollLeft)).toBe(0)
    await expect.poll(() => viewport.evaluate((node) => node.scrollTop)).toBe(0)
  })
}

test('image zoom survives focus mode and resets when another work opens', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/artifact/learning-cycle')
  await page.getByRole('button', { name: '放大图片', exact: true }).click()
  const enlargedWidth = await imageWidth(page)
  await page.keyboard.press('f')
  await expect(page.locator('.reader-shell')).toHaveClass(/focus-mode/)
  expect(await imageWidth(page)).toBeGreaterThanOrEqual(enlargedWidth)
  await page.keyboard.press('Escape')
  await expect(page.locator('.reader-shell')).not.toHaveClass(/focus-mode/)

  await page.evaluate(() => {
    history.pushState({}, '', '/artifact/knowledge-landscape')
    dispatchEvent(new PopStateEvent('popstate'))
  })
  await expect(page.locator('.image-artifact img')).toHaveAttribute('src', /knowledge-landscape/)
  await expect(page.getByRole('button', { name: '缩小图片', exact: true })).toBeDisabled()
  expect(await imageWidth(page)).toBeLessThanOrEqual(390)
  await expect
    .poll(() => page.locator('.image-artifact').evaluate((node) => node.scrollLeft))
    .toBe(0)
})

test('zoom keeps SVG in an image context without executing its script or external resource', async ({
  page,
}) => {
  const probes = []
  page.on('request', (request) => {
    if (request.url().includes('__image-probe')) probes.push(request.url())
  })
  await page.route('**/__image-probe**', (route) => route.abort())
  await page.route('**/artifacts/learning-cycle/index.svg', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200"><rect width="1200" height="1200" fill="#edf1e7"/><text x="40" y="80" font-size="30">安全图片示例</text><script>window.__imageScriptExecuted=true;fetch('/__image-probe-script')</script><image href="https://example.com/__image-probe-resource" width="50" height="50"/></svg>`,
    }),
  )
  await page.goto('/artifact/learning-cycle')
  await expect
    .poll(() => page.locator('.image-artifact img').evaluate((image) => image.naturalWidth))
    .toBe(1200)
  await page.getByRole('button', { name: '放大图片', exact: true }).click()
  await expect(page.locator('.image-artifact img')).toHaveCount(1)
  await expect(
    page.locator('.image-artifact svg, .image-artifact iframe, object, embed'),
  ).toHaveCount(0)
  expect(await page.evaluate(() => window.__imageScriptExecuted)).toBeUndefined()
  expect(probes).toEqual([])
})

test('raster image import keeps its zoom controls inside the preview and reader', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/create')
  await page.getByRole('button', { name: '带入作品', exact: true }).click()
  await page.locator('input[type=file]').setInputFiles({
    name: '图片阅读示例.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jitcAAAAASUVORK5CYII=',
      'base64',
    ),
  })
  await page.getByRole('button', { name: '预览', exact: true }).click()
  const preview = page.locator('.editor-preview')
  await preview.getByRole('button', { name: '放大图片', exact: true }).click()
  expect(
    await preview.evaluate((node) => {
      const bounds = node.getBoundingClientRect()
      const reader = node.querySelector('.image-reader').getBoundingClientRect()
      return reader.bottom <= bounds.bottom + 1 && reader.width <= bounds.width
    }),
  ).toBe(true)
  await page.getByRole('button', { name: '种进花园', exact: true }).click()
  await expect(page.locator('.image-artifact img')).toBeVisible()
  await expect(page.getByRole('button', { name: '缩小图片', exact: true })).toBeDisabled()
  const fittedWidth = await imageWidth(page)
  await page.getByRole('button', { name: '放大图片', exact: true }).click()
  await expect.poll(() => imageWidth(page)).toBeGreaterThan(fittedWidth * 1.9)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('a tall image still records and restores progress on its actual scroll area', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.route('**/artifacts/learning-cycle/index.svg', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="4000"><rect width="400" height="4000" fill="#edf1e7"/></svg>',
    }),
  )
  await page.goto('/artifact/learning-cycle')
  const viewport = page.getByRole('region', { name: '图片阅读区域', exact: true })
  await expect
    .poll(() => page.locator('.image-artifact img').evaluate((image) => image.naturalHeight))
    .toBe(4000)
  await viewport.evaluate((node) => {
    node.scrollTop = (node.scrollHeight - node.clientHeight) / 2
  })
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem('ink-grove:garden:v1')).visits['learning-cycle'].progress,
      ),
    )
    .toBeGreaterThan(0.49)
  await page.reload()
  await expect
    .poll(() =>
      viewport.evaluate((node) => node.scrollTop / (node.scrollHeight - node.clientHeight)),
    )
    .toBeGreaterThan(0.49)
})

test('replacing an SVG draft resets zoom even while the same preview stays open', async ({
  page,
}) => {
  await page.goto('/create?mode=import')
  const file = page.locator('input[type=file]')
  await file.setInputFiles({
    name: '第一张.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200"><rect width="1200" height="1200" fill="#edf1e7"/></svg>',
    ),
  })
  await page.getByRole('button', { name: '预览', exact: true }).click()
  const preview = page.locator('.editor-preview')
  await preview.getByRole('button', { name: '放大图片', exact: true }).click()
  const firstUrl = await preview.locator('img').getAttribute('src')
  await file.setInputFiles({
    name: '第二张.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#d0ddc7"/></svg>',
    ),
  })
  await expect(preview.locator('img')).not.toHaveAttribute('src', firstUrl)
  await expect(preview.locator('img')).toHaveAttribute('src', /^blob:/)
  await expect(preview.getByRole('button', { name: '缩小图片', exact: true })).toBeDisabled()
  expect(await preview.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true)
})
