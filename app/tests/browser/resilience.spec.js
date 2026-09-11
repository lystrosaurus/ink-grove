import { test, expect } from '@playwright/test'

const STORAGE_KEY = 'ink-grove:garden:v1'
const localId = 'local-resilience'
const titleInput = (page) => page.getByRole('textbox', { name: '作品标题', exact: true })
const bodyInput = (page) => page.getByRole('textbox', { name: '作品内容', exact: true })
const readGarden = (page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key)), STORAGE_KEY)

async function seedLocal(page, body = '# 初始正文\n\n值得继续思考。') {
  await page.goto('/')
  await page.evaluate(
    ({ key, id, body }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          schemaVersion: 1,
          favorites: [id],
          visits: {},
          collections: [
            {
              id: 'collection-resilience',
              title: '我的专题',
              description: '',
              artifactIds: [id],
              color: '#526747',
            },
          ],
          artifacts: [
            {
              schemaVersion: 1,
              id,
              slug: id,
              title: '已经保存的思考',
              subtitle: '草稿恢复验收',
              artifactType: 'idea',
              sourceType: 'personal',
              author: '我',
              topics: ['个人主题'],
              concepts: ['反馈'],
              visualStyle: 'personal',
              related: [],
              connections: [],
              artifact: { renderer: 'markdown', content: body },
              cover: '',
              createdAt: '2026-09-11T06:00:00.000Z',
              provenance: { generatedBy: 'human', sources: [], derivedFrom: [] },
            },
          ],
        }),
      )
    },
    { key: STORAGE_KEY, id: localId, body },
  )
}

async function blockGardenWrites(page) {
  await page.evaluate((key) => {
    window.restoreGardenWrites = () => {
      Storage.prototype.setItem = original
    }
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (name, value) {
      if (this === localStorage && name === key)
        throw new DOMException('Test quota exceeded', 'QuotaExceededError')
      return original.call(this, name, value)
    }
  }, STORAGE_KEY)
}

test('editing and new-work drafts survive immediate refresh without mixing contexts', async ({
  page,
}) => {
  await seedLocal(page)
  await page.goto(`/create?edit=${localId}`)
  await titleInput(page).fill('还没发布的编辑标题')
  await bodyInput(page).fill('# 编辑到一半\n\n刷新后要继续这一句。')
  await page.reload()
  await expect(titleInput(page)).toHaveValue('还没发布的编辑标题')
  await expect(bodyInput(page)).toHaveValue('# 编辑到一半\n\n刷新后要继续这一句。')
  await page.goto('/create')
  await expect(titleInput(page)).toHaveValue('')
  await bodyInput(page).fill('这是另一份新作草稿。')
  await page.reload()
  await expect(bodyInput(page)).toHaveValue('这是另一份新作草稿。')
  await page.goto(`/create?edit=${localId}`)
  await expect(bodyInput(page)).toHaveValue('# 编辑到一半\n\n刷新后要继续这一句。')
  expect((await readGarden(page)).artifacts[0].title).toBe('已经保存的思考')
})

test('a synthesis draft restores its changed title, body and sources from a seeded route', async ({
  page,
}) => {
  await page.goto('/create?mode=synthesis&from=cognitive-awakening')
  await titleInput(page).fill('让反馈成为新的连接')
  await page
    .locator('.source-options')
    .getByRole('button', { name: '刻意练习', exact: true })
    .click()
  await bodyInput(page).fill('# 尚未完成的贯通\n\n两份思想正在对话。')
  await page.reload()
  await expect(titleInput(page)).toHaveValue('让反馈成为新的连接')
  await expect(bodyInput(page)).toHaveValue('# 尚未完成的贯通\n\n两份思想正在对话。')
  await expect(page.locator('.source-options .selected')).toHaveCount(2)
  await page.goto('/create?from=cognitive-awakening&mode=synthesis')
  await expect(bodyInput(page)).toHaveValue('# 尚未完成的贯通\n\n两份思想正在对话。')
  await expect(page.locator('.source-options .selected')).toHaveCount(2)
})

test('quota failures keep the editor and recoverable draft, then one successful retry creates one work', async ({
  page,
}) => {
  await page.goto('/create')
  await titleInput(page).fill('配额失败仍保留的创作')
  await bodyInput(page).fill('# 不能丢掉的正文\n\n继续编辑，比丢失更重要。')
  await blockGardenWrites(page)
  await page.getByRole('button', { name: '种进花园', exact: true }).click()
  await expect(page).toHaveURL('/create')
  await expect(bodyInput(page)).toHaveValue('# 不能丢掉的正文\n\n继续编辑，比丢失更重要。')
  await page.reload()
  await expect(titleInput(page)).toHaveValue('配额失败仍保留的创作')
  await expect(bodyInput(page)).toHaveValue('# 不能丢掉的正文\n\n继续编辑，比丢失更重要。')
  await blockGardenWrites(page)
  await page.getByRole('button', { name: '种进花园', exact: true }).click()
  await page.getByRole('button', { name: '种进花园', exact: true }).click()
  await expect(page).toHaveURL('/create')
  await page.evaluate(() => window.restoreGardenWrites())
  await page.getByRole('button', { name: '种进花园', exact: true }).click()
  await expect(page).toHaveURL(/\/artifact\/local-/)
  expect((await readGarden(page)).artifacts).toHaveLength(1)
  await page.goto('/create')
  await expect(titleInput(page)).toHaveValue('')
})

test('failed deletion keeps the reader, and a successful retry removes every reference without ghost visits', async ({
  page,
}) => {
  await seedLocal(page)
  await page.goto(`/artifact/${localId}`)
  await expect(page.locator('.markdown-content')).toContainText('初始正文')
  await blockGardenWrites(page)
  await page.getByRole('button', { name: '更多作品操作', exact: true }).click()
  await page.getByRole('button', { name: '删除作品', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: '移除这份作品？' })
  await dialog.getByRole('button', { name: '确认移除', exact: true }).click()
  await expect(page).toHaveURL(`/artifact/${localId}`)
  await expect(dialog).toBeVisible()
  expect((await readGarden(page)).artifacts).toHaveLength(1)
  await page.evaluate(() => window.restoreGardenWrites())
  await dialog.getByRole('button', { name: '确认移除', exact: true }).click()
  await expect(page).toHaveURL('/explore')
  const garden = await readGarden(page)
  expect(garden.artifacts).toEqual([])
  expect(garden.favorites).toEqual([])
  expect(garden.collections[0].artifactIds).toEqual([])
  expect(garden.visits[localId]).toBeUndefined()
  await page.reload()
  expect((await readGarden(page)).visits[localId]).toBeUndefined()
})

test('markdown internal links navigate in the same tab while external and unsafe URLs remain separated', async ({
  page,
  context,
}) => {
  await seedLocal(
    page,
    '# 连接可以被走通\n\n[走向认知觉醒](/artifact/cognitive-awakening)\n\n[外部资料](https://example.com/)\n\n[不可执行](javascript:alert%281%29)',
  )
  await page.goto(`/artifact/${localId}`)
  await expect(page.getByRole('link', { name: '外部资料', exact: true })).toHaveAttribute(
    'target',
    '_blank',
  )
  expect(await page.locator('.markdown-content a[href^="javascript:"]').count()).toBe(0)
  await page.getByRole('link', { name: '走向认知觉醒', exact: true }).click()
  await expect(page).toHaveURL('/artifact/cognitive-awakening')
  await expect(page.locator('iframe')).toBeVisible()
  expect(context.pages()).toHaveLength(1)
})
