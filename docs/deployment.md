# CloudBase 部署

Ink Grove 与 Seed Grove 以同一份静态产物部署到现有 CloudBase 环境，分别从 `/` 与 `/seed` 进入。上线后仍使用访问者浏览器中各自独立的本地存储；没有账号、云同步、数据库或真实 AI 服务，花园备份和儿童输入不会上传到云端。

## 当前目标

| 项目               | 值                                                                                |
| ------------------ | --------------------------------------------------------------------------------- |
| 环境               | `ink-d0gvorjko99e99e4d`                                                           |
| 地域               | `ap-shanghai`                                                                     |
| 站点               | [Ink Grove 在线花园](https://ink-d0gvorjko99e99e4d-1303038884.tcloudbaseapp.com/) |
| 配置文件           | 根目录 `cloudbaserc.json`                                                         |
| 配置中的站点       | `hosting[].name: web`，项目根 `app`，构建输出 `dist`                              |
| 实际上传目录与路径 | 仓库根目录下 `app/dist` → 云端 `/`                                                |
| 已验证的 CLI       | `@cloudbase/cli` 3.8.1                                                            |

这是 CloudBase 默认测试域名。首次打开会出现平台的访问提示，等待倒计时后点击「确定访问」即可进入花园；该提示不由本站代码提供。[CloudBase 默认域名说明](https://docs.cloudbase.net/service/alias)解释了中间页和非导航请求的 `Content-Disposition: attachment`。正式对外使用时可另行绑定自定义域名；当前没有绑定自定义域名。

本机地址与线上地址属于不同的浏览器存储来源。需要迁移收藏、阅读进度或个人作品时，在原地址导出花园 JSON，再在新地址导入。

## 构建、验证与发布

以下命令均从仓库根目录执行。首次安装项目依赖用 `npm --prefix app ci`。如 CLI 尚未登录，使用正常的 `tcb login` 流程；不要把凭据写进仓库或前端环境变量。

```powershell
tcb --version
tcb hosting detail -e ink-d0gvorjko99e99e4d
npm test
npm run test:e2e
npm run build
npm run preview
```

预览服务运行后，在另一终端执行生产检查：

```powershell
node app/scripts/verify-production.mjs
node app/scripts/verify-seed-production.mjs
node app/scripts/verify-edition.mjs
```

三个脚本不传参数均默认检查 `http://127.0.0.1:4173`，也接受站点根URL。production检查Ink深链接与全部HTML正文；seed-production检查Seed四区、六个统一活动与延伸、Think8、保存和手机版；edition逐一操作23本新书和3篇贯通文章，同时检查首页入口、深色配色、390px宽度、两份图解的320px缩放与键盘滚动，以及自动外部请求。后两者支持 `--capture` 保存展示截图。

确认生产检查通过，再发布同一份 `app/dist`：

```powershell
tcb hosting deploy app/dist -e ink-d0gvorjko99e99e4d --safe --verify
```

上传完成后运行公网检查：

```powershell
node app/scripts/verify-production.mjs https://ink-d0gvorjko99e99e4d-1303038884.tcloudbaseapp.com/
node app/scripts/verify-seed-production.mjs https://ink-d0gvorjko99e99e4d-1303038884.tcloudbaseapp.com/
node app/scripts/verify-edition.mjs https://ink-d0gvorjko99e99e4d-1303038884.tcloudbaseapp.com/
```

以上命令用于重复执行发布流程；本版CLI校验和公网页面检查状态见 [1.4发布验收](../artifacts/verification-1.4.json)，历史结果保存在 [1.3验收](../artifacts/verification-1.3.json)及更早发行记录中。

此命令只上传已构建产物，不重复安装或构建，不上传 `materials/`、设计文档、源码或本地花园数据。`--safe` 在覆盖前创建云端备份；`--verify` 检查本地产物与远端文件。入口 HTML 在资源文件上传完成后上传。发布失败时 CLI 尝试从备份恢复覆盖文件，并移除此轮新增文件。[CLI 静态托管文档](https://docs.cloudbase.net/cli-v1/hosting)提供参数和一致性发布说明。

**CLI 3.8.1 的根路径参数必须省略。**不要给上述命令增加第二个 `/` 或 `.` 参数。该版本对显式 `/` 生成 `/index.html` 等本地清单 Key，远端列举却返回 `index.html`，造成全部文件被报为 `missing`。回滚比较使用同样的不一致 Key，会把覆盖文件误判为新增文件并删除；即使输出「已自动回滚」，也必须检查实际站点文件。省略参数会令本地清单、上传路径和远端 Key 保持一致；历史发布已验证这种调用方式可同时通过 `--safe --verify`，每轮仍须检查当次结果。

这次发布不使用 `--prune`。环境根路径还保存 CloudBase 的 `__auth/`、`cloud-admin/` 等文件，不能把它们作为本站的旧产物删除。该命令覆盖同名作品和入口文件，并保留远端其他文件；旧的带哈希 CSS/JS 也保留，已经打开的旧页面仍可请求它们。不要对整个云端根目录执行清空操作。

`cloudbaserc.json` 记录项目构建位置、`installCommand: npm ci` 与 `prune: false`，供声明式部署使用；`tcb hosting deploy` 的文件发布选项以命令行为准。CLI 3.8.1 与后续版本的声明式自动构建行为不同，升级后应重新阅读本机 `tcb deploy --help`，不要假设它与上述文件发布命令相同。

## 路由与上线检查

本站使用 History 路由，直接打开或刷新 `/explore`、`/artifact/:slug`、`/journeys/personal-growth`，以及 `/seed`、`/seed/layer/:id`、`/seed/play/:slug`、`/seed/think/q2`、`/seed/parent` 必须进入对应体验。`tcb hosting detail` 的错误文档为空，并不能单独证明回退失效，必须以公网响应和浏览器结果为准。`/seeds/` 是作品静态资源前缀，不是 `/seed` 应用路由。

现有环境对不存在的资源也会回退到入口 HTML。因此当前 CDN 的资源 404 语义不完整，不能仅凭 HTTP 200 判定作品或脚本已部署成功。上线检查应同时验证 HTML 作品正文、脚本内容类型与实际页面交互。后续配置自定义域名或精细路由时，应把回退限制在应用路由，令不存在的 `/assets/`、`/artifacts/`、`/seeds/` 资源返回 404。

每轮发布后：

1. 打开线上首页，在全新浏览器上下文中按平台提示确认访问。
2. 直接打开并刷新探索页、作品页和旅程页；确认路由、筛选、作品内部交互正常。
3. 验证本轮新增作品标题、正文和封面确实出现；HTML 仍在 `sandbox="allow-scripts"` iframe 中读取。
4. 确认没有应用控制台错误，并保留 CLI 输出中的备份路径与校验结果。

继续覆盖1.3引入的Seed统一体验与数据保护：从Ink进入Seed，四区、六活动与八张思考工具没有年龄分组；延伸自由可用；实际互动与显式保存正常；v1兼容、损坏保护及两套备份独立。1.4在此基础上覆盖57件Ink作品（54件HTML）、10个集合、35个概念，检查23本新书与3篇文章的实际互动，不沿用旧数量判断发布完整性。

1.1.0 的目录基准是 31 件作品、28 件 HTML、7 个集合、35 个概念，其中 27 件 HTML 来自 `materials/`，另有《清醒行动实验室》。追加的六件作品覆盖股东信、经济学、管理效能、价值投资与当下觉察；公网验收须包含它们，不能沿用扩容前的作品数量或产物清单。参考资料应先在父页显示目标域名，点击「打开参考资料」后再打开新页，不能通过增加 iframe 弹窗权限来适配线上环境。

当前入口页面响应为 `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`，资源仍应按实际响应验证。若之后启用 CDN 长缓存，不给 `index.html` 设置长期缓存，避免新入口引用与旧脚本版本错配。字体及带内容哈希的资源可采用较长缓存。

只读检查命令：

```powershell
tcb hosting detail -e ink-d0gvorjko99e99e4d --json
tcb hosting list artifacts/ -e ink-d0gvorjko99e99e4d --json
tcb domains ls -e ink-d0gvorjko99e99e4d --filter 'DomainType=STATIC_STORE' --json
```

## 回滚

1.3 的 Seed 数据格式升级为 v2，但存储键仍是 `seed-grove:garden:v1`。静态站点回滚不会将访问者已保存的数据降为旧格式；1.2 无法读取 v2，会按未知版本进入原始恢复保护。涉及回退到 1.2 时，先保留当前 Seed 导出，并验证该数据在计划部署版本中的处理方式；优先修复后发布仍兼容 v2 的版本，不把旧程序能加载等同于用户记录可用。

优先从已验证的历史提交重新构建上一版，避免依赖完整性未知的云端快照。在仓库外建立独立工作树，替换下列 `<提交号>`：

```powershell
git worktree add --detach C:/tmp/ink-grove-rollback <提交号>
```

在该工作树中执行依赖安装、测试、构建和生产检查，再上传其产物；不会改写当前分支：

```powershell
npm --prefix app ci
npm test
npm run test:e2e
npm run build
```

启动该工作树的生产预览并检查后，仍省略云端根路径参数：

```powershell
tcb hosting deploy app/dist -e ink-d0gvorjko99e99e4d --safe --verify
```

`--safe` 只在上传或校验失败时尝试自动回滚，不能替代发布后的产品检查。CLI 输出的 `.cloudbase-backup/<时间戳>/` 是该次命令执行前的文件快照，不保证对应一个完整可用版本；失败后重试生成的快照可能只包含残余文件。备份默认保留，不自动清理。

如确实需要从备份恢复，先在 CloudBase 或其底层 COS 文件管理中核实备份对象，再下载到仓库外的专用目录。按发布前清单验证 `index.html`、其引用的全部脚本与样式，以及各作品内容和封面的完整性，再按同样的安全发布命令上传。以下本地目录须替换为已核验快照的位置：

```powershell
tcb hosting deploy 'C:/tmp/ink-grove-rollback/<时间戳>' -e ink-d0gvorjko99e99e4d --safe --verify
```

回滚不带 `--prune`，恢复旧入口、脚本和同名作品后重新做公网检查。本轮新增但旧版不引用的文件可能仍在云端；需要完全移除时，先根据发布差异逐项核对，只删除确定属于被撤回版本的路径。文件快照不包含域名、路由和缓存配置，调整这些配置前应另行记录原值。

### 1.1.0 发布的备份限制

在追加六份素材之前，首次调用因显式 `/` 触发上述 CLI 缺陷。CLI 报告备份前缀 `.cloudbase-backup/1789152740091/`；失败后的错误回滚删除了同名应用文件，线上根目录只余 8 个文件。随后省略 `cloudPath` 重新发布，当时的 183 个产物上传和校验成功，恢复了应用文件；该批次的公网页面检查及远端 ETag 与本地 MD5 核对均通过。183 是扩容前批次的历史数量，31 件作品版本的产物清单与最终公网验收结果以最新 [发布验收记录](../artifacts/verification.json)为准。

第二次命令报告的备份前缀为 `.cloudbase-backup/1789152807331/`，产生于根目录只剩 8 个残余文件时，未核实其对象或内容，**不能把它视为完整上一版回滚点**。第一份备份的 CLI 列举结果为空，存在性及完整性也未验证，不能依赖它恢复旧版。两份路径均不代表已经验证的可用快照。[发布验收记录](../artifacts/verification.json)记录首次失败、修正命令、成功校验及 `backupVerified: false`；回退旧版仍优先从历史提交重新构建。

最终 31 件作品版本已完成 201 个产物的一致性校验与公网浏览器验收。最后一次发布报告备份前缀 `.cloudbase-backup/1789153453510/`；该备份内容未单独验证，不能仅凭 CLI 提示替代恢复检查。

部署前原站点的六个平台文件为 `__auth/device/index.html`、`__auth/env/login.config.json`、`__auth/env/logo.svg`、`__auth/index.html`、`__auth/oauth/index.html`、`cloud-admin/index.html`。最终文件列表确认六个文件均保留，ETag 与发布过程中的基线一致。
