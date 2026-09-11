# Ink Grove

## Visual Knowledge Garden

**Version:** 0.1  
**Project Codename:** Ink Grove  
**Product Type:** AI-native Visual Knowledge System  
**Core Idea:** Content is free. The system is stable.

---

# 0. 写在最前面

Ink Grove 不是一个读书笔记 App。

它也不是：

- Notion 的另一个版本
- 知识库后台
- 卡片笔记工具
- 电子书阅读器
- AI 摘要工具
- 第二大脑 Dashboard
- 固定模板的信息图生成器

Ink Grove 想探索的是另一件事情：

> **如果 AI 可以根据知识本身，选择最适合它的表达方式，那么知识系统应该长什么样？**

传统知识系统通常先定义容器：

> 标题 → 摘要 → 标签 → 正文 → 金句 → 卡片

然后要求所有知识进入同一种结构。

Ink Grove 反过来。

我们允许每一份知识拥有自己的表达方式。

《认知觉醒》可以是一份编辑杂志。

《刻意练习》可以是一份训练实验室档案。

《纳瓦尔宝典》可以是一份极简财富哲学手册。

《高效能人士的七个习惯》可以是一张成长地图。

几本书之间产生的新理解，可以成为一份新的：

> Synthesis Artifact。

因此 Ink Grove 的基本原则是：

> **系统不决定知识应该长什么样。**

系统只负责让知识：

- 被发现
- 被阅读
- 被组织
- 被收藏
- 被连接
- 被重新理解
- 被重新组合
- 被再次创造

最终形成一个不断生长的：

# Intellectual Landscape

个人思想景观。

---

# 1. 产品愿景

Ink Grove 希望成为：

> **A visual garden for ideas.**

一个思想可以自由生长、彼此连接，并不断产生新思想的视觉知识花园。

传统知识管理解决的问题通常是：

> “我如何保存信息？”

Ink Grove 更关心：

> “我如何理解信息？”

进一步：

> “不同知识之间会产生什么新的理解？”

因此产品最终要经历三个阶段。

### Stage 1 — Knowledge Artifact

把一个知识主题变成一个高质量视觉作品。

### Stage 2 — Knowledge Connection

发现不同 Artifact 之间的概念关系。

### Stage 3 — Knowledge Synthesis

从已有知识之间创造新的知识。

最终：

> Knowledge → Connection → Synthesis → New Knowledge

形成知识复利。

---

# 2. 产品核心哲学

## 2.1 Content is free. System is stable.

这是 Ink Grove 最重要的架构原则。

系统层保持稳定。

内容层保持自由。

系统负责：

- 首页
- 浏览
- 搜索
- 收藏
- 标签
- 关系
- 阅读
- 创建入口
- Artifact 生命周期

Artifact 可以完全自由。

它可能是：

- HTML
- React
- SVG
- Markdown
- Canvas
- Timeline
- Map
- Diagram
- Interactive Story
- Knowledge Graph
- Dashboard
- Visual Essay
- Longform
- Comparison
- Simulation

未来出现新的内容形式，不应该要求重构 Ink Grove。

---

# 3. Artifact：系统最重要的抽象

Ink Grove 不以 Book 为核心对象。

也不以 Note 为核心对象。

核心对象叫：

# Artifact

Artifact = 一个完整的知识表达作品。

一本书可以产生 Artifact。

一个概念也可以。

一个问题也可以。

例如：

```text
《刻意练习》
↓
Deliberate Practice Artifact
```

但也可以：

```text
“为什么知道很多，却依然没有进步？”
↓
Visual Essay Artifact
```

甚至：

```text
认知觉醒
+
刻意练习
+
七个习惯
↓
Personal Growth OS
```

因此 Artifact 的来源可能是：

```text
Book
Article
Paper
Person
Idea
Question
Topic
Project
History
Conversation
Multiple Artifacts
```

---

# 4. Artifact ≠ Template

这一点必须严格坚持。

不要把 Artifact 系统逐渐做成：

```text
BookTemplate
ArticleTemplate
PersonTemplate
ConceptTemplate
```

模板可以存在。

但模板只是：

> Optional Rendering Strategy

