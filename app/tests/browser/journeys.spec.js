import { test, expect } from '@playwright/test'

const steps = [
  ['cognitive-awakening', '认知觉醒', '觉察'],
  ['seven-habits', '高效能人士的七个习惯', '原则'],
  ['deliberate-practice', '刻意练习', '能力'],
  ['naval-almanack', '纳瓦尔宝典', '自由'],
  ['personal-growth-os', '贯通思考篇', '贯通'],
]

test('the growth journey has five ordered readings with a narrative between each step', async ({
  page,
}) => {
  await page.goto('/journeys/personal-growth')
  await expect(page.getByRole('heading', { name: '从觉醒到自由', exact: true })).toBeVisible()
  const chapters = page.getByRole('list', { name: '成长路径的五个阶段' }).getByRole('listitem')
  await expect(chapters).toHaveCount(5)
  for (const [index, [id, title, stage]] of steps.entries()) {
    const chapter = chapters.nth(index)
    await expect(chapter.getByText(`0${index + 1}`, { exact: true })).toBeVisible()
    await expect(chapter.getByRole('heading', { name: stage, exact: true })).toBeVisible()
    await expect(chapter.getByRole('link', { name: `阅读《${title}》` })).toHaveAttribute(
      'href',
      `/artifact/${id}`,
    )
    await expect(chapter.locator('.journey-narrative')).not.toBeEmpty()
    await expect(chapter.locator('.journey-next-thought')).not.toBeEmpty()
  }
  await expect(page.getByText('已探索 0 / 5 个阶段')).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('a journey opens the selected artifact and browser back returns to the same path', async ({
  page,
}) => {
  await page.goto('/journeys/personal-growth')
  await page.getByRole('link', { name: '阅读《刻意练习》', exact: true }).click()
  await expect(page).toHaveURL(/\/artifact\/deliberate-practice$/)
  await expect(page.frameLocator('iframe').locator('body')).toContainText('刻意练习：五步训练协议')
  await page
    .frames()[1]
    .evaluate(() =>
      window.scrollTo({
        top: (document.documentElement.scrollHeight - innerHeight) * 0.95,
        behavior: 'instant',
      }),
    )
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem('ink-grove:garden:v1')).visits['deliberate-practice']
            .progress,
      ),
    )
    .toBeGreaterThan(0.9)
  await page.goBack()
  await expect(page).toHaveURL(/\/journeys\/personal-growth$/)
  await expect(page.getByRole('heading', { name: '从觉醒到自由', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: '阅读《刻意练习》', exact: true })).toBeVisible()
  await expect(page.getByText('已探索 1 / 5 个阶段')).toBeVisible()
  await expect(page.locator('#journey-deliberate-practice .journey-reading-status')).toHaveText(
    '已探索',
  )
})
