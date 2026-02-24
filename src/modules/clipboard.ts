const COPY_ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3.75 1h8.5c.966 0 1.75.784 1.75 1.75v11.5A1.75 1.75 0 0 1 12.25 16h-8.5A1.75 1.75 0 0 1 2 14.25V2.75C2 1.784 2.784 1 3.75 1Zm0 1.5a.25.25 0 0 0-.25.25v11.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25Zm1.75 2a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75Z"/></svg>';

const CHECK_ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="color: #1a7f37"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/></svg>';

let feedbackTimer: ReturnType<typeof setTimeout> | null = null;
let originalButtonHTML: string | null = null;

function fallbackCopy(text: string): boolean {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    return document.execCommand('copy');
  } catch {
    console.error('[RawLink] fallback copy failed');
    return false;
  } finally {
    document.body.removeChild(ta);
  }
}

/**
 * 将文本写入剪贴板（必须在用户手势的同步调用链内调用）。
 * @param text - 要复制的文本
 * @returns 写入是否成功
 */
export async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return fallbackCopy(text);
  }
}

/**
 * 在按钮上显示复制成功反馈（图标变绿色勾选，2 秒后恢复）。
 * clearTimeout 防止连续点击时状态堆积。
 * @param button - 触发复制的按钮元素
 */
export function showFeedback(button: HTMLButtonElement): void {
  if (feedbackTimer !== null) {
    clearTimeout(feedbackTimer);
  } else {
    originalButtonHTML = button.innerHTML;
  }

  button.innerHTML = CHECK_ICON_SVG;
  button.title = '已复制!';

  feedbackTimer = setTimeout(() => {
    if (originalButtonHTML !== null) {
      button.innerHTML = originalButtonHTML;
      originalButtonHTML = null;
    }
    button.title = '';
    feedbackTimer = null;
  }, 2000);
}
