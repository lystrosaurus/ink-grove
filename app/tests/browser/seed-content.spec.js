import { expect, test } from '@playwright/test'

const ids = [
  'emotion-weather',
  'attention-detective',
  'time-store',
  'just-right-challenge',
  'break-it-down',
  'mistakes-are-clues',
]

async function openSeed(page, id, suffix = '') {
  await page.goto(`/seeds/${id}/index.html${suffix}`)
  await expect(page.locator('#story')).not.toBeEmpty()
}

test('weather connects a feeling, body signal and chosen response in the same picnic scene', async ({
  page,
}) => {
  await openSeed(page, 'emotion-weather')
  await page.getByRole('button', { name: '☂ 下小雨', exact: true }).click()
  await expect(page.locator('#weather-window')).toHaveAttribute('data-weather', 'rain')
  await expect(page.locator('#reflection')).toBeHidden()
  await page.locator('#next').click()
  await page.getByRole('button', { name: '胸口有点闷', exact: true }).click()
  await expect(page.locator('#result')).toContainText('胸口有点闷')
  await page.locator('#next').click()
  await page.getByRole('button', { name: '找人陪一陪', exact: true }).click()
  await expect(page.locator('#reflection')).toBeVisible()
  await page.locator('#again').click()
  await expect(page.getByRole('button', { name: '☂ 下小雨', exact: true })).toBeVisible()
  await expect(page.locator('#reflection')).toBeHidden()
  await page.getByText('再想一步', { exact: true }).click()
  await page.getByRole('button', { name: '他们不想和我玩', exact: true }).click()
  await expect(page.locator('#deeper-result')).toContainText('还不能确定')
  await page.getByRole('button', { name: '下雨了，野餐取消了', exact: true }).click()
  await expect(page.locator('#deeper-result')).toContainText('看见或核实')
})

test('the observation desk can change its question without changing its specimens', async ({
  page,
}) => {
  await openSeed(page, 'attention-detective')
  await page.locator('#tidy').click()
  await expect(page.locator('#toys')).toBeHidden()
  await page.locator('#focus').click()
  await expect(page.locator('#surface')).toHaveClass(/focused/)
  const other = page.locator('.sample[data-target="false"]').first()
  await other.click()
  await expect(other).toHaveAttribute('aria-pressed', 'false')
  for (const leaf of await page.locator('.sample[data-target="true"]').all()) await leaf.click()
  await expect(page.locator('#reflection')).toBeVisible()
  await expect(page.locator('.sample[aria-pressed="true"]')).toHaveCount(3)
  const specimens = await page
    .locator('.sample')
    .evaluateAll((items) => items.map((item) => item.getAttribute('aria-label')))
  await page.getByText('再想一步', { exact: true }).click()
  await page.locator('#change-question').click()
  await expect(page.locator('.sample[aria-pressed="true"]')).toHaveCount(0)
  await expect(page.locator('#reflection')).toBeHidden()
  expect(
    await page
      .locator('.sample')
      .evaluateAll((items) => items.map((item) => item.getAttribute('aria-label'))),
  ).toEqual(specimens)
  await expect(page.locator('.sample[data-target="true"]')).toHaveCount(2)
  for (const leaf of await page.locator('.sample[data-target="true"]').all()) await leaf.click()
  await expect(page.locator('#reflection')).toBeVisible()
  await page.locator('#again').click()
  await expect(page.locator('.sample[aria-pressed="true"]')).toHaveCount(0)
  await expect(page.locator('#toys')).toBeHidden()
})

test('time cannot be spent twice and reserving time requires an actual exchange', async ({
  page,
}) => {
  await openSeed(page, 'time-store')
  const game = page.getByRole('button', { name: /玩游戏/ })
  const drawing = page.getByRole('button', { name: /画画/ })
  await game.click()
  await drawing.click()
  await expect(page.locator('#budget-label')).toHaveText(/^还可以安排 0 分钟/)
  const book = page.getByRole('button', { name: /读书/ })
  await book.click()
  await expect(book).toHaveAttribute('aria-pressed', 'false')
  await expect(page.locator('#result')).toContainText('还差 10 分钟')
  await page.getByText('再想一步', { exact: true }).click()
  await page.locator('#reserve').click()
  await expect(page.locator('#reserve')).toHaveAttribute('aria-pressed', 'false')
  await expect(page.locator('.activity[aria-pressed="true"]')).toHaveCount(2)
  await drawing.click()
  await page.locator('#reserve').click()
  await expect(page.locator('#reserve')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('#coins .fixed')).toHaveCount(1)
  await expect(page.locator('#budget-label')).toHaveText(/^还可以安排 0 分钟/)
  await page.locator('#checkout').click()
  await expect(page.locator('#planning')).toBeHidden()
  await expect(page.locator('#result')).toContainText('预留了 10 分钟')
  await expect(page.locator('#reflection')).toBeVisible()
  await page.locator('#again').click()
  await game.click()
  await expect(page.locator('#budget-label')).toHaveText(/^还可以安排 20 分钟/)
})

