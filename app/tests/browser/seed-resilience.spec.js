import { test, expect } from '@playwright/test'

const SEED_KEY = 'seed-grove:garden:v1'
const INK_KEY = 'ink-grove:garden:v1'
const reflection = (page) => page.getByLabel('我想记下')
const saveReflection = (page) => page.getByRole('button', { name: '保存这片小叶子' })
const readRaw = (page, key = SEED_KEY) =>
  page.evaluate((storageKey) => localStorage.getItem(storageKey), key)
const readSeed = async (page) => JSON.parse(await readRaw(page))

function backup(note = '已经保存的生活发现。') {
  return {
    schemaVersion: 1,
    product: 'seed-grove',
    revision: 4,
    age: '9-11',
    events: [
      {
        id: 'growth-saved-example',
        seedId: 'mistakes-are-clues',
        questionId: '',
        kind: 'real-life',
        note,
        source: 'parent',
        age: '9-11',
        at: new Date().toISOString(),
      },
    ],
  }
}

async function installSavedData(page, seed, adult = null) {
  await page.addInitScript(
    ({ seedKey, inkKey, seedRaw, adultRaw }) => {
      if (window.top !== window) return
      localStorage.setItem(seedKey, seedRaw)
      if (adultRaw !== null) localStorage.setItem(inkKey, adultRaw)
    },
    { seedKey: SEED_KEY, inkKey: INK_KEY, seedRaw: seed, adultRaw: adult },
  )
}

async function blockSeedWrites(page) {
  await page.evaluate((key) => {
    const original = Storage.prototype.setItem
    window.restoreSeedWrites = () => {
      Storage.prototype.setItem = original
    }
    Storage.prototype.setItem = function (name, value) {
      if (this === localStorage && name === key)
        throw new DOMException('Test quota exceeded', 'QuotaExceededError')
      return original.call(this, name, value)
    }
  }, SEED_KEY)
}

test('a failed reflection save keeps the text and only a successful retry creates a record', async ({
  page,
}) => {
  await page.goto('/seed/play/emotion-weather')
  const note = '我心里像一阵雨，想先慢慢呼吸。'
  await reflection(page).fill(note)
  await blockSeedWrites(page)
  await saveReflection(page).click()
  await expect(reflection(page)).toHaveValue(note)
  await expect(page.getByRole('alert').filter({ hasText: /没有保存/ })).toBeVisible()
  await expect(page.getByText('这次发现，已经种在小花园里。', { exact: true })).toHaveCount(0)
  expect(await readRaw(page)).toBeNull()

  await page.evaluate(() => window.restoreSeedWrites())
  await saveReflection(page).click()
  await expect(reflection(page)).toHaveValue('')
  const garden = await readSeed(page)
  expect(garden.events).toHaveLength(1)
  expect(garden.events[0]).toMatchObject({ note, kind: 'discovery', source: 'child' })
})

test('a dirty stale tab cannot overwrite another tab and keeps its unsaved reflection', async ({
  page,
  context,
}) => {
  await page.goto('/seed/play/emotion-weather')
  const other = await context.newPage()
  await other.goto('/seed/play/mistakes-are-clues')
  await reflection(page).fill('这一页还没有保存的感受。')
  await reflection(other).fill('另一页保存了底座变宽的发现。')
  await saveReflection(other).click()
  await expect(reflection(other)).toHaveValue('')
  await expect(page.getByRole('alert').filter({ hasText: /另一页面/ })).toBeVisible()
  await saveReflection(page).click()
  await expect(reflection(page)).toHaveValue('这一页还没有保存的感受。')
  expect((await readSeed(page)).events.map((event) => event.note)).toEqual([
    '另一页保存了底座变宽的发现。',
  ])
  await expect(page.getByText('这次发现，已经种在小花园里。', { exact: true })).toHaveCount(0)

  page.once('dialog', (dialog) => dialog.dismiss())
  await page.getByRole('link', { name: '花园地图', exact: true }).first().click()
  await expect(page).toHaveURL(/\/seed\/play\/emotion-weather$/)
  await expect(reflection(page)).toHaveValue('这一页还没有保存的感受。')
})

test('a fresh save protects unknown Seed data byte for byte and leaves the adult garden untouched', async ({
  page,
}) => {
  const unknown = '{ "product": "seed-grove", "schemaVersion": 99, "future": ["需要保留"] }'
  const adult =
    '{"schemaVersion":1,"favorites":["mindware"],"visits":{},"collections":[],"artifacts":[]}'
  await installSavedData(page, unknown, adult)
  await page.goto('/seed/parent')
  await expect(page.getByRole('alert').filter({ hasText: /原始数据/ })).toBeVisible()
  expect(await readRaw(page)).toBe(unknown)
  await reflection(page).fill('新的一次生活尝试。')
  await saveReflection(page).click()
  await expect(reflection(page)).toHaveValue('')
  expect(await readRaw(page, `${SEED_KEY}:recovery`)).toBe(unknown)
  expect(await readRaw(page, INK_KEY)).toBe(adult)
  expect((await readSeed(page)).events.map((event) => event.note)).toEqual(['新的一次生活尝试。'])
})

