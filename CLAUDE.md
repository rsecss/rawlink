# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.


# currentDate
Today's date is 2026-02-18.

---

## 项目概述

**RawLink** — Chrome 扩展（Manifest V3），在 GitHub 文件页面的 Raw 按钮旁注入"一键复制 raw.githubusercontent.com 直链"按钮。

**技术栈**：WXT 0.20.17 + TypeScript 5 + pnpm

---

## 开发命令

```bash
pnpm dev               # HMR 开发，自动打开 Chrome
pnpm build             # 生产构建 → .output/chrome-mv3/
pnpm zip               # 打包 ZIP（用于 Chrome Web Store）
pnpm typecheck         # TypeScript 类型检查（严格模式）
pnpm test              # 单次运行单元测试
pnpm test:watch        # 监听模式运行测试
pnpm test:coverage     # 生成覆盖率报告
```

---

## 项目结构

```
rawlink/
├── wxt.config.ts                              # WXT 配置（srcDir, manifest）
├── tsconfig.json                              # extends .wxt/tsconfig.json
├── vitest.config.ts                           # Vitest 配置（jsdom 环境）
├── package.json
├── public/icon/                               # 扩展图标（16/48/128 PNG）
└── src/
    ├── entrypoints/
    │   └── github-raw.content.ts             # Content Script 入口
    └── modules/
        ├── url-parser.ts                      # URL 解析（纯函数）
        ├── clipboard.ts                       # 剪贴板 + 视觉反馈
        ├── dom-injector.ts                    # DOM 注入
        └── __tests__/
            ├── url-parser.test.ts
            ├── clipboard.test.ts
            └── dom-injector.test.ts
```

---

## 模块接口契约

### `src/modules/url-parser.ts`

```typescript
/**
 * 将 GitHub 文件页 URL 或 Raw 按钮 href 转换为 raw.githubusercontent.com 直链。
 * 支持 blob 路径（/owner/repo/blob/ref/path）和 raw 路径（/owner/repo/raw/ref/path）。
 * @returns 有效的 raw URL 字符串，非文件页或解析失败时返回 null
 */
export function toRawUrl(href: string): string | null;
```

### `src/modules/clipboard.ts`

```typescript
/**
 * 将文本写入剪贴板（必须在用户手势的同步调用链内调用）。
 * 优先使用 navigator.clipboard.writeText()，失败时降级为 execCommand('copy')。
 * @returns 写入是否成功
 */
export async function writeClipboard(text: string): Promise<boolean>;

/**
 * 在按钮上显示复制成功反馈（图标变绿色勾选，2 秒后恢复）。
 * 模块级 originalButtonHTML 保证连续点击时原始 HTML 只捕获一次。
 */
export function showFeedback(button: HTMLButtonElement): void;
```

### `src/modules/dom-injector.ts`

```typescript
/** 查找页面上的 Raw 按钮（主选择器 + fallback 双策略）。 */
export function findRawButton(): HTMLElement | null;

/**
 * 创建复制按钮并注入到 Raw 按钮旁。
 * - 仅复制 rawButton.className，不复制 data-*
 * - 容器内设置 [data-rawlink-copy] 防重复标记
 * - aria-label="Copy raw link" + type="button"
 * - 内联样式修正 border/background/cursor/color（button vs a 默认样式差异）
 */
export function injectCopyButton(
  rawButton: HTMLElement,
  rawUrl: string,
  onCopy: (url: string) => Promise<boolean>,
): void;

/** 移除已注入的复制按钮（SPA 跳转前调用）。 */
export function cleanup(): void;

/** 检查复制按钮是否已注入。 */
export function isInjected(): boolean;

/** 防重复标记属性名（data-rawlink-copy），供 content script 引用。 */
export const RAWLINK_ATTR: string;
```

---

## 架构约束

| 约束项 | 规范 |
|--------|------|
| **导入别名** | `~/modules/...`（WXT 自动配置） |
| **WXT auto-import** | `defineContentScript` 无需手动 import；`ContentScriptContext` 需从 `wxt/utils/content-script-context` 手动导入 |
| **权限** | MV3 无需 `clipboardWrite`；click handler 内 Clipboard API 不需要额外权限 |
| **主选择器** | `button[data-testid="download-raw-button"]` |
| **Fallback 选择器** | `a[href*="raw.githubusercontent.com"]` |
| **防重复标记** | 在 `rawButton.parentElement` 容器内查找 `[data-rawlink-copy]` |
| **SPA 处理** | `wxt:locationchange` 事件 + 局部 MutationObserver（监听 `#repo-content-pjax-container` 或 `main` 或 `body` 或 `documentElement`） |
| **Observer 超时** | `ctx.setTimeout(stop, 3000)` — content script 失效时自动取消 |
| **Observer 堆积防护** | 模块级 `cancelWait` 函数追踪并取消上一次 `waitForButton`，同一时刻最多一个 observer |
| **样式克隆** | 仅复制 `className`，不复制任何 `data-*` 属性 |
| **无副作用** | `console.error` 可用，禁止 `console.log` 遗留 |

---

## 分支策略

- `main`：稳定发布版
- `dev`：开发分支（当前活跃）
