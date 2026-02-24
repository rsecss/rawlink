import type { ContentScriptContext } from 'wxt/utils/content-script-context';
import { toRawUrl } from '~/modules/url-parser';
import {
  cleanup,
  findRawButton,
  injectCopyButton,
  isInjected,
  RAWLINK_ATTR,
} from '~/modules/dom-injector';
import { showFeedback, writeClipboard } from '~/modules/clipboard';

// 模块级：取消上一次 waitForButton（防 SPA 快速跳转时 observer 堆积）
let cancelWait: (() => void) | null = null;

function tryInject(): void {
  const rawButton = findRawButton();
  if (rawButton === null) return;

  const rawUrl = toRawUrl(window.location.href);
  if (rawUrl === null) return;

  injectCopyButton(rawButton, rawUrl, handleCopy);
}

async function handleCopy(url: string): Promise<boolean> {
  const success = await writeClipboard(url);
  if (!success) return false;

  const btn = document.querySelector<HTMLButtonElement>(`button[${RAWLINK_ATTR}]`);
  if (btn !== null) showFeedback(btn);

  return true;
}

// 等待 Raw 按钮出现（SPA 跳转后 DOM 可能尚未就绪）
function waitForButton(ctx: ContentScriptContext): void {
  cancelWait?.(); // 取消上一次等待

  let done = false;

  const stop = (): void => {
    if (done) return;
    done = true;
    observer.disconnect();
    cancelWait = null;
  };

  cancelWait = stop;

  // document.documentElement 永远非 null，确保 target 类型为 Element
  const target =
    document.querySelector('#repo-content-pjax-container') ??
    document.querySelector('main') ??
    document.body ??
    document.documentElement;

  const observer = new MutationObserver(() => {
    if (done || findRawButton() === null) return;
    tryInject();
    if (isInjected()) stop();
  });

  observer.observe(target, { childList: true, subtree: true });

  // ctx.setTimeout 在 content script 失效时自动取消
  ctx.setTimeout(stop, 3000);
}

export default defineContentScript({
  matches: ['https://github.com/*'],
  runAt: 'document_idle',

  main(ctx) {
    tryInject();

    ctx.addEventListener(window, 'wxt:locationchange', () => {
      cancelWait?.(); // 取消可能进行中的等待
      cleanup();
      tryInject();

      if (!isInjected()) {
        waitForButton(ctx);
      }
    });
  },
});
