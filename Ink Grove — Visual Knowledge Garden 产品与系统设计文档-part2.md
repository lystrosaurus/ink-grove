# 50. 产品演进原则

Ink Grove 的开发不应该按照“功能越多越好”的方式推进。

每一个版本都应该验证一个更深层的问题。

建议遵循以下顺序：

```text
能不能展示？
↓
能不能组织？
↓
能不能连接？
↓
能不能生成？
↓
能不能综合？
↓
能不能理解用户的思想地图？
↓
能不能形成知识复利？
```

也就是说：

> 每一版都增加一种“认知能力”，而不仅仅增加一个 UI 功能。

---

# 51. Version 0.1 — Gallery

## 目标

证明最核心的产品体验成立：

> 不同视觉风格的知识 Artifact，可以被一个统一、克制的系统承载。

这一阶段 Ink Grove 本质上是：

# Visual Knowledge Gallery

---

## 核心功能

必须完成：

```text
首页
Explore
Artifact Detail
HTML Artifact Renderer
Artifact Manifest
Artifact Card
本地搜索
Topic Filter
收藏
Focus Mode
Light / Dark Theme
响应式
```

---

## 内容

首批直接放入现有 Artifact：

```text
高效能人士的七个习惯
刻意练习
认知觉醒
纳瓦尔宝典
贯通思考篇
```

最好再增加 3–5 个不同类型内容。

例如：

```text
思考，快与慢
原则
穷查理宝典
系统之美
人类简史
```

目的不是数量。

而是确认：

> Artifact 视觉差异足够大的情况下，Ink Grove 仍然保持整体一致。

---

## 不做

V0.1 明确不做：

```text
用户系统
数据库
AI Generation
Knowledge Graph
评论
同步
多人协作
复杂 CMS
后台
付费
```

---

## 验收标准

V0.1 成功的判断不是：

> 功能齐全。

而是第一次打开 Ink Grove 的人会不会觉得：

> “这不是普通的读书笔记网站。”

具体应该做到：

- 首页能体现知识空间感
- Artifact 有明显视觉人格
- Detail 页面足够沉浸
- 系统 UI 不抢内容
- 五个现有 Artifact 都能稳定打开
- Mobile 体验不崩
- 添加一个新 Artifact 不需要改系统代码

---

# 52. Version 0.2 — Library

## 目标

让 Ink Grove 从“展示作品”升级为：

> 可以长期积累的个人知识库。

重点从：

```text
View
```

升级到：

```text
Organize
```

---

## 新能力

加入：

```text
Collections
Journeys
Recently Viewed
Favorites
Reading History
Concept Tags
Improved Search
Command Palette
```

---

## Collection

用户可以创建：

```text
Personal Growth
AI
Business
History
Design
Philosophy
```

Artifact 可以进入多个 Collection。

---

## Journey

开始支持有顺序的知识路径。

例如：

```text
如何建立个人成长系统

01 认知觉醒
02 七个习惯
03 刻意练习
04 纳瓦尔宝典
05 贯通思考篇
```

这一步很重要。

因为它第一次让 Ink Grove 不只是“横向收藏”，而是出现：

> Narrative Learning Path

---

## 搜索升级

搜索开始覆盖：

```text
Title
Subtitle
Topics
Concepts
Author
Type
```

支持：

```text
⌘ K
```

---

## 数据层

这一阶段仍然可以不引入真正后端。

可以使用：

```text
JSON
LocalStorage
IndexedDB
```

如果需要简单持久化，也可以引入：

```text
SQLite
```

但不要为了“以后会有账号”提前把架构搞复杂。

---

# 53. Version 0.3 — Connections

## 目标

这是 Ink Grove 第一次真正从“知识库”变成：

# Knowledge Network

核心问题：

> 不同 Artifact 之间有什么关系？

---

## 新能力

加入：

```text
Concept
Connection
Related by Concept
Continue Exploring
Connection Reason
Concept Page
Basic Knowledge Graph
```

---

## Connection 数据模型

从简单：

```json
"related": [
  "deliberate-practice"
]
```

升级成：

```json
{
  "from": "cognitive-awakening",
  "to": "deliberate-practice",
  "concept": "反馈",
  "relation": "supports",
  "reason": "两者都将反馈视为修正认知和能力的重要机制。"
}
```

---

## Artifact Detail 新增

页面底部出现：

```text
Connections
```

而不是：

```text
You may also like
```

例如：

```text
注意力
认知觉醒
→
刻意练习的高专注训练

长期主义
七个习惯
→
纳瓦尔宝典的复利

反馈
认知觉醒
→
刻意练习
```

---

## Knowledge Graph

