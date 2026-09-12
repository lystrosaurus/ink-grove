import { expect, test } from '@playwright/test'

const ids = [
  'emotion-weather',
  'attention-detective',
  'time-store',
  'just-right-challenge',
  'break-it-down',
  'mistakes-are-clues',
]

async function openSeed(page, id, age = '9-11') {
  await page.goto(`/seeds/${id}/index.html?age=${age}`)
  await expect(page.locator('#story')).not.toBeEmpty()
}

test('weather lets a child observe a feeling, a body signal and a chosen response without deciding how they should feel', async ({ page }) => {
  await openSeed(page, 'emotion-weather')
  await page.getByRole('button', { name: '☂ 下小雨', exact: true }).click()
  await expect(page.locator('#weather-window')).toHaveAttribute('data-weather', 'rain')
  await expect(page.locator('#reflection')).toBeHidden()
  await page.locator('#next').click()
  await page.getByRole('button', { name: '胸口有点闷', exact: true }).click()
  await expect(page.locator('#result')).toContainText('胸口有点闷')
  await page.locator('#next').click()
  await page.getByRole('button', { name: '换个舒服的位置', exact: true }).click()
  await expect(page.locator('#result')).toContainText('换个舒服的位置')
  await expect(page.locator('#reflection')).toBeVisible()
  await page.locator('#again').click()
  await expect(page.getByRole('button', { name: '☂ 下小雨', exact: true })).toBeVisible()
  await expect(page.locator('#reflection')).toBeHidden()
})

test('the observation desk supports changing distractions, matching actual features and trying again', async ({ page }) => {
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
  await page.locator('#again').click()
  await expect(page.locator('.sample[aria-pressed="true"]')).toHaveCount(0)
  await expect(page.locator('#toys')).toBeHidden()
})

test('time cannot be spent twice and a choice can be returned before making another arrangement', async ({ page }) => {
  await openSeed(page, 'time-store')
  const game = page.getByRole('button', { name: /玩游戏/ })
  await game.click()
  await page.getByRole('button', { name: /出去玩/ }).click()
  await expect(page.locator('#budget-label')).toContainText('0 分钟')
  const drawing = page.getByRole('button', { name: /画画/ })
  await drawing.click()
  await expect(drawing).toHaveAttribute('aria-pressed', 'false')
  await expect(page.locator('#result')).toContainText('还差 20 分钟')
  await expect(page.locator('.activity[aria-pressed="true"]')).toHaveCount(2)
  await page.locator('#checkout').click()
  await expect(page.locator('#planning')).toBeHidden()
  await expect(page.locator('#reflection')).toBeVisible()
  await page.locator('#again').click()
  await game.click()
  await expect(page.locator('#budget-label')).toContainText('30 分钟')
  await drawing.click()
  await expect(drawing).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('#budget-label')).toContainText('10 分钟')
})

test('the mountain task responds to the actual pattern and offers both a hint and smaller steps', async ({ page }) => {
  await openSeed(page, 'just-right-challenge')
  await page.getByRole('button', { name: '试试 12', exact: true }).click()
  await expect(page.locator('#pattern .tile').last()).toHaveText('?')
  await page.locator('#show-hint').click()
  await expect(page.locator('#hint')).toBeVisible()
  await page.getByRole('button', { name: '试试 15', exact: true }).click()
  await expect(page.locator('#pattern .tile').last()).toHaveText('15')
  await page.getByRole('button', { name: '试试 12', exact: true }).click()
  await expect(page.locator('#pattern .tile').last()).toHaveText('?')
  await page.locator('#easier').click()
  await expect(page.locator('[data-level="0"]')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('#pattern .tile')).toHaveText(['2', '4', '6', '?'])
  await page.getByRole('button', { name: '试试 8', exact: true }).click()
  await expect(page.locator('#pattern .tile').last()).toHaveText('8')
})

