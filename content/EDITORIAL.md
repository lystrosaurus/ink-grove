# 展示副本编辑记录

`materials/` 中的 HTML 是用户提供的原稿，保留原始内容与字节。`content/artifacts/` 中的 HTML 是系统发布源；下列展示副本经过有记录的内容或阅读修正，不再要求与对应原稿逐字一致。构建时清理无法解析的内部引用标记并注入阅读通信脚本，不回写原稿。

## 1.0 · 系统之美：补全杠杆点

- 原稿：`materials/thinking_in_systems_single_page.html`
- 展示副本：`content/artifacts/thinking-in-systems/index.html`
- 问题：第 06 节标示「12 → 1」，但卡片编号从 12 跳到 10，缺少 11「缓冲区」；原来的「∞」提示混在杠杆点列表中。
- 修正：补上第 11 项，说明缓冲存量要结合流量规模理解，能缓和波动，但过大也会增加成本、降低响应速度。正式列表恢复 12 至 1 的十二项；原来的「关键不是控制」保留为列表外的延伸提示。
- 依据：Donella Meadows 的官方存档 [Leverage Points: Places to Intervene in a System](https://donellameadows.org/archives/leverage-points-places-to-intervene-in-a-system/) 第 11 节及完整十二项列表。核对日期：2026-09-11。新增中文说明为简要转述。

## 1.0 · 贯通思考 II：保留手机矩阵语义

- 原稿：`materials/integrated_thinking_intellectual_atlas.html`
- 展示副本：`content/artifacts/intellectual-atlas/index.html`
- 问题：第 02 节跨书矩阵在窄屏改为纵向卡片后，六个列头集中在顶部，后续内容失去「看自己、看世界、做判断、采取行动、长期结构」的对应关系。
- 修正：为 25 个数据格补充原列名 `data-label`；手机视图隐藏集中列头，在每格内容前显示其列名。问题行标题和内容顺序保留，桌面六列布局不变。
- 依据：原稿第 02 节的六列表头与五组问题，不引入新的书籍观点或来源。

## 素材扩充 · 控制论：收拢手机闭环图

- 原稿：`materials/cybernetics_control_console.html`
- 展示副本：`content/artifacts/cybernetics/index.html`
- 问题：390px 视口下，闭环图的网格最小内容宽度把页面撑到约 449px，右侧控制器和系统节点越出屏幕。
- 修正：仅在 680px 以下缩小图内边距、箭头列和误差圆，允许节点文字换行，解除子网格的固有最小宽度。四个节点与原有箭头方向保留；跨领域五列矩阵仍使用区域内横向滚动，保留原列头及对应关系。
- 依据：原稿第 01 节闭环图和第 03 节矩阵；未修改正文或控制关系。在 320、390、768、1440px 检查页面宽度和节点边界，未出现页面横向溢出；390px 矩阵宽度在容器内保持可滚动。

## 素材扩充 · 管理决策中的判断：显示完整审计签名区

- 原稿：`materials/judgment_in_managerial_decision_making.html`
- 展示副本：`content/artifacts/managerial-judgment/index.html`
- 问题：审计表签名区的三项内容不换行，固定签字线和间距将日期、结论挤出表格，再被表格的 `overflow:hidden` 裁掉。
- 修正：在 1080px 以下允许签名区换行，缩短签字线并约束字段宽度；在 720px 以下让审计表头纵向排布。原有审计问题、结论选项与签名文字保留。
- 依据：原稿第 E 节审计表。在 320、390、768、1440px 检查三项签名内容边界，均可完整呈现。

## 素材扩充 · 聪明的投资者：保留窄屏资产示意条

- 原稿：`materials/the_intelligent_investor_fortress.html`
- 展示副本：`content/artifacts/intelligent-investor/index.html`
- 问题：资产配置示意图采用固定的 150px 名称列、55px 说明列与间距，320px 阅读宽度下挤掉了中间三条图形，实际条宽均为 0；页面整体宽度正常，仍会漏掉这部分视觉信息。
- 修正：仅在 700px 以下将名称和说明保留在第一行，让对应示意条占满下一行。股票、高质量债券、现金／流动性的名称、说明及原有示意长度均保留；桌面三列排布不变。
- 依据：原稿第 06 节的三项资产示意；不改变原文的组合思想及“并非具体配置建议”说明。在严格 `sandbox="allow-scripts"` iframe 中验证 320、390、768、1440px，三条图形及对应字段均可见且完整落在容器内；已保留可复现零宽缺陷的浏览器回归。

新增编辑应继续记录原稿、展示副本、问题、修正及依据；不要通过覆盖原稿来消除展示副本的差异。`clear-thinking-lab` 为本次新增的 AI 辅助贯通作品，来源记录在其 manifest，内容不是材料原稿的替代版本。
