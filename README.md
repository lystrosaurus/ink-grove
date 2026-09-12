# Ink Grove & Seed Grove

**让知识拥有最适合它自己的形态。**

两座可在本机使用、也可通过 CloudBase 静态分发的花园。Ink Grove 让成人发现、阅读与连接知识；Seed Grove 让孩子在情境、尝试和现实行动中练习思考。

**1.2.0 · One Core, Two Experiences。**保留 Ink Grove 的 31 件作品、7 个精选集合与 35 个概念，新增 Seed Grove 的四区地图、六个独立互动 Seed 与 Think 8。两者共用安全渲染、构建和存储保护，各自保留产品个性与本地数据。AI 接口默认关闭。发行内容见 [CHANGELOG](CHANGELOG.md)，仓库协作约定见 [AGENTS.md](AGENTS.md)。

## 启动

需要 Node.js 20+、npm。首次准备：

```powershell
npm --prefix app ci
npm run dev
```

打开 **http://127.0.0.1:5173** 进入 Ink Grove，打开 **http://127.0.0.1:5173/seed** 进入 Seed Grove。开发服务绑定本机，端口被占用时明确失败，不会悄悄更换地址。

```powershell
npm test          # 内容契约、搜索、数据校验、存储保护
npm run test:e2e  # 真实 Edge 浏览器流程，未启动服务时自动启动
npm run build    # 生成内容与生产文件 app/dist
npm run preview  # 本机查看生产版 http://127.0.0.1:4173
```

浏览器测试使用已安装的 Microsoft Edge；也可在 `app/playwright.config.js` 修改 channel。静态服务器应把应用路由回退到 `index.html`，并让缺失资源返回 404；现有 CloudBase 环境的回退范围与验收方式见 [部署说明](docs/deployment.md)。默认启动服务只绑定本机。

## CloudBase 展示

