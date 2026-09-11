import { test, expect } from '@playwright/test'
import { mkdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const STORAGE_KEY = 'ink-grove:garden:v1'
const catalog = JSON.parse(
  await readFile(new URL('../../../content/catalog.json', import.meta.url), 'utf8'),
)
const screenshotDir = fileURLToPath(new URL('../../../artifacts/screenshots/', import.meta.url))
const readGarden = (page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key)), STORAGE_KEY)
const readRaw = (page) => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)

async function settleImages(page) {
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all(
      [...document.images].map((image) => {
        image.loading = 'eager'
        return image.decode().catch(() => {})
      }),
    )
  })
}

async function createMarkdown(page, title = '验收：把发现种进花园') {
  await page.goto('/create')
  await page.getByRole('textbox', { name: '作品标题', exact: true }).fill(title)
  await page.getByLabel('一句话描述').fill('保留中文、结构与我自己的判断。')
  await page
    .getByRole('textbox', { name: '作品内容', exact: true })
    .fill('# 独立思考\n\n第一条可验证的发现。\n\n- 观察\n- 行动\n- 反馈')
  await page.getByLabel('主题', { exact: true }).fill('验收主题，反馈')
  await page.getByRole('button', { name: '种进花园', exact: true }).click()
  await expect(page).toHaveURL(/\/artifact\/local-/)
  await expect(
    page.locator('.markdown-content').getByRole('heading', { name: '独立思考' }),
  ).toBeVisible()
  return (await readGarden(page)).artifacts.find((artifact) => artifact.title === title)
}

async function openData(page) {
  await page.goto('/')
  await page.getByRole('button', { name: '我的花园数据' }).click()
  const dialog = page.getByRole('dialog', { name: '照料你的花园' })
  await expect(dialog).toBeVisible()
  return dialog
}

async function uploadBackup(dialog, backup, name = 'garden-backup.json') {
  await dialog.locator('input[type=file]').setInputFiles({
    name,
    mimeType: 'application/json',
    buffer: Buffer.from(typeof backup === 'string' ? backup : JSON.stringify(backup)),
  })
}

async function downloadBackup(page, dialog) {
  const pendingDownload = page.waitForEvent('download')
  await dialog.getByRole('button', { name: '导出花园备份', exact: true }).click()
  const download = await pendingDownload
  expect(download.suggestedFilename()).toMatch(/^ink-grove-\d{4}-\d{2}-\d{2}\.json$/)
  return JSON.parse(await readFile(await download.path(), 'utf8'))
}