第一版 Graph 不要做成复杂炫技图。

只需要支持：

```text
Artifact
Concept
Connection
```

三类节点即可。

用户点击节点：

```text
Highlight neighborhood
```

看到局部关系。

不要一开始加载整个宇宙。

---

# 54. Version 0.4 — Create

## 目标

从：

> 人工把 Artifact 放进系统

升级成：

> 用户可以在 Ink Grove 里创造 Artifact。

这是产品开始进入 AI-native 阶段。

---

## Create Flow

```text
Create
↓
输入主题
↓
选择来源
↓
AI 理解内容
↓
AI 选择表达策略
↓
生成 Artifact
↓
生成 Manifest
↓
加入 Ink Grove
```

---

## 来源

支持：

```text
Topic
Book
URL
Text
PDF
Existing Artifacts
```

第一版可以只做：

```text
Topic
Text
URL
```

---

## Expression

默认：

```text
Let AI decide
```

手动选项：

```text
Visual Essay
Knowledge Map
Timeline
System Diagram
Comparison
Manual
Journey
```

---

## 为什么 Let AI decide 必须优先

这是 Ink Grove 和传统 AI 内容工具的关键区别。

传统工具：

```text
选择模板
↓
AI 填内容
```

Ink Grove：

```text
理解知识
↓
识别结构
↓
选择视觉语法
↓
生成表达
```

因此：

> Design is part of reasoning.

视觉不是最后一层装饰。

---

# 55. Version 0.5 — Artifact Studio

## 目标

生成之后，用户可以“和作品一起工作”。

而不是：

> Generate once and forget.

这一阶段引入：

# Artifact Studio

---

## Studio 能做什么

例如：

```text
Make it simpler
Make it more visual
Add examples
Make it more rigorous
Change style
Turn into timeline
Turn into comparison
Add a section
Remove a section
Change emphasis
```

---

## 重要原则

Studio 不应该变成复杂网页编辑器。

不要做：

```text
拖拽 div
改 padding
调 border
调 font-size
```

用户表达的是：

> 意图。

例如：

```text
“这个太像报告了，想更像一张思想地图。”
```

AI 负责重新设计。

---

## Artifact Revision

需要开始支持：

```text
Version History
```

例如：

```text
v1 — Generated
v2 — More visual
v3 — Added examples
```

---

# 56. Version 0.6 — Synthesis

## 目标

这是 Ink Grove 的一个关键拐点。

不再只是：

> 从外部内容生成知识 Artifact。

而开始：

> 从已有 Artifact 中生成新的知识。

---

## Synthesis Entry

用户选中：

```text
认知觉醒
刻意练习
纳瓦尔宝典
```

点击：

```text
Synthesize
```

AI 分析：

```text
共同点
冲突
缺口
延伸
潜在问题
```

---

## AI 可以建议

例如：

```text
Possible Synthesis

1.
为什么很多人知道很多，却无法真正变强？

2.
Specific Knowledge 是如何通过刻意练习形成的？

3.
认知、能力和财富之间是什么关系？
```

用户选择一个。

生成：

```text
Synthesis Artifact
```

---

## Synthesis Artifact

必须和普通 Artifact 一样。

例如：

```text
type: synthesis
```

其他系统完全复用。

不要为 Synthesis 建另一套阅读 UI。

---

# 57. Version 0.7 — AI Connector

## 目标

让系统开始自动发现：

> 用户可能没有意识到的知识连接。

AI 角色开始从 Creator 变成：

# Connector

---

## 自动分析

当新 Artifact 加入时：

AI 提取：

```text
Concepts
Claims
Frameworks
Questions
People
Methods
Tensions
```

然后和已有知识比较。

---

## 输出

例如：

```text
New Connection Found

《刻意练习》
心理表征

↔

《认知觉醒》
认知模式

Why:
两者都涉及大脑通过重复经验形成内部模型。
```

用户可以：

```text
Accept
Ignore
Explore
```

---

## Connection Inbox

可以有一个很轻量的页面：

```text
Connections to Review
```

避免 AI 自动污染知识图谱。

原则：

> AI proposes. User curates.

---

# 58. Version 0.8 — Intellectual Landscape

## 目标

这一阶段 Ink Grove 开始真正理解：

> 用户的知识世界长什么样。

这是产品从工具向“思想环境”演进的重要版本。

---

## 首页升级

首页不只是 Featured。

开始出现：

```text
Your Landscape
```

例如：

```text
You are currently exploring

Learning
Systems
Decision Making
AI
Freedom
```

---

## Insights

系统可以发现：

```text
Most explored concepts

反馈
长期主义
系统
认知
杠杆
```

