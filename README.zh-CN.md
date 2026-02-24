# RawLink

[English](README.md) | [中文](README.zh-CN.md)

> 在 GitHub 文件页面一键复制 `raw.githubusercontent.com` 直链。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with WXT](https://img.shields.io/badge/构建于-WXT%200.20-7c3aed?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTV6TTIgMTdsOSA1IDktNXYtNWwtOSA1LTktNXoiLz48L3N2Zz4=)](https://wxt.dev)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-34a853?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## 功能介绍

在 GitHub 浏览文件时，RawLink 会在 **Raw** 按钮旁注入一个复制按钮。点击即可将 `raw.githubusercontent.com` 直链写入剪贴板，无需跳转页面。

---

## 特性

- **一键复制** — 点击按钮立即写入剪贴板
- **视觉反馈** — 按钮图标变为绿色勾选，2 秒后自动恢复
- **SPA 感知** — 跟随 GitHub 客户端路由跳转，无需刷新页面
- **双重选择器** — 主选择器 + fallback，应对 GitHub 界面变动
- **零额外权限** — 无需声明 `clipboardWrite` 等敏感权限

---

## 安装

### 开发者模式（源码构建）

1. 克隆仓库并安装依赖：

   ```bash
   git clone https://github.com/rsecss/rawlink.git
   cd rawlink
   pnpm install
   ```

2. 构建扩展：

   ```bash
   pnpm build
   ```

3. 打开 Chrome，访问 `chrome://extensions`

4. 开启右上角的**开发者模式**

5. 点击**加载已解压的扩展程序**，选择 `.output/chrome-mv3/` 目录

> **环境要求：** Node.js ≥ 18、[pnpm](https://pnpm.io/zh)

---

## 本地开发

```bash
pnpm dev            # HMR 开发模式，自动打开 Chrome
pnpm build          # 生产构建 → .output/chrome-mv3/
pnpm zip            # 打包 ZIP（用于 Chrome Web Store 提交）
pnpm typecheck      # TypeScript 严格模式类型检查
pnpm test           # 单次运行单元测试
pnpm test:watch     # 监听模式运行测试
pnpm test:coverage  # 生成覆盖率报告
```

---

## 项目结构

```
src/
├── entrypoints/
│   └── github-raw.content.ts   # Content Script 入口 — 生命周期与事件绑定
└── modules/
    ├── url-parser.ts            # 纯函数：GitHub URL → raw URL
    ├── clipboard.ts             # 剪贴板写入 + 视觉反馈
    └── dom-injector.ts          # 按钮注入与清理
```

---

## 参与贡献

欢迎提交 Pull Request。对于较大的改动，请先[提交 Issue](https://github.com/rsecss/rawlink/issues) 说明你的想法。

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feat/your-feature`
3. 按照 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 规范提交
4. 向 `main` 分支发起 Pull Request

---

## 许可证

[MIT](LICENSE) © 2026 [Maple](https://github.com/rsecss)