test('a small mountain step offers grouping help and an optional related pattern without replacing the first attempt', async ({
  page,
}) => {
  await openSeed(page, 'just-right-challenge')
  await page.getByRole('button', { name: '试试 △', exact: true }).click()
  await expect(page.locator('#pattern .tile').last()).toHaveText('?')
  await page.locator('#show-hint').click()
  await expect(page.locator('#hint')).toBeVisible()
  await page.locator('#easier').click()
  await expect(page.locator('#small-step')).toBeVisible()
  await page.getByRole('button', { name: '试试 ○', exact: true }).click()
  await expect(page.locator('#pattern .tile').last()).toHaveText('○')
  await page.getByRole('button', { name: '试试 △', exact: true }).click()
  await expect(page.locator('#pattern .tile').last()).toHaveText('?')
  await page.getByRole('button', { name: '试试 ○', exact: true }).click()
  await expect(page.locator('#pattern .tile').last()).toHaveText('○')
  await page.getByText('再想一步', { exact: true }).click()
  await page.getByRole('button', { name: '新路标试试 ○', exact: true }).click()
  await expect(page.locator('#deeper-pattern .tile').last()).toHaveText('?')
  await page.getByRole('button', { name: '新路标试试 △', exact: true }).click()
  await expect(page.locator('#deeper-pattern .tile').last()).toHaveText('△')
  await page.getByRole('button', { name: '新路标试试 ○', exact: true }).click()
  await expect(page.locator('#deeper-pattern .tile').last()).toHaveText('?')
  await page.getByRole('button', { name: '新路标试试 △', exact: true }).click()
  await expect(page.locator('#deeper-pattern .tile').last()).toHaveText('△')
  await expect(page.locator('#pattern .tile').last()).toHaveText('○')
})

test('a seed display plan respects dependencies and permits independent drawing and writing to change order', async ({
  page,
}) => {
  await openSeed(page, 'break-it-down')
  await page.locator('#split').click()
  await expect(page.locator('.step').nth(3)).toHaveAttribute('aria-disabled', 'true')
  await page
    .locator('.step')
    .nth(3)
    .evaluate((button) => button.click())
  await expect(page.locator('#path .pebble')).toHaveCount(0)
  await page.locator('#smaller').click()
  await expect(page.locator('#small-step')).toBeVisible()
  for (const index of [0, 2, 1, 3]) await page.locator('.step').nth(index).click()
  await expect(page.locator('#path .pebble')).toHaveCount(4)
  await expect(page.locator('#path .pebble').nth(1)).toHaveAttribute('aria-label', /写一句/)
  await expect(page.locator('#reflection')).toBeVisible()
  await page.getByText('再想一步', { exact: true }).click()
  await page.locator('#swap').click()
  await expect(page.locator('#path .pebble').nth(1)).toHaveAttribute('aria-label', /画/)
  await expect(page.locator('#path .pebble')).toHaveCount(4)
  await page.locator('#undo').click()
  await expect(page.locator('#path .pebble')).toHaveCount(3)
  await expect(page.locator('.step').nth(3)).toHaveAttribute('aria-pressed', 'false')
  await expect(page.locator('#reflection')).toBeHidden()
})

test('the experiment compares a single changed condition and optional wind on the same tower', async ({
  page,
}) => {
  await openSeed(page, 'mistakes-are-clues')
  await expect(page.locator('#wind')).toBeHidden()
  await page.locator('#test').click()
  await expect(page.locator('#result')).toContainText('向一侧倾倒')
  await page.locator('#width').focus()
  await page.locator('#width').press('End')
  await page.locator('#test').click()
  await expect(page.locator('#result')).toContainText('保持站立')
  await expect(page.locator('#result')).toContainText('只改了底座宽度')
  await page.getByText('再想一步', { exact: true }).click()
  await page.locator('#height').focus()
  await page.locator('#height').press('End')
  await page.locator('#wind').focus()
  await page.locator('#wind').press('End')
  await page.locator('#test').click()
  await expect(page.locator('#result')).toContainText('同时改了 2 个条件')
  await expect(page.locator('#log li')).toHaveCount(3)
  await page.locator('#reset').click()
  await expect(page.locator('#log li')).toHaveCount(0)
  await expect(page.locator('#width')).toHaveValue('1')
  await expect(page.locator('#wind')).toHaveValue('0')
  await expect(page.locator('#reflection')).toBeHidden()
})

for (const id of ids) {
  test(`${id} ignores legacy age URLs and supports keyboard and 320px with optional depth`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 720 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const errors = [],
      external = [],
      experiences = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('request', (request) => {
      if (!request.url().startsWith('http://127.0.0.1:5173/') && !request.url().startsWith('data:'))
        external.push(request.url())
    })
    for (const suffix of ['', '?age=6-8', '?age=9-11', '?age=12-15', '?age=unknown']) {
      await openSeed(page, id, suffix)
      if (id === 'break-it-down') await page.locator('#split').click()
      experiences.push(await page.locator('main').innerText())
      const depth = page.locator('summary').filter({ hasText: '再想一步' })
      await depth.focus()
      await depth.press('Enter')
      await expect(page.locator('details')).toHaveAttribute('open', '')
      const width = await page.evaluate(() => ({
        content: document.documentElement.scrollWidth,
        viewport: innerWidth,
      }))
      expect(width.content).toBeLessThanOrEqual(width.viewport)
      const first = page.locator('button:visible').first()
      await first.focus()
      await expect(first).toBeFocused()
      await first.press('Enter')
    }
    expect(new Set(experiences).size).toBe(1)
    expect(errors).toEqual([])
    expect(external).toEqual([])
  })
}
