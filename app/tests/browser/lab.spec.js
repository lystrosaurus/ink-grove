import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'

const source = await readFile(
  new URL('../../../content/artifacts/clear-thinking-lab/index.html', import.meta.url),
  'utf8',
)

async function openLab(page) {
  await page.setContent(
    '<iframe title="清醒行动实验室" sandbox="allow-scripts" style="width:100%;height:900px;border:0"></iframe>',
  )
  await page.locator('iframe').evaluate((frame, html) => {
    frame.srcdoc = html
  }, source)
  return page.frameLocator('iframe')
}

test('lab turns a decision and its counter-evidence into a selectable action card', async ({
  page,
}) => {
  const lab = await openLab(page)
  await lab.getByLabel('正在考虑的决定').fill('为读书会增加一次周中讨论')
  await lab.getByLabel('已有证据').fill('最近 3 次讨论只有 2 人准备了笔记')
  await lab.getByLabel('最强反证或另一种解释').fill('大家可能缺少阅读时间，增加会议会更忙')
  await lab.getByLabel('最小可逆行动').fill('先试 1 次 10 分钟的自愿交流 <不追加考核>')
  await lab.getByLabel('观察什么，何时复盘').fill('下周五记录参与人数和自愿反馈')
  await lab.getByRole('button', { name: '生成我的行动卡' }).click()
  const card = lab.getByLabel('可选择复制的行动卡')
  await expect(card).toHaveValue(/增加会议会更忙/)
  await expect(card).toHaveValue(/先试 1 次 10 分钟的自愿交流 <不追加考核>/)
  await expect(card).toHaveValue(/下周五记录参与人数和自愿反馈/)
  await expect(card).toHaveValue(/现状基线：待补充/)
  await lab.getByRole('button', { name: '选中行动卡' }).click()
  expect(
    await card.evaluate((element) => element.selectionEnd - element.selectionStart),
  ).toBeGreaterThan(100)
  await lab.getByLabel('最小可逆行动').fill('改为只发一份匿名问卷')
  await expect(lab.getByRole('status').filter({ hasText: '已修改' })).toBeVisible()
  await lab.getByRole('button', { name: '生成我的行动卡' }).click()
  await expect(card).toHaveValue(/改为只发一份匿名问卷/)
  await expect(card).not.toHaveValue(/10 分钟/)
})

test('feedback controls change the actual delayed recurrence with keyboard input', async ({
  page,
}) => {
  const lab = await openLab(page)
  const gain = lab.getByLabel('修正强度')
  await gain.focus()
  await gain.press('Home')
  await gain.press('ArrowRight')
  await gain.press('ArrowRight')
  await gain.press('ArrowRight')
  await gain.press('ArrowRight')
  await expect(gain).toHaveValue('0.5')
  await expect(lab.locator('[data-step="3"]')).toHaveText('0.88')
  const before = await lab.locator('#response-path').getAttribute('d')
  const delay = lab.getByLabel('观察延迟')
  await delay.focus()
  await delay.press('ArrowRight')
  await delay.press('ArrowRight')
  await expect(delay).toHaveValue('2')
  await expect(lab.locator('[data-step="3"]')).toHaveText('1.50')
  expect(await lab.locator('#response-path').getAttribute('d')).not.toBe(before)
  await lab.getByRole('button', { name: '恢复初始实验' }).click()
  await expect(gain).toHaveValue('0.4')
  await expect(delay).toHaveValue('0')
  await expect(lab.locator('[data-step="3"]')).toHaveText('0.78')
})

test('lab stays usable at 390px without any network, storage, or parent access', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const errors = []
  const requests = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('request', (request) => requests.push(request.url()))
  const lab = await openLab(page)
  await expect(lab.getByRole('heading', { name: '清醒行动实验室', level: 1 })).toBeVisible()
  const overflow = await lab
    .locator('html')
    .evaluate((element) => element.scrollWidth - element.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)
  await lab.getByRole('button', { name: '填入一个读书会示例' }).click()
  await lab.getByRole('button', { name: '生成我的行动卡' }).click()
  await expect(lab.getByLabel('可选择复制的行动卡')).not.toHaveValue('')
  expect(requests).toEqual([])
  expect(errors).toEqual([])
})
