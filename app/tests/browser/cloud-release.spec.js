import { test, expect } from '@playwright/test'

test('the home invites readers into a hands-on synthesis even after a previous reading', async ({
  page,
}) => {
  await page.goto('/artifact/cognitive-awakening')
  await expect(page.locator('iframe')).toBeVisible()
  await page.goto('/')
  await page.getByRole('link', { name: '进入清醒行动实验室', exact: true }).click()
  await expect(page).toHaveURL(/\/artifact\/clear-thinking-lab$/)
  await expect(page.locator('iframe')).toHaveAttribute('sandbox', 'allow-scripts')
})

test('new materials have usable narrow-screen controls and visible audit signatures', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/artifact/cybernetics')
  await expect(page.frameLocator('iframe').locator('body')).toContainText('控制论')
  expect(
    await page.frames()[1].evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBe(true)
  await page.goto('/artifact/managerial-judgment')
  const signatures = page.frameLocator('iframe').locator('.audit-sign')
  await expect(signatures).toBeVisible()
  expect(
    await signatures.evaluate((element) =>
      [...element.children].every((child) => {
        const rect = child.getBoundingClientRect()
        return rect.left >= 0 && rect.right <= innerWidth
      }),
    ),
  ).toBe(true)
})
