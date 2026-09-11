# Ink Grove

**让知识拥有最适合它自己的形态。**

一个可在本机使用的视觉知识花园。发现作品，沉浸阅读，沿概念建立连接，再把新理解种回花园。

**1.0.0 是本地系统的首个正式版本。**本版汇集 19 件作品，提供完整的本地阅读、组织、连接和创作流程，AI 接口保留且默认关闭。发行内容见 [CHANGELOG](CHANGELOG.md)，仓库协作约定见 [AGENTS.md](AGENTS.md)。

## 启动

需要 Node.js 20+、npm。首次准备：

```powershell
npm --prefix app ci
npm run dev
```

打开 **http://127.0.0.1:5173**。开发服务绑定本机，端口被占用时明确失败，不会悄悄更换地址。

```powershell
npm test          # 内容契约、搜索、数据校验、存储保护
npm run test:e2e  # 真实 Edge 浏览器流程，未启动服务时自动启动
npm run build    # 生成内容与生产文件 app/dist
npm run preview  # 本机查看生产版 http://127.0.0.1:4173
```

浏览器测试使用已安装的 Microsoft Edge；也可在 `app/playwright.config.js` 修改 channel。生产部署到静态服务器时，把作品以外的应用路由回退到 `index.html`，资源 404 不回退。默认启动服务只绑定本机。

## 走一遍花园

1. **首页 `/`**：从思想树、精选贯通作品与成长小径开始。访问作品后，首页会出现真实的「继续探索」。
2. **探索 `/explore`**：类型与主题组合筛选，中文多关键词搜索，排序、网格与列表视图。搜索词与筛选保留在链接中，刷新可恢复。`Ctrl/Cmd + K` 打开搜索；上下键选择，Enter 进入作品。
3. **作品 `/artifact/:slug`**：完整展示作品原有视觉。移动鼠标唤回工具栏，`F` 进入专注，`Esc` 退出。作品内部同样支持快捷键，阅读位置自动恢复。触屏提供专注退出按钮。
4. **集合 `/collections`**：收藏心仪作品，创建、编辑与移除自己的集合。
5. **旅程 `/journeys/personal-growth`**：五个有顺序、有叙述的阶段，从觉醒走向贯通。完成数来自真实阅读进度。
6. **连接 `/connections`**：可点击的关系图、有方向与含义的关系列表、概念频次与孤岛；按作品／关系筛选。概念可进入独立页面。
7. **创造 `/create`**：写 Markdown、导入 HTML/SVG/图片，或选择多个来源整理贯通草稿，补充个人判断后保存。作品可再次编辑、导出与删除。
8. **页脚**：切换浅色／深色／跟随系统，或通过「我的花园数据」导出、恢复备份。

## 已有作品

内置 19 件作品，其中 16 件 HTML 保留各自的视觉与交互。新增的九件书籍与贯通作品已加入探索、精选集合、概念与语义关系网络。

| 内容               | 作品                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| 原有书籍与思考地图 | 《认知觉醒》《高效能人士的七个习惯》《刻意练习》《刻意练习 · 知识系统》《纳瓦尔宝典》《思考的框架》                             |
| 新增书籍           | 《认知觉醒 · 内在操作系统》《人生十二法则》《思维模型》《如何阅读一本书》《创新者的窘境》《逻辑思维》《麦肯锡方法》《系统之美》 |
| 贯通作品           | 《贯通思考篇》：个人成长操作系统；新增《贯通思考 II》：从多本书连接成思想地图                                                   |
| 其他表达形式       | 《注意力的回路》（Markdown）、《学习如何真正发生》（SVG）、《知识生长的地形》（image）                                          |

三件非 HTML 示例的 AI 辅助创作来源已在 manifest 中标注。各作品的来源、派生关系、概念与集合归属保存在内容目录中；目录数量随后续内容更新。

## 文件与边界

