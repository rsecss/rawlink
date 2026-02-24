const RAW_BUTTON_SELECTOR_PRIMARY = 'button[data-testid="download-raw-button"]';
const RAW_BUTTON_SELECTOR_FALLBACK = 'a[href*="raw.githubusercontent.com"]';
const RAWLINK_ATTR = 'data-rawlink-copy';

export { RAWLINK_ATTR };

const COPY_ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3.75 1h8.5c.966 0 1.75.784 1.75 1.75v11.5A1.75 1.75 0 0 1 12.25 16h-8.5A1.75 1.75 0 0 1 2 14.25V2.75C2 1.784 2.784 1 3.75 1Zm0 1.5a.25.25 0 0 0-.25.25v11.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25Zm1.75 2a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75Z"/></svg>';

export function findRawButton(): HTMLElement | null {
  return (
    document.querySelector<HTMLElement>(RAW_BUTTON_SELECTOR_PRIMARY) ??
    document.querySelector<HTMLElement>(RAW_BUTTON_SELECTOR_FALLBACK)
  );
}

export function injectCopyButton(
  rawButton: HTMLElement,
  rawUrl: string,
  onCopy: (url: string) => Promise<boolean>,
): void {
  const container = rawButton.parentElement;
  if (container === null) return;
  if (container.querySelector(`[${RAWLINK_ATTR}]`) !== null) return;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Copy raw link');
  btn.setAttribute(RAWLINK_ATTR, '1');
  btn.className = rawButton.className;

  btn.style.border = 'none';
  btn.style.background = 'inherit';
  btn.style.textDecoration = 'none';
  btn.style.cursor = 'pointer';
  btn.style.color = 'inherit';

  btn.innerHTML = COPY_ICON_SVG;

  btn.addEventListener('click', () => {
    onCopy(rawUrl).catch(() => false); // 不 await — 保持用户激活上下文，防 unhandled rejection
  });

  container.appendChild(btn);
}

export function cleanup(): void {
  document.querySelector(`[${RAWLINK_ATTR}]`)?.remove();
}

export function isInjected(): boolean {
  return document.querySelector(`[${RAWLINK_ATTR}]`) !== null;
}
