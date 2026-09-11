# 28. 项目目录与代码组织

Ink Grove 的目录设计需要服务于一个核心原则：

> **System 与 Artifact 解耦。**

系统代码负责发现、组织和渲染 Artifact。

Artifact 本身保持独立。

推荐初始目录：

```text
ink-grove/
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   │
│   ├── explore/
│   │   └── page.tsx
│   │
│   ├── artifact/
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── collections/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── journeys/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── graph/
│   │   └── page.tsx
│   │
│   ├── create/
│   │   └── page.tsx
│   │
│   └── search/
│       └── page.tsx
│
├── components/
│   │
│   ├── shell/
│   │   ├── AppShell.tsx
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   └── PageTransition.tsx
│   │
│   ├── artifact/
│   │   ├── ArtifactRenderer.tsx
│   │   ├── HtmlRenderer.tsx
│   │   ├── MarkdownRenderer.tsx
│   │   ├── ArtifactToolbar.tsx
│   │   ├── ArtifactMeta.tsx
│   │   ├── ArtifactConnections.tsx
│   │   └── FocusMode.tsx
│   │
│   ├── cards/
│   │   ├── ArtifactCard.tsx
│   │   ├── FeaturedArtifact.tsx
│   │   ├── ConceptCard.tsx
│   │   ├── JourneyCard.tsx
│   │   └── SynthesisCard.tsx
│   │
│   ├── explore/
│   │   ├── ExploreGrid.tsx
│   │   ├── ExploreFilter.tsx
│   │   └── TopicSelector.tsx
│   │
│   ├── search/
│   │   ├── SearchBox.tsx
│   │   ├── SearchResults.tsx
│   │   └── CommandPalette.tsx
│   │
│   ├── graph/
│   │   ├── KnowledgeGraph.tsx
│   │   ├── GraphNode.tsx
│   │   └── GraphEdge.tsx
│   │
│   ├── collections/
│   │   ├── CollectionGrid.tsx
│   │   └── CollectionHeader.tsx
│   │
│   ├── journeys/
│   │   ├── JourneyPath.tsx
│   │   └── JourneyStep.tsx
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── Tag.tsx
│       ├── Tooltip.tsx
│       ├── Dialog.tsx
│       └── EmptyState.tsx
│
├── content/
│   │
│   ├── artifacts/
│   │   │
│   │   ├── seven-habits/
│   │   │   ├── manifest.json
│   │   │   ├── index.html
│   │   │   └── cover.webp
│   │   │
│   │   ├── deliberate-practice/
│   │   │   ├── manifest.json
│   │   │   ├── index.html
│   │   │   └── cover.webp
│   │   │
│   │   ├── cognitive-awakening/
│   │   │   ├── manifest.json
│   │   │   ├── index.html
│   │   │   └── cover.webp
│   │   │
│   │   ├── naval-almanack/
│   │   │   ├── manifest.json
│   │   │   ├── index.html
│   │   │   └── cover.webp
│   │   │
│   │   └── personal-growth-os/
│   │       ├── manifest.json
│   │       ├── index.html
│   │       └── cover.webp
│   │
│   ├── collections/
│   │   └── *.json
│   │
│   └── journeys/
│       └── *.json
│
├── lib/
│   ├── artifacts/
│   │   ├── loadArtifacts.ts
│   │   ├── getArtifact.ts
│   │   ├── searchArtifacts.ts
│   │   └── relatedArtifacts.ts
│   │
│   ├── manifest/
│   │   ├── schema.ts
│   │   └── validate.ts
│   │
│   ├── graph/
│   │   ├── buildGraph.ts
│   │   └── connections.ts
│   │
│   ├── collections/
│   ├── journeys/
│   ├── search/
│   └── storage/
│       └── favorites.ts
│
├── types/
│   ├── artifact.ts
│   ├── concept.ts
│   ├── connection.ts
│   ├── collection.ts
│   └── journey.ts
│
├── styles/
│   ├── globals.css
│   └── tokens.css
│
├── public/
│   ├── artifacts/
│   ├── covers/
│   └── images/
│
└── PRODUCT.md
```

第一阶段不必把所有目录全部实现。

目录代表的是：

> **长期边界，而不是第一天的任务列表。**

---

# 29. Artifact Type System

建议尽早建立 TypeScript 类型。

例如：

```ts
export type ArtifactFormat =
  | "html"
  | "markdown"
  | "react"
  | "svg"
  | "canvas";

export type ArtifactSourceType =
  | "book"
  | "article"
  | "paper"
  | "person"
  | "idea"
  | "question"
  | "topic"
  | "synthesis";

export interface Artifact {
  id: string;
  slug: string;

  title: string;
  subtitle?: string;

  type: ArtifactSourceType;
  format: ArtifactFormat;

  author?: string;
  description?: string;

  visualStyle?: string;

  topics: string[];
  concepts: string[];

  related?: string[];

  cover?: string;

  artifact: {
    type: ArtifactFormat;
    src: string;
  };

  createdAt?: string;
  updatedAt?: string;
}
```