而不是内容模型。

AI 应该能够判断：

> 这个知识最适合怎样表达？

例如：

```text
刻意练习
→ Training Lab

纳瓦尔宝典
→ Black / Gold Philosophy Manual

认知觉醒
→ Editorial Magazine

七个习惯
→ Journey Map

历史事件
→ Timeline

复杂理论
→ System Diagram

思想比较
→ Debate / Comparison

人物生平
→ Narrative Timeline
```

表达形式服务于内容。

而不是内容服从模板。

---

# 5. Artifact Manifest

系统不需要理解 Artifact 内部实现。

每一个 Artifact 提供 manifest。

建议：

```json
{
  "id": "deliberate-practice",
  "slug": "deliberate-practice",

  "title": "刻意练习",
  "subtitle": "如何从平凡走向卓越",

  "type": "book",
  "format": "html",

  "author": "Anders Ericsson",

  "visualStyle": "training-lab",

  "topics": [
    "学习",
    "成长",
    "能力"
  ],

  "concepts": [
    "刻意练习",
    "心理表征",
    "反馈",
    "学习区"
  ],

  "related": [
    "cognitive-awakening",
    "seven-habits",
    "naval"
  ],

  "artifact": {
    "type": "html",
    "src": "/artifacts/deliberate-practice/index.html"
  }
}
```

Manifest 是：

> System ↔ Artifact Contract

系统读取 Manifest。

系统不干涉 Artifact。

---

# 6. Artifact Renderer

第一阶段 HTML Artifact 使用：

```text
iframe
```

而不是直接：

```text
dangerouslySetInnerHTML
```

原因：

Artifact 可以拥有自己的：

- CSS
- Typography
- Animation
- JavaScript
- Layout
- Responsive Strategy

同时避免污染 Ink Grove Shell。

未来 Renderer：

```text
ArtifactRenderer
├── HtmlRenderer
├── MarkdownRenderer
├── ReactRenderer
├── SvgRenderer
├── CanvasRenderer
└── FutureRenderer
```

统一入口：

```tsx
<ArtifactRenderer artifact={artifact} />
```

---

# 7. Ink Grove 本身应该“消失”

系统 UI 不应该与 Artifact 争夺注意力。

Artifact Detail Page 应该非常克制。

普通状态：

```text
← Ink Grove

              ARTIFACT
```

鼠标移动 / Hover：

```text
← Back

刻意练习

收藏
关联
分享
全屏
•••
```

Focus Mode：

```text
F
```

进入以后：

> 所有 Ink Grove UI 消失。

屏幕只剩 Artifact。

这是非常重要的体验。

用户不是“打开一个网页”。

而是：

> 进入一个知识作品。

---

# 8. 首页不是书架

不要做：

```text
我的书籍

[Book]
[Book]
[Book]
[Book]
```

这会让 Ink Grove 迅速变成读书 App。

首页应该表达：

> Knowledge Landscape

例如：

```text
INK GROVE

What do you want to explore today?


FEATURED

认知觉醒
重新理解自己

刻意练习
如何真正变强

纳瓦尔宝典
财富、自由与幸福


PATH

Awareness
   ↓
Principles
   ↓
Practice
   ↓
Capability
   ↓
Leverage
   ↓
Freedom
```

首页首先是：

> 思想入口。

其次才是内容列表。

---

# 9. Explore

Explore 是完整内容浏览空间。

支持：

```text
All
Books
Ideas
People
Systems
Synthesis
History
Visual Essays
```

同时支持：

```text
Topic
Concept
Style
Source
Format
Created Time
```

但 UI 不应该像数据库 Filter Panel。

尽量保持：

> Editorial / Gallery Experience。

---

# 10. Artifact Card

Artifact Card 不应该所有内容都一样。

Card 可以有轻微视觉差异。

Manifest：

```text
visualStyle
```

可以影响：

- Accent
- Cover
- Typography
- Thumbnail
- Hover animation

但 Card Shell 保持一致。

做到：

> System coherence + Artifact personality。

---

# 11. Search

搜索不是只搜索标题。

未来搜索：

```text
Title
Topic
Concept
Author
Question
Artifact Content
Connection
```