---

## Recent Growth

```text
Recently growing area

Decision Making
+7 new connections
```

---

## Blind Spots

例如：

```text
You have explored:

How to build capability

But less:

How to choose what capability is worth building
```

然后建议：

```text
Explore Judgment
```

---

## 原则

这里绝不能变成：

> AI 教训用户。

表达应该是：

```text
You may want to explore...
```

而不是：

```text
You lack...
```

---

# 59. Version 0.9 — Knowledge Questions

## 目标

让 Ink Grove 从：

> “我有什么知识？”

升级成：

> “我正在追什么问题？”

这是非常重要的一步。

---

## Question 成为一等对象

例如：

```text
为什么知道很多却改变不了自己？
```

它可以连接多个 Artifact：

```text
认知觉醒
刻意练习
七个习惯
```

---

## Question Page

```text
QUESTION

为什么知道很多却无法改变？
```

下面：

```text
Relevant Artifacts
Relevant Concepts
Different Answers
Contradictions
Open Questions
Synthesis
```

---

## 为什么 Question 重要

真正的知识不是围绕：

> 文件。

而是围绕：

> 问题。

所以长期来看：

```text
Artifact
Concept
Question
```

应该成为 Ink Grove 的三大基础实体。

---

# 60. Version 1.0 — Personal Knowledge OS

## 目标

到这一阶段，Ink Grove 才真正成为：

# Personal Knowledge Operating System

不是简单的作品展示工具。

---

## 1.0 应该具备

### Artifact

可以自由创建和展示。

### Connections

知识可以形成语义连接。

### Synthesis

已有知识可以产生新知识。

### Questions

围绕长期问题组织探索。

### Journey

可以形成学习路径。

### AI

可以：

```text
Create
Curate
Connect
Synthesize
```

### Landscape

系统能够帮助用户理解自己的知识结构。

---

# 61. Version 1.1 — Source Grounding

## 目标

让每一份知识作品知道：

> 它基于什么。

Artifact 可以保存：

```text
Sources
References
Quotes
Notes
```

---

## Source Types

```text
Book
PDF
URL
Article
Paper
Video
Conversation
Manual Input
```

---

## Artifact Source Drawer

阅读 Artifact 时可以打开：

```text
Sources
```

看到：

```text
原始书籍
引用段落
外部文章
参考材料
```

这会让 Ink Grove 从“视觉摘要”走向：

> 可验证知识作品。

---

# 62. Version 1.2 — Research Mode

## 目标

用户不只是生成已有知识总结。

而是：

> 提出一个问题，让 Ink Grove 完成研究。

例如：

```text
AI 时代个人最值得建立的长期能力是什么？
```

系统：

```text
Research
↓
Source Collection
↓
Claim Extraction
↓
Comparison
↓
Synthesis
↓
Artifact
```

输出可能是：

```text
Research Artifact
```

并且保留 Sources。

---

# 63. Version 1.3 — Living Artifacts

## 目标

让 Artifact 不再是静态的。

例如：

```text
AI Agent Landscape 2026
```

未来技术变化时：

```text
Update Available
```

用户可以选择：

```text
Review changes
Update artifact
Keep old version
```

---

## Living Artifact

Manifest：

```json
{
  "living": true,
  "updatePolicy": "manual"
}
```

未来也可以：

```text
Monthly
Quarterly
On source change
```

---

# 64. Version 1.4 — Temporal Knowledge

## 目标

支持知识随时间演进。

例如：

```text
My understanding of AI
```

2026：

```text
Agent
Tool Use
Reasoning
```

2027：

可能变化。

Ink Grove 可以展示：

```text
Idea Evolution
```

而不是只显示最新版本。

---

# 65. Version 1.5 — Contradictions

## 目标

开始把“冲突”视为知识的一部分。

传统知识库喜欢：

> 把内容整理成一致答案。

但真正深度思考需要：

> 保留冲突。

---

## Example

```text
七个习惯
强调原则驱动

纳瓦尔宝典
强调个人自由与欲望减少
```

系统可以问：

```text
Are these always compatible?
```

生成：

```text
Tension Artifact
```

---

## Relation

增加：

```text
contradicts
challenges
qualifies
```

---

# 66. Version 1.6 — Multi-Perspective

## 目标

同一个问题可以有多个解释。

例如：

```text
什么是成功？
```

可以分别从：

```text
心理学
哲学
创业
财富
关系
历史
```

去理解。

生成：

# Perspective Artifact

不是追求一个最终答案。

而是：

> 展示不同认知框架。

---

# 67. Version 1.7 — Personal Annotation

## 目标

