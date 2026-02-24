# DEVLOG.md — 开发日志

> 格式规范：
> - `[INFO]` 正常进展
> - `[ERROR]` 出现错误及解决方案
> - `[FIX]` 已修正的设计问题
> - `[TODO]` 待解决事项

---

## 2026-02-18

### 阶段：Research（参考项目分析）

**[INFO]** 克隆参考项目 `github-raw-link-copier` 到 `temp_clone/`

参考项目核心逻辑（55 行原生 JS）：
- 选择器：`a[data-testid="raw-button"]`
- URL 转换：`href.replace('/raw/', '/')` + 域名替换
- SPA 处理：MutationObserver 监听整个 `document.body`
- 权限：`clipboardWrite` + `scripting`

**[INFO]** 确认技术选型（甲方确认）：
- 浏览器：Chrome/Edge（MV3）
- 语言：TypeScript
- 框架：WXT（专为浏览器扩展设计，支持 HMR + SPA 事件）

---

### 阶段：规划设计

**[INFO]** 完成开发规划文档，路径：`~/.claude/plans/mossy-popping-wozniak.md`

模块划分：
- `src/modules/url-parser.ts` — URL 解析（纯函数）
- `src/modules/dom-injector.ts` — DOM 注入
- `src/modules/clipboard.ts` — 剪贴板 + 视觉反馈
- `src/entrypoints/github-raw.content.ts` — Content Script 入口

---

### 阶段：规划审核

**自审发现（第一轮）**

**[FIX]** 权限声明冗余：MV3 中 click handler 内 `navigator.clipboard.writeText()` 无需声明 `clipboardWrite`，permissions 留空即可。

**[FIX]** SPA 处理策略升级：纯轮询（10×200ms）在慢网络下可能超时，改为局部 MutationObserver（限定 `#repo-content-pjax-container` 或 `main`，发现目标即 disconnect，3 秒超时兜底）。

**[FIX]** 样式标签差异：Raw 按钮是 `<a>`，注入按钮是 `<button>`，默认样式不同，需内联修正 `border/background/text-decoration/cursor/color`。

---

**Codex 审核（第二轮）**

**[ERROR]** `toRawUrl()` 严重遗漏 — Raw 按钮的 `href` 在 GitHub 新版页面可能已经是 `https://raw.githubusercontent.com/...`，原逻辑因 `hostname !== 'github.com'` 校验失败，直接返回 `null`，导致按钮完全不注入。
**[FIX]** 在解析前增加优先判断：`hostname === 'raw.githubusercontent.com'` 时直接返回原 href。

**[FIX]** DOM 选择器脆弱：`data-testid="raw-button"` 属 GitHub 内部测试标记，随时可能改动，增加 fallback 选择器（href 含 `raw.githubusercontent.com` 的 `<a>` 标签）。

**[FIX]** 样式克隆范围过大：原方案复制所有 `data-*` 属性，存在埋点/水合状态污染风险，修正为仅复制 `className`。

**[FIX]** 防重复策略改进：原用全局 `id="rawlink-copy-btn"` 判断，多工具条场景下误判，改为在 `rawButton.parentElement` 容器内查找 `[data-rawlink-copy]` 标记。

**[FIX]** 可访问性补充：为注入按钮添加 `aria-label="Copy raw link"`、`type="button"`。

---

**[ERROR]** Codex MCP 服务不可用（503 Service Unavailable）
- 原因：代理服务 `ai.qaq.al` 账号资源耗尽
- 出现时间：2026-02-18 下午
- 恢复时间：同日稍后
- 影响：规划审核推迟，期间改用自审替代

---

### Git 操作记录

**[ERROR]** 空仓库无法切换分支
- 原因：`git checkout -b dev` 在零提交仓库中创建的分支不会持久化，切换到 `research` 提交后，`dev` 分支丢失
- 解决：在 `research` 分支完成初始提交后，再 `git checkout -b dev` 重建

**[INFO]** 当前分支结构：
```
main（无提交）
└── dev ← 当前分支
    └── 合并自 research（已删除）
        └── chore(research): add reference project for analysis
```

---

### 待办

**[TODO]** ~~初始化 WXT 项目~~ — 已完成（T1）
**[TODO]** 实现 `url-parser.ts`（含双路径兼容逻辑）— T3 由 core-logic agent 负责
**[TODO]** 实现 `dom-injector.ts` — T5 由 dom-builder agent 负责
**[TODO]** 实现 `clipboard.ts` — T4 由 io-ux agent 负责
**[TODO]** 实现 `github-raw.content.ts` — T8 由 team-lead 负责
**[TODO]** 准备扩展图标（16/48/128 PNG）— 已使用 temp_clone/icon.png 临时替代
**[TODO]** 本地加载测试（chrome://extensions）— T9 验收阶段

---

## 2026-02-18（续）

### 阶段：实施（T1+T2 完成）

**[INFO]** T3 (core-logic) — url-parser.ts 实现完成
- 7 项逻辑顺序正确：URL 解析 → raw.githubusercontent.com 优先短路 → github.com 校验 → 路径段解析 → splice(2,1)
- 8 个边界用例全覆盖，typecheck 通过

**[INFO]** T4 (io-ux) — clipboard.ts 实现完成，team-lead review 发现并修复 1 个 Bug
- **[FIX]** showFeedback 原始实现中，`originalHTML` 在 clearTimeout 后重新捕获时已是 CHECK_ICON_SVG
  - 根因：用户在 2 秒内连续点击两次时，feedbackTimer 被 clearTimeout 取消，但 button.innerHTML 已是勾选图标
  - 修复：引入模块级 `originalButtonHTML`，仅在进入反馈态时（feedbackTimer === null）保存一次

**[INFO]** T5 (dom-builder) — dom-injector.ts 实现完成，team-lead review 修复 1 个 Bug
- **[FIX]** onCopy(rawUrl) 未处理 rejected promise（可能产生 unhandled rejection），添加 .catch(() => false)

**[INFO]** T8 (team-lead) — github-raw.content.ts 入口编写，Codex review 发现并修复 1 个 Bug
- **[FIX]** SPA 快速连续跳转时 waitForButton 会产生多个 MutationObserver 堆积
  - 修复：模块级 cancelWait 函数追踪并取消上一次 waitForButton，保证同一时刻最多一个 observer
- 整体架构：tryInject → wxt:locationchange → cleanup → tryInject → waitForButton(ctx)
- ctx.setTimeout(stop, 3000) 处理超时，ctx 失效时自动取消

**[INFO]** T9 — 集成验收通过
- pnpm typecheck：零错误
- pnpm build：成功，content script 6.31 kB
- manifest.json：无 permissions 声明（无 clipboardWrite）
- content_scripts.matches: ["https://github.com/*"]，run_at: document_idle

