const CHECK_ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="color: #1a7f37"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/></svg>';

let feedbackTimer: ReturnType<typeof setTimeout> | null = null;
let originalNodes: Node[] | null = null;

/** Parse hardcoded SVG string via detached template (avoids innerHTML on live DOM). */
function createSvgNode(svgHtml: string): Node {
  const t = document.createElement('template');
  t.innerHTML = svgHtml;
  return t.content.firstChild!;
}


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
  if (!navigator.userActivation?.isActive) return false;
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
    originalNodes = Array.from(button.childNodes, (n) => n.cloneNode(true));
  }

  button.replaceChildren(createSvgNode(CHECK_ICON_SVG));
  button.title = '已复制!';

  feedbackTimer = setTimeout(() => {
    if (originalNodes !== null) {
      button.replaceChildren(...originalNodes);
      originalNodes = null;
    }
    button.title = '';
    feedbackTimer = null;
  }, 2000);
}
