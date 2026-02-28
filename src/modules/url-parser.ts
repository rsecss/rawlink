/**
 * 将 GitHub 文件页 URL 或 Raw 按钮 href 转换为 raw.githubusercontent.com 直链。
 * @param href - GitHub 文件页 URL（blob 格式）或 Raw 按钮 href
 * @returns 有效的 raw URL 字符串，非文件页或解析失败时返回 null
 */
export function toRawUrl(href: string): string | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }

  if (url.hostname === 'raw.githubusercontent.com') {
    if (url.protocol !== 'https:') return null;
    const rawSegments = url.pathname.split('/').filter(Boolean);
    if (rawSegments.length < 4 || rawSegments.some((s) => s === '.' || s === '..')) return null;
    return `https://raw.githubusercontent.com/${rawSegments.join('/')}`;
  }
  if (url.hostname !== 'github.com') return null;

  const segments = url.pathname.split('/').filter(Boolean);
  if (segments.length < 4 || (segments[2] !== 'raw' && segments[2] !== 'blob')) return null;
  if (segments.some((s) => s === '.' || s === '..')) return null;

  segments.splice(2, 1);
  return 'https://raw.githubusercontent.com/' + segments.join('/');
}