例如：

用户搜索：

```text
长期主义
```

可能返回：

```text
纳瓦尔宝典
七个习惯
刻意练习

以及：

“长期主义如何形成能力复利？”
```

最后一项甚至可能是 Synthesis。

---

# 12. Knowledge Connection

这是 Ink Grove 第二阶段真正重要的能力。

Artifact 不应该是孤岛。

例如：

```text
刻意练习
```

存在 Concept：

```text
心理表征
反馈
学习区
能力
长期训练
```

其中：

```text
长期训练
```

可以连接：

```text
七个习惯
→ 不断更新
```

连接：

```text
纳瓦尔宝典
→ Specific Knowledge
```

连接：

```text
认知觉醒
→ 行动反馈循环
```

因此系统逐渐形成：

# Concept Graph

---

# 13. Knowledge Graph

未来数据关系：

```text
Artifact
   ↓
Concept
   ↓
Connection
   ↓
Artifact
```

例如：

```text
认知觉醒
   │
   ├── 注意力
   │
   ├── 主动选择
   │       │
   │       └── 七个习惯
   │
   └── 反馈
           │
           └── 刻意练习
                    │
                    └── 专长
                          │
                          └── 纳瓦尔宝典
```

注意：

Knowledge Graph 不应该为了“有图谱”而做。

Graph 的价值是：

> 帮助用户发现新的连接。

---

# 14. Connection UI

Artifact 阅读到底部：

```text
Continue Exploring
```

例如《刻意练习》：

```text
心理表征
→ 认知觉醒 / 大脑机制

长期训练
→ 七个习惯 / 不断更新

专业能力
→ 纳瓦尔宝典 / Specific Knowledge

完整成长路径
→ 贯通思考篇
```

这比传统：

```text
相关推荐
```

更有意义。

因为这是：

> Conceptual Connection

不是 Recommendation Algorithm。

---

# 15. Synthesis

这是 Ink Grove 最值得发展的 Artifact 类型之一。

Synthesis = 多个知识来源产生的新理解。

例如：

```text
认知觉醒
+
刻意练习
↓
为什么知道很多，却依然没有进步？
```

或者：

```text
七个习惯
+
纳瓦尔宝典
↓
高效能和自由是否存在冲突？
```

或者：

```text
认知觉醒
+
七个习惯
+
刻意练习
+
纳瓦尔宝典
↓
Personal Growth Operating System
```

也就是现在已经出现的：

> 贯通思考篇。

---

# 16. Synthesis Pipeline

未来：

```text
Source Artifact
       ↓
Concept Extraction
       ↓
Connection Discovery
       ↓
Interesting Tension
       ↓
New Question
       ↓
Synthesis
       ↓
New Artifact
```

新 Artifact 又重新进入知识图谱。

于是：

```text
Knowledge
   ↓
Connection
   ↓
Synthesis
   ↓
New Knowledge
   ↓
More Connections
```

形成真正的：

# Knowledge Compounding

知识复利。

---

# 17. Create

未来右上角：

```text
＋ Create
```

点击：

```text
Create a knowledge artifact

What do you want to explore?

┌─────────────────────────────┐
│ 《思考，快与慢》             │
└─────────────────────────────┘
```

然后：

```text
How should it be expressed?

● Let AI decide

○ Knowledge Map
○ Visual Essay
○ Timeline
○ System Diagram
○ Comparison
○ Interactive Story
○ Manual
```

其中：

# Let AI decide

必须作为默认推荐。

因为 Ink Grove 的核心不是：

> AI 填模板。

而是：

> AI 根据知识选择表达方式。

---

# 18. AI Artifact Generation

未来生成流程：

```text
User Input
    ↓
Research / Source
    ↓
Knowledge Extraction
    ↓
Structure Understanding
    ↓
Visual Strategy
    ↓
Artifact Generation
    ↓
Manifest Generation
    ↓
Ink Grove
```

AI 首先回答：

```text
这个内容是什么？
```

然后：

```text
它最重要的结构是什么？
```

最后：

```text
哪种视觉形式最适合表达这种结构？
```

而不是：

```text
选择模板 → 填内容
```