让用户真正参与知识，而不仅仅阅读。

Artifact 里可以：

```text
Highlight
Note
Question
Reaction
Connection
```

但不要复制传统 PDF Annotation。

更适合：

```text
Select concept
→ Add thought
```

例如：

```text
“长期主义”
```

用户写：

```text
我觉得长期主义只有在方向正确时才有效。
```

这条个人 Thought 可以进入 Knowledge Graph。

---

# 68. Version 1.8 — Personal Thought Artifact

## 目标

让用户自己的想法也成为 Artifact。

例如：

```text
今天想到：

效率可能不是解决拖延的核心。
核心也许是意义感不足。
```

系统可以：

```text
Turn into Artifact
```

然后连接：

```text
认知觉醒
七个习惯
```

这时 Ink Grove 不只是：

> 收藏别人思想。

而开始：

> 生长自己的思想。

---

# 69. Version 1.9 — Conversational Exploration

## 目标

加入对话，但不要变成普通 Chat。

对话应该发生在：

> 当前知识环境里。

例如打开《刻意练习》：

```text
Ask this artifact
```

用户：

```text
这套方法对学习编程怎么用？
```

AI 回答可以引用当前 Artifact。

然后：

```text
Save as Thought
Create Practice Plan
Generate New Artifact
```

---

# 70. Version 2.0 — Knowledge Companion

## 目标

到 2.0，AI 不再只是按命令工作。

它开始成为：

# Knowledge Companion

但必须保持克制。

---

## AI 可以做

例如：

```text
You have been exploring deliberate practice and system thinking.

There may be an interesting connection:
feedback loops.
```

或者：

```text
Three artifacts you created this month all touch on “judgment”.

Would you like to synthesize them?
```

---

## AI 不应该做

不要：

```text
每天疯狂推送
强行总结人生
无休止建议
假装比用户更了解用户
```

原则：

> AI surfaces possibilities.

User decides meaning.

---

# 71. Version 2.1 — Generative Journeys

## 目标

AI 根据用户的问题生成学习路径。

用户：

```text
我想真正理解“决策”。
```

Ink Grove：

```text
Journey: Understanding Decision Making

01 Cognitive Bias
02 Mental Models
03 Probabilistic Thinking
04 Feedback
05 Judgment
06 Decision Systems
```

Journey 可以混合：

```text
Existing Artifact
New Artifact
External Source
Question
Exercise
```

---

# 72. Version 2.2 — Practice Artifacts

## 目标

把“知道”连接到“做到”。

Artifact 不只是知识说明。

也可以是：

```text
Practice Artifact
```

例如《刻意练习》生成：

```text
30-Day Deliberate Practice Protocol
```

每天：

```text
Goal
Exercise
Feedback
Reflection
```

这会让系统连接：

> Knowledge → Action

---

# 73. Version 2.3 — Decision Artifacts

## 目标

将知识真正用于现实问题。

例如：

```text
Should I start a company?
```

生成：

# Decision Artifact

结构：

```text
Question
Constraints
Values
Options
Tradeoffs
Relevant Knowledge
Unknowns
Decision
Review Date
```

并连接已有知识。

---

# 74. Version 2.4 — Project Knowledge

## 目标

Artifact 开始服务实际项目。

例如：

```text
Build Ink Grove
```

Project 下：

```text
Research
Decisions
Architecture
Ideas
References
Artifacts
Questions
```

这会让 Ink Grove 从 Personal Knowledge 进入：

> Knowledge Work

---

# 75. Version 2.5 — Shared Groves

## 目标

支持共享，但不是传统社交。

可以分享：

```text
Artifact
Collection
Journey
Synthesis
Grove
```

例如：

```text
My AI Learning Grove
```

公开后别人可以浏览。

---

## 不做传统社交 Feed

避免：

```text
点赞排行榜
关注焦虑
内容流
流量竞争
```

Ink Grove 的共享更接近：

> Open Garden

而不是 Social Network。

---

# 76. Version 2.6 — Collaborative Grove

## 目标

多人共同研究一个主题。

例如：

```text
AI Agents 研究组
```

成员共同添加：

```text
Artifact
Source
Question
Connection
Synthesis
```

重点是：

> Shared intellectual space.

而不是协作文档。

---

# 77. Version 2.7 — Public Knowledge Gardens

## 目标

允许专家或创作者发布完整知识花园。

例如：

```text
Economics Grove
Philosophy Grove
AI Research Grove
Design Grove
```

每个 Grove 可以拥有自己的：

```text
Artifacts
Journeys
Concept Graph
Questions
Synthesis
```

---

# 78. Version 2.8 — Artifact Ecosystem

## 目标