```text
根目录 *.html                   原始作品，保留原字节
产品与系统设计文档*.md           用户提供的设计来源，保持原文
content/artifacts/<id>/          manifest、作品文件与封面
content/catalog.json             集合、概念以及内容目录
scripts/build-content.mjs        验证并生成浏览器可用内容
app/src/                        系统外壳、页面、Renderer、本地数据模型
app/src/generated/              构建生成，不手动编辑
app/public/artifacts/           构建生成，包含阅读通信桥与展示适配
app/tests/                      模型与真实浏览器测试
artifacts/screenshots/          系统展示截图
```

内容目录中的 `manifest.json` 是各作品的权威描述；生成给应用的目录会重新读取这些 manifest，`content/catalog.json` 提供顺序索引、集合和概念。新增作品放入独立目录，提供 `schemaVersion: 1`、唯一 id/slug、有效 renderer、本地作品资源、概念与关系，并把作品 ID 加入 catalog 的 artifacts 索引；运行 `npm run content`。无效关系、重复标识和越界路径会在构建时明确报错。只验证内容而不生成文件时，运行 `node scripts/build-content.mjs --check`。

根目录 16 件原始 HTML 保持原字节，内容目录默认直接复制原稿。本版仅对《系统之美》的层级遗漏与《贯通思考 II》的移动端矩阵标签修复内容副本，具体差异见 [内容编辑记录](content/EDITORIAL.md)。阅读通信桥和无效引用占位标记清理作用于构建输出，不回写原稿或内容副本；这些展示适配范围明确、经过测试。

HTML 用 `sandbox="allow-scripts"` iframe，允许作品自己的 JavaScript；不授予同源、弹窗、表单或顶层导航权限。系统与作品通过验证窗口身份的消息桥传递阅读进度和快捷键。SVG 通过图片呈现，Markdown 禁用原始 HTML。

## 数据与能力边界

- 已保存的收藏、作品、集合与阅读进度存于当前浏览器的 `ink-grove:garden:v1`；草稿存于当前标签页的 sessionStorage。没有账号或跨设备云同步。
- 导出 JSON 可在另一个浏览器恢复。恢复前显示数量并确认；非法备份不会覆盖当前数据，写入失败不会替换当前花园。
- 损坏／未知版本原始数据会先保护到 recovery key，再允许新操作保存。「我的花园数据」可下载原始恢复数据。保存失败会提示，未保存内容不会被跨标签页事件静默覆盖。
- 文件导入限制为 2 MB，备份总量上限 10 MB；实际可保存容量还取决于浏览器配额。图片嵌入备份，作品可单独导出。
- 全部内置作品、图标与字体为本地资源，运行后不依赖远程字体或图片服务。
- **当前创作由用户完成。**「整理贯通草稿」根据选定作品的真实元数据整理来源与共同概念，不调用模型，不宣称完成 AI 研究。
- **AI 接口已预留，默认关闭。**`app/src/lib/generation.js` 提供可注入的 provider 契约，校验请求与生成结果，返回兼容现有 Renderer 和存储的未保存作品。没有真实模型调用或 HTTP 服务；后续接入方式见 [AI 创作接口说明](docs/ai-generation-contract.md)。
- **AI 研究生成、AI 自动语义关系发现、服务端任务、作品版本演进、问题系统、多人协作和公开知识花园尚未实现。**本仓库的 1.0.0 是按当前确定范围发布的本地系统版本，不代表设计文档中完整 Personal Knowledge OS 或长期 3.0 路线图已经实现。真实 AI 服务留待后续接入。
- 沿用现有 React + Vite 基础，使用纯 CSS、Lucide、React Markdown 与本地字体；未引入数据库。文档推荐的 Next.js / TypeScript 并非本版所用技术栈。

设计依据为根目录原产品文档及补充的 part0–part2 文档。根目录原文和 HTML 均未重写。

## 展示截图

[首页](artifacts/screenshots/home-desktop.png) · [探索](artifacts/screenshots/explore-desktop.png) · [知识连接](artifacts/screenshots/connections-desktop.png) · [成长旅程](artifacts/screenshots/journey-desktop.png) · [创作](artifacts/screenshots/create-desktop.png) · [深色](artifacts/screenshots/home-dark.png) · [手机](artifacts/screenshots/home-mobile.png)

服务运行时，可重新生成截图：

```powershell
node app/scripts/capture.mjs
```
