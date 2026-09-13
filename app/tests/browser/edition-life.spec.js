import { test, expect } from '@playwright/test'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

async function openWork(page, id) {
  const path = fileURLToPath(new URL(`../../../content/artifacts/${id}/index.html`, import.meta.url))
  const source = existsSync(path) ? readFileSync(path, 'utf8') : '<p>尚未实现</p>'
  await page.setViewportSize({ width: 390, height: 844 })
  await page.setContent('<style>body{margin:0}iframe{width:100%;height:844px;border:0}</style><iframe title="作品" sandbox="allow-scripts"></iframe>')
  await page.locator('iframe').evaluate((frame, html) => { frame.srcdoc = html }, source)
  await expect(page.frameLocator('iframe').locator('h1')).toBeVisible()
  return page.frameLocator('iframe')
}

test('四千周的承诺桌限制三项，并让取消选择释放位置', async ({ page }) => {
  const work = await openWork(page, 'four-thousand-weeks')
  for (const n of [0, 1, 2]) await work.locator('[data-commit]').nth(n).click()
  await work.locator('[data-commit]').nth(3).click()
  await expect(work.locator('#commit-result')).toContainText('请先放下')
  await expect(work.locator('[data-commit][aria-pressed="true"]')).toHaveCount(3)
  await work.locator('[data-commit]').nth(0).click()
  await work.locator('[data-commit]').nth(3).click()
  await expect(work.locator('#commit-result')).toContainText('本阶段投入 3 件')
})

test('意义的回应区分可以改变的伤害和不可改变的事实', async ({ page }) => {
  const work = await openWork(page, 'mans-search-for-meaning')
  await work.locator('#meaning-situation').selectOption('harm')
  await expect(work.locator('#meaning-response')).toContainText('保护与求助')
  await work.locator('#meaning-situation').selectOption('loss')
  await expect(work.locator('#meaning-response')).toContainText('不必立刻找到意义')
})

test('原则卡要求可观察反证，生成后可重新修订', async ({ page }) => {
  const work = await openWork(page, 'principles-life-work')
  await work.locator('#principle-build').click()
  await expect(work.locator('#principle-result')).toContainText('请补齐')
  await work.locator('#principle-if').fill('需求仍有两处未确认')
  await work.locator('#principle-then').fill('先开15分钟澄清会')
  await work.locator('#principle-unless').fill('已有书面验收条件')
  await work.locator('#principle-build').click()
  await expect(work.locator('#principle-result')).toContainText('已有书面验收条件')
})

test('芒格传证据抽屉揭示同伴证词的来源限制', async ({ page }) => {
  const work = await openWork(page, 'damn-right')
  await work.locator('[data-evidence="tribute"]').click()
  await expect(work.locator('#evidence-result')).toContainText('亲历者证词')
  await work.locator('[data-evidence="counterfactual"]').click()
  await expect(work.locator('#evidence-result')).toContainText('未成功的同类人')
})

test('黑天鹅观察遗漏事件可反转历史平均值，并支持重置', async ({ page }) => {
  const work = await openWork(page, 'black-swan')
  await expect(work.locator('#tail-result')).toContainText('1.00')
  await work.locator('#tail-add').click()
  await expect(work.locator('#tail-result')).toContainText('-9.00')
  await expect(work.locator('#tail-add')).toBeDisabled()
  await work.locator('#tail-reset').click()
  await expect(work.locator('#tail-result')).toContainText('1.00')
})

test('反脆弱实验区分凸性、凹性及越过失效阈值', async ({ page }) => {
  const work = await openWork(page, 'antifragile')
  await work.locator('#response-shape').selectOption('convex')
  await expect(work.locator('#convex-result')).toContainText('凸性收益 25')
  await work.locator('#response-shape').selectOption('concave')
  await expect(work.locator('#convex-result')).toContainText('凹性损失 25')
  await work.locator('#stress-spread').fill('9')
  await work.locator('#stress-spread').dispatchEvent('input')
  await expect(work.locator('#convex-result')).toContainText('越过失效阈值')
})

test('穷理查格言在不同约束下得到不同改写', async ({ page }) => {
  const work = await openWork(page, 'poor-richards-almanack')
  await work.locator('#almanack-context').selectOption('care')
  await expect(work.locator('#maxim-result')).toContainText('照护劳动')
  await work.locator('#almanack-context').selectOption('repair')
  await expect(work.locator('#maxim-result')).toContainText('总成本')
})

test('十五件作品在320像素阅读器中没有横向溢出', async ({ page }) => {
  for (const id of ['four-thousand-weeks', 'mans-search-for-meaning', 'principles-life-work', 'damn-right', 'black-swan', 'antifragile', 'poor-richards-almanack', 'buffett-shareholder-letters', 'peter-lynch-stock-scout', 'intelligent-investor', 'poor-charlies-almanack', 'rockefeller-wealth-archive', 'naval-almanack', 'power-of-now', 'twelve-rules-for-life']) {
    await openWork(page, id)
    await page.setViewportSize({ width: 320, height: 844 })
    expect(await page.frames()[1].evaluate(() => document.documentElement.scrollWidth <= innerWidth), id).toBe(true)
  }
})

test('巴菲特收益桥显示维持资本开支改变可支配收益', async ({ page }) => {
  const work = await openWork(page, 'buffett-shareholder-letters')
  await work.locator('#maintenance-cost').fill('80')
  await work.locator('#owner-calculate').click()
  await expect(work.locator('#owner-result')).toContainText('40')
})

test('林奇研究台将现金流证据与门店热闹区分', async ({ page }) => {
  const work = await openWork(page, 'peter-lynch-stock-scout')
  await work.locator('#lynch-evidence').selectOption('cash')
  await expect(work.locator('#lynch-result')).toContainText('现金流')
})

test('格雷厄姆估值下限下降会反转表面安全边际', async ({ page }) => {
  const work = await openWork(page, 'intelligent-investor')
  await work.locator('#value-low').fill('60')
  await work.locator('#safety-check').click()
  await expect(work.locator('#safety-result')).toContainText('-25.0%')
  await work.locator('#value-low').fill('0')
  await work.locator('#safety-check').click()
  await expect(work.locator('#safety-result')).toContainText('请输入大于0')
})

test('多模型审问产生不同可证伪问题', async ({ page }) => {
  const work = await openWork(page, 'poor-charlies-almanack')
  await work.locator('#model-view').selectOption('counter')
  await expect(work.locator('#model-result')).toContainText('对照')
})

test('洛克菲勒档案加入被影响者的制度问题', async ({ page }) => {
  const work = await openWork(page, 'rockefeller-wealth-archive')
  await work.locator('#archive-lens').selectOption('public')
  await expect(work.locator('#archive-result')).toContainText('谁有决定权')
})

test('纳瓦尔复制成本包含制作及支持而非只有边际复制', async ({ page }) => {
  const work = await openWork(page, 'naval-almanack')
  await work.locator('#reuse-count').fill('30')
  await work.locator('#reuse-calculate').click()
  await expect(work.locator('#reuse-result')).toContainText('9.0 小时')
})

test('当下练习允许逐步转向具体行动而非压制思考', async ({ page }) => {
  const work = await openWork(page, 'power-of-now')
  await work.locator('#presence-next').click()
  await work.locator('#presence-next').click()
  await expect(work.locator('#presence-result')).toContainText('具体行动')
})

test('十二法则不把个人整理作为提出公共问题的资格', async ({ page }) => {
  const work = await openWork(page, 'twelve-rules-for-life')
  await work.locator('#rule-scene').selectOption('institution')
  await expect(work.locator('#rule-result')).toContainText('不需要先')
})