---

# 19. Visual Strategy Engine

未来 AI 可以在生成前内部判断：

```text
Content Nature

Narrative?
System?
Comparison?
Timeline?
Framework?
Philosophy?
Process?
Network?
Journey?
```

然后选择：

```text
Visual Grammar
```

例如：

```text
Narrative
→ Timeline / Visual Essay

System
→ Architecture Diagram

Framework
→ Knowledge Map

Philosophy
→ Editorial / Manifesto

Process
→ Journey / Flow

Comparison
→ Split View

Network
→ Graph

Practice
→ Lab / Workbook
```

但这些不是硬模板。

只是：

> Design Grammar。

---

# 20. Collections

用户可以建立：

```text
Learning
Thinking
Business
History
AI
Life
```

但更有意思的是：

# Journey

例如：

```text
如何成为更清醒的人
```

Journey：

```text
认知觉醒
↓
七个习惯
↓
刻意练习
↓
纳瓦尔宝典
↓
贯通思考篇
```

Collection 是集合。

Journey 是路径。

两者应该区分。

---

# 21. My Intellectual Landscape

这是长期产品愿景。

Ink Grove 最终不是告诉用户：

> 你收藏了 372 个 Artifact。

而是帮助用户理解：

```text
你最近在研究：

认知
学习
系统
财富
历史
AI

你最密集的概念：

反馈
长期主义
系统思维
能力
杠杆

最近出现的新连接：

刻意练习
↔
Specific Knowledge

七个习惯
↔
长期主义

认知觉醒
↔
主动选择
```

甚至：

```text
Unexplored

你已经大量研究“能力形成”，
但很少研究“决策质量”。

Explore?
```

这才是真正的：

> Intellectual Landscape。

---

# 22. AI 不应该只是 Generator

未来 AI 在 Ink Grove 有四种角色。

### ① Creator

创造 Artifact。

### ② Curator

整理知识。

### ③ Connector

发现连接。

### ④ Synthesizer

创造新的理解。

因此：

```text
AI
├── Create
├── Curate
├── Connect
└── Synthesize
```

这比：

```text
AI Chat
```

更符合产品方向。

---

# 23. 产品视觉原则

Ink Grove 本身：

### Calm

安静。

### Editorial

编辑设计感。

### Spatial

有空间感。

### Minimal

系统退居幕后。

### Crafted

不像标准 SaaS。

### Content-first

Artifact 永远是主角。

---

# 24. 不应该出现的视觉

避免：

```text
传统 Dashboard
大量 KPI
Admin Panel
Sidebar + Table
密集按钮
蓝紫 AI Gradient
满屏玻璃拟态
千篇一律 Card Grid
传统读书 App
传统博客
传统 Notion Clone
```

---

# 25. Design Tokens

建议系统本体：

```text
Background
Warm neutral / cool neutral

Text
Near black

Accent
Ink / Vermilion / Indigo / Moss

Radius
12–24px

Shadow
Very subtle

Spacing
Generous

Typography
Editorial hierarchy
```

Artifact 自己可以完全突破这些规则。

系统：

> Quiet.

Artifact：

> Expressive.

---

# 26. Motion

动画不要为了炫技。

推荐：

```text
Fade
Reveal
Soft scale
Page transition
Card lift
Focus fade
Graph connection animation
```

原则：

> Motion explains structure.

而不是：

> Motion decorates UI.

---

# 27. 技术架构

推荐：

```text
Next.js
TypeScript
Tailwind CSS
Framer Motion
Lucide
```

初期：

```text
Local Content
+
Manifest
```

不要数据库。

---

# 28. 项目目录

建议：

```text
ink-grove/

app/
├── page.tsx
├── explore/
├── artifact/[slug]/
├── collections/
├── journeys/
├── graph/
└── create/

components/
├── shell/
├── navigation/
├── artifact/
├── cards/
├── graph/
├── search/
└── ui/

content/
└── artifacts/
    ├── seven-habits/
    │   ├── manifest.json
    │   └── index.html
    │
    ├── deliberate-practice/
    │   ├── manifest.json
    │   └── index.html
    │
    ├── cognitive