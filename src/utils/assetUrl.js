/**
 * 解析 public 目录静态资源 URL，兼容本地开发与 GitHub Pages base 路径
 * @param {string} path 以 assets/ 或 /assets/ 开头的相对路径
 * @returns {string}
 */
export function assetUrl(path) {
  const normalized = String(path).replace(/^\//, '')
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${normalized}`
}
