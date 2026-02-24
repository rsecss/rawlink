import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: 'RawLink',
    description: '一键复制 GitHub 文件的 raw.githubusercontent.com 直链',
    version: '1.0.0',
    // MV3 无需额外 API 权限：click handler 内 Clipboard API 不需要 clipboardWrite
  },
});
