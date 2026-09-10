# InkGrove × han-design 主题引擎评估与落地建议 v1.0

## 结论

建议采用，但采用方式应是“可插拔 Art Direction Provider”，而不是让 han-design 接管 InkGrove 整个产品 UI。

InkGrove 负责：
- 左侧导航
- 搜索
- 页面路由
- Article / Concept / Source 数据
- 交互状态
- 可访问性
- 响应式
- Block 组件行为

han-design 负责：
- Article 阅读区域的主题 Token
- 字体与排版气质
- 纹样、材质、边框、留白
- 章节过场
- 部分视觉组件风格
- 中国文化主题的 Art Direction

这样可以同时得到统一产品体验和不同内容的视觉世界。

## 为什么适合

han-design 当前提供 7 个朝代启发主题、9 个文化主题、6 个当代配色主题，并提供专门给已有应用使用的 `han-scoped.css`。官方说明 scoped 入口只在 `data-han-scope` 内定义主题变量，不修改宿主应用全局 body、标题、段落、表单或滚动条。这和 InkGrove 的架构高度匹配。

同时需要注意：han-design 当前版本是 preview，官方定位为设计 Skill + 视觉资产包，而不是通用前端组件库。因此不应把 InkGrove 的交互层绑定到 Han。

## 推荐 V1 暴露的主题

不要把二十多个主题全部暴露给用户。V1 建议只保留 6 个：

1. InkGrove Night
   - 默认主题
   - 科技、认知、管理、综合知识

2. Han · Song
   - 清雅、克制
   - 哲学、人文、经典、宋代内容

3. Han · Qin-Han
   - 厚重、漆器、石刻感
   - 先秦、秦汉、制度史、战争史

4. Han · Ink
   - 水墨、留白
   - 历史人物、思想、文学、艺术

5. Han · Dunhuang
   - 丰富、华彩、文化感
   - 艺术史、宗教史、文明史

6. Han · Celadon
   - 温润、安静
   - 生活、美学、散文、慢阅读

其余主题作为后续高级主题包。

## 主题优先级

推荐：
用户固定偏好 > 当前文章手动选择 > Article 推荐主题 > Book/Collection 推荐主题 > InkGrove 默认主题

Article 数据建议增加：

```json
{
  "art_direction": {
    "theme": "song",
    "intensity": "restrained",
    "hero_style": "editorial",
    "allow_user_override": true
  }
}
```

## 不要只换颜色

主题至少影响五个层级：

1. Color Tokens
2. Typography
3. Border / Radius / Material
4. Spacing / Whitespace
5. Motif / Chapter Break / Hero treatment

例如同一个 Comparison Block：
- Night：现代数字杂志
- Song：细线、留白、低对比
- Qin-Han：厚边、低圆角、朱红与暗金
- Ink：更轻的框体，甚至取消背景
- Dunhuang：装饰性更强，但只用于局部
- Celadon：温润低对比

## 推荐技术结构

```text
InkGrove App Shell
├── Navigation
├── Search
├── Article Router
└── Article Renderer
    └── <article data-han-scope data-theme="song">
        ├── ParagraphBlock
        ├── InsightBlock
        ├── ComparisonBlock
        ├── ProcessBlock
        ├── RelationGraphBlock
        ├── QuoteBlock
        └── ...
```

生产环境中：
- 复制 han-design assets 到项目内；
- InkGrove 已有应用使用 `han-scoped.css`；
- 不直接使用 Han 的全局 reset；
- 不依赖 Han 来实现 Modal、Tabs、Tree、Select 等复杂交互；
- Han 更新时通过 adapter/token mapping 隔离版本变化。

## Theme Adapter

建议不要让业务组件直接依赖所有 Han class。

增加中间层：

```text
Semantic Block
    ↓
InkGrove Theme Adapter
    ↓
InkGrove Native / Han Song / Han Qin-Han / Han Ink...
```

例如：

```ts
type ArtDirection = {
  provider: "inkgrove" | "han";
  theme: "night" | "song" | "qinhan" | "ink" | "dunhuang" | "celadon";
  intensity: "restrained" | "balanced" | "expressive";
}
```

这样未来可以替换或升级 han-design，而不影响 Article Schema。

## 自动推荐主题

上游 Agent 可以推荐，但不要强制。

示例：
- 秦汉史 → qinhan
- 宋代人物 → song
- 中国思想 / 文学 → ink
- 敦煌 / 佛教艺术 → dunhuang
- 美学 / 茶 / 生活 → celadon
- 现代认知、科技、商业 → night

自动推荐只是 Art Direction 元数据，不应该改变知识内容。

## Visual Narrative 与主题的关系

Hero Visual 应和主题协同，但图片资产与主题 CSS 分离。

示例：
- Qin-Han：黑、朱红、暗金、石刻/漆器质感
- Song：清雅、留白、纸张、细线
- Ink：水墨、远近层次、低饱和
- Dunhuang：壁画色、矿物色、纹样
- Night：抽象网络、现代信息视觉

因此：
Article Content ≠ Image Prompt ≠ Theme CSS

三者通过 art_direction 关联。

## 本 Demo 的用途

当前 Demo 是“判断方向”的集成预览：
- 使用 han-design 官方主题概念、命名和 scoped 集成思路；
- 主题视觉为 InkGrove 中的适配演示，并非逐像素复制 Han 的全部 CSS；
- 正式开发时应直接引入官方 `han-scoped.css` 和 assets，再做 Theme Adapter。

## 最终建议

采用 han-design。

但把它定义成：

**InkGrove Cultural Theme Provider**

而不是：

**InkGrove UI Framework**

这是风险最低、长期扩展性最好、同时最能提升视觉差异化的方案。