这里要特别注意：

不要过早设计几十个字段。

Manifest 应该：

> Small Core + Extensible Metadata

而不是一开始就成为复杂 CMS Schema。

---

# 30. Manifest Validation

Artifact 是系统边界。

所以 Manifest 必须验证。

推荐：

```text
Zod
```

例如：

```ts
const ArtifactManifestSchema = z.object({
  id: z.string(),
  slug: z.string(),

  title: z.string(),
  subtitle: z.string().optional(),

  type: z.enum([
    "book",
    "article",
    "paper",
    "person",
    "idea",
    "question",
    "topic",
    "synthesis"
  ]),

  format: z.enum([
    "html",
    "markdown",
    "react",
    "svg",
    "canvas"
  ]),

  topics: z.array(z.string()),
  concepts: z.array(z.string()),

  related: z.array(z.string()).optional(),

  artifact: z.object({
    type: z.string(),
    src: z.string()
  })
});
```

错误 Artifact 不应该让整个系统崩溃。

应该显示：

```text
Artifact unavailable

Manifest validation failed.
```

并在开发模式输出详细错误。

---

# 31. HTML Artifact 安全模型

由于未来 HTML 很可能由 AI 生成，这一层非常重要。

第一阶段：

```html
<iframe sandbox="allow-scripts">
```

默认：

不要允许：

```text
allow-same-origin
allow-forms
allow-popups
allow-top-navigation
```

除非某个 Artifact 明确需要。

Artifact 应该被视为：

> Untrusted visual document

而不是系统代码。

这能够保证未来 AI Artifact Generation 更容易扩展。

---

# 32. Artifact 生命周期

未来一个 Artifact 可以经历：

```text
Draft
↓
Generated
↓
Reviewed
↓
Published
↓
Connected
↓
Synthesized
↓
Updated
```

第一阶段不需要实现状态系统。

但架构上不要假设：

> Artifact 永远不会变化。

未来可能出现：

```text
Version 1
Version 2
Version 3
```

甚至：

```text
重新生成视觉
```

但知识内容保持不变。

因此：

> Content Version

与：

> Visual Version

未来最好可以区分。

---

# 33. 首页信息架构

首页建议分为六层。

## 33.1 Hero

不是营销 Banner。

而是：

```text
Ink Grove

A visual garden for ideas.

What do you want to explore today?
```

下面一个极简搜索 / Command Input。

---

## 33.2 Featured Artifact

只突出 1–2 个。

不要十几个。

例如：

```text
Featured

贯通思考篇

从认知觉醒到时间自由：
一套个人成长操作系统。
```

大尺寸视觉预览。

---

## 33.3 Continue Exploring

用户最近阅读：

```text
Continue Exploring

刻意练习
42%

认知觉醒
71%
```

第一阶段可以暂不实现阅读进度。

---

## 33.4 Knowledge Journey

例如：

```text
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

对应已有五个 Artifact。

这应该成为首页非常有辨识度的一块。

---

## 33.5 Recently Added

轻量展示最近 Artifact。

---

## 33.6 Explore by Concept

不是：

```text
分类
```

而是：

```text
Explore an idea

认知
反馈
长期主义
注意力
自由
能力
系统
判断力
```

点击概念进入相关 Artifact。

---

# 34. Detail Page 信息架构

Artifact Detail：

```text
System Header
↓
Artifact
↓
Artifact Meta
↓
Connections
↓
Continue Exploring
```

但默认视觉重点必须是：

# Artifact

Meta 可以收起。

例如：

```text
About this artifact
```

展开：

```text
Source
Topics
Concepts
Created
Visual Style
Connections
```

---

# 35. Focus Mode

Focus Mode 是第一阶段就值得实现的功能。

进入：

```text
F
```

或者点击：

```text
Focus
```

之后：

```text
Header → Fade
Toolbar → Fade
Metadata → Hidden
Background → Neutral
Artifact → Maximum viewport
```

Esc：

退出。

这个体验可以成为 Ink Grove 很重要的产品特征。

---

# 36. Command Palette

建议比较早实现：

```text
⌘ K
```

打开：

```text
Search Ink Grove...

> 刻意练习
```

结果：

```text
ARTIFACTS

刻意练习


CONCEPTS

反馈
心理表征
学习区


ACTIONS