test('failed deletion keeps saved records and its confirmation open until a successful retry', async ({
  page,
}) => {
  const raw = JSON.stringify(backup())
  await installSavedData(page, raw)
  await page.goto('/seed/parent')
  await expect(page.getByText('已经保存的生活发现。', { exact: true })).toBeVisible()
  await blockSeedWrites(page)
  await page.getByRole('button', { name: '删除本机 Seed Grove 记录', exact: true }).click()
  const confirm = page.getByRole('button', { name: '确认删除 Seed Grove 记录', exact: true })
  await confirm.click()
  await expect(confirm).toBeVisible()
  await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible()
  await expect(page.getByText('已经保存的生活发现。', { exact: true })).toBeVisible()
  expect(await readRaw(page)).toBe(raw)

  await page.evaluate(() => window.restoreSeedWrites())
  await confirm.click()
  await expect(confirm).toHaveCount(0)
  await expect(page.getByText('已经保存的生活发现。', { exact: true })).toHaveCount(0)
  expect((await readSeed(page)).events).toEqual([])
})

test('failed backup replacement keeps the preview, saved data, age and unfinished parent note', async ({
  page,
}) => {
  const original = JSON.stringify(backup())
  const imported = { ...backup('从另一台设备带来的记录。'), age: '6-8' }
  await installSavedData(page, original)
  await page.goto('/seed/parent')
  await reflection(page).fill('家长还没写完的生活记录。')
  await page.getByLabel('选择 Seed Grove 备份文件').setInputFiles({
    name: 'seed-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(imported)),
  })
  const confirm = page.getByRole('button', { name: '确认导入并替换', exact: true })
  await expect(confirm).toBeVisible()
  expect(await readRaw(page)).toBe(original)
  await blockSeedWrites(page)
  page.once('dialog', (dialog) => dialog.accept())
  await confirm.click()
  await expect(confirm).toBeVisible()
  await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible()
  await expect(reflection(page)).toHaveValue('家长还没写完的生活记录。')
  await expect(page.getByLabel('阅读年龄')).toHaveValue('9-11')
  expect(await readRaw(page)).toBe(original)

  await page.evaluate(() => window.restoreSeedWrites())
  page.once('dialog', (dialog) => dialog.accept())
  await confirm.click()
  await expect(confirm).toHaveCount(0)
  await expect(reflection(page)).toHaveValue('')
  await expect(page.getByLabel('阅读年龄')).toHaveValue('6-8')
  await expect(page.getByText('从另一台设备带来的记录。', { exact: true })).toBeVisible()
  expect((await readSeed(page)).events.map((event) => event.note)).toEqual([
    '从另一台设备带来的记录。',
  ])
})

test('adult and unknown-version backup files cannot replace existing Seed records', async ({
  page,
}) => {
  const original = JSON.stringify(backup())
  await installSavedData(page, original)
  await page.goto('/seed/parent')
  for (const [name, value] of [
    ['adult.json', { schemaVersion: 1, favorites: [], visits: {}, collections: [], artifacts: [] }],
    ['future-seed.json', { ...backup(), schemaVersion: 99 }],
  ]) {
    await page.getByLabel('选择 Seed Grove 备份文件').setInputFiles({
      name,
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(value)),
    })
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByRole('button', { name: '确认导入并替换', exact: true })).toHaveCount(0)
    expect(await readRaw(page)).toBe(original)
    await expect(page.getByText('已经保存的生活发现。', { exact: true })).toBeVisible()
  }
})

test('declining browser Back restores the Seed route and keeps the unfinished reflection', async ({
  page,
}) => {
  await page.goto('/seed')
  await page
    .getByRole('navigation', { name: '花园地图', exact: true })
    .getByRole('link', { name: /内心花园/ })
    .click()
  await page.getByRole('link', { name: /我的情绪天气/ }).click()
  await reflection(page).fill('返回之前，还想写下这句感受。')
  const declined = page.waitForEvent('dialog')
  await page.evaluate(() => history.back())
  await (await declined).dismiss()
  await expect(page).toHaveURL(/\/seed\/play\/emotion-weather$/)
  await expect(reflection(page)).toHaveValue('返回之前，还想写下这句感受。')
  const accepted = page.waitForEvent('dialog')
  await page.evaluate(() => history.back())
  await (await accepted).accept()
  await expect(page).toHaveURL(/\/seed\/layer\/1$/)
  await expect(reflection(page)).toHaveCount(0)
  expect(await readRaw(page)).toBeNull()
})
