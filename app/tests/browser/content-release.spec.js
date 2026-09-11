import { test, expect } from '@playwright/test'

test('the full knowledge network keeps all nineteen node targets separate on desktop and mobile', async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/connections')
    await expect(page.locator('.graph-node')).toHaveCount(19)
    await expect
      .poll(async () =>
        page.locator('.graph-node').evaluateAll((nodes) => {
          const bounds = nodes.map((node) => node.getBoundingClientRect())
          return bounds.reduce(
            (count, box, index) =>
              count +
              bounds
                .slice(index + 1)
                .filter(
                  (other) =>
                    Math.min(box.right, other.right) - Math.max(box.left, other.left) > 1 &&
                    Math.min(box.bottom, other.bottom) - Math.max(box.top, other.top) > 1,
                ).length,
            0,
          )
        }),
      )
      .toBe(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
})

test('the new atlas is discoverable and its eleven book sources form an explorable network', async ({
  page,
}) => {
  await page.goto('/')
  await expect(
    page.getByRole('link', { name: '贯通思考 II · 思想地图', exact: true }),
  ).toBeVisible()
  await page.goto('/explore')
  await page.getByRole('textbox', { name: '在作品中搜索' }).fill('主题阅读')
  await expect(page.locator('.artifact-card h3')).toContainText([
    '贯通思考 II · 思想地图',
    '如何阅读一本书',
  ])
  await page.goto('/connections?artifact=intellectual-atlas')
  await page.getByLabel('连接类型').selectOption('synthesizes')
  await expect(page.locator('.graph-node')).toHaveCount(12)
  await page.getByRole('button', { name: '连接列表', exact: true }).click()
  await expect(page.locator('.connection-list .edge-row')).toHaveCount(11)
  await expect(page.locator('.connection-list')).toContainText('如何阅读一本书')
  await expect(page.locator('.connection-list')).toContainText('系统之美')
})

test('edited reading copies preserve mobile matrix labels and the complete twelve leverage points', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/artifact/intellectual-atlas')
  const atlas = page.frameLocator('iframe')
  await expect(atlas.locator('.matrix .cell[data-label]')).toHaveCount(25)
  await expect(atlas.locator('.matrix .cell.head').first()).toBeHidden()
  expect(
    await atlas
      .locator('.cell[data-label]')
      .first()
      .evaluate((cell) => getComputedStyle(cell, '::before').content),
  ).toContain('看自己')
  expect(
    await page.frames()[1].evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBe(true)
  await page.setViewportSize({ width: 1440, height: 1000 })
  await expect(atlas.locator('.matrix .cell.head').first()).toBeVisible()
  await page.goto('/artifact/thinking-in-systems')
  await expect(page.frameLocator('iframe').locator('.levers .rank')).toHaveText(
    Array.from({ length: 12 }, (_, index) => String(12 - index)),
  )
  await expect(page.frameLocator('iframe').locator('.leverage-note')).toContainText('关键不是')
})
