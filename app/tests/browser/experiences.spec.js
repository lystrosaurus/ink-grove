import { test, expect } from '@playwright/test'

test('a search requested during experience loading opens when the adult shell is ready', async ({
  page,
}) => {
  let release
  const ready = new Promise((resolve) => {
    release = resolve
  })
  await page.route('**/src/App.jsx', async (route) => {
    await ready
    await route.continue()
  })
  await page.goto('/')
  await expect(page.getByRole('status')).toContainText('花园正在展开')
  await page.keyboard.press('Control+k')
  release()
  await expect(page.getByRole('dialog').getByRole('textbox', { name: '搜索关键词' })).toBeFocused()
})

test('switching gardens preserves adult data and theme without carrying its shell into Seed', async ({
  page,
}) => {
  await page.goto('/')
  const adult = {
    schemaVersion: 1,
    favorites: ['mindware'],
    visits: {},
    collections: [],
    artifacts: [],
  }
  await page.evaluate((value) => {
    localStorage.setItem('ink-grove:theme', 'dark')
    localStorage.setItem('ink-grove:garden:v1', JSON.stringify(value))
  }, adult)
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page
    .getByRole('navigation', { name: '主导航', exact: true })
    .getByRole('link', { name: 'Seed Grove · 小小思考家', exact: true })
    .click()
  await expect(page.getByRole('navigation', { name: '花园地图', exact: true })).toBeVisible()
  await expect(page.locator('.site-header')).toHaveCount(0)
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/seed-icon.svg')
  await page.goto('/seed/play/emotion-weather')
  await page.getByLabel('我想记下').fill('一起走进同一座小花园。')
  await page.getByRole('button', { name: '保存这片小叶子' }).click()
  await expect(page.getByLabel('我想记下')).toHaveValue('')
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('ink-grove:garden:v1'))),
  ).toEqual(adult)
  await page.getByRole('link', { name: 'Ink Grove · 大人的花园', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('.seed-app')).toHaveCount(0)
  await expect(page.getByRole('button', { name: '搜索作品', exact: true })).toBeVisible()
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('seed-grove:garden:v1')).events[0].note,
    ),
  ).toBe('一起走进同一座小花园。')
})

test('the adult home invites children into Seed and mobile navigation keeps the entrance available', async ({
  page,
}) => {
  await page.goto('/')
  const invitation = page.getByRole('region', { name: '和孩子一起，让好奇心发芽' })
  await expect(invitation).toBeVisible()
  await invitation.getByRole('link', { name: '走进 Seed Grove' }).click()
  await expect(page).toHaveURL(/\/seed$/)
  await expect(page.getByRole('navigation', { name: '花园地图', exact: true })).toBeVisible()
  for (const width of [390, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/')
    if (width === 390) await page.getByRole('button', { name: '展开导航' }).click()
    const entrance = page
      .getByRole('navigation', { name: '主导航', exact: true })
      .getByRole('link', { name: 'Seed Grove · 小小思考家', exact: true })
    await expect(entrance).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    )
    await entrance.click()
    await expect(page).toHaveURL(/\/seed$/)
  }
})

test('reader messages never count as a child reporting a discovery', async ({ page }) => {
  await page.goto('/seed/play/mistakes-are-clues')
  await page.frameLocator('iframe').locator('#test').click()
  await page.locator('iframe').evaluate((frame) => {
    window.postMessage(
      { type: 'seed-grove:growth', seedId: 'mistakes-are-clues', kind: 'real-life' },
      '*',
    )
    frame.contentWindow.postMessage({ type: 'ink-grove:progress', progress: 1 }, '*')
  })
  await page.getByRole('link', { name: '我的小脚印', exact: true }).first().click()
  await expect(page.getByText('这里还没有记录', { exact: true })).toBeVisible()
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('seed-grove:garden:v1') || '{"events":[]}').events,
    ),
  ).toEqual([])
})
