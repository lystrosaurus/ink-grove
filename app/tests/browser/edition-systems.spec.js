import { test, expect } from '@playwright/test'
import { readFileSync, existsSync } from 'node:fs'

// Render actual standalone works with the same opaque-origin sandbox as the app.
async function openWork(page, id) {
  const file = new URL(`../../../content/artifacts/${id}/index.html`, import.meta.url)
  const html = existsSync(file) ? readFileSync(file, 'utf8') : '<p>作品尚未实现</p>'
  await page.setContent('<style>body{margin:0}iframe{width:100%;height:900px;border:0}</style><iframe title="作品" sandbox="allow-scripts"></iframe>')
  await page.locator('iframe').evaluate((frame, src) => { frame.srcdoc = src }, html)
  return page.frameLocator('iframe')
}

test('strategy distinguishes coordinated actions from an over-budget wish list', async ({ page }) => {
  const work = await openWork(page, 'good-strategy-bad-strategy')
  await work.locator('#action-guide').check()
  await work.locator('#action-measure').check()
  await expect(work.locator('#strategy-result')).toContainText('相互支持')
  await work.locator('#action-ads').check()
  await expect(work.locator('#strategy-result')).toContainText('超出')
})

test('door signifier communicates the available action without changing the mechanism', async ({ page }) => {
  const work = await openWork(page, 'design-everyday-things')
  await work.locator('#door-pull').click()
  await expect(work.locator('#door-result')).toContainText('没有打开')
  await work.locator('#show-sign').check()
  await expect(work.locator('#door-sign')).toBeVisible()
  await work.locator('#door-push').click()
  await expect(work.locator('#door-result')).toContainText('门已打开')
})

test('communication exercise accepts refusal and invites another strategy', async ({ page }) => {
  const work = await openWork(page, 'nonviolent-communication')
  await work.locator('#request-kind').selectOption('demand')
  await work.locator('#hear-no').click()
  await expect(work.locator('#dialogue-result')).toContainText('惩罚')
  await work.locator('#request-kind').selectOption('request')
  await work.locator('#hear-no').click()
  await expect(work.locator('#dialogue-result')).toContainText('另一种安排')
})

test('pyramid keeps a small sample from supporting a universal claim', async ({ page }) => {
  const work = await openWork(page, 'pyramid-principle')
  await work.locator('#claim-scope').selectOption('all')
  await expect(work.locator('#pyramid-result')).toContainText('越过')
  await work.locator('#claim-scope').selectOption('pilot')
  await expect(work.locator('#pyramid-result')).toContainText('试点')
  await expect(work.locator('#pyramid-result')).toContainText('不能保证')
})

test('rule 90 evolves a single live cell into two and reset restores initial state', async ({ page }) => {
  const work = await openWork(page, 'complexity-guided-tour')
  await work.locator('#evolve-step').click()
  await expect(work.locator('#automaton-status')).toContainText('第 1 代 · 活跃 2')
  await work.locator('#evolve-reset').click()
  await expect(work.locator('#automaton-status')).toContainText('第 0 代 · 活跃 1')
  await work.locator('#automaton-rule').selectOption('0')
  await work.locator('#evolve-step').click()
  await expect(work.locator('#automaton-status')).toContainText('活跃 0')
})

test('common resource accounting clamps depletion and reset allows a different withdrawal', async ({ page }) => {
  const work = await openWork(page, 'governing-commons')
  await work.locator('#harvest').fill('40')
  await work.locator('#commons-step').click()
  await expect(work.locator('#commons-stock')).toHaveText('0')
  await work.locator('#commons-reset').click()
  await work.locator('#harvest').fill('10')
  await work.locator('#commons-step').click()
  await expect(work.locator('#commons-stock')).toHaveText('80')
})

test('team investment has an immediate backlog cost and a delayed capacity benefit', async ({ page }) => {
  const work = await openWork(page, 'fifth-discipline')
  await work.locator('#team-action').selectOption('learn')
  await work.locator('#learning-step').click()
  await expect(work.locator('#team-backlog')).toHaveText('44')
  await expect(work.locator('#team-capacity')).toHaveText('11')
  await work.locator('#team-action').selectOption('normal')
  await work.locator('#learning-step').click()
  await expect(work.locator('#team-backlog')).toHaveText('43')
})

test('changing defaults never submits a subscription or replaces explicit confirmation', async ({ page }) => {
  const work = await openWork(page, 'nudge')
  await work.locator('#default-mode').selectOption('on')
  await expect(work.locator('#newsletter')).toBeChecked()
  await expect(work.locator('#choice-result')).toContainText('尚未确认')
  await work.locator('#newsletter').uncheck()
  await work.locator('#confirm-choice').click()
  await expect(work.locator('#choice-result')).toContainText('不接收')
  await work.locator('#default-mode').selectOption('off')
  await expect(work.locator('#choice-result')).toContainText('尚未确认')
})

const systemsWorks = [
  'thinking-in-systems', 'cybernetics', 'innovators-dilemma', 'mckinsey-way',
  'effective-executive', 'economic-way-of-thinking', 'seven-habits', 'thinking-framework',
  'good-strategy-bad-strategy', 'design-everyday-things', 'nonviolent-communication',
  'pyramid-principle', 'complexity-guided-tour', 'governing-commons', 'fifth-discipline', 'nudge',
]

for (const width of [320, 390]) {
  test(`systems works preserve readable page width at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    for (const id of systemsWorks) {
      const work = await openWork(page, id)
      await expect(work.locator('h1'), id).toBeVisible()
      const dimensions = await work.locator('body').evaluate((body) => ({
        scroll: body.scrollWidth,
        viewport: body.ownerDocument.documentElement.clientWidth,
      }))
      expect(dimensions.scroll, id).toBeLessThanOrEqual(dimensions.viewport + 1)
    }
  })
}
