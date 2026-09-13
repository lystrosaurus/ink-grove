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

## 1.4 · 逐份深化、书目补齐与跨书对读

2026-09-13，依据用户对本轮内容深化与发布的授权，修订31件原有成人作品及6个Seed，新增23本书籍解读与3篇贯通文章。以下逐件说明实际编辑结果。原稿保护基线见 `content/source-integrity.json`；书目和研究边界见 `docs/research/`。读者使用的发布源在 content 中，materials原稿不随修订改变。

### 学会提问 · 新增

- 发布源：`content/artifacts/asking-right-questions/index.html`。
- 编辑结果：把一项建议拆成结论、证据与尚未证明的桥梁。
- 原创书籍专属视觉结构与概念图。
- 区分公开来源主题、独立推演与示例假设。
- 实现并测试作品专属互动。
- 核对资料：[Pearson：Asking the Right Questions（目录与主题）](https://www.pearson.com/en-us/subject-catalog/p/Browne-Asking-the-Right-Questions-A-Guide-to-Critical-Thinking-Subscription-12th-Edition/P200000002371/9780137501731)；[BGSU：M. Neil Browne 作者履历与书目](https://www.bgsu.edu/content/dam/BGSU/honors-college/documents/dr-neil-browne.pdf)。
- 互动验收：选证据检查，再选假设检查；预期从reconsider转correct，解释因果与推广缺口。

### 认知天性 · 新增

- 发布源：`content/artifacts/make-it-stick/index.html`。
- 编辑结果：从熟悉感转向能够独立提取、辨别与应用。
- 原创书籍专属视觉结构与概念图。
- 区分公开来源主题、独立推演与示例假设。
- 实现并测试作品专属互动。
- 核对资料：[作者官网：Make It Stick](https://www.makeitstick.com/about-make-it-stick)；[Roediger 与 Karpicke：Test-Enhanced Learning，2006](https://www.psychologicalscience.org/journals/psychological-science/j.1467-9280.2006.01693.x/)。
- 互动验收：揭示解释后切换回忆自评；预期解释展开，遗忘与独立想起产生不同示例复习间隔。

### 超预测 · 新增

- 发布源：`content/artifacts/superforecasting/index.html`。
- 编辑结果：给判断写上概率、截止时间和可以核对的结果。
- 原创书籍专属视觉结构与概念图。
- 区分公开来源主题、独立推演与示例假设。
- 实现并测试作品专属互动。
- 核对资料：[Penguin Random House：Superforecasting](https://www.penguinrandomhouse.com/books/227815/superforecasting-by-philip-e-tetlock-and-dan-gardner/)；[Mellers 等：预测竞赛研究，2014](https://faculty.wharton.upenn.edu/wp-content/uploads/2015/07/2014---psychological-strategies-for-winning-a-tournament.pdf)。
- 互动验收：输入80，分别选发生/未发生计算，再输入101；预期0.040、0.640；越界输入显示invalid。

### 思考，快与慢 · 新增

- 发布源：`content/artifacts/thinking-fast-slow/index.html`。
- 编辑结果：辨认直觉如何形成，再给重要判断安排复核。
- 原创书籍专属视觉结构与概念图。
- 区分公开来源主题、独立推演与示例假设。
- 实现并测试作品专属互动。
- 核对资料：[Macmillan：Thinking, Fast and Slow](https://us.macmillan.com/books/9780374275631/thinkingfastandslow/)；[Kahneman：Maps of Bounded Rationality，诺贝尔演讲](https://www.nobelprize.org/prizes/economic-sciences/2002/kahneman/lecture/)。
- 互动验收：依次选择80与120；预期相对多20与少20，但最终金额始终100。

### 事实 · 新增

- 发布源：`content/artifacts/factfulness/index.html`。
- 编辑结果：给醒目的数字补上分母、分布、日期与趋势。
- 原创书籍专属视觉结构与概念图。
- 区分公开来源主题、独立推演与示例假设。
- 实现并测试作品专属互动。
- 核对资料：[Macmillan：Factfulness](https://us.macmillan.com/books/9781250123824/factfulness/)；[Gapminder：Factfulness 与十种本能](https://www.gapminder.org/factfulness-book/)。
- 互动验收：切换总数与每万人；预期总数A较高，比例B较高，比例值分别2和4。

### 心流 · 新增

- 发布源：`content/artifacts/flow/index.html`。
- 编辑结果：在挑战、技能与反馈之间，为投入创造条件。
- 原创书籍专属视觉结构与概念图。
- 区分公开来源主题、独立推演与示例假设。
- 实现并测试作品专属互动。
- 核对资料：[HarperAcademic：Flow](https://www.harperacademic.com/book/9780061339202/flow/)；[Csikszentmihalyi：Flow and the Foundations of Positive Psychology](https://link.springer.com/book/10.1007/978-94-017-9088-8)；[Cowley 等：心流与技能学习实验，2019](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.01126/full)。
- 互动验收：输入准备2挑战8，再匹配8与8但取消反馈，最后补回反馈；预期overload→feedback→matched；明确只是示意。

### 科学革命的结构 · 新增

- 发布源：`content/artifacts/scientific-revolutions/index.html`。
- 编辑结果：观察科学共同体如何定义问题、处理异常与比较框架。
- 原创书籍专属视觉结构与概念图。
- 区分公开来源主题、独立推演与示例假设。
- 实现并测试作品专属互动。
- 核对资料：[Chicago：The Structure of Scientific Revolutions，50周年版](https://press.uchicago.edu/ucp/books/book/chicago/S/bo13179781.html)；[Chicago：库恩晚期著作与不可通约性](https://press.uchicago.edu/ucp/books/book/chicago/L/bo181541288.html)。
- 互动验收：切换单次偏离、重复异常、竞争框架；预期check→anomaly→compare；不会自动宣布科学革命。

### 写给大家看的设计书 · 新增

- 发布源：`content/artifacts/non-designers-design-book/index.html`。
- 编辑结果：第4版 · 用对比、重复、对齐与亲密性让关系被看见。
- 原创书籍专属视觉结构与概念图。
- 区分公开来源主题、独立推演与示例假设。
- 实现并测试作品专属互动。
- 核对资料：[Peachpit：The Non-Designer’s Design Book，第4版](https://www.peachpit.com/store/non-designers-design-book-9780133966152)；[Peachpit：作者授权公开样章](https://www.peachpit.com/content/images/9780133966152/samplepages/9780133966152.pdf)。
- 互动验收：切换对齐与亲密性，观察真实文字与间距；预期text-align改变，时间地点相邻，联系信息组间距离增大。

### 认知觉醒 · 修订

- 发布源：`content/artifacts/cognitive-awakening/index.html`。
- 原始依据：`materials/cognitive_awakening_editorial.html`；原文保留。
- 编辑结果：把单因成长叙事改为受情境约束的自我观察。
- 把单因成长叙事改为受情境约束的自我观察。
- 改写大脑、情绪、反馈的绝对断言。
- 新增四次写作安排的原创对照案例与复盘口径。
- 保留报纸特刊网格与原始来源，补公开研究链接。
- 核对资料：[人民邮电出版社：认知觉醒](https://detail.youzan.com/show/goods?alias=3f1jmx11cd4mp&from_source=gbox_seo)；[The Brain Is Adaptive Not Triune，2022](https://pubmed.ncbi.nlm.nih.gov/35432041/)。

### 认知觉醒 · 内在操作系统 · 修订

- 发布源：`content/artifacts/cognitive-awakening-inner-os/index.html`。
- 原始依据：`materials/cognitive_awakening_inner_os_single_page.html`；原文保留。
- 编辑结果：把三类脑功能表述明确改为行为观察隐喻。
- 把三类脑功能表述明确改为行为观察隐喻。
- 改写模糊造成焦虑与理性接管等过度解释。
- 新增资料整理的任务调节实例，区分元认知监测和控制。
- 保留薄荷环形操作系统视觉并补来源边界。
- 核对资料：[人民邮电出版社：认知觉醒](https://detail.youzan.com/show/goods?alias=3f1jmx11cd4mp&from_source=gbox_seo)；[The Brain Is Adaptive Not Triune，2022](https://pubmed.ncbi.nlm.nih.gov/35432041/)。

### 刻意练习 · 修订

- 发布源：`content/artifacts/deliberate-practice/index.html`。
- 原始依据：`materials/deliberate_practice_lab_style.html`；原文保留。
- 编辑结果：补足严格刻意练习与有目的练习的区别。
- 补足严格刻意练习与有目的练习的区别。
- 修正舒适区、反馈时机与专家判断的绝对表述，撤下无比例依据的大多数练习概括。
- 加入八小节演奏的原创完整训练记录与迁移检查。
- 引用复核研究说明时长并非充分解释。
- 核对资料：[Penguin：Peak](https://www.penguin.co.uk/books/421170/peak-by-anders-ericsson/9780099598473)；[Macnamara 与 Maitra：复核刻意练习研究，2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6731745/)。

### 刻意练习 · 知识系统 · 修订

- 发布源：`content/artifacts/deliberate-practice-modern/index.html`。
- 原始依据：`materials/deliberate_practice_modern.html`；原文保留。
- 编辑结果：将知识系统版深化为表征、反馈与真实迁移的训练设计。
- 将知识系统版深化为表征、反馈与真实迁移的训练设计。
- 移除普通重复无价值与反馈越快越好的判断，把概览中的即时反馈同步改为可用反馈。
- 新增客服问题识别的原创训练推演。
- 保留暗色知识网络视觉与原始稿来源。
- 核对资料：[Penguin：Peak](https://www.penguin.co.uk/books/421170/peak-by-anders-ericsson/9780099598473)；[Macnamara 与 Maitra：复核刻意练习研究，2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6731745/)。

### 逻辑思维 · 修订

- 发布源：`content/artifacts/mindware/index.html`。
- 原始依据：`materials/mindware_logic_thinking_single_page.html`；原文保留。
- 编辑结果：将跨学科工具落到样本、基准率、混杂和可判别预测。
- 将跨学科工具落到样本、基准率、混杂和可判别预测。
- 修正文化思维二分、自然实验与逻辑矛盾的简化。
- 加入分组构成导致汇总反转的原创数值案例。
- 保留蓝色电路图并连接作者亲授课程。
- 核对资料：[Macmillan：Mindware](https://us.macmillan.com/books/9780374536244/mindware/)；[Richard Nisbett：密歇根大学 Mindware 课程](https://www.coursera.org/learn/mindware)。

### 思维模型 · 通用思维工具 · 修订

- 发布源：`content/artifacts/great-mental-models/index.html`。
- 原始依据：`materials/great_mental_models_single_page.html`；原文保留。
- 编辑结果：给九个模型补适用条件与相互检验方式。
- 给九个模型补适用条件与相互检验方式。
- 修正第一性原理与汉隆剃刀的过度断言。
- 加入响应速度指标的原创多模型决策推演。
- 明确流程与支撑镜片是编辑组织而非原书固定章节。
- 核对资料：[Farnam Street：第一卷九个模型](https://fs.blog/books/mental-models-vol1/)；[Farnam Street：第一性原理的情境边界](https://fs.blog/first-principles/)。

### 如何阅读一本书 · 修订

- 发布源：`content/artifacts/how-to-read-a-book/index.html`。
- 原始依据：`materials/how_to_read_a_book_single_page.html`；原文保留。
- 编辑结果：把阅读层次深化为不同产物与有限时间取舍。
- 把阅读层次深化为不同产物与有限时间取舍。
- 改写理解后才有资格批评等门槛表述。
- 新增远程协作主题阅读的原创问题矩阵。
- 区分作者术语、读者共同语言与实证评价。
- 核对资料：[Simon & Schuster：How to Read a Book](https://www.simonandschuster.com/books/How-to-Read-a-Book/Mortimer-J-Adler/9780671212094)；[Pearson：论证、理由与隐含假设的检查](https://www.pearson.com/en-us/subject-catalog/p/Browne-Asking-the-Right-Questions-A-Guide-to-Critical-Thinking-Subscription-12th-Edition/P200000002371/9780137501731)。

### 管理决策中的判断 · 修订

- 发布源：`content/artifacts/managerial-judgment/index.html`。
- 原始依据：`materials/judgment_in_managerial_decision_making.html`；原文保留。
- 编辑结果：清除95%脑占比、双系统脑区化与慢思维唯一可靠等错误。
- 清除95%脑占比、双系统脑区化与慢思维唯一可靠等错误。
- 撤下伪作者引语、未核实版次历史与名人背书。
- 把七问审计及读者带走的检查提纲一致标为本站练习，撤下十分钟完成承诺。
- 把有限觉察的探照灯标明为编辑隐喻，移除从单个视觉实验直接外推管理规律的表述。
- 新增项目追加资源的原创案例，区分沉没成本与未来退出成本。
- 保留卷宗、阶梯、聚光灯、七问表的独立视觉。
- 核对资料：[Wiley：Judgment in Managerial Decision Making，第8版](https://bcs.wiley.com/he-bcs/Books?action=index&bcsId=7506&itemId=1118065700)；[Moore 与 Bazerman：Leadership & overconfidence，2022](https://www.hbs.edu/ris/download.aspx?name=Moore+Bazerman+2022+BSP.pdf)；[Kahneman：有限理性演讲](https://www.nobelprize.org/prizes/economic-sciences/2002/kahneman/lecture/)。

### 1%法则 · 修订

- 发布源：`content/artifacts/one-percent-rule/index.html`。
- 原始依据：`materials/1_percent_rule_single_page.html`；原文保留。
- 编辑结果：修正37倍能力增长、无限自动化与无出处赛事数字。
- 修正37倍能力增长、无限自动化与无出处赛事数字。
- 区分作者主题与本站重组协议，撤去伪神经科学因果。
- 增加退回数量/比例互动及任务差异、成本、停用条件。
- 按实际结构改为三组九项，移除行动与仪式的必然性及早晚三分钟原书归属。
- 核对资料：[Tom Connellan：作者书目与小差距案例](https://tomconnellan.com/tomconnellanbooks.html)；[Lally 等：现实中的习惯形成研究](https://onlinelibrary.wiley.com/doi/10.1002/ejsp.674)。
- 互动验收：比较30/100与18/60，再改为12/60；预期比例先相同，再下降10个百分点；拒绝零分母。

### 贯通思考篇 · 修订

- 发布源：`content/artifacts/personal-growth-os/index.html`。
- 原始依据：`materials/integrated_thinking_personal_os.html`；原文保留。
- 编辑结果：将单向成长阶梯改为可回溯的多入口地图。
- 将单向成长阶梯改为可回溯的多入口地图。
- 补充技能、目标协商、结构约束分流互动。
- 用周报案例说明练习与杠杆的边界、现实停止条件。
- 移除出售时间低于复利的人生等级暗示，保留照护与在场价值。
- 核对资料：[Donella Meadows：系统的杠杆点](https://donellameadows.org/archives/leverage-points-places-to-intervene-in-a-system/)。
- 互动验收：依次选择技能与结构阻力；预期建议从拆技能变为协商工作量，选中状态同步。

### 贯通思考 II · 思想地图 · 修订

- 发布源：`content/artifacts/intellectual-atlas/index.html`。
- 原始依据：`materials/integrated_thinking_intellectual_atlas.html`；原文保留。
- 编辑结果：修正反馈必然改善、消除情绪与单一意义来源。
- 修正反馈必然改善、消除情绪与单一意义来源。
- 增加读书会竞争解释、预期证据和反证路径。
- 为跨书箭头补充条件，保留个人责任与结构解释的分歧。
- 将创新者的窘境限定为组织约束视角，不作为个人自由与复利的直接依据。
- 依据范围：manifest记录的原有作品、来源或设计；新增案例与图示语义是本站原创推演。

### 清醒行动实验室 · 修订

- 发布源：`content/artifacts/clear-thinking-lab/index.html`。
- 编辑结果：增加指标替代目的的读书会反例。
- 增加指标替代目的的读书会反例。
- 补充结果、代价、参与者退出与继续/修改/停止三种复盘结论。
- 明确固定目标教学模型不能代替现实价值判断。
- 依据范围：manifest记录的原有作品、来源或设计；新增案例与图示语义是本站原创推演。

### 学习如何真正发生 · 修订

- 发布源：`content/artifacts/learning-cycle/index.svg`。
- 编辑结果：把装饰性循环深化为有方向和检验条件的学习图。
- 增加六步方向箭头及继续/修改/停止分支语义。
- 增加概念解释的完整例子，区分表现与保留迁移。
- 标明本站综合图解，补充反馈噪声、支持与恢复条件。
- 依据范围：manifest记录的原有作品、来源或设计；新增案例与图示语义是本站原创推演。

### 知识生长的地形 · 修订

- 发布源：`content/artifacts/knowledge-landscape/landscape.svg`。
- 编辑结果：让风景里的连线表达可检验的联系而非必然进步。
- 修正每一个连接都促进理解的绝对表述。
- 为观察、核对、返回与沉淀路径添加语义。
- 明确虚线是待检验联系，保留插画与图片Renderer。
- 依据范围：manifest记录的原有作品、来源或设计；新增案例与图示语义是本站原创推演。

### 注意力的回路 · 修订

- 发布源：`content/artifacts/attention-loop/index.md`。
- 编辑结果：将专注札记深化为竞争解释与可检验的学习尝试。
- 区分刺激吸引与缺少背景知识两种分心解释。
- 区分投入、当下表现、保留与迁移。
- 加入解释性反馈来源和无效果时的调整路径。
- 核对资料：[Retrieval Practice：反馈与元认知](https://www.retrievalpractice.org/feedback/)。

### 四千周 · 新增

- 发布源：`content/artifacts/four-thousand-weeks/index.html`。
- 编辑结果：把有限的一生，交给真正愿意承诺的事。
- 区分四千周约数和寿命预测，以入口开放解释效率陷阱并给出反例。
- 承诺桌限制三项并支持取消，明确暂缓的机会成本。
- 加入照护与排班约束，实践以日历中可观察行为复看。
- 核对资料：[Oliver Burkeman：Four Thousand Weeks 作者说明](https://www.oliverburkeman.com/fourthousandweeks)；[Macmillan：Four Thousand Weeks 书介](https://us.macmillan.com/books/9780374159122/fourthousandweeks/)。
- 互动验收：依次选入4件，取消1件后再选；预期第四件被限制，取消后释放容量。

### 活出生命的意义 · 新增

- 发布源：`content/artifacts/mans-search-for-meaning/index.html`。
- 编辑结果：在具体处境中回应生活，也保留悲伤和求助的位置。
- 分开历史见证与因果证据，不以幸存推断德性或意义强弱。
- 以有限自由和具体处境解释意义，加入现实伤害优先求助的边界。
- 设计四种处境切换，不作诊断或治疗效果承诺。
- 核对资料：[Beacon Press：Man’s Search for Meaning](https://www.beacon.org/Mans-Search-for-Meaning-P602.aspx)；[Viktor Frankl Institute：Logotherapy and Existential Analysis](https://www.viktorfrankl.org/logotherapy.html)。
- 互动验收：切换持续伤害与失去处境；预期分别提示保护求助和允许悲伤。

### 原则 · 新增

- 发布源：`content/artifacts/principles-life-work/index.html`。
- 编辑结果：把经验写成可检验、可修订的判断依据。
- 把作者五步过程与本站条件—行动—反证卡分开。
- 加入透明的隐私成本、可信度领域边界和权力固化反例。
- 三字段生成操作原则并提示空输入，可继续修订。
- 核对资料：[Simon & Schuster：Principles: Life and Work](https://www.simonandschuster.com/books/Principles/Ray-Dalio/Principles/9781501124020)；[Ray Dalio：Use the 5-Step Process](https://www.principles.com/principles/689e0214-1e50-4ca0-a5d2-5e223599badf/)。
- 互动验收：先空提交再补齐情境、行动、例外；预期空项提醒；补齐后生成包含例外的原则。

### 查理·芒格传 · 新增

- 发布源：`content/artifacts/damn-right/index.html`。
- 编辑结果：从成功叙事中拆出判断、关系与时代条件。
- 确认Janet Lowe独立传记书目，只按公开目录讨论范围，不捏造章节事件。
- 以巴菲特1959相识与合作回顾为一手对读，说明来源晚于传记及纪念文本局限。
- 证据抽屉分开同伴证词、目录与缺失对照，补充制度代价。
- 核对资料：[Wiley：Damn Right! 扉页、致谢与目录](https://catalogimages.wiley.com/images/db/pdf/R0471244732.fm.pdf)；[Warren Buffett：2023 年股东信中的芒格纪念文字](https://www.berkshirehathaway.com/letters/2023ltr.pdf)。
- 互动验收：分别查看同伴证词和缺席对照；预期显示亲历证词限制与幸存偏差问题。

### 黑天鹅 · 新增

- 发布源：`content/artifacts/black-swan/index.html`。
- 编辑结果：当历史样本漏掉关键事件，判断该留下什么余量。
- 区分观察者预期、重大影响和事后叙事，不把所有意外泛称黑天鹅。
- 用九次+1与一次−99演示样本遗漏，不暗示真实概率或收益。
- 保留可预测领域的校准价值，实践聚焦共同失效与恢复能力。
- 核对资料：[Penguin Random House：The Black Swan 书介与作者访谈](https://www.penguinrandomhouse.com/books/176226/the-black-swan-second-edition-by-nassim-nicholas-taleb/hardcover/)；[Taleb & Douady：Mathematical Definition, Mapping, and Detection of (Anti)Fragility](https://arxiv.org/abs/1208.1189)。
- 互动验收：纳入−99冲击再重置；预期平均由1.00变为−9.00，重置恢复。

### 反脆弱 · 新增

- 发布源：`content/artifacts/antifragile/index.html`。
- 编辑结果：先问谁从波动中受益，再问代价由谁承担。
- 把脆弱、稳健、反脆弱绑定到对象指标与范围，反对所有压力都有益。
- 数学互动固定均值比较凸凹响应，同时以明确人为阈值中止失效外推。
- 加入试错总预算、恢复时间和谁承担损失的制度检查。
- 核对资料：[Penguin Random House：Antifragile](https://www.penguinrandomhouse.com/books/176227/antifragile-by-nassim-nicholas-taleb/hardcover/)；[Taleb & Douady：Mathematical Definition, Mapping, and Detection of (Anti)Fragility](https://arxiv.org/abs/1208.1189)。
- 互动验收：切换凸凹函数并把半幅提高到9；预期输出±25变化，再提示越过失效阈值。

### 穷理查年鉴选读 · 新增

- 发布源：`content/artifacts/poor-richards-almanack/index.html`。
- 编辑结果：让十八世纪的格言，接受今天生活条件的追问。
- 明确现代选本与历年年鉴的区别，恢复笔名及印刷文化语境。
- 格言采用原创改写，配对适用条件与反例，不以财富或忙碌评判德性。
- 校样台按照护、耐用品总成本和过劳给出不同改写。
- 核对资料：[Modern Library：Wit and Wisdom from Poor Richard’s Almanack](https://www.penguinrandomhouse.com/books/55619/wit-and-wisdom-from-poor-richards-almanack-by-benjamin-franklin/)；[Library of Congress：Benjamin Franklin, Printer and Writer](https://www.loc.gov/exhibits/franklin/franklin-printer.html)。
- 互动验收：切换照护与易损物品处境；预期显示照护劳动约束与总成本核算。

### 巴菲特致股东的信 · 修订

- 发布源：`content/artifacts/buffett-shareholder-letters/index.html`。
- 原始依据：`materials/buffett_shareholder_letters_owners_manual.html`；原文保留。
- 编辑结果：让资本配置与所有者收益接受成本、竞争和估计误差的检验。
- 直接重写长期持有、增量资本回报、回购流动性与确定性表述。
- 资本配置章节加入纺织业务竞争回应的历史反例。
- 会计章节增加所有者收益估计结构及维持投入互动。
- 清理内容副本遗留引用占位符，保留原稿和现有视觉结构。
- 按出版方英文第 4 版目录原位修正独立序篇、第八章税务和第九章伯克希尔五十年及未来，标明中文章名为本站译写。
- 核对资料：[Berkshire Hathaway：1985 年股东信，纺织业务关闭](https://www.berkshirehathaway.com/letters/1985.html)；[Berkshire Hathaway：1986 年股东信，所有者收益附录](https://www.berkshirehathaway.com/letters/1986.html)；[Carolina Academic Press：英文第 4 版扉页与目录](https://cap-press.com/pdf/9781611637588.pdf)。
- 互动验收：维持投入改成80后重算；预期示意所有者收益40。

### 彼得·林奇的成功投资 · 修订

- 发布源：`content/artifacts/peter-lynch-stock-scout/index.html`。
- 原始依据：`materials/peter_lynch_stock_scout.html`；原文保留。
- 编辑结果：把生活线索推进到财务证伪，限制十倍股与长期持有叙事。
- 直接修订十倍股、周期估值及只等故事改变的退出表述。
- 用作者公开序言的购物经历说明熟悉经验也会限制观察。
- 研究台按排队、收入、现金流、负债切换证伪问题。
- 清理内容副本遗留引用占位符，保留原稿和现有视觉结构。
- 核对资料：[Simon & Schuster：One Up On Wall Street，公开序言](https://www.simonandschuster.com/books/One-Up-On-Wall-Street/Peter-Lynch/9780743200400)；[Fidelity：Investing legends 教学逐字稿](https://www.fidelity.com/bin-public/060_www_fidelity_com/documents/learning-center/Transcript_Investing%20legends_v2.pdf)。
- 互动验收：选择经营现金流下降；预期提示现金流与利润分离，检查营运资本与季节性。

### 聪明的投资者 · 修订

- 发布源：`content/artifacts/intelligent-investor/index.html`。
- 原始依据：`materials/the_intelligent_investor_fortress.html`；原文保留。
- 编辑结果：把安全边际从漂亮折价图推进到估值误差与失效结构。
- 修订进取型风险、价格波动及低价等于安全的简化。
- 安全边际章节增加价值下限敏感性互动，拒绝非正输入。
- 组合章节区分分散、流动性与估值纪律，保留bar-row布局选择器。
- 清理内容副本遗留引用占位符，保留原稿和现有视觉结构。
- 末尾安全边际改为部分估计误差缓冲，补充集中度、流动性、共同失效及永久损失边界。
- 核对资料：[HarperCollins：The Intelligent Investor, Revised Edition](https://www.harpercollins.com/products/the-intelligent-investor-rev-ed-benjamin-graham)；[Berkshire Hathaway：1987 年股东信](https://www.berkshirehathaway.com/letters/1987.html)。
- 互动验收：价值下限从80改为60；预期缓冲变为−25.0%，不形成交易建议。

### 穷查理宝典 · 修订

- 发布源：`content/artifacts/poor-charlies-almanack/index.html`。
- 原始依据：`materials/poor_charlies_almanack_decision_room.html`；原文保留。
- 编辑结果：把模型清单转为互相冲突也能接受证据检验的决策过程。
- 直接修正逆向必胜、预期价值足够和时间必然复利等表述。
- 订单例子让激励、机会成本、因果对照与失效提出不同问题。
- 能力圈以可核查经验、预测反馈和不知道校准。
- 清理内容副本遗留引用占位符，保留原稿和现有视觉结构。
- 末尾逆向检查与安全边际取消一定失败和免受未知伤害保证，说明未知冲击及耐心复用的条件。
- 核对资料：[PCA Publications：Poor Charlie’s Almanack](https://www.poorcharliesalmanack.com/pca.php)；[Berkshire Hathaway：2023 年股东信中的合作回顾](https://www.berkshirehathaway.com/letters/2023ltr.pdf)。
- 互动验收：从激励切换因果对照；预期提出未采用奖励团队、季节及客户结构等反证。

### 洛克菲勒：一个关于财富的神话 · 修订

- 发布源：`content/artifacts/rockefeller-wealth-archive/index.html`。
- 原始依据：`materials/rockefeller_wealth_myth_archive.html`；原文保留。
- 编辑结果：让效率、垄断与慈善分别接受事实和公共问责的检验。
- 替换单人财富范式和未经限定的研究概括，区分效率与市场权力。
- 加入1896日常退出、1911拆分及1913基金会建制事实。
- 透镜切换覆盖竞争者和公共议程决定权，补充幸存偏差实践。
- 清理内容副本遗留引用占位符，保留原稿和现有视觉结构。
- 核对资料：[Rockefeller Archive Center：John D. Rockefeller 人物档案](https://rockarch.org/resources/about-the-rockefellers/john-d-rockefeller-sr/)；[Rockefeller Archive Center：基金会机构史](https://resource.rockarch.org/story/rockefeller-foundation-history-origins-to-2013/)。
- 互动验收：切换慈善与公共决定；预期询问谁有决定权、谁提出需求及谁评价效果。

### 纳瓦尔宝典 · 修订

- 发布源：`content/artifacts/naval-almanack/index.html`。
- 原始依据：`materials/naval_almanack_black_gold.html`；原文保留。
- 编辑结果：把专长和低复制成本放回需求、维护与生活约束。
- 直接修订不需许可、所有回报来自复利及幸福仅在内部的绝对表述。
- 在专长章节增加真实用户反馈，在杠杆章节加入制作＋支持成本比较。
- 保留黑金网格，补充生活资源约束和复利类比局限。
- 清理内容副本遗留引用占位符，保留原稿和现有视觉结构。
- 核对资料：[Almanack of Naval Ravikant：编辑与全书说明](https://www.navalmanack.com/)；[Find a Position of Leverage：公开整理原文](https://www.navalmanack.com/almanack-of-naval-ravikant/find-a-position-of-leverage)。
- 互动验收：人数改为30后比较；预期可复用说明总投入9.0小时。

### 当下的力量 · 修订

- 发布源：`content/artifacts/power-of-now/index.html`。
- 原始依据：`materials/the_power_of_now_presence.html`；原文保留。
- 编辑结果：把灵性觉察与事实、情绪及行动区分，避免医学化和压制性理解。
- 直接标明pain-body为灵性隐喻，取消实体化和医学化理解。
- 时间与接纳章节补上合理计划、事实不等于认可、边界和求助。
- 三步注意力练习可以睁眼、停止和重来，不要求压制情绪或停止思考。
- 清理内容副本遗留引用占位符，保留原稿和现有视觉结构。
- 核对资料：[Eckhart Tolle：The Power of Now 公开节选](https://eckharttolle.com/power-of-now-excerpt/)；[New World Library：The Power of Now](https://newworldlibrary.com/product/the-power-of-now)。
- 互动验收：点击两次；预期从看见到分开，再转向具体行动。

### 人生十二法则 · 修订

- 发布源：`content/artifacts/twelve-rules-for-life/index.html`。
- 原始依据：`materials/12_rules_for_life_single_page.html`；原文保留。
- 编辑结果：把十二条人生主张放回证据层次、互相制约的价值与行动边界。
- 将四成长阶段改为本站阅读视角，将隐藏法则标成非第十三条。
- 直接修订姿态等于勇气、先完善自己才批评和牺牲等于意义的暗示。
- 情境辨认区分个人约定、公共制度、对话与挑战，补充非羞辱边界。
- 清理内容副本遗留引用占位符，保留原稿和现有视觉结构。
- 核对资料：[Penguin Random House：12 Rules for Life 书介与目录](https://penguinrandomhousehighereducation.com/book/?isbn=9780345816023)；[Jordan B. Peterson：公开前置页及目录](https://www.jordanbpeterson.com/wp-content/uploads/2017/12/12_Rules_Christmas_Package.pdf)。
- 互动验收：切换团队不公平分工；预期明确无需先把个人生活完善才可提出公共问题。

### 我的情绪天气 · 修订

- 发布源：`content/seeds/emotion-weather/index.html`。
- 原始依据：`docs/design/Seed Grove｜小小思考家儿童底层认知系统设计文档.md`；原文保留。
- 编辑结果：说明情绪天气只是隐喻，不把身体信号固定配对。
- 说明情绪天气只是隐喻，不把身体信号固定配对。
- 为事实/猜想辨认提供可实际说出口的核实问题。
- 家长提示避免替孩子命名或纠正感受。
- 依据范围：manifest记录的原有作品、来源或设计；新增案例与图示语义是本站原创推演。

### 注意力小侦探 · 修订

- 发布源：`content/seeds/attention-detective/index.html`。
- 原始依据：`docs/design/Seed Grove｜小小思考家儿童底层认知系统设计文档.md`；原文保留。
- 编辑结果：将找到目标推进为指出判断特征。
- 将找到目标推进为指出判断特征。
- 增加观察框遗漏与任务改变的反例。
- 明确环境调整的效果需要孩子自己观察。
- 依据范围：manifest记录的原有作品、来源或设计；新增案例与图示语义是本站原创推演。

### 每一个选择都有交换 · 修订

- 发布源：`content/seeds/time-store/index.html`。
- 原始依据：`docs/design/Seed Grove｜小小思考家儿童底层认知系统设计文档.md`；原文保留。
- 编辑结果：澄清票面时长是游戏约定，现实可协商且有转换成本。
- 澄清票面时长是游戏约定，现实可协商且有转换成本。
- 将机会成本指向最看重的未选替代，避免累加所有放弃项。
- 保留空白与休息的价值。
- 依据范围：manifest记录的原有作品、来源或设计；新增案例与图示语义是本站原创推演。

### 刚刚好的难 · 修订

- 发布源：`content/seeds/just-right-challenge/index.html`。
- 原始依据：`docs/design/Seed Grove｜小小思考家儿童底层认知系统设计文档.md`；原文保留。
- 编辑结果：把看见答案推进为解释分组与核对共同约定。
- 把看见答案推进为解释分组与核对共同约定。
- 强调局部练习结果不能定义能力或要求硬撑。
- 提示与家长话语支持真实选择。
- 依据范围：manifest记录的原有作品、来源或设计；新增案例与图示语义是本站原创推演。

### 把大问题拆小 · 修订

- 发布源：`content/seeds/break-it-down/index.html`。
- 原始依据：`docs/design/Seed Grove｜小小思考家儿童底层认知系统设计文档.md`；原文保留。
- 编辑结果：区分计划约定与真实依赖，允许草稿先试摆。
- 区分计划约定与真实依赖，允许草稿先试摆。
- 增加工具准备与他人支持的漏项检查。
- 明确排计划与实际完成不同。
- 依据范围：manifest记录的原有作品、来源或设计；新增案例与图示语义是本站原创推演。

### 错误是线索 · 修订

- 发布源：`content/seeds/mistakes-are-clues/index.html`。
- 原始依据：`docs/design/Seed Grove｜小小思考家儿童底层认知系统设计文档.md`；原文保留。
- 编辑结果：揭示确定性教学模型边界，避免误读为物理规律。
- 揭示确定性教学模型边界，避免误读为物理规律。
- 结果变化后提示现实重复观察。
- 将日志标题与只保留最近4条的真实行为对齐。
- 依据范围：manifest记录的原有作品、来源或设计；新增案例与图示语义是本站原创推演。

### 方法有边界，思考才开始 · 新增

- 发布源：`content/artifacts/methods-with-boundaries/index.html`。
- 编辑结果：围绕主张、可结算预测、不可逆后果与价值分歧组织十份作品，保留模型使用条件。
- 围绕真实问题对读来源作品，明确原创情境与推论。
- 独立视觉、可操作情境与明确的适用边界。
- 提供返回各书来源的关联。
- 核对资料：[Good Judgment：可结算的问题与预测问题组](https://goodjudgment.com/question_clusters/)。
- 互动验收：切换预测、不可逆承诺等四个问题；预期分别显示结算条件、损失边界、迁移或价值协商提示。

### 让成长，装得进生活 · 新增

- 发布源：`content/artifacts/a-life-that-fits/index.html`。
- 编辑结果：对读效率、心流、技能、意义与时间有限性，避免把所有生活都解释为能力投资。
- 围绕真实问题对读来源作品，明确原创情境与推论。
- 独立视觉、可操作情境与明确的适用边界。
- 提供返回各书来源的关联。
- 核对资料：[Oliver Burkeman：Four Thousand Weeks](https://www.oliverburkeman.com/fourthousandweeks)。
- 互动验收：选择25、20、45分钟，再取消45分钟项；预期提示超出30分钟，取消后留下15分钟，时间条同步。

### 从自己的花园，到共同的花园 · 新增

- 发布源：`content/artifacts/shared-ground/index.html`。
- 编辑结果：用共享工作桌原创案例连接系统、制度、设计、沟通与战略，突出受影响者和规则可修改性。
- 围绕真实问题对读来源作品，明确原创情境与推论。
- 独立视觉、可操作情境与明确的适用边界。
- 提供返回各书来源的关联。
- 核对资料：[Elinor Ostrom：Beyond Markets and States 诺奖演讲](https://www.nobelprize.org/prizes/economic-sciences/2009/ostrom/lecture/)。
- 互动验收：切换先到、预约、自由三条规则；预期显示晚班参与者、例外申请、维护成本等不同遗漏。

### 系统之美 · 修订

- 发布源：`content/artifacts/thinking-in-systems/index.html`。
- 原始依据：`materials/thinking_in_systems_single_page.html`；原文保留。
- 编辑结果：以维修任务池补足存量流量推演，并收紧杠杆点与公共资源表述。
- 保留完整十二杠杆点和 leverage-note 选择器。
- 明确流入下降仍可能积压增加与单位换算。
- 用竞争回路和数据观察区分解释与证据。
- 删除高杠杆必有效、共同资源必衰竭的暗示。
- 核对资料：[Meadows：十二个杠杆点](https://donellameadows.org/archives/leverage-points-places-to-intervene-in-a-system/)；[Meadows：与系统共舞](https://donellameadows.org/archives/dancing-with-systems/)。

### 控制论 · 修订

- 发布源：`content/artifacts/cybernetics/index.html`。
- 原始依据：`materials/cybernetics_control_console.html`；原文保留。
- 编辑结果：用可手算的稳定与振荡例子深化控制机制，明确工程和组织类比边界。
- 纠正高质量负反馈必然稳定。
- 增加 k=0.5、2、2.2 三组离散响应与收敛条件。
- 历史精神病理章节不作当代医学依据。
- 标识静态示意波形，区分纠偏与学习。
- 核对资料：[MIT Press：维纳《控制论》](https://mitpress.mit.edu/9780262537841/cybernetics-or-control-and-communication-in-the-animal-and-the-machine/)；[Åström 与 Murray：反馈系统教材](https://www.cds.caltech.edu/~murray/FBS/First_Edition.html)。

### 创新者的窘境 · 修订

- 发布源：`content/artifacts/innovators-dilemma/index.html`。
- 原始依据：`materials/innovators_dilemma_single_page.html`；原文保留。
- 编辑结果：从新技术标签改为可观察的市场进入路径与组织筛选机制。
- 区分持续性竞争与新市场立足点。
- 移除低利润、客户拒绝即机会的过强暗示。
- 用组织收入门槛解释资源依赖。
- 标明后续理论术语和失败样本的重要性。
- 核对资料：[Christensen Institute：原书书目](https://www.christenseninstitute.org/book/the-innovators-dilemma/)；[Christensen Institute：破坏性创新理论](https://www.christenseninstitute.org/theory/disruptive-innovation/)。

### 麦肯锡方法 · 修订

- 发布源：`content/artifacts/mckinsey-way/index.html`。
- 原始依据：`materials/the_mckinsey_way_single_page.html`；原文保留。
- 编辑结果：原位修正利润树的重复归因，并让问题解决流程可被证伪。
- 产品组合下沉为收入成本的解释维度。
- 增加可手算利润变化与竞争假设。
- 区分访谈事实、解释和建议。
- 把 80/20 明确为启发并增加调查停止条件。
- 核对资料：[McGraw Hill：The McKinsey Way](https://www.mheducation.com/highered/mhp/product/mckinsey-way.html)；[McKinsey：不确定情境的问题解决心态](https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/six-problem-solving-mindsets-for-very-uncertain-times)。

### 卓有成效的管理者 · 修订

- 发布源：`content/artifacts/effective-executive/index.html`。
- 原始依据：`materials/effective_executive_55_os.html`；原文保留。
- 编辑结果：用时间审计与接收者检验深化有效性，限制优势和停止工作的误读。
- 将四个入口标为编辑教学归组。
- 增加 40 小时时间账与碎片到连续窗口的区别。
- 授权与停止工作需验证组织成本。
- 优势原则不豁免安全诚信与岗位必需能力。
- 核对资料：[Routledge：The Effective Executive](https://www.routledge.com/The-Effective-Executive/Drucker/p/book/9780750685078)；[Drucker：2004 年有效管理者文章](https://hbr.org/2004/06/what-makes-an-effective-executive)。

### 经济学的思维方式 · 修订

- 发布源：`content/artifacts/economic-way-of-thinking/index.html`。
- 原始依据：`materials/economic_way_of_thinking_13_lens_lab.html`；原文保留。
- 编辑结果：用增量决策与账外成本区分机会成本、沉没成本和福利判断。
- 增加可手算继续或取消工作坊例子。
- 机会成本只计最佳可行替代项。
- 价格和利润不等于完整社会价值。
- 价格反应补充其他条件、弹性和时段限制。
- 核对资料：[Pearson：第十三版出版资料](https://www.pearson.com/en-ca/subject-catalog/p/economic-way-of-thinking-the/P200000005920/9780132992589)；[Pearson：第十三版样章](https://www.pearson.de/media/muster/ext/9781292053608.pdf)；[Pearson：第十三版目录](https://www.pearson.de/media/muster/toc/toc_9781292053608.pdf)。

### 高效能人士的七个习惯 · 修订

- 发布源：`content/artifacts/seven-habits/index.html`。
- 原始依据：`materials/seven_habits_core_map.html`；原文保留。
- 编辑结果：以真实约束与关系协商深化七个习惯，去除人格阶梯和成果保证。
- 伪署名引句标为编辑转述。
- 依赖独立互赖改为关系位置而非人生评分。
- 周末协商案例连接选择、方向、倾听与双赢。
- 将成果承诺改为可观察变化，更新允许休息。
- 核对资料：[FranklinCovey：七个习惯的公开说明](https://ir.franklincovey.com/news-releases/news-release-details/7-habits-highly-effective-people-25th-anniversary-edition)；[FranklinCovey：双赢思维](https://www.franklincovey.com/habit-4/)。

### 思考的框架 · 修订

- 发布源：`content/artifacts/thinking-framework/index.html`。
- 原始依据：`materials/thinking-framework-core-map.html`；原文保留。
- 编辑结果：明确非已知书籍身份，以流程选择情境替换未证实名人故事。
- 未知作者与书籍身份在正文明确。
- 虚构目录和金句身份改为编辑路径与提醒。
- 三个名人因果故事改为标注的假设情境。
- 六种工具围绕同一真实决定分别说明机制与边界。
- 核对资料：[Meadows：系统思考的观察与边界](https://donellameadows.org/archives/dancing-with-systems/)；[McKinsey：开放假设与不确定性](https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/six-problem-solving-mindsets-for-very-uncertain-times)。

### 好战略，坏战略 · 新增

- 发布源：`content/artifacts/good-strategy-bad-strategy/index.html`。
- 编辑结果：用资源取舍练习解释诊断、指导方针与协调行动。
- 将增长目标与可检验诊断分开。
- 以三人周案例检查行动配合与预算。
- 提供诊断失效后的重审条件。
- 核对资料：[作者文章：坏战略的危险](https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/the-perils-of-bad-strategy)；[Penguin Random House 出版资料](https://www.penguinrandomhouse.com/books/208668/good-strategy-bad-strategy-by-richard-rumelt/)。
- 互动验收：勾选引导和测量，再加广告；预期先提示相互支持，随后提示预算超出。

### 设计心理学 1 · 新增

- 发布源：`content/artifacts/design-everyday-things/index.html`。
- 编辑结果：以一扇门区分可供性、示意符、映射与反馈。
- 标明修订扩充版身份。
- 可操作的推拉门保持固定机械关系。
- 将执行失手与错误概念模型分别处理。
- 核对资料：[MIT Press：修订扩充版](https://mitpress.mit.edu/9780262525671/the-design-of-everyday-things/)；[Don Norman：修订版前言](https://jnd.org/preface-design-of-everyday-things-revised-edition/)。
- 互动验收：拉门、显示提示、再推门；预期错误动作保持关闭，推门打开并解释示意符。

### 非暴力沟通 · 新增

- 发布源：`content/artifacts/nonviolent-communication/index.html`。
- 编辑结果：用拒绝之后的回应检验请求是否仍是请求。
- 以观察与评价、需要与策略构建对话。
- 不提供人格评分或疗效保证。
- 交互并列展示惩罚与协商的不同回应。
- 核对资料：[PuddleDancer Press：第三版](https://nonviolentcommunication.com/product/nvc/)；[出版方提供：四个要素与关键区别](https://www.nonviolentcommunication.com/bookshare/4_components_of_NVC_4_rev_6.20.19.pdf)。
- 互动验收：分别选择两种意图并点击听见拒绝；预期指出惩罚式要求，或提出允许拒绝的另一种安排。

### 金字塔原理 · 新增

- 发布源：`content/artifacts/pyramid-principle/index.html`。
- 编辑结果：让试点案例暴露表达结构与证据力度之间的差别。
- 搭建中心建议—理由—依据的可见层次。
- 区分同类归组、推导和研究日志。
- 交互限制小样本结论的适用范围。
- 核对资料：[Barbara Minto 作者网站](https://www.barbaraminto.com/)；[Pearson 出版资料](https://www.pearson.com/en-gb/subject-catalog/p/the-pyramid-principle/P200000015259/9781292763255)。
- 互动验收：从局部试点切换全面确定推广；预期指出越过证据范围，并保留试点的效果不确定性。

### 复杂 · 新增

- 发布源：`content/artifacts/complexity-guided-tour/index.html`。
- 编辑结果：以确定性元胞自动机理解局部互动、涌现和模型边界。
- 实现规则 0、90、150 的同步演化。
- 显式记录初始条件、固定边界和代数限制。
- 区分随机、混沌、涌现与适应。
- 核对资料：[Oxford University Press：Complexity](https://academic.oup.com/book/51004)；[Melanie Mitchell 作者网站与配套程序](https://melaniemitchell.me/)；[Santa Fe Institute：虚拟实验室](https://www.complexityexplorer.org/explore/virtual-laboratory)。
- 互动验收：运行规则 90 一代，再重置并运行规则 0；预期活跃格由 1 变 2；规则 0 变 0。

### 公共事物的治理之道 · 新增

- 发布源：`content/artifacts/governing-commons/index.html`。
- 编辑结果：把资源约束和治理机制分开检验。
- 展示共同池资源的可减性与排除成本。
- 将八项原则按制度问题归组并标出情境限制。
- 可重置的三家庭资源账注明不模拟遵约。
- 核对资料：[Cambridge University Press：Governing the Commons](https://www.cambridge.org/core/books/governing-the-commons/7AB7AE11BADA84409C34815CC288CD79)；[Ostrom 诺贝尔讲座](https://www.nobelprize.org/uploads/2018/06/ostrom_lecture.pdf)；[Ostrom 访谈：设计原则不是统一处方](https://www.nobelprize.org/prizes/economic-sciences/2009/ostrom/164465-ostrom-williamson-interview-transcript/)。
- 互动验收：取用 40 后运行，再重置以 10 运行；预期资源先降至 0，重置后的低取用轮剩余 80。

### 第五项修炼 · 新增

- 发布源：`content/artifacts/fifth-discipline/index.html`。
- 编辑结果：以救急与学习的延迟效应解释五项修炼的联系。
- 五项修炼保留各自作用与共同关系。
- 积压模型允许逐轮选择并保留轨迹。
- 明确培训不必然有效与权力环境限制。
- 核对资料：[Penguin Random House：The Fifth Discipline](https://www.penguinrandomhouse.com/books/163984/the-fifth-discipline-by-peter-m-senge/)；[SoL：Peter Senge 主持的五项修炼课程](https://www.solonline.org/foundations-for-leadership-fall-2020/)；[SoL：作者的二十五周年反思](https://www.solonline.org/wp-content/uploads/2019/03/sol_reflections_14.3.pdf)。
- 互动验收：选择学习推进一轮，然后正常处理；预期首次积压 44、能力 11，下一轮积压 43。

### 助推 · 新增

- 发布源：`content/artifacts/nudge/index.html`。
- 编辑结果：用可撤回的默认值示意检查助推与选择权。
- 明确 2021 Final Edition 身份。
- 修改默认值不会被解释为同意且需重新确认。
- 加入收益归属、透明、退出与反效果观察。
- 核对资料：[Penguin：2021 The Final Edition](https://penguinrandomhousehighereducation.com/book/?isbn=9780143137009)；[作者新版前言：Nudge](https://www.chicagobooth.edu/review/nudge-preface-final-edition)；[Richard Thaler：Nudges and Sludge](https://www.chicagobooth.edu/review/words-live-flops-nudges-and-sludge)。
- 互动验收：切换默认接收后取消勾选并确认；预期默认变更仍未确认，最终明确不接收且无实际订阅。
