import { test, expect } from '@playwright/test'

test('the adult dark palette survives a delayed base stylesheet and keeps the editorial routes readable', async ({
  page,
}) => {
  await page.route('**/src/styles.css', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 350))
    await route.continue()
  })
  await page.goto('/')
  await page.getByRole('button', { name: '切换主题，当前浅色', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect
    .poll(() =>
      page.locator('html').evaluate((element) => getComputedStyle(element).backgroundColor),
    )
    .toBe('rgb(24, 30, 25)')
  const palette = await page
    .locator('.reading-edition-path')
    .first()
    .evaluate((element) => ({
      background: getComputedStyle(element).backgroundColor,
      color: getComputedStyle(element).color,
    }))
  expect(palette.background).toBe('rgb(24, 30, 25)')
  expect(palette.color).toBe('rgb(213, 221, 203)')
  await expect(page.locator('html')).toHaveCSS('font-family', /DM Sans Variable/)
})
