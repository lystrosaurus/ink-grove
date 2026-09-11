# Ink Grove 仓库工作约定

## 产品与沟通

- 默认用中文沟通，说明实际改动、验证结果和仍未实现的能力。
- Ink Grove 是本地视觉知识花园：系统负责发现、组织、连接和阅读，作品保留独立表达。不要把不同 HTML 改造成统一的书籍详情模板。
- 当前交付范围是本地系统，AI 仅保留接口。docs/design/ 下的产品设计文档及 part0–part2 是设计依据；其中长期路线图不等于本版已完成或已授权扩展的功能。
- 启动、常用命令、数据边界见 [README.md](README.md)，版本变化见 [CHANGELOG.md](CHANGELOG.md)。

## 源文件与内容

- `materials/` 下的 `*.html` 和用户提供的产品与系统设计文档（docs/design/）是原始资料，保持原文与原字节；不要对它们批量格式化、重写或清理。
- `content/artifacts/<id>/manifest.json` 是单件作品元数据的权威来源。同目录保存作品文件与封面；HTML 默认直接复制原稿。必要的内容或交互修复仅修改内容副本，在 [content/EDITORIAL.md](content/EDITORIAL.md) 记录具体差异与理由，并验证修复行为。
- `content/catalog.json` 提供作品顺序索引、精选集合与概念。构建会重新读取各 manifest；不要只改 catalog 中重复的作品字段。
- 新增作品需使用唯一且稳定的 id/slug，加入 catalog 索引，补齐 Renderer、封面、主题、概念、来源和有明确含义的关系。关系与派生来源必须指向实际存在的作品，不能虚构来源。
- `app/src/generated/`、`app/public/artifacts/` 和 `app/dist/` 是生成目录，不手动编辑或提交。修改源文件后用 `npm run content` 或 `npm run build` 重新生成。
- 构建展示适配须范围明确并有测试，不回写原始 HTML 或内容副本。当前适配包括注入阅读通信桥，以及清理无法解析的引用占位标记；不要借适配重写作品正文或视觉。

## 实现边界

- 当前技术栈是 React、Vite、JavaScript 与 CSS；依赖和锁文件位于 `app/`。沿用现有模块和风格，不因路线图示例自行迁移技术栈。
- HTML 通过 `sandbox="allow-scripts"` iframe 阅读，不放开 `allow-same-origin`、弹窗、表单或顶层导航权限。阅读桥只在生成副本中注入；消息必须验证来源窗口，阅读进度须校验范围。
- SVG 按图片呈现，Markdown 禁用原始 HTML。外壳主题与样式不得侵入作品内部视觉。
- 花园数据契约和校验在 `app/src/lib/garden.js`。保持 `schemaVersion`、稳定 ID 和备份兼容性；未知版本或损坏数据不能直接覆盖。
- 保留恢复副本、存储失败提示、未保存内容保护及跨标签页冲突处理。备份恢复、新建和删除等要求原子提交的操作，须在存储成功后更新相应状态或导航。
- AI 边界位于 `app/src/lib/generation.js`，契约见 [AI 创作接口说明](docs/ai-generation-contract.md)。默认没有 provider，不擅自启用真实模型调用。未来适配器仍须校验选定来源与输出，先返回未保存作品，再由用户预览和保存；编辑时保留真实创作来源。

## 验证与提交

- 首次安装用 `npm --prefix app ci`；开发启动用 `npm run dev`。其余命令和浏览器要求见 README。
- 按变更选择有意义的验证：内容变更运行 `npm run content` 和相关内容测试；数据或接口变更运行 `npm test`；交互变更运行相关浏览器测试。发布前运行 `npm test`、`npm run test:e2e`、`npm run build`，并检查生产预览。
- 不为纯文案等低影响变更增加镜像实现的测试。修复实际行为缺陷时保留能复现问题的回归测试。
- 不自动执行 Sonar 密钥扫描。仅在用户明确要求时运行 `sonar analyze secrets`。
- 提交前检查差异，保留用户已有改动；不提交依赖、构建产物、日志、本地备份或凭据。更新与本次功能有关的文档，避免把临时进度写成长期规则。
- 按用户对 commit、push、tag 或发布的实际授权执行，已授权的步骤不重复确认。不强推，不擅自重写共享历史。