Create Artifact
Explore Graph
```

未来 Command Palette 会成为整个系统的快速入口。

---

# 37. 收藏

第一阶段：

```text
localStorage
```

即可。

例如：

```text
ink-grove:favorites
```

不要为了收藏功能引入数据库和用户系统。

未来账户体系出现后再迁移。

---

# 38. Theme

系统支持：

```text
Light
Dark
System
```

但要区分：

> Ink Grove Theme

与：

> Artifact Theme

Artifact 自己决定视觉。

例如：

系统 Light Mode。

打开《纳瓦尔宝典》仍然可以是 Black Gold。

系统不能强制 Artifact 跟随 Theme。

---

# 39. 响应式原则

Ink Grove Shell 必须：

```text
Desktop
Tablet
Mobile
```

Artifact 则由 Artifact 自己负责响应式。

系统只保证 Renderer：

```text
width: 100%
height: available viewport
```

不要让系统尝试修改 Artifact 内部布局。

---

# 40. Cover Strategy

每个 Artifact 应该有 Cover。

但 Cover 不一定是单独设计的图片。

第一阶段可以：

### Option A

Artifact 截图。

### Option B

Manifest 指定 cover。

### Option C

系统生成简单视觉预览。

优先：

> Artifact Screenshot

因为最能体现作品自己的视觉人格。

---

# 41. Artifact Preview

Card Hover 可以轻微展示：

```text
Preview
```

未来可以：

- 静态截图
- 微缩页面
- Motion preview

第一阶段：

静态 Cover 即可。

不要一开始就在 Grid 里加载几十个 iframe。

---

# 42. Collection

Collection 是：

> 一组 Artifact 的集合。

例如：

```text
Personal Growth
```

包含：

```text
认知觉醒
七个习惯
刻意练习
纳瓦尔宝典
```

Collection 没有强顺序。

---

# 43. Journey

Journey 与 Collection 不同。

Journey 有：

> Order + Narrative

例如：

# From Awareness to Freedom

```text
01
认知觉醒

↓

02
七个习惯

↓

03
刻意练习

↓

04
纳瓦尔宝典

↓

05
贯通思考篇
```

Journey 是一种：

> Curated Learning Path

未来 AI 也可以自动创建 Journey。

---

# 44. Concept

Concept 是 Knowledge Graph 的基本节点。

例如：

```text
反馈
```

Concept 页面未来可以展示：

```text
反馈

Appears in:

认知觉醒
刻意练习
七个习惯

Connections:

反馈
→ 复盘
→ 心理表征
→ 能力成长
```

第一阶段不用做 Concept Detail。

但 Manifest 已经应该保留：

```text
concepts
```

---

# 45. Connection

未来 Connection 不应该只有：

```text
related: [...]
```

而应该升级成：

```json
{
  "from": "deliberate-practice",
  "to": "cognitive-awakening",

  "concept": "反馈",

  "relation": "extends",

  "reason": "两者都强调通过反馈修正认知与行为。"
}
```

Relation 可以有：

```text
related
extends
contrasts
supports
applies
challenges
synthesizes
```

这样 Knowledge Graph 才真正有语义。

---

# 46. Synthesis Artifact Schema

未来：

```json
{
  "type": "synthesis",

  "sources": [
    "cognitive-awakening",
    "seven-habits",
    "deliberate-practice",
    "naval-almanack"
  ],

  "question": "一个人如何从认知觉醒走向真正的自由？",

  "concepts": [
    "觉察",
    "主动选择",
    "原则",
    "能力",
    "杠杆",
    "自由"
  ]
}
```

Synthesis 本身仍然是普通 Artifact。

这点非常重要。

不要建立第二套展示系统。

---

# 47. Create Architecture

未来 Create 页面：

```text
Create Artifact
```

第一步：

```text
What do you want to explore?
```

输入：

```text
《思考，快与慢》
```

第二步：

```text
Source
```

可能：

```text
Public Knowledge
URL
PDF
Text
Existing Artifacts
```

第三步：

```text
Expression
```

默认：

```text
● Let AI decide
```

其他：

```text
Knowledge Map
Visual Essay
Timeline
System
Comparison
Manual
Story
```

最后：

```text
Generate
```

---

# 48. AI Generation Contract

AI 不应该直接随便输出 HTML。

生成过程未来建议拆成：

```text
Research
↓
Knowledge Model
↓
Narrative Structure
↓
Visual Strategy
↓
Artifact
↓
Manifest
```

内部中间结果可以是：

```json
{
  "coreQuestion": "...",

  "keyIdeas": [],

  "relationships": [],

  "narrative": [],

  "visualStrategy": {
    "grammar": "system-map",
    "tone": "editorial",
    "density": "medium"
  }
}
```

然后才生成最终 Artifact。

这样未来：

> 内容理解

和：

> 页面设计

可以分别优化。

---

# 49. AI Design Principle

AI 设计 Artifact 时不要问：

> 哪个模板最合适？

应该问：

> 这个知识的内在结构是什么？

例如：

如果内容结构是：

```text
Cause
→ Process
→ Result
```

适合：

Flow。

如果：

```text
Multiple competing