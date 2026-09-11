import { test, expect } from '@playwright/test'

test('theme preference survives reload and does not recolor an original artifact', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: '切换主题，当前浅色' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.goto('/artifact/cognitive-awakening')
  await expect(page.frameLocator('iframe').locator('body')).toBeVisible()
  const darkShellColor = await page
    .frames()[1]
    .evaluate(() => getComputedStyle(document.body).backgroundColor)
  await page.goto('/')
  await page.getByRole('button', { name: '切换主题，当前深色' }).click()
  await page.getByRole('button', { name: '切换主题，当前跟随系统' }).click()
  await page.goto('/artifact/cognitive-awakening')
  await expect(page.frameLocator('iframe').locator('body')).toBeVisible()
  expect(
    await page.frames()[1].evaluate(() => getComputedStyle(document.body).backgroundColor),
  ).toEqual(darkShellColor)
})

test('command palette searches concepts and supports a keyboard-selected artifact', async ({
  page,
}) => {
  await page.goto('/')
  await page.keyboard.press('Control+k')
  const input = page.getByRole('textbox', { name: '搜索关键词' })
  await input.fill('反馈')
  await expect(
    page.getByRole('dialog').getByRole('link', { name: '反馈', exact: true }),
  ).toBeVisible()
  await input.fill('纳瓦尔')
  await input.press('Enter')
  await expect(page).toHaveURL(/artifact\/naval-almanack/)
  await expect(page.locator('iframe')).toBeVisible()
})

test('unsaved local edits survive a storage event from another tab', async ({ page }) => {
  await page.goto('/explore')
  await page.evaluate(() => {
    const set = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key === 'ink-grove:garden:v1') throw new DOMException('full', 'QuotaExceededError')
      return set.call(this, key, value)
    }
  })
  await page.getByRole('button', { name: '收藏认知觉醒', exact: true }).click()
  await expect(page.getByRole('button', { name: '取消收藏认知觉醒', exact: true })).toBeVisible()
  await page.evaluate(() =>
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'ink-grove:garden:v1',
        newValue: JSON.stringify({
          schemaVersion: 1,
          favorites: [],
          visits: {},
          collections: [],
          artifacts: [],
        }),
      }),
    ),
  )
  await expect(page.getByRole('button', { name: '取消收藏认知觉醒', exact: true })).toBeVisible()
  await expect(page.getByRole('alert')).toContainText('已保留此页面尚未保存的创作')
})

test('protected raw data can be downloaded without normalization', async ({ page }) => {
  await page.goto('/')
  const raw = '{"schemaVersion":99,"未来内容":"保留每一个字节"}'
  await page.evaluate((raw) => localStorage.setItem('ink-grove:garden:v1', raw), raw)
  await page.reload()
  await page.getByRole('button', { name: '我的花园数据' }).click()
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name: '下载被保护的原始数据' }).click()
  const download = await downloadEvent
  const stream = await download.createReadStream()
  const chunks = []
  for await (const chunk of stream) chunks.push(chunk)
  expect(Buffer.concat(chunks).toString('utf8')).toBe(raw)
})