test('home presents a knowledge garden and connections render a usable graph', async ({ page }) => {
  await mkdir(screenshotDir, { recursive: true })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('思想在此相遇，知识由此成林。')
  await expect(page.getByRole('link', { name: /探索《贯通思考篇》/ })).toHaveAttribute(
    'href',
    '/artifact/personal-growth-os',
  )
  await expect(page.getByRole('link', { name: '走进知识花园' })).toHaveAttribute('href', '/explore')
  await settleImages(page)
  await page.screenshot({
    path: `${screenshotDir}/home-desktop.png`,
    fullPage: true,
    animations: 'disabled',
  })
  await page.getByRole('link', { name: '发现思想之间的连接' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('思想之间，正在发生什么？')
  await expect(page.locator('.graph-node')).toHaveCount(catalog.artifacts.length)
  await expect(page.locator('.knowledge-graph g > title').first()).toContainText('→')
  await settleImages(page)
  await page.screenshot({
    path: `${screenshotDir}/connections-desktop.png`,
    fullPage: true,
    animations: 'disabled',
  })
  await page.getByRole('button', { name: '查看认知觉醒的连接', exact: true }).click()
  await expect(
    page.locator('.network-sidebar').getByRole('heading', { name: '认知觉醒', exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('combobox', { name: '按作品查看连接' })).toHaveValue(
    'cognitive-awakening',
  )
})

test('explore combines type, topic and all search words; clearing an empty result survives refresh', async ({
  page,
}) => {
  await page.goto('/explore')
  await expect(page.locator('.artifact-card')).toHaveCount(catalog.artifacts.length)
  await page
    .getByRole('group', { name: '作品类型' })
    .getByRole('button', { name: '书籍', exact: true })
    .click()
  await page.locator('.topic-filter').getByRole('button', { name: '学习', exact: true }).click()
  await page.getByRole('textbox', { name: '在作品中搜索' }).fill('艾利克森')
  expect(new URL(page.url()).searchParams.get('q')).toBe('艾利克森')
  await expect(page.locator('.artifact-card')).toHaveCount(2)
  await expect(page.locator('.artifact-card h3')).toHaveText(['刻意练习', '刻意练习 · 知识系统'])
  await page.reload()
  await expect(page.locator('.artifact-card')).toHaveCount(2)
  await expect(page.getByRole('textbox', { name: '在作品中搜索' })).toHaveValue('艾利克森')
  await page.getByRole('textbox', { name: '在作品中搜索' }).fill('反馈 系统 艾利克森')
  await expect(page.locator('.artifact-card')).toHaveCount(1)
  await expect(page.locator('.artifact-card h3')).toHaveText('刻意练习 · 知识系统')
  await page.getByRole('textbox', { name: '在作品中搜索' }).fill('反馈 完全不存在的概念')
  await expect(page.getByRole('heading', { name: '这片园地，等待新的种子' })).toBeVisible()
  await page.getByRole('button', { name: '清除筛选', exact: true }).click()
  await expect(page.locator('.artifact-card')).toHaveCount(catalog.artifacts.length)
  await page.reload()
  await expect(page.locator('.artifact-card')).toHaveCount(catalog.artifacts.length)
})

test('global search matches author and concept together and opens the matching artifact', async ({
  page,
}) => {
  await page.goto('/')
  await page.keyboard.press('Control+k')
  const dialog = page.getByRole('dialog', { name: '沿着好奇心，找一个入口' })
  await expect(dialog.getByRole('textbox', { name: '搜索关键词' })).toBeFocused()
  await dialog.getByRole('textbox', { name: '搜索关键词' }).fill('周岭 反馈')
  await expect(
    dialog.locator('.search-result[href="/artifact/cognitive-awakening"]'),
  ).toContainText('认知觉醒')
  await dialog.locator('.search-result[href="/artifact/cognitive-awakening"]').click()
  await expect(page).toHaveURL('/artifact/cognitive-awakening')
  await expect(dialog).toHaveCount(0)
})

test('markdown creation can be read, refreshed, edited and kept under the same identity', async ({
  page,
}) => {
  const original = await createMarkdown(page)
  await page.reload()
  await expect(page.locator('.markdown-content')).toContainText('第一条可验证的发现。')
  await page.mouse.move(850, 70)
  await page.getByRole('button', { name: '更多作品操作' }).click()
  await page.getByRole('link', { name: '编辑作品', exact: true }).click()
  await expect(page.getByRole('textbox', { name: '作品标题', exact: true })).toHaveValue(
    original.title,
  )
  await page.getByRole('textbox', { name: '作品标题', exact: true }).fill('验收：更新后的思考')
  await page
    .getByRole('textbox', { name: '作品内容', exact: true })
    .fill('# 第二轮理解\n\n修改之后，仍能看见自己的推理。')
  await page.getByRole('button', { name: '保存作品', exact: true }).click()
  await expect(page).toHaveURL(`/artifact/${original.id}`)
  await page.reload()
  await expect(
    page.locator('.markdown-content').getByRole('heading', { name: '第二轮理解' }),
  ).toBeVisible()
  const garden = await readGarden(page)
  expect(garden.artifacts).toHaveLength(1)
  expect(garden.artifacts[0]).toMatchObject({
    id: original.id,
    slug: original.slug,
    createdAt: original.createdAt,
    title: '验收：更新后的思考',
    topics: ['验收主题', '反馈'],
  })
})

test('synthesis scaffolds two sources and persists provenance and directed graph relationships', async ({
  page,
}) => {
  await page.goto('/create?mode=synthesis')
  await page.getByRole('textbox', { name: '作品标题', exact: true }).fill('为什么理解需要反馈？')
  const options = page.locator('.source-options')
  await options.getByRole('button', { name: '认知觉醒', exact: true }).click()
  await expect(page.getByRole('button', { name: '整理贯通草稿', exact: true })).toBeDisabled()
  await options.getByRole('button', { name: '刻意练习', exact: true }).click()
  await page.getByRole('button', { name: '整理贯通草稿', exact: true }).click()
  const editor = page.getByRole('textbox', { name: '作品内容', exact: true })
  const draft = await editor.inputValue()
  expect(draft).toContain('### 认知觉醒')
  expect(draft).toContain('### 刻意练习')
  expect(draft).toContain('**反馈**')
  expect(draft).toContain('[认知觉醒](/artifact/cognitive-awakening)')
  await editor.fill(`${draft}\n\n我的判断：反馈让理解接受行动的检验。`)
  await page.getByRole('button', { name: '种进花园', exact: true }).click()
  await expect(page).toHaveURL(/\/artifact\/local-/)
  const artifact = (await readGarden(page)).artifacts[0]
  expect(artifact.artifactType).toBe('synthesis')
  expect(artifact.provenance.derivedFrom).toEqual(['cognitive-awakening', 'deliberate-practice'])
  expect(artifact.connections).toEqual([
    { target: 'cognitive-awakening', type: 'derived-from', label: '思考来源', concept: '' },
    { target: 'deliberate-practice', type: 'derived-from', label: '思考来源', concept: '' },
  ])
  await page.reload()
  await expect(page.locator('.markdown-content')).toContainText(
    '我的判断：反馈让理解接受行动的检验。',
  )
  await page.goto(`/connections?artifact=${artifact.id}`)
  await expect(page.locator('.graph-node')).toHaveCount(3)
  await expect(page.locator('.network-sidebar')).toContainText('2 条思想连接')
  await page.getByRole('button', { name: '连接列表', exact: true }).click()
  await expect(page.locator('.connection-list .edge-row')).toHaveCount(2)
  await expect(page.locator('.connection-list')).toContainText('源自')
  await expect(page.locator('.connection-list')).toContainText('认知觉醒')
  await expect(page.locator('.connection-list')).toContainText('刻意练习')
})

test('collections support creating, editing membership and refreshing saved data', async ({
  page,
}) => {
  await page.goto('/collections')
  await page.getByRole('button', { name: '创建集合', exact: true }).click()
  let dialog = page.getByRole('dialog', { name: '开辟一条新的小径' })
  await dialog.getByLabel('集合名称').fill('关于反馈的探索')
  await dialog.getByLabel('写一句引言').fill('让认知和训练互相解释。')
  await dialog.getByRole('checkbox', { name: '认知觉醒', exact: true }).check()
  await dialog.getByRole('checkbox', { name: '刻意练习', exact: true }).check()
  await dialog.getByRole('button', { name: '保存集合', exact: true }).click()
  await expect(page).toHaveURL(/\/collections\/collection-/)
  const collectionId = new URL(page.url()).pathname.split('/').at(-1)
  await expect(page.locator('.artifact-card')).toHaveCount(2)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('关于反馈的探索')
  await page.getByRole('button', { name: '编辑集合' }).click()
  dialog = page.getByRole('dialog', { name: '照料这个集合' })
  await dialog.getByLabel('集合名称').fill('从反馈走向自由')
  await dialog.getByRole('checkbox', { name: '刻意练习', exact: true }).uncheck()
  await dialog.getByRole('checkbox', { name: '纳瓦尔宝典', exact: true }).check()
  await dialog.getByRole('button', { name: '保存集合', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('从反馈走向自由')
  await expect(page.locator('.artifact-card h3')).toHaveText(['认知觉醒', '纳瓦尔宝典'])
  expect((await readGarden(page)).collections).toEqual([
    {
      id: collectionId,
      title: '从反馈走向自由',
      description: '让认知和训练互相解释。',
      artifactIds: ['cognitive-awakening', 'naval-almanack'],
      color: '#4c6851',
    },
  ])
})

test('an exported backup restores its exact data in a separate browser context', async ({
  page,
  browser,
}) => {
  const artifact = await createMarkdown(page, '可以迁移的中文思考')
  await page.mouse.move(850, 70)
  await page.getByRole('button', { name: '收藏作品', exact: true }).click()
  const dialog = await openData(page)
  const original = await downloadBackup(page, dialog)
  expect(original.artifacts[0].title).toBe('可以迁移的中文思考')
  expect(original.favorites).toEqual([artifact.id])
  expect(original.visits[artifact.id]).toBeDefined()
  const otherContext = await browser.newContext({ baseURL: 'http://127.0.0.1:5173' })
  try {
    const otherPage = await otherContext.newPage()
    const otherDialog = await openData(otherPage)
    expect(await readRaw(otherPage)).toBeNull()
    await uploadBackup(otherDialog, original)
    await expect(otherDialog.getByRole('heading', { name: '备份已读取，等待恢复' })).toBeVisible()
    await otherDialog.getByRole('button', { name: '确认恢复', exact: true }).click()
    await expect(otherDialog).toHaveCount(0)
    expect(await readGarden(otherPage)).toEqual(original)
    await otherPage.reload()
    expect(await readGarden(otherPage)).toEqual(original)
    await otherPage.goto('/explore')
    await expect(
      otherPage.getByRole('heading', { name: '可以迁移的中文思考', exact: true }),
    ).toBeVisible()
    expect(await readGarden(page)).toEqual(original)
  } finally {
    await otherContext.close()
  }
})

test('invalid backup versions and malformed JSON leave current data intact', async ({ page }) => {
  await createMarkdown(page, '不应被无效备份覆盖')
  const dialog = await openData(page)
  const before = await readRaw(page)
  await uploadBackup(dialog, { ...JSON.parse(before), schemaVersion: 999 })
  await expect(dialog.getByRole('alert')).toContainText('不支持此备份版本')
  await expect(dialog.getByRole('button', { name: '确认恢复', exact: true })).toHaveCount(0)
  expect(await readRaw(page)).toBe(before)
  await uploadBackup(dialog, '{broken JSON')
  await expect(dialog.getByRole('alert')).toContainText('未导入')
  expect(await readRaw(page)).toBe(before)
  await dialog.getByRole('button', { name: '关闭', exact: true }).click()
  await page.goto('/explore')
  await expect(page.getByRole('heading', { name: '不应被无效备份覆盖', exact: true })).toBeVisible()
})

test('quota failure during backup restore preserves both stored and in-memory gardens atomically', async ({
  page,
}) => {
  await createMarkdown(page, '配额失败仍应保留的思考')
  const dialog = await openData(page)
  const before = await readRaw(page)
  const replacement = {
    schemaVersion: 1,
    favorites: ['naval-almanack'],
    visits: {},
    collections: [],
    artifacts: [],
  }
  await uploadBackup(dialog, replacement)
  await expect(dialog.getByRole('button', { name: '确认恢复', exact: true })).toBeVisible()
  await page.evaluate((key) => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (name, value) {
      if (this === localStorage && name === key)
        throw new DOMException('Test quota exceeded', 'QuotaExceededError')
      return original.call(this, name, value)
    }
  }, STORAGE_KEY)
  await dialog.getByRole('button', { name: '确认恢复', exact: true }).click()
  await expect(page.locator('.storage-warning')).toContainText('存储空间不足')
  expect(await readRaw(page)).toBe(before)
  expect(await downloadBackup(page, dialog)).toEqual(JSON.parse(before))
  await dialog.getByRole('button', { name: '取消', exact: true }).click()
  await dialog.getByRole('button', { name: '关闭', exact: true }).click()
  await page
    .getByRole('navigation', { name: '主导航' })
    .getByRole('link', { name: '探索', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: '配额失败仍应保留的思考', exact: true }),
  ).toBeVisible()
  expect(await readRaw(page)).toBe(before)
})

test('all primary routes stay free of browser errors and mobile horizontal overflow', async ({
  page,
}) => {
  test.setTimeout(60000)
  const errors = []
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })
  const routes = [
    '/',
    '/explore',
    '/collections',
    '/collections/favorites',
    '/connections',
    '/concept/attention',
    '/journeys',
    '/create',
    '/missing-route',
    '/artifact/missing-artifact',
  ]
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport)
    for (const route of routes) {
      await page.goto(route)
      await expect(page.locator('main')).toBeVisible()
      const heading = route.includes('missing-')
        ? page.getByRole('heading', { name: '这条小径，还没有长出作品' })
        : page.locator('main').getByRole('heading', { level: 1 }).first()
      await expect(heading, `${route} should render its page content`).toBeVisible()
      await settleImages(page)
      const overflow = await page.evaluate(() => ({
        width: innerWidth,
        content: document.documentElement.scrollWidth,
      }))
      expect
        .soft(overflow.content, `${route} at ${viewport.width}px must fit horizontally`)
        .toBeLessThanOrEqual(overflow.width + 1)
      if (route === '/' && viewport.width === 390) {
        await mkdir(screenshotDir, { recursive: true })
        await page.screenshot({
          path: `${screenshotDir}/home-mobile.png`,
          fullPage: true,
          animations: 'disabled',
        })
        await page.getByRole('button', { name: '展开导航', exact: true }).click()
        await expect(page.getByRole('navigation', { name: '主导航' })).toBeVisible()
        await page.getByRole('button', { name: '关闭导航', exact: true }).click()
      }
    }
  }
  expect(errors, 'Primary routes should not throw or log browser errors').toEqual([])
})
