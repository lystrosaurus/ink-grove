# Grove 仓库工作约定

## 一个内核，两套体验

- 默认用中文沟通，说明实际改动、验证结果和未实现能力。启动与命令见 [README.md](README.md)，发行变化见 [CHANGELOG.md](CHANGELOG.md)，Seed 的实装范围与验收见 [Seed Grove](docs/seed-grove.md)。`docs/design/` 是设计依据，长期路线图不等于已实现或已授权扩展。
- **One Core, Two Experiences：共享基础设施，保留各自产品性格。** Ink Grove（`/`）是成人／通用视觉知识花园，负责发现、组织、连接和阅读；Seed Grove（`/seed`）是儿童认知花园，通过情境、尝试和现实行动帮助思考。各自拥有导航、视觉语言、内容密度、互动方式与成长语义；不要把 Seed 做成成人书架换皮，也不要把独立作品套入统一文章或书籍详情模板。
- 共用资源契约、安全 Renderer、构建适配和存储保护机制；内容目录、产品数据与体验状态分别管理。只抽取已被双方实际使用的基础能力，不为路线图预建空的 Journey、Graph 或 AI 系统。
- 沿用 React、Vite、JavaScript 与 CSS，依赖和锁文件在 `app/`；同一静态产物分发两套体验，样式按体验隔离且不侵入作品内部。当前范围是浏览器本地系统与 CloudBase 静态分发，不增加账号、云同步或在线模型调用。
- Seed 按 2026-09-13 的设计调整提供统一体验，不按年龄分组，也不以隐藏年龄或全局难度选择替代。每个 Seed 围绕一个儿童能理解的问题提供明确场景、隐喻、可操作的尝试和可带回现实的问题；需要延伸时提供人人可自由尝试的「再想一步」。不做能力分数、排行榜、打卡压力、性格标签或心理诊断，不上传儿童任意输入。调整依据维护在 [Seed Grove](docs/seed-grove.md)，不回写原设计。

## 内容与权威来源

- `materials/*.html` 与用户提供的 `docs/design/` 文档保留原文、原字节。HTML 默认直接复制原稿；必要修复仅修改内容副本，在 [内容编辑记录](content/EDITORIAL.md) 记下差异与理由并验证行为。原创 Seed 可采用故事、游戏、实验或思考卡，不强制套用成人作品形式。
- 1.4 内容深化后的发布源已有逐件审稿记录，见 `content/reviews/`；原稿校验基线在 `content/source-integrity.json`，不能随展示副本更新。后续编辑应修改既有审稿记录或补充明确记录，并同步 `content/EDITORIAL.md`。书籍解读优先核对作者、出版方及原始研究，区分公开信息可支持的范围、本站原创案例和跨书推论；不声称仅凭简介完成全书精读，不把教学模型、修辞比喻或传记个案当成普遍规律。
- 单件元数据分别以 `content/artifacts/<id>/manifest.json`、`content/seeds/<id>/manifest.json` 为准；对应的 `content/catalog.json`、`content/seed-catalog.json` 管理各自索引与组织信息。构建重新读取 manifest，不只修改索引里重复的作品字段。
- 新内容使用稳定且唯一的 id/slug，补齐 Renderer、本地资源、封面、主题／能力与来源，加入所属索引；Seed 另补思考问题和家长提示，不新增年龄元数据或年龄版本。关系必须有明确含义且指向实际存在的内容，派生关系须有真实来源。AI 原创在 provenance 标明 `generatedBy: "ai"`，人与 AI 共同创作按实际参与标为 `hybrid`，保留真实依据，不能因概念相似虚构成人书派生来源。
- `app/src/generated/`、`app/public/artifacts/`、`app/public/seeds/` 和 `app/dist/` 是生成目录，不手动编辑或提交；用 `npm run content` 或 `npm run build` 重建。阅读桥注入、引用占位标记清理等展示适配只作用于构建输出，范围明确且有测试，不借此改写正文或视觉。

## 安全、数据与 AI

- HTML 始终用 `sandbox="allow-scripts"` iframe，不授予同源、弹窗、表单或顶层导航权限。消息验证来源窗口，阅读进度校验范围；SVG 按图片呈现，Markdown 禁用原始 HTML。
- HTML 外部参考请求须为 HTTP(S)、无凭据且不同于本站 origin。消息只请求父页展示并固定目标，用户点击父页链接后才以 `noopener noreferrer` 打开；近期窗口激活不构成对任意目标的授权。
- Ink 数据契约在 `app/src/lib/garden.js`，Seed 契约在 `app/src/seed/garden.js`；分别使用 `ink-grove:garden:v1` 与 `seed-grove:garden:v1`。保持稳定 ID、`schemaVersion` 和既有备份兼容性，不混入另一产品的数据。未知版本或损坏数据须先保护原始恢复副本，不能直接覆盖。
- Seed 当前数据与导出为 `schemaVersion: 2`，花园和事件不含年龄字段；保留旧存储键用于发现既有数据。旧 v1 必须按原契约严格校验后仅在内存迁移，保留记录 ID、含义、文字、来源、时间与 revision；加载不自动回写，下次用户明确保存且写入成功后才持久化 v2。有效旧备份可以恢复为 v2；损坏、未知版本或非法旧数据仍走原始恢复保护。
- 保留存储失败提示、恢复数据导出、未保存内容保护及跨标签页冲突处理。备份恢复、新建、删除等原子操作必须存储成功后再更新状态或导航；共享存储机制不改变各产品数据含义。
- Seed 的发现和现实使用由用户明确记录；点击、浏览、答题或阅读进度不能自动解释为“会用了”或能力成长。记录要保留事件语义与发生时间，不能据次数推断孩子的成熟度。
- AI 接口在 `app/src/lib/generation.js`，默认没有 provider，见 [AI 创作接口说明](docs/ai-generation-contract.md)。后续适配仍须校验选定来源与输出，先返回未保存作品，预览后由用户保存，编辑保留真实来源；Seed MVP 不提供自由 AI 对话。

## 验证与交付

- 按变更选择验证：内容修改运行 `npm run content` 与相关内容测试，数据／接口修改运行 `npm test`，交互修改运行相关浏览器测试。发布前运行 `npm test`、`npm run test:e2e`、`npm run build` 并检查生产预览；共用内核修改须同时覆盖两套体验。不为纯文案增加镜像测试，实际行为缺陷保留可复现的回归测试。
- CloudBase 流程见 [部署说明](docs/deployment.md)：上传已验证的同一份 `app/dist`，使用 `--safe --verify`，不对含平台文件的根目录执行全量 `--prune`。CLI 3.8.1 发布根路径须省略 `cloudPath`，不显式传 `/` 或 `.`；失败后核对实际文件，不能只相信「已自动回滚」。回退优先从历史提交重建，使用备份前先核验完整性。
- 部署后验证两套体验的公网深链接、正文与实际互动，不能仅凭 HTTP 200 判断资源正确；默认域名的正常访问提示不属于应用失败。
- 不自动执行 Sonar 密钥扫描；仅在用户明确要求时运行 `sonar analyze secrets`。提交前检查差异并保留用户已有改动，不提交依赖、生成产物、日志、本地备份或凭据。按实际授权执行 commit、push、tag 或发布，不重复确认、不强推、不改写共享历史。
