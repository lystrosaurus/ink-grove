import { test, expect } from '@playwright/test'
import { createArtifact, emptyGarden, exportGarden } from '../../src/lib/garden.js'

test('a reference opens only through the visible parent link while its HTML keeps popup isolation', async ({
  page,
  context,
}) => {
  await context.route('https://example.com/reference', (route) =>
    route.fulfill({ contentType: 'text/html; charset=utf-8', body: '<h1>已打开参考资料</h1>' }),
  )
  const artifact = createArtifact({
    title: '引用交互',
    renderer: 'html',
    body: `<html><body><h1>引用交互</h1><a href="https://example.com/reference" target="_blank">查看参考资料</a>
      <script>window.addEventListener('message', (event) => {
        if (event.data?.type !== 'reference-test:replace') return;
        parent.postMessage({type: 'ink-grove:keydown', key: 'Escape'}, '*');
        parent.postMessage({type: 'ink-grove:reference', href: 'https://example.com/replaced'}, '*');
        parent.postMessage({type: 'reference-test:done'}, '*');
      });</script></body></html>`,
  })
  await page.goto('/')
  await page.evaluate(
    (data) => localStorage.setItem('ink-grove:garden:v1', data),
    exportGarden({ ...emptyGarden(), artifacts: [artifact] }),
  )
  await page.goto(`/artifact/${artifact.id}`)
  await page.frameLocator('iframe').getByRole('link', { name: '查看参考资料', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: '参考资料', exact: true })
  await expect(dialog).toContainText('example.com')
  await page.locator('iframe').evaluate(async (iframe) => {
    const delivered = new Promise((resolve) => {
      window.addEventListener('message', function listener(event) {
        if (event.source === iframe.contentWindow && event.data?.type === 'reference-test:done') {
          window.removeEventListener('message', listener)
          requestAnimationFrame(() => resolve())
        }
      })
    })
    iframe.contentWindow.postMessage({ type: 'reference-test:replace' }, '*')
    await delivered
  })
  await expect(dialog.getByRole('link', { name: '打开参考资料', exact: true })).toHaveAttribute(
    'href',
    'https://example.com/reference',
  )
  expect(context.pages()).toHaveLength(1)
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await page.frameLocator('iframe').getByRole('link', { name: '查看参考资料', exact: true }).click()
  await expect(dialog).toBeVisible()
  const newPage = context.waitForEvent('page', { timeout: 4000 })
  await dialog.getByRole('link', { name: '打开参考资料', exact: true }).click()
  const reference = await newPage
  await expect(reference.getByRole('heading')).toHaveText('已打开参考资料')
  expect(await reference.evaluate(() => window.opener)).toBeNull()
  await expect(page.locator('iframe')).toHaveAttribute('sandbox', 'allow-scripts')
  await expect(page).toHaveURL(new RegExp(`/artifact/${artifact.id}$`))
})
