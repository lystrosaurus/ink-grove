import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

async function openWork(page, id) {
  const html = await readFile(
    new URL(`../../../content/artifacts/${id}/index.html`, import.meta.url),
    'utf8',
  )
  await page.setContent(
    '<iframe title="编辑作品" sandbox="allow-scripts" style="width:100%;height:900px;border:0"></iframe>',
  )
  await page.locator('iframe').evaluate((frame, source) => {
    frame.srcdoc = source
  }, html)
  return page.frameLocator('iframe')
}

test('a smaller error count is compared against its denominator before calling it improvement', async ({
  page,
}) => {
  const work = await openWork(page, 'one-percent-rule')
  await work.locator('#compare-rates').click()
  await expect(work.locator('#rate-result')).toContainText('30.0% → 30.0%')
  await expect(work.locator('#rate-result')).toContainText('没有下降')
  await work.locator('#after-errors').fill('12')
  await work.locator('#compare-rates').click()
  await expect(work.locator('#rate-result')).toContainText('下降 10.0 个百分点')
  await work.locator('#after-total').fill('0')
  await work.locator('#compare-rates').click()
  await expect(work.locator('#rate-result')).toContainText('总次数必须大于 0')
  await expect(work.locator('#rate-result')).not.toContainText('NaN')
})

test('the growth map distinguishes skill practice from resource and agreement constraints', async ({
  page,
}) => {
  const work = await openWork(page, 'personal-growth-os')
  await work.locator('[data-bottleneck="skill"]').click()
  await expect(work.locator('#bottleneck-result')).toContainText('拆一个技能')
  await work.locator('[data-bottleneck="structure"]').click()
  await expect(work.locator('#bottleneck-result')).toContainText('协商工作量')
  await expect(work.locator('#bottleneck-result')).not.toContainText('拆一个技能')
  await expect(work.locator('[data-bottleneck="skill"]')).toHaveAttribute('aria-pressed', 'false')
})

test('the method desk separates forecastable questions from irreversible exposure', async ({
  page,
}) => {
  const work = await openWork(page, 'methods-with-boundaries')
  await work.locator('[data-situation="forecast"]').click()
  await expect(work.locator('#method-result')).toContainText('结算条件')
  await work.locator('[data-situation="ruin"]').click()
  await expect(work.locator('#method-result')).toContainText('先限制损失')
  await expect(work.locator('[data-situation="forecast"]')).toHaveAttribute('aria-pressed', 'false')
})

test('the time margin refuses to fund every promise from already committed time', async ({
  page,
}) => {
  const work = await openWork(page, 'a-life-that-fits')
  await work.locator('[data-promise="practice"]').click()
  await work.locator('[data-promise="friend"]').click()
  await work.locator('[data-promise="project"]').click()
  await expect(work.locator('#time-result')).toContainText('超出 30 分钟')
  await work.locator('[data-promise="project"]').click()
  await expect(work.locator('#time-result')).toContainText('留下 15 分钟')
  await expect(work.locator('#time-bar')).toHaveAttribute('aria-valuenow', '45')
})

test('a shared rule is checked against the affected participant rather than accepted by label', async ({
  page,
}) => {
  const work = await openWork(page, 'shared-ground')
  await work.locator('[data-rule="first"]').click()
  await expect(work.locator('#rule-result')).toContainText('工作到很晚')
  await work.locator('[data-rule="rotation"]').click()
  await expect(work.locator('#rule-result')).toContainText('例外申请')
  await work.locator('[data-rule="free"]').click()
  await expect(work.locator('#rule-result')).toContainText('维护')
})
