# 系统、组织与设计组：逐件公开资料核对

核对日期：2026-09-13。范围为 8 件旧视觉稿的内容副本与 8 件新作品。先逐件阅读旧稿，再回到出版社、作者、作者研究机构和原始研究资料。未取得原书全文的书籍不声称通读，不提供伪页码、长引文或全书重建。`materials/*.html` 与 `docs/design/` 保留原字节。

交付记录以 [edition-systems.json](../../content/reviews/edition-systems.json) 为准；它记录每件作品的改动、来源及交互。新稿统一仅用本地 HTML/CSS/JavaScript/SVG，各自独立组织视觉结构与情境。不存在账号、联网模型、输入上传或本地存储。

## 验证范围

- `app/tests/browser/edition-systems.spec.js` 在 `sandbox="allow-scripts"` 的 srcdoc 中运行真实作品；8 个新交互先 RED（功能未实现），实现后 GREEN。
- 对全部 16 件逐一检查 320 与 390 像素的可读宽度；应用路由、构建注入与公网深链接由主任务统一验证。
- 本组没有运行 Sonar、提交、推送或部署。测试不证明书中主张的经验普适性。

## 系统之美 · thinking-in-systems

类型：修订原作品。正文及标注约 2738 个中文字符。

**核实依据：** 作者十二杠杆点文章包含明确的谦逊与适用边界；存量流量应保持单位一致。

**推论与限制：** 维修队及 40、12、10 等数字均为原创算例。两条反馈回路只作候选解释；公共资源衰竭需要制度条件，杠杆排序不保证实际收益。

**落地：** 以维修任务池补足存量流量推演，并收紧杠杆点与公共资源表述。

