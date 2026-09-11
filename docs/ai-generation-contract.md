# AI 创作预留接口 · v1

当前交付先完成本地系统。AI 接口位于 `app/src/lib/generation.js`，默认没有 provider；不会发起模型请求、读取密钥或自动保存作品。这里预留的是应用模块接口，尚未提供 HTTP 服务、后台任务或 AI 创作页面。

## 调用方式

```js
import { createGenerationService, generationService } from '../lib/generation.js'

generationService.getStatus() // { configured: false, mode: 'local' }

// 后续接入时注入真实适配器；以下仅展示接口，不是当前启用的功能。
const service = createGenerationService({
  id: 'your-provider',
  async generate(request, { signal }) {
    // 调用未来配置的本地模型或服务端接口，返回下述 v1 输出对象。
    // 适配器自行处理传输、超时和取消；云服务密钥应由服务端持有。
    return await configuredAdapter.generate(request, { signal })
  },
})

const controller = new AbortController()
const draft = await service.generate(
  {
    prompt: '反馈如何把理解转化成行动？',
    expression: 'auto',
    sourceIds: selectedArtifactIds,
  },
  { artifacts: currentArtifacts, signal: controller.signal },
)
// draft 是通过现有校验的作品对象。调用方先呈现预览，再由用户决定保存。
// generate 本身不写入本地存储、不修改目录，也不导航或发布。
```

Provider 必须是普通对象，包含 `generate(request, { signal })` 方法和由小写字母、数字、连字符组成的 1–80 字符 `id`（首字符不能是连字符）。已注入的实例通过 `getStatus()` 返回 `{ configured: true, mode: 'ai', provider: id }`；该状态仅表示适配器已配置，不代表网络健康检查成功。

## 请求

调用方提供 `prompt`、可选 `expression` 和可选 `sourceIds`，另以 options 传入当前经过校验的作品目录和 `AbortSignal`。

| 字段         | 约束                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------- |
| `prompt`     | 非空文本，最多 4000 个字符；交给适配器前去除首尾空白                                                                 |
| `expression` | 默认 `auto`，也支持 `knowledge-map`、`visual-essay`、`timeline`、`system-diagram`、`comparison`、`interactive-story` |
| `sourceIds`  | 默认空数组，最多 20 个 ID；必须存在于传入目录中，重复 ID 会合并                                                      |

表达偏好是创作提示，不强制某个 Renderer 或固定页面模板。

适配器收到独立拷贝的 `{ schemaVersion: 1, prompt, expression, sources }`。每个 source 只包含 `id/title/subtitle/author/topics/concepts/artifact`；其中 artifact 只包含 `renderer` 和 `content` 或 `src`（有内嵌 content 时优先）。不会传入收藏、阅读记录、未选作品或额外元数据。整个请求的 JSON 编码上限为 10 MiB。

内置作品可能提供本机静态资源 `src`，本地个人作品提供内嵌 `content`。本模块不读取资源；未来适配器如果需要正文，应解析所选资源，不能假定远端模型能够访问本机相对路径。

## 适配器输出

返回一个包含以下 **全部九个字段** 的普通对象。不接受缺失字段、`undefined` 或额外字段。

```json
{
  "schemaVersion": 1,
  "title": "让理解进入反馈回路",
  "subtitle": "从认知走向练习",
  "body": "# 让理解进入反馈回路\n\n在这里呈现完整作品。",
  "renderer": "markdown",
  "artifactType": "synthesis",
  "topics": ["学习"],
  "concepts": ["反馈", "行动"],
  "visualStyle": "visual-essay"
}
```

| 字段            | 约束                                                                                          |
| --------------- | --------------------------------------------------------------------------------------------- |
| `schemaVersion` | 数字 `1`                                                                                      |
| `title`         | 非空，最多 200 字符                                                                           |
| `subtitle`      | 文本，可为空，最多 1000 字符                                                                  |
| `body`          | 完整内嵌内容；HTML/Markdown/SVG 最多 2 MiB，图片 data URL 最多 3 MiB                          |
| `renderer`      | `html`、`markdown`、`svg`、`image`；SVG 须含 svg 元素；图片为现有校验器支持的 base64 data URL |
| `artifactType`  | `book`、`idea`、`person`、`history`、`system`、`synthesis`；synthesis 须选中至少两个不同来源  |
| `topics`        | 最多 100 项，每项为 1–160 字符的非空文本                                                      |
| `concepts`      | 最多 200 项，每项为 1–160 字符的非空文本                                                      |
| `visualStyle`   | 非空文本，最多 120 字符                                                                       |

模块复用 `createArtifact` 和 `validateGarden`，生成唯一的本地 id/slug、创建时间、`sourceType: personal`、来源关系与 AI 标记。适配器不能指定这些字段或伪造来源。`provenance.generatedBy` 为 `ai`，`sources` 为选中作品的 `artifact:<id>`，`derivedFrom` 为对应 ID；author 记录适配器标识。v1 不承载网络研究引用，后续扩展需显式演进契约。

结果可直接交给现有 `ArtifactRenderer`、花园存储和导出流程。HTML 继续在 `sandbox="allow-scripts"` 中展示。后续人工编辑保留 AI 来源、作者标记、原有概念与视觉风格；派生关系随当前选择更新。格式验证不判断内容事实是否正确，内容审阅仍发生在保存之前。

## 错误与取消

错误类型为 `GenerationError`，使用稳定的 `code`：

| code               | 含义                                         |
| ------------------ | -------------------------------------------- |
| `NOT_CONFIGURED`   | 默认本地模式，没有连接生成适配器             |
| `INVALID_PROVIDER` | 适配器配置无效，创建实例时抛出               |
| `INVALID_REQUEST`  | 输入、来源目录、请求大小或取消信号格式无效   |
| `INVALID_RESULT`   | 输出字段、版本、作品内容或来源数量不符合契约 |
| `PROVIDER_ERROR`   | 适配器执行失败；不透传上游请求细节           |
| `ABORTED`          | 调用前或执行中取消；结果不保存               |

中途取消会立即拒绝调用，即使适配器忽略信号，迟到结果也不会返回作品。实际停止模型计算或网络请求仍需适配器响应 `signal`；本模块不自动重试。

## 验证

`app/tests/generation.test.js` 验证离线默认值、选择来源、字段隔离、输出校验、来源归属、存储兼容、取消和错误处理。`app/tests/browser/generation-contract.spec.js` 用测试专用适配器生成草稿，验证现有阅读器以及人工编辑后的来源保留。测试适配器不会作为应用功能启用。