test('planning respects dependencies while allowing independent steps to change order', async ({ page }) => {
  await openSeed(page, 'break-it-down')
  await page.locator('#split').click()
  await expect(page.locator('.step').nth(3)).toHaveAttribute('aria-disabled', 'true')
  await page.locator('#smaller').click()
  await expect(page.locator('#small-step')).toBeVisible()
  for (const index of [0, 2, 1, 3]) await page.locator('.step').nth(index).click()
  await expect(page.locator('#path .pebble')).toHaveCount(4)
  await expect(page.locator('#path .pebble').nth(1)).toHaveAttribute('aria-label', /写一句/)
  await expect(page.locator('#reflection')).toBeVisible()
  await page.locator('#undo').click()
  await expect(page.locator('#path .pebble')).toHaveCount(3)
  await expect(page.locator('.step').nth(3)).toHaveAttribute('aria-pressed', 'false')
  await expect(page.locator('#reflection')).toBeHidden()
})

test('the experiment compares observed results and distinguishes one changed condition from several', async ({ page }) => {
  await openSeed(page, 'mistakes-are-clues', '12-15')
  await page.locator('#test').click()
  await expect(page.locator('#result')).toContainText('向一侧倾倒')
  await page.locator('#width').focus()
  await page.locator('#width').press('End')
  await page.locator('#test').click()
  await expect(page.locator('#result')).toContainText('保持站立')
  await expect(page.locator('#result')).toContainText('只改了底座宽度')
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
  await expect(page.locator('#reflection')).toBeHidden()
})

for (const [stage, age] of ['6-8', '9-11', '12-15'].entries()) {
  test(`age ${age} changes available observations, resource limits and the actual task complexity`, async ({ page }) => {
    await openSeed(page, 'emotion-weather', age)
    await expect(page.locator('#choices button')).toHaveCount([3, 4, 5][stage])
    await openSeed(page, 'attention-detective', age)
    await expect(page.locator('.sample')).toHaveCount([6, 9, 12][stage])
    const firstTarget = page.locator('.sample[data-target="true"]').first()
    await expect(firstTarget).toHaveAttribute('aria-label', [/完整叶子/, /边缘平滑、有小洞/, /锯齿边缘、有小洞/][stage])
    await openSeed(page, 'time-store', age)
    await expect(page.locator('#coins .coin')).toHaveCount([3, 6, 8][stage])
    await expect(page.locator('#coins .fixed')).toHaveCount([0, 0, 2][stage])
    await openSeed(page, 'just-right-challenge', age)
    await expect(page.locator('#pattern .tile')).toHaveText([
      ['○', '△', '○', '△', '?'],
      ['1', '3', '6', '10', '?'],
      ['2', '3', '5', '9', '17', '?'],
    ][stage])
    await openSeed(page, 'break-it-down', age)
    await page.locator('#split').click()
    await expect(page.locator('.step')).toHaveCount([3, 4, 5][stage])
    await openSeed(page, 'mistakes-are-clues', age)
    await expect(page.locator('.control:visible')).toHaveCount([1, 2, 3][stage])
  })
}

for (const id of ids) {
  test(`${id} remains usable at 320 pixels for all ages and does not load external resources`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const errors = []
    const external = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('request', (request) => {
      if (!request.url().startsWith('http://127.0.0.1:5173/') && !request.url().startsWith('data:')) external.push(request.url())
    })
    const stories = new Set()
    for (const age of ['6-8', '9-11', '12-15']) {
      await openSeed(page, id, age)
      stories.add(await page.locator('#story').textContent())
      if (id === 'break-it-down') await page.locator('#split').click()
      const width = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: innerWidth }))
      expect(width.content).toBeLessThanOrEqual(width.viewport)
      const first = page.locator('button:visible').first()
      await first.focus()
      await expect(first).toBeFocused()
      await first.press('Enter')
    }
    expect(stories.size).toBe(3)
    expect(errors).toEqual([])
    expect(external).toEqual([])
  })
}
