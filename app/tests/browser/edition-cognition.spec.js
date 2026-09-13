import { test, expect } from '@playwright/test'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Load the actual standalone work under the same opaque-origin sandbox as the reader.
async function openWork(page, id) {
  const path = fileURLToPath(new URL(`../../../content/artifacts/${id}/index.html`, import.meta.url))
  const source = existsSync(path) ? readFileSync(path, 'utf8') : '<p>Work is not implemented yet.</p>'
  await page.setContent('<iframe title="作品" sandbox="allow-scripts" style="width:100%;height:900px;border:0"></iframe>')
  await page.locator('iframe').evaluate((frame, html) => { frame.srcdoc = html }, source)
  return page.frameLocator('iframe')
}

test('论证分类区分观测与因果假设，并允许纠正判断', async ({ page }) => {
  const work = await openWork(page, 'asking-right-questions')
  await work.locator('#argument-role').selectOption('evidence')
  await work.locator('#argument-check').click()
  await expect(work.locator('#argument-feedback')).toHaveAttribute('data-result', 'reconsider')
  await work.locator('#argument-role').selectOption('assumption')
  await work.locator('#argument-check').click()
  await expect(work.locator('#argument-feedback')).toHaveAttribute('data-result', 'correct')
})

test('提取练习先尝试再揭示，忘记与独立想起产生不同复习安排', async ({ page }) => {
  const work = await openWork(page, 'make-it-stick')
  await expect(work.locator('#retrieval-answer')).toBeHidden()
  await work.locator('#reveal-answer').click()
  await expect(work.locator('#retrieval-answer')).toBeVisible()
  await work.locator('#recall-rating').selectOption('forgot')
  await expect(work.locator('#review-plan')).toContainText('明天')
  await work.locator('#recall-rating').selectOption('independent')
  await expect(work.locator('#review-plan')).toContainText('7 天后')
})

test('预测评分按概率和结果计算，拒绝越界概率', async ({ page }) => {
  const work = await openWork(page, 'superforecasting')
  await work.locator('#forecast-probability').fill('80')
  await work.locator('#forecast-outcome').selectOption('1')
  await work.locator('#score-forecast').click()
  await expect(work.locator('#forecast-score')).toContainText('0.040')
  await work.locator('#forecast-outcome').selectOption('0')
  await work.locator('#score-forecast').click()
  await expect(work.locator('#forecast-score')).toContainText('0.640')
  await work.locator('#forecast-probability').fill('101')
  await work.locator('#score-forecast').click()
  await expect(work.locator('#forecast-score')).toHaveAttribute('data-state', 'invalid')
})

test('参照点改变相对得失但不改写最终金额', async ({ page }) => {
  const work = await openWork(page, 'thinking-fast-slow')
  await work.locator('#reference-point').selectOption('80')
  await expect(work.locator('#reference-result')).toContainText('多 20')
  await expect(work.locator('#final-value')).toHaveText('100')
  await work.locator('#reference-point').selectOption('120')
  await expect(work.locator('#reference-result')).toContainText('少 20')
  await expect(work.locator('#final-value')).toHaveText('100')
})

test('相同虚构数据换成每万人比例后排序反转', async ({ page }) => {
  const work = await openWork(page, 'factfulness')
  await work.locator('#denominator-mode').selectOption('count')
  await expect(work.locator('#comparison-result')).toHaveAttribute('data-higher', 'a')
  await work.locator('#denominator-mode').selectOption('rate')
  await expect(work.locator('#comparison-result')).toHaveAttribute('data-higher', 'b')
  await expect(work.locator('#value-a')).toHaveText('2')
  await expect(work.locator('#value-b')).toHaveText('4')
})

test('心流情境建议同时检查挑战差距与反馈条件', async ({ page }) => {
  const work = await openWork(page, 'flow')
  await work.locator('#skill-level').fill('2')
  await work.locator('#challenge-level').fill('8')
  await work.locator('#flow-check').click()
  await expect(work.locator('#flow-guidance')).toHaveAttribute('data-condition', 'overload')
  await work.locator('#skill-level').fill('8')
  await work.locator('#clear-feedback').uncheck()
  await work.locator('#flow-check').click()
  await expect(work.locator('#flow-guidance')).toHaveAttribute('data-condition', 'feedback')
  await work.locator('#clear-feedback').check()
  await work.locator('#flow-check').click()
  await expect(work.locator('#flow-guidance')).toHaveAttribute('data-condition', 'matched')
})

test('单次异常不会自动判为科学革命，竞争框架仍保留比较要求', async ({ page }) => {
  const work = await openWork(page, 'scientific-revolutions')
  await work.locator('#evidence-context').selectOption('single')
  await expect(work.locator('#paradigm-reading')).toHaveAttribute('data-stage', 'check')
  await work.locator('#evidence-context').selectOption('repeated')
  await expect(work.locator('#paradigm-reading')).toHaveAttribute('data-stage', 'anomaly')
  await work.locator('#evidence-context').selectOption('alternative')
  await expect(work.locator('#paradigm-reading')).toHaveAttribute('data-stage', 'compare')
})

test('版式开关改变真实文字对齐与分组间距，并可撤回', async ({ page }) => {
  const work = await openWork(page, 'non-designers-design-book')
  await work.locator('#align-control').check()
  await expect(work.locator('#design-sample')).toHaveCSS('text-align', 'left')
  await work.locator('#proximity-control').check()
  const near = await work.locator('.event-place').evaluate(el => el.getBoundingClientRect().top - el.previousElementSibling.getBoundingClientRect().bottom)
  const far = await work.locator('.event-contact').evaluate(el => el.getBoundingClientRect().top - el.previousElementSibling.getBoundingClientRect().bottom)
  expect(far).toBeGreaterThan(near + 10)
  await work.locator('#align-control').uncheck()
  await expect(work.locator('#design-sample')).toHaveCSS('text-align', 'center')
})

for (const width of [320, 390]) {
  test(`新认知作品在 ${width}px 内不产生横向页面溢出`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    for (const id of ['asking-right-questions', 'make-it-stick', 'superforecasting', 'thinking-fast-slow', 'factfulness', 'flow', 'scientific-revolutions', 'non-designers-design-book']) {
      const work = await openWork(page, id)
      await expect(work.locator('h1')).toBeVisible()
      const overflow = await work.locator('html').evaluate(el => el.scrollWidth - el.clientWidth)
      expect(overflow, id).toBeLessThanOrEqual(1)
    }
  })
}