允许用户创建新的 Artifact Renderer / Visual Grammar。

例如：

```text
Timeline Renderer
Argument Map
Scientific Paper Map
Historical Atlas
Code Architecture
Character Network
```

未来可能形成：

# Artifact Ecosystem

类似插件。

但核心不是 UI Widget。

而是：

> Knowledge Representation。

---

# 79. Version 3.0 — Intellectual Infrastructure

## 长期愿景

如果 Ink Grove 真正走到 3.0，它不再只是一个应用。

而是一层：

# Intellectual Infrastructure

它帮助一个人长期完成：

```text
Discover
Understand
Remember
Connect
Question
Practice
Decide
Create
Synthesize
Evolve
```

---

# 80. 版本路线图总览

可以把整个路线压缩为：

```text
0.1
Gallery
展示知识

↓

0.2
Library
组织知识

↓

0.3
Connections
连接知识

↓

0.4
Create
生成知识作品

↓

0.5
Studio
编辑与再表达

↓

0.6
Synthesis
创造新理解

↓

0.7
Connector
自动发现关系

↓

0.8
Landscape
理解个人知识结构

↓

0.9
Questions
围绕问题组织知识

↓

1.0
Personal Knowledge OS
形成完整系统

↓

1.x
Grounding / Research / Living Knowledge / Contradictions

↓

2.x
Practice / Decision / Projects / Shared Groves

↓

3.0
Intellectual Infrastructure
```

---

# 81. 建议实际开发顺序

虽然路线很长，但真正落地时不要同时做。

推荐 Codex 严格按照：

## Milestone A

```text
Artifact Infrastructure
```

完成：

```text
Manifest
Loader
Renderer
Detail
Card
```

---

## Milestone B

```text
Beautiful Shell
```

完成：

```text
Home
Explore
Navigation
Focus Mode
Theme
```

---

## Milestone C

```text
Knowledge Organization
```

完成：

```text
Search
Topics
Favorites
Collections
Journeys
```

---

## Milestone D

```text
Knowledge Connection
```

完成：

```text
Concept
Connection
Related Artifact
Basic Graph
```

---

## Milestone E

```text
AI Creation
```

完成：

```text
Create
Visual Strategy
Artifact Generation
Manifest Generation
```

---

## Milestone F

```text
Synthesis
```

完成：

```text
Multi-Artifact selection
Question generation
Synthesis Artifact
```

---

# 82. 当前最重要的产品判断

在前几个版本里，不要急着证明：

> AI 很强。

先证明：

> 这种知识呈现方式值得存在。

第一阶段最大的风险不是技术做不出来。

而是最后做成：

```text
另一个知识管理 SaaS
```

所以每次新增功能都应该问：

> 这个功能是在强化“Visual Knowledge Garden”，还是正在把产品拉回传统知识库？

---

# 83. 功能优先级判断框架

未来出现新需求时，用四个问题判断：

### 1.

它是否让知识更容易被理解？

### 2.

它是否让不同知识之间产生更多连接？

### 3.

它是否帮助用户形成新的思想？

### 4.

它是否保持 Artifact 的表达自由？

如果四个问题都是否：

> 不做。

---

# 84. 第一阶段真正的 North Star

V0.1 不要看：

```text
DAU
Artifact count
Retention
```

如果只是自己先用，更不用看。

第一阶段真正应该观察：

> 我是否愿意反复打开这个系统？

以及：

> 当我读完一个 Artifact 后，我是否自然地想进入下一个？

还有：

> 我是否开始产生“再做一个”的冲动？

如果答案是 Yes，

说明 Grove 开始有生命。

---

# 85. 第二阶段 North Star

当 Connection 出现后：

> 用户是否通过 Ink Grove 发现了原本没有意识到的联系？

这是比：

```text
点击率
```

更重要的信号。

---

# 86. 第三阶段 North Star

当 Synthesis 出现：

> 系统是否帮助用户形成了以前没有的理解？

这是 Ink Grove 最终真正的价值。

---

# 87. 最终产品宣言

Ink Grove 不应该成为一个装满信息的仓库。

它应该是一座不断生长的思想花园。

在这里：

```text
书不是终点。
文章不是终点。
笔记不是终点。
Artifact 也不是终点。
```

真正的终点是：

```text
理解。
```

而理解之后：

```text
Connection.
```

连接之后：

```text
Synthesis.
```

综合之后：

```text
New Thought.
```

最终形成：

# Knowledge Compounding

知识开始复利。

Ink Grove 的使命不是帮助用户拥有更多信息。

而是帮助用户：

> **看见更多联系，形成更深理解，最终拥有自己的思想。**