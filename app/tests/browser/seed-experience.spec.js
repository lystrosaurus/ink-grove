import { test, expect } from '@playwright/test'

test('the garden map opens a shared seed without an age preference or frame parameter', async ({
  page,
}) => {
  await page.goto('/seed')
  const map = page.getByRole('navigation', { name: '花园地图' })
  await expect(map.getByRole('link')).toHaveCount(4)
  await map.getByRole('link', { name: /反馈实验室/ }).click()
  await expect(page).toHaveURL(/\/seed\/layer\/5$/)
  await page.getByRole('link', { name: /错误是线索/ }).click()
  await expect(page.locator('iframe')).toHaveAttribute('sandbox', 'allow-scripts')
  await expect(page.locator('iframe')).not.toHaveAttribute('src', /[?&]age=/)
  await expect(page.getByRole('combobox', { name: '阅读年龄' })).toHaveCount(0)
  await page.reload()
  await expect(page.locator('iframe')).not.toHaveAttribute('src', /[?&]age=/)
})

test('Think 8 gives different feedback and records only an explicitly saved discovery', async ({
  page,
}) => {
  await page.goto('/seed/think/q2')
  await page.getByRole('button', { name: '小雨一定不喜欢我' }).click()
  await expect(page.getByRole('status').filter({ hasText: /猜测/ })).toBeVisible()
  await page.getByRole('button', { name: '换一个想法试试' }).click()
  await page.getByRole('button', { name: '小雨还没有回复消息' }).click()
  await expect(page.getByRole('status').filter({ hasText: /看见/ })).toBeVisible()
  await page.getByRole('button', { name: '带回生活里' }).click()
  await page.getByRole('link', { name: '我的小脚印', exact: true }).first().click()
  await expect(page.getByText('这里还没有记录')).toBeVisible()
  await page.goto('/seed/think/q2')
  await page.getByRole('button', { name: '小雨还没有回复消息' }).click()
  await page.getByRole('button', { name: '带回生活里' }).click()
  await page.getByLabel('我想记下').fill('没有回复不代表不喜欢我，我可以先问问。')
  await page.getByRole('button', { name: '保存这片小叶子' }).click()
  await page.getByRole('link', { name: '我的小脚印', exact: true }).first().click()
  await expect(page.getByText('没有回复不代表不喜欢我，我可以先问问。')).toBeVisible()
  await expect(page.getByText('一次发现', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByText('没有回复不代表不喜欢我，我可以先问问。')).toBeVisible()
})

test('all eight thinking tools offer a choice, feedback and a real-life reflection', async ({
  page,
}) => {
  for (let i = 1; i <= 8; i += 1) {
    await page.goto(`/seed/think/q${i}`)
    const choices = page.getByRole('group', { name: '试一试' }).getByRole('button')
    await expect(choices).toHaveCount(i === 2 ? 2 : 3)
    await choices.first().click()
    await expect(page.getByRole('button', { name: '换一个想法试试' })).toBeVisible()
    await page.getByRole('button', { name: '再想一步', exact: true }).click()
    const deeper = page.getByRole('region', { name: '再想一步' })
    await expect(deeper).toBeVisible()
    await expect(deeper.getByRole('heading')).toBeVisible()
    await expect(
      page.getByRole('group', { name: '试一试' }).getByRole('button').first(),
    ).toHaveAttribute('aria-pressed', 'true')
    await page.getByRole('button', { name: '带回生活里' }).click()
    await expect(page.getByLabel('我想记下')).toBeVisible()
  }
})

test('unsaved reflections stay put when navigation is declined', async ({ page }) => {
  await page.goto('/seed/play/emotion-weather')
  await page.getByLabel('我想记下').fill('我今天像一阵小雨')
  page.once('dialog', (dialog) => dialog.dismiss())
  await page.getByRole('link', { name: '花园地图', exact: true }).first().click()
  await expect(page).toHaveURL(/\/seed\/play\/emotion-weather$/)
  await expect(page.getByLabel('我想记下')).toHaveValue('我今天像一阵小雨')
  await page.getByRole('button', { name: '保存这片小叶子' }).click()
  await page.getByRole('link', { name: '花园地图', exact: true }).first().click()
  await expect(page).toHaveURL(/\/seed$/)
})

test('parent records distinguish real-life use and deletion requires confirmation', async ({
  page,
}) => {
  await page.goto('/seed/parent')
  await page.getByLabel('记录与哪颗种子有关').selectOption('mistakes-are-clues')
  await page.getByLabel('我想记下').fill('搭积木倒下后，孩子自己换了宽底座。')
  await page.getByRole('button', { name: '保存这片小叶子' }).click()
  await expect(page.getByText('搭积木倒下后，孩子自己换了宽底座。')).toBeVisible()
  await expect(page.getByText('生活中用过', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '删除本机 Seed Grove 记录' }).click()
  await page.getByRole('button', { name: '保留记录' }).click()
  await expect(page.getByText('搭积木倒下后，孩子自己换了宽底座。')).toBeVisible()
  await page.getByRole('button', { name: '删除本机 Seed Grove 记录' }).click()
  await page.getByRole('button', { name: '确认删除 Seed Grove 记录' }).click()
  await expect(page.getByRole('heading', { name: '最近 7 天还没有记录' })).toBeVisible()
})

test('optional deeper thinking stays in one scene and never saves a discovery', async ({
  page,
}) => {
  await page.goto('/seed/think/q1')
  const scene = page.locator('.seed-scene')
  const firstScene = await scene.textContent()
  await expect(page.getByRole('region', { name: '再想一步' })).toHaveCount(0)
  await page.getByRole('button', { name: '一场小雨，有点难过' }).click()
  await page.getByRole('button', { name: '再想一步', exact: true }).click()
  await expect(page.getByRole('region', { name: '再想一步' })).toBeVisible()
  await expect(scene).toHaveText(firstScene)
  await expect(page.getByRole('button', { name: '一场小雨，有点难过' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.getByRole('button', { name: '收起这一步' }).click()
  await expect(page.getByRole('region', { name: '再想一步' })).toHaveCount(0)
  await page.getByRole('button', { name: '带回生活里' }).click()
  await expect(page.getByLabel('我想记下')).toBeVisible()
  await page.getByRole('link', { name: '我的小脚印', exact: true }).first().click()
  await expect(page.getByText('这里还没有记录')).toBeVisible()
})

test('malformed seed links offer a way home', async ({ page }) => {
  await page.goto('/seed/think/q1')
  // Vite rejects malformed encodings before serving the application. Exercise
  // the client route directly, as a static host's SPA fallback can serve it.
  await page.evaluate(() => {
    window.history.pushState({}, '', '/seed/play/%E0%A4%A')
    window.dispatchEvent(new PopStateEvent('popstate'))
  })
  await page.getByRole('link', { name: '回到花园地图', exact: true }).click()
  await expect(page).toHaveURL(/\/seed$/)
})

test('the mobile map keeps all four regions reachable without horizontal page overflow', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/seed')
  const map = page.getByRole('navigation', { name: '花园地图' })
  for (const link of await map.getByRole('link').all()) await expect(link).toBeInViewport()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  await page.screenshot({ path: testInfo.outputPath('seed-mobile-home.png'), fullPage: true })
  await map.getByRole('link', { name: /学习山谷/ }).click()
  await expect(page.getByRole('link', { name: /刚刚好的难/ })).toBeVisible()
})