- [Meadows：十二个杠杆点](https://donellameadows.org/archives/leverage-points-places-to-intervene-in-a-system/)
- [Meadows：与系统共舞](https://donellameadows.org/archives/dancing-with-systems/)

## 控制论 · cybernetics

类型：修订原作品。正文及标注约 2262 个中文字符。

**核实依据：** MIT Press 核对原著身份与第二版范围；现代反馈教材用于澄清稳定性，避免把有负反馈写成必然收敛。

**推论与限制：** 离散式 y′=y+k(r−y) 为本站模型，0<k<2 的条件只适用于无延迟的该模型。组织与学习映射是类比，历史心理章节不构成当代诊断。

**落地：** 用可手算的稳定与振荡例子深化控制机制，明确工程和组织类比边界。

- [MIT Press：维纳《控制论》](https://mitpress.mit.edu/9780262537841/cybernetics-or-control-and-communication-in-the-animal-and-the-machine/)
- [Åström 与 Murray：反馈系统教材](https://www.cds.caltech.edu/~murray/FBS/First_Edition.html)

## 创新者的窘境 · innovators-dilemma

类型：修订原作品。正文及标注约 2963 个中文字符。

**核实依据：** 研究机构明确区分持续性与破坏性创新，强调进入路径、被过度服务或非消费者、可持续商业模式和向上发展。

**推论与限制：** 低价、客户拒绝、小市场都不是充分条件。两种软件进入情境和收入门槛为编辑假设；低端/新市场分类注明借用后续澄清，不能宣布所有新技术最终胜出。

**落地：** 从新技术标签改为可观察的市场进入路径与组织筛选机制。

- [Christensen Institute：原书书目](https://www.christenseninstitute.org/book/the-innovators-dilemma/)
- [Christensen Institute：破坏性创新理论](https://www.christenseninstitute.org/theory/disruptive-innovation/)

## 麦肯锡方法 · mckinsey-way

类型：修订原作品。正文及标注约 2431 个中文字符。

**核实依据：** 出版方把本书定位为前顾问的实践解读；机构后续公开文章要求好奇心、开放假设、实验及容忍不确定。

**推论与限制：** 原问题树把产品组合当作第三个独立利润贡献，已改为收入/成本下的解释维度。账期例子为原创；2020 年文章不冒充原书内容，80/20 不当作定律。

**落地：** 原位修正利润树的重复归因，并让问题解决流程可被证伪。

- [McGraw Hill：The McKinsey Way](https://www.mheducation.com/highered/mhp/product/mckinsey-way.html)
- [McKinsey：不确定情境的问题解决心态](https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/six-problem-solving-mindsets-for-very-uncertain-times)

## 卓有成效的管理者 · effective-executive

类型：修订原作品。正文及标注约 2565 个中文字符。

**核实依据：** Routledge 目录支持时间、贡献、长处、优先事项和决策等核心主题；Drucker 2004 年相关文章只用于短句说明实践不取决于单一性格。

**推论与限制：** 原稿中文译本信息作为原阅读背景保留，没有声称本次通读该译本。四个入口明确为编辑归组；40 小时时间账、授权与贡献例子均为原创。HBR 页派生表述严格限制在简短一句。

**落地：** 用时间审计与接收者检验深化有效性，限制优势和停止工作的误读。

- [Routledge：The Effective Executive](https://www.routledge.com/The-Effective-Executive/Drucker/p/book/9780750685078)
- [Drucker：2004 年有效管理者文章](https://hbr.org/2004/06/what-makes-an-effective-executive)

## 经济学的思维方式 · economic-way-of-thinking

类型：修订原作品。正文及标注约 2754 个中文字符。

**核实依据：** Pearson 第十三版公开样章及目录支持选择、机会成本、价格协调和制度主题，并核对十六章地图。

**推论与限制：** 工作坊数字是示意估值。机会成本只计最佳可行替代项；沉没成本不排除过去形成的未来后果。价格利润不被等同于完整社会福利，政策推论需要本地资料。

**落地：** 用增量决策与账外成本区分机会成本、沉没成本和福利判断。

- [Pearson：第十三版出版资料](https://www.pearson.com/en-ca/subject-catalog/p/economic-way-of-thinking-the/P200000005920/9780132992589)
- [Pearson：第十三版样章](https://www.pearson.de/media/muster/ext/9781292053608.pdf)
- [Pearson：第十三版目录](https://www.pearson.de/media/muster/toc/toc_9781292053608.pdf)

## 高效能人士的七个习惯 · seven-habits

类型：修订原作品。正文及标注约 1403 个中文字符。

**核实依据：** FranklinCovey 公共说明支持七项习惯、个人与互赖实践，以及双赢中的勇气与体谅。

**推论与限制：** 移除疑似原文署名，改为编辑转述；依赖/独立/互赖不作年龄或人格等级。周末协商为假设，更新不承诺健康或人生结果。

**落地：** 以真实约束与关系协商深化七个习惯，去除人格阶梯和成果保证。

- [FranklinCovey：七个习惯的公开说明](https://ir.franklincovey.com/news-releases/news-release-details/7-habits-highly-effective-people-25th-anniversary-edition)
- [FranklinCovey：双赢思维](https://www.franklincovey.com/habit-4/)

## 思考的框架 · thinking-framework

类型：修订原作品。正文及标注约 1828 个中文字符。

**核实依据：** 原稿与 manifest 都不能确认一本具体书或原作者。使用 Meadows 和 McKinsey 的公开方法作为新增编辑分析的依据。

**推论与限制：** 保留作者未标注身份；“章节”改为编辑路径、“金句”改为编辑提醒。无一手证据的 SpaceX、贝佐斯、柯达因果故事替换为标注的假设任务，不编造来源关系。

**落地：** 明确非已知书籍身份，以流程选择情境替换未证实名人故事。

- [Meadows：系统思考的观察与边界](https://donellameadows.org/archives/dancing-with-systems/)
- [McKinsey：开放假设与不确定性](https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/six-problem-solving-mindsets-for-very-uncertain-times)

## 好战略，坏战略 · good-strategy-bad-strategy

类型：新增公开资料视觉解读。正文及标注约 1301 个中文字符。

**核实依据：** Rumelt 署名文章明确给出诊断、指导方针和协调行动，并区分目标、空话与真正取舍；出版方核对书目。

**推论与限制：** 三人周与导入案例为本站假设。交互只检查给定方针下的配合与资源约束，不自动评价现实战略，也不保证正确诊断。

**落地：** 用资源取舍练习解释诊断、指导方针与协调行动。

- [作者文章：坏战略的危险](https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/the-perils-of-bad-strategy)
- [Penguin Random House 出版资料](https://www.penguinrandomhouse.com/books/208668/good-strategy-bad-strategy-by-richard-rumelt/)

## 设计心理学 1 · design-everyday-things

类型：新增公开资料视觉解读。正文及标注约 1356 个中文字符。

**核实依据：** MIT Press 核对修订扩充版；Norman 的前言强调可供性与示意符的区别。

**推论与限制：** 门、扫描器及操作旅程为本站教学表达，不复刻原书图例。机制固定为推开；显示“推”只改变线索。2013 年修订版与 2014 年 MIT Press 版年份区分。

**落地：** 以一扇门区分可供性、示意符、映射与反馈。

- [MIT Press：修订扩充版](https://mitpress.mit.edu/9780262525671/the-design-of-everyday-things/)
- [Don Norman：修订版前言](https://jnd.org/preface-design-of-everyday-things-revised-edition/)

## 非暴力沟通 · nonviolent-communication

类型：新增公开资料视觉解读。正文及标注约 1285 个中文字符。

**核实依据：** 出版方确认第三版书目，公开四要素资料区分观察/评价、感受/判断、需要/策略以及请求/要求。

**推论与限制：** 项目对话全部为本站假设。拒绝后的回应不评分、不诊断；对需要的猜测应能被对方纠正，强调拒绝与暂停的真实空间。出版社推荐语不被用作疗效证据。

**落地：** 用拒绝之后的回应检验请求是否仍是请求。

- [PuddleDancer Press：第三版](https://nonviolentcommunication.com/product/nvc/)
- [出版方提供：四个要素与关键区别](https://www.nonviolentcommunication.com/bookshare/4_components_of_NVC_4_rev_6.20.19.pdf)

## 金字塔原理 · pyramid-principle

类型：新增公开资料视觉解读。正文及标注约 1240 个中文字符。

**核实依据：** 作者网站与 Pearson 支持将思考、逻辑组织与清楚写作联系起来。

**推论与限制：** 整页的服务点 8 次观察与试点建议为本站案例。互动揭示结构整齐不能扩张证据范围，不声称观察已经确立因果或统计代表性。

**落地：** 让试点案例暴露表达结构与证据力度之间的差别。

- [Barbara Minto 作者网站](https://www.barbaraminto.com/)
- [Pearson 出版资料](https://www.pearson.com/en-gb/subject-catalog/p/the-pyramid-principle/P200000015259/9781292763255)

## 复杂 · complexity-guided-tour

类型：新增公开资料视觉解读。正文及标注约 1298 个中文字符。

**核实依据：** Oxford 摘要核对复杂系统研究的跨领域范围；作者提供配套程序，Santa Fe Institute 提供元胞自动机虚拟实验资源。

**推论与限制：** 元胞自动机由本站独立实现，规则、同步更新、31 格宽度、固定暗边界、单亮格初始条件和 20 代上限明确。图案不是现实涌现的实证，更不把混沌、随机、适应视为同义词。

**落地：** 以确定性元胞自动机理解局部互动、涌现和模型边界。

- [Oxford University Press：Complexity](https://academic.oup.com/book/51004)
- [Melanie Mitchell 作者网站与配套程序](https://melaniemitchell.me/)
- [Santa Fe Institute：虚拟实验室](https://www.complexityexplorer.org/explore/virtual-laboratory)

## 公共事物的治理之道 · governing-commons

类型：新增公开资料视觉解读。正文及标注约 1323 个中文字符。

**核实依据：** Cambridge 核对原著；2009 年作者讲座与访谈强调制度多样性及设计原则是对长期稳健制度的概括，而非同一套处方。

**推论与限制：** 八原则归成四组是教学安排。三家庭资源账不模拟信任、协商、监督或惩罚；两种制度安排为假设，没有用资源条声称制度成功。

**落地：** 把资源约束和治理机制分开检验。

- [Cambridge University Press：Governing the Commons](https://www.cambridge.org/core/books/governing-the-commons/7AB7AE11BADA84409C34815CC288CD79)
- [Ostrom 诺贝尔讲座](https://www.nobelprize.org/uploads/2018/06/ostrom_lecture.pdf)
- [Ostrom 访谈：设计原则不是统一处方](https://www.nobelprize.org/prizes/economic-sciences/2009/ostrom/164465-ostrom-williamson-interview-transcript/)

## 第五项修炼 · fifth-discipline

类型：新增公开资料视觉解读。正文及标注约 1331 个中文字符。

**核实依据：** 出版方及 Senge 主持的 SoL 课程支持五项修炼及结构、假设、愿景和集体学习的联系；作者二十五周年访谈供进一步阅读。

**推论与限制：** 积压、流入、学习收益和疲劳成本全部是明确的模型假设，真实培训不保证提高能力。共同愿景不能代替权责和公平工作条件。

**落地：** 以救急与学习的延迟效应解释五项修炼的联系。

- [Penguin Random House：The Fifth Discipline](https://www.penguinrandomhouse.com/books/163984/the-fifth-discipline-by-peter-m-senge/)
- [SoL：Peter Senge 主持的五项修炼课程](https://www.solonline.org/foundations-for-leadership-fall-2020/)
- [SoL：作者的二十五周年反思](https://www.solonline.org/wp-content/uploads/2019/03/sol_reflections_14.3.pdf)

## 助推 · nudge

类型：新增公开资料视觉解读。正文及标注约 1332 个中文字符。

**核实依据：** 出版方明确 2021 Final Edition；作者新版前言增加 sludge、信息披露等讨论并说明助推的能力边界；Thaler 文章区分帮助选择与有害阻力。

**推论与限制：** 默认设置示意既不订阅也不存储。改变选项后必须重新确认，退出容易。伦理四问为本站建议，不能把提高采纳率等同于福利改善。

**落地：** 用可撤回的默认值示意检查助推与选择权。

- [Penguin：2021 The Final Edition](https://penguinrandomhousehighereducation.com/book/?isbn=9780143137009)
- [作者新版前言：Nudge](https://www.chicagobooth.edu/review/nudge-preface-final-edition)
- [Richard Thaler：Nudges and Sludge](https://www.chicagobooth.edu/review/words-live-flops-nudges-and-sludge)