同一站点提供 [Ink Grove 在线花园](https://ink-d0gvorjko99e99e4d-1303038884.tcloudbaseapp.com/) 与 [Seed Grove 小小思考家](https://ink-d0gvorjko99e99e4d-1303038884.tcloudbaseapp.com/seed) 两个入口。两套体验使用同一份构建产物发布；测试与公网检查见 [1.2 发布验收记录](artifacts/verification-1.2.json)，上一版记录保存在 [1.1 验收记录](artifacts/verification.json)。默认测试域名首次访问会显示平台提示，等待倒计时后点击「确定访问」即可继续。

在根目录完成测试、构建与生产预览检查后，使用 TCB 上传同一份产物：

```powershell
node app/scripts/verify-production.mjs
node app/scripts/verify-seed-production.mjs
tcb hosting deploy app/dist -e ink-d0gvorjko99e99e4d --safe --verify
node app/scripts/verify-production.mjs https://ink-d0gvorjko99e99e4d-1303038884.tcloudbaseapp.com/
node app/scripts/verify-seed-production.mjs https://ink-d0gvorjko99e99e4d-1303038884.tcloudbaseapp.com/
```

首次生产检查默认访问本机 `http://127.0.0.1:4173`，需先运行 `npm run preview`；传入 URL 后检查对应站点。发布不使用全根目录 `--prune`，保留平台文件和旧哈希资源。配置、回滚与默认域名行为详见 [CloudBase 部署](docs/deployment.md)。

**CLI 3.8.1 发布到根路径时省略第二个路径参数，不要显式传 `/` 或 `.`。**显式 `/` 会触发清单路径不一致，导致校验失败，自动回滚还可能误删同名站点文件。回退旧版优先从历史提交重新构建，不把任意一次发布备份直接视为完整上一版。

线上分发不会同步个人数据。本机、默认域名或未来自定义域名各自拥有独立的浏览器存储。两套产品分别导出、导入自己的 JSON 备份，不能互相替代。

## 走一遍花园

1. **首页 `/`**：从思想树、精选贯通作品与成长小径开始。访问作品后，首页会出现真实的「继续探索」。
2. **探索 `/explore`**：类型与主题组合筛选，中文多关键词搜索，排序、网格与列表视图。搜索词与筛选保留在链接中，刷新可恢复。`Ctrl/Cmd + K` 打开搜索；上下键选择，Enter 进入作品。
3. **作品 `/artifact/:slug`**：完整展示作品原有视觉。移动鼠标唤回工具栏，`F` 进入专注，`Esc` 退出。作品内部同样支持快捷键，阅读位置自动恢复。触屏提供专注退出按钮。点击 HTML 中的外部参考链接后，阅读器显示目标域名，再点击「打开参考资料」访问来源。
4. **集合 `/collections`**：收藏心仪作品，创建、编辑与移除自己的集合。
5. **旅程 `/journeys/personal-growth`**：五个有顺序、有叙述的阶段，从觉醒走向贯通。完成数来自真实阅读进度。
6. **连接 `/connections`**：可点击的关系图、有方向与含义的关系列表、概念频次与孤岛；按作品／关系筛选。概念可进入独立页面。
7. **创造 `/create`**：写 Markdown、导入 HTML/SVG/图片，或选择多个来源整理贯通草稿，补充个人判断后保存。作品可再次编辑、导出与删除。
8. **页脚**：切换浅色／深色／跟随系统，或通过「我的花园数据」导出、恢复备份。

## 走进 Seed Grove

Seed Grove 实现原设计 §45–46 的首版：从 `/seed` 地图自由进入**内心花园、选择路口、学习山谷、反馈实验室**，没有课程锁、积分或排名。默认 9–11 岁，可切换 6–8、12–15 岁；三档会改变故事、问题和互动任务。

| 小种子             | 可以做什么                                               |
| ------------------ | -------------------------------------------------------- |
| 我的情绪天气       | 观察感受和身体信号，选择此刻想给自己的照顾               |
| 注意力小侦探       | 带着不同目标寻找线索，发现注意力怎样影响观察             |
| 每一个选择都有交换 | 在有限时间里分配活动，看看选择留下了什么、暂时放下了什么 |
| 刚刚好的难         | 试着选择挑战与支持，找到适合当前练习的一小步             |
| 把大问题拆小       | 把具体任务拆成能行动的小步骤                             |
| 错误是线索         | 改变积木实验中的条件，根据结果寻找下一次调整             |

**Think 8 `/seed/think`** 提供八张可随手使用的问题卡，每张都有年龄对应的情境、选择、反馈和现实反思。**我的小脚印 `/seed/growth`** 收集亲手保存的发现与生活尝试。**家长小角落 `/seed/parent`** 提供陪伴问题、最近七天真实记录与数据管理。

记录留在当前浏览器，最多 1000 条，每条最多 600 个字符；备份限 1 MB，恢复和清除需要明确确认。浏览或答题不会自动生成“已掌握”结论。十层完整内容、十二 Seed 全集、长期能力推断、账号同步与 AI 对话尚未实现。设计对应关系、内容来源、路由和数据契约见 [Seed Grove 实装与验收](docs/seed-grove.md)。

## Ink Grove 已有作品

内置 31 件作品，其中 28 件 HTML 保留各自的视觉与交互：27 件来自 `materials/` 原始素材，1 件为新增的 AI 辅助贯通作品。作品已接入探索、精选集合、概念与语义关系网络。

去重后的 22 本已有书籍、23 本候选推荐及 6 条阅读路线见 [书单清单](materials/书单清单.md)。候选书目按优先级与阅读问题组织，并附书目来源。

| 内容               | 作品                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| 原有书籍与思考地图 | 《认知觉醒》《高效能人士的七个习惯》《刻意练习》《刻意练习 · 知识系统》《纳瓦尔宝典》《思考的框架》                             |
| 1.0 扩充书籍       | 《认知觉醒 · 内在操作系统》《人生十二法则》《思维模型》《如何阅读一本书》《创新者的窘境》《逻辑思维》《麦肯锡方法》《系统之美》 |
| 1.1 判断与行动     | 《1%法则》《控制论》《管理决策中的判断》《穷查理宝典》《洛克菲勒：一个关于财富的神话》                                          |
| 1.1 投资与经营     | 《巴菲特致股东的信》《经济学的思维方式》《彼得·林奇的成功投资》《聪明的投资者》                                                 |
| 1.1 效能与觉察     | 《卓有成效的管理者》《当下的力量》                                                                                              |
| 贯通作品           | 《贯通思考篇》：个人成长操作系统；《贯通思考 II》：从多本书连接成思想地图；《清醒行动实验室》：把判断变成可验证的行动           |
| 其他表达形式       | 《注意力的回路》（Markdown）、《学习如何真正发生》（SVG）、《知识生长的地形》（image）                                          |

《清醒行动实验室》连接《管理决策中的判断》《穷查理宝典》《控制论》《1%法则》：填写证据、反证与下一步，整理可复制的行动卡；调节修正强度和观察延迟，查看简化反馈模型的曲线与数值。它是带有明确来源的 AI 辅助贯通创作，不是书中原有量表，也不调用在线模型。实验输入只在当前页面暂存，离开前可复制行动卡。

新增精选集合「从判断到行动」把这组作品组织在一起；「像所有者一样思考」连接经营、投资与经济学，围绕内在价值、安全边际、资本配置和机会成本建立概念关系。《清醒行动实验室》与三件非 HTML 示例的 AI 辅助创作来源均在 manifest 中标注。各作品的来源、派生关系、概念与集合归属保存在内容目录中；目录数量随后续内容更新。

## 文件与边界

```text
materials/*.html                用户原始作品，保留原字节
docs/design/                    用户提供的产品与系统设计文档，保持原文
docs/deployment.md              CloudBase 部署、验收与回滚说明
cloudbaserc.json                CloudBase 环境与静态站点构建配置
content/artifacts/<id>/          manifest、作品文件与封面
content/catalog.json             集合、概念以及内容目录
content/seeds/<id>/              Seed manifest、独立互动与封面
content/seed-catalog.json         Seed 索引与四个区域
scripts/build-all.mjs            顺序生成两套内容目录
scripts/build-content.mjs        验证并生成浏览器可用内容
scripts/build-seeds.mjs          验证 Seed 并复用 HTML 构建适配
app/src/core/                   共用 Renderer 与 JSON 存储保护
app/src/seed/                   独立儿童外壳、Think 8、本地成长契约
app/src/                        系统外壳、页面、Renderer、本地数据模型
app/src/generated/              构建生成，不手动编辑
app/public/artifacts/           构建生成，包含阅读通信桥与展示适配
app/public/seeds/               构建生成的独立儿童作品
app/tests/                      模型与真实浏览器测试
artifacts/screenshots/          系统展示截图
```

内容目录中的 `manifest.json` 是各作品的权威描述；生成给应用的目录会重新读取这些 manifest，`content/catalog.json` 提供顺序索引、集合和概念。新增作品放入独立目录，提供 `schemaVersion: 1`、唯一 id/slug、有效 renderer、本地作品资源、概念与关系，并把作品 ID 加入 catalog 的 artifacts 索引；运行 `npm run content`。无效关系、重复标识和越界路径会在构建时明确报错。只验证内容而不生成文件时，运行 `node scripts/build-all.mjs --check`。

`materials/` 中的 27 件原始 HTML 保持原字节，内容目录默认直接复制原稿。五件展示副本记录了明确修复：《系统之美》的层级遗漏、《贯通思考 II》的移动端矩阵标签，以及 1.1.0 修复的《控制论》手机闭环图、《管理决策中的判断》窄屏签名区和《聪明的投资者》手机资产示意条。具体差异见 [内容编辑记录](content/EDITORIAL.md)。阅读通信桥和无效引用占位标记清理作用于构建输出，不回写原稿或内容副本。

HTML 用 `sandbox="allow-scripts"` iframe，允许作品自己的 JavaScript；不授予同源、弹窗、表单或顶层导航权限。系统与作品通过验证窗口身份的消息桥传递阅读进度、快捷键和参考资料请求。外部参考须校验 HTTP(S) 地址并由父页展示目标域名，用户再次点击父页链接后才打开，使用 `noopener noreferrer` 隔离新页。SVG 通过图片呈现，Markdown 禁用原始 HTML。

## Ink Grove 数据与能力边界

- 已保存的收藏、作品、集合与阅读进度存于当前浏览器的 `ink-grove:garden:v1`；草稿存于当前标签页的 sessionStorage。没有账号或跨设备云同步。
- 导出 JSON 可在另一个浏览器恢复。恢复前显示数量并确认；非法备份不会覆盖当前数据，写入失败不会替换当前花园。
- 损坏／未知版本原始数据会先保护到 recovery key，再允许新操作保存。「我的花园数据」可下载原始恢复数据。保存失败会提示，未保存内容不会被跨标签页事件静默覆盖。
- 文件导入限制为 2 MB，备份总量上限 10 MB；实际可保存容量还取决于浏览器配额。图片嵌入备份，作品可单独导出。
- 全部内置作品、图标与字体随站点分发，阅读不依赖远程字体或图片服务；用户选择打开外部参考资料时才离开本站。
- **当前创作由用户完成。**「整理贯通草稿」根据选定作品的真实元数据整理来源与共同概念，不调用模型，不宣称完成 AI 研究。
- **AI 接口已预留，默认关闭。**`app/src/lib/generation.js` 提供可注入的 provider 契约，校验请求与生成结果，返回兼容现有 Renderer 和存储的未保存作品。没有真实模型调用或 HTTP 服务；后续接入方式见 [AI 创作接口说明](docs/ai-generation-contract.md)。
- **AI 研究生成、AI 自动语义关系发现、服务端任务、作品版本演进、问题系统、多人协作和个人花园公开发布能力尚未实现。**1.1.0 增加静态站点分发，访问者的个人作品仍只保存在自己的浏览器，不会成为其他人可见的云端内容。本版不代表设计文档中完整 Personal Knowledge OS 或长期 3.0 路线图已经实现。
- 沿用现有 React + Vite 基础，使用纯 CSS、Lucide、React Markdown 与本地字体；未引入数据库。文档推荐的 Next.js / TypeScript 并非本版所用技术栈。

设计依据为 `docs/design/` 中的 Ink 产品文档、part0–part2 与 Seed Grove 设计文档，原文保持不变。

## 展示截图

[Seed 花园地图](artifacts/screenshots/seed-home-desktop.png) · [Seed 手机版](artifacts/screenshots/seed-home-mobile.png) · [Think 8](artifacts/screenshots/seed-think-desktop.png) · [反馈实验](artifacts/screenshots/seed-feedback-desktop.png) · [家长小角落](artifacts/screenshots/seed-parent-desktop.png)

[首页](artifacts/screenshots/home-desktop.png) · [探索](artifacts/screenshots/explore-desktop.png) · [知识连接](artifacts/screenshots/connections-desktop.png) · [成长旅程](artifacts/screenshots/journey-desktop.png) · [创作](artifacts/screenshots/create-desktop.png) · [深色](artifacts/screenshots/home-dark.png) · [手机](artifacts/screenshots/home-mobile.png)

[清醒行动实验室](artifacts/screenshots/clear-thinking-lab-desktop.png) · [行动卡](artifacts/screenshots/clear-thinking-lab-action.png) · [反馈实验](artifacts/screenshots/clear-thinking-lab-feedback.png) · [实验室手机版](artifacts/screenshots/clear-thinking-lab-mobile.png)

[1.2 发布验收记录](artifacts/verification-1.2.json)记录两套体验的测试、生产检查、远端产物校验与发布状态；[1.1 记录](artifacts/verification.json)保留上一版的 CloudBase 备份限制。

服务运行时，可重新生成截图：

```powershell
node app/scripts/capture.mjs
node app/scripts/verify-seed-production.mjs http://127.0.0.1:4173 --capture
```
