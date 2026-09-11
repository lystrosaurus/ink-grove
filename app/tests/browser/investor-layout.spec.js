import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { prepareArtifactHtml } from '../../../scripts/build-content.mjs'

const source = await readFile(
  new URL('../../../content/artifacts/intelligent-investor/index.html', import.meta.url),
  'utf8',
)

test('portfolio asset bars and their labels remain visible in a narrow sandbox reader', async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.setContent(
      '<style>body{margin:0}iframe{width:100%;height:900px;border:0}</style><iframe title="聪明的投资者" sandbox="allow-scripts"></iframe>',
    )
    await page.locator('iframe').evaluate((frame, html) => {
      frame.srcdoc = html
    }, prepareArtifactHtml(source))
    const reader = page.frameLocator('iframe')
    await expect(reader.locator('.bar-row')).toHaveCount(3)
    await expect(reader.locator('.bar-row > b')).toHaveText(['股票', '高质量债券', '现金 / 流动性'])
    await expect(reader.locator('.bar-row > span')).toHaveText(['风险资产', '稳定器', '选择权'])
    const rows = await reader.locator('.bar-row').evaluateAll((elements) =>
      elements.map((row) => {
        const bar = row.querySelector('.bar').getBoundingClientRect()
        const fill = row.querySelector('.fill').getBoundingClientRect()
        const container = row.parentElement.getBoundingClientRect()
        const items = [row, ...row.children].map((element) => element.getBoundingClientRect())
        return {
          bar: bar.width,
          fill: fill.width,
          contained: items.every(
            (rect) => rect.left >= container.left - 1 && rect.right <= container.right + 1,
          ),
        }
      }),
    )
    for (const row of rows) {
      expect(row.bar, `bar at ${width}px`).toBeGreaterThan(0)
      expect(row.fill, `filled bar at ${width}px`).toBeGreaterThan(0)
      expect(row.contained, `labels and bar at ${width}px`).toBe(true)
    }
  }
})
