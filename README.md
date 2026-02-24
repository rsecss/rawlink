# RawLink

[English](README.md) | [中文](README.zh-CN.md)

> One-click copy of `raw.githubusercontent.com` links on GitHub file pages.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with WXT](https://img.shields.io/badge/Built%20with-WXT%200.20-7c3aed?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTV6TTIgMTdsOSA1IDktNXYtNWwtOSA1LTktNXoiLz48L3N2Zz4=)](https://wxt.dev)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-34a853?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## What It Does

When browsing a file on GitHub, RawLink injects a copy button next to the **Raw** button. One click copies the `raw.githubusercontent.com` direct link to your clipboard — no page navigation needed.

---

## Features

- **One-click copy** — copies the raw URL instantly on button click
- **Visual feedback** — button icon turns green for 2 seconds to confirm success
- **SPA-aware** — works across GitHub's client-side navigation without page reloads
- **Dual selector strategy** — primary selector + fallback to handle GitHub UI changes gracefully
- **Zero permissions** — no `clipboardWrite` or other sensitive permissions required

---

## Installation

### Developer Mode (from source)

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/rsecss/rawlink.git
   cd rawlink
   pnpm install
   ```

2. Build the extension:

   ```bash
   pnpm build
   ```

3. Open Chrome and go to `chrome://extensions`

4. Enable **Developer mode** (toggle in the top-right corner)

5. Click **Load unpacked** and select the `.output/chrome-mv3/` directory

> **Requirements:** Node.js ≥ 18, [pnpm](https://pnpm.io)

---

## Development

```bash
pnpm dev            # Start HMR dev mode (auto-opens Chrome)
pnpm build          # Production build → .output/chrome-mv3/
pnpm zip            # Package ZIP for Chrome Web Store submission
pnpm typecheck      # TypeScript strict-mode type check
pnpm test           # Run unit tests once
pnpm test:watch     # Run tests in watch mode
pnpm test:coverage  # Generate coverage report
```

---

## Project Structure

```
src/
├── entrypoints/
│   └── github-raw.content.ts   # Content script — lifecycle & event wiring
└── modules/
    ├── url-parser.ts            # Pure function: GitHub URL → raw URL
    ├── clipboard.ts             # Clipboard write + visual feedback
    └── dom-injector.ts          # Button injection & cleanup
```

---

## Contributing

Pull requests are welcome. For major changes, please [open an issue](https://github.com/rsecss/rawlink/issues) first to discuss what you'd like to change.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit following [Conventional Commits](https://www.conventionalcommits.org/)
4. Open a pull request against `main`

---

## License

[MIT](LICENSE) © 2026 [Maple](https://github.com/rsecss)
