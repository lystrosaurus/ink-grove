import { test, expect } from '@playwright/test'
import { createGenerationService } from '../../src/lib/generation.js'
import { createArtifact, emptyGarden, exportGarden } from '../../src/lib/garden.js'

test('a future generated draft uses the existing reader and keeps its provenance through human editing', async ({
  page,
}) => {
  const sources = ['已有认知', '已有练习'].map((title) =>
    createArtifact({ title, body: `# ${title}`, topics: ['反馈'] }),
  )
  const service = createGenerationService({
    id: 'contract-fixture',
    async generate() {
      return {
        schemaVersion: 1,
        title: '贯通后的新理解',
        subtitle: '由来源产生的草稿',
        body: '# 新的理解\n\n根据反馈修正行动。',
        renderer: 'markdown',
        artifactType: 'synthesis',
        topics: ['学习'],
        concepts: [
          '心理表征',
          '反馈',
          ...Array.from({ length: 198 }, (_, index) => `原有概念${index}`),
        ],
        visualStyle: 'visual-essay',
      }
    },
  })
  const artifact = await service.generate(
    { prompt: '反馈如何帮助学习？', sourceIds: sources.map((a) => a.id) },
    { artifacts: sources },
  )
  const garden = { ...emptyGarden(), artifacts: [...sources, artifact] }
  await page.goto('/')
  await page.evaluate(
    (data) => localStorage.setItem('ink-grove:garden:v1', data),
    exportGarden(garden),
  )
  await page.goto(`/artifact/${artifact.id}`)
  await expect(page.locator('.markdown-content')).toContainText('新的理解')
  await page.goto(`/create?edit=${artifact.id}`)
  await page.getByLabel('作品内容').fill('# 新的理解\n\n这是我进一步补充的判断。')
  await page.getByRole('button', { name: '保存作品', exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`/artifact/${artifact.id}$`))
  const saved = await page.evaluate(
    (id) =>
      JSON.parse(localStorage.getItem('ink-grove:garden:v1')).artifacts.find((a) => a.id === id),
    artifact.id,
  )
  expect(saved.provenance).toEqual(artifact.provenance)
  expect(saved.concepts).toEqual(expect.arrayContaining(artifact.concepts))
  expect(saved.concepts).toHaveLength(200)
  expect(saved.visualStyle).toEqual(artifact.visualStyle)
  expect(saved.author).toEqual(artifact.author)
  expect(saved.artifact.content).toContain('进一步补充')
  await page.reload()
  await expect(page.locator('.markdown-content')).toContainText('进一步补充')
})
