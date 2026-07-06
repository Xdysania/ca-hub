/**
 * 从 Provider 官网字段解析域名，用于 favicon / logo 回退
 * @param {string} [url]
 * @returns {string}
 */
export function getProviderDomain(url) {
  const raw = String(url || '').trim()
  if (!raw) return ''
  try {
    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
    return new URL(normalized).hostname.replace(/^www\./i, '')
  } catch {
    return ''
  }
}

/**
 * 按优先级生成 Provider logo 候选 URL 列表
 * @param {object} provider
 * @returns {string[]}
 */
export function getProviderLogoSources(provider) {
  if (!provider) return []

  const sources = []
  const slug = provider.slug || ''

  if (provider.logo) sources.push(provider.logo)
  if (provider.logoUrl) sources.push(provider.logoUrl)

  if (slug) {
    sources.push(`/assets/providers/${slug}.png`)
    sources.push(`/assets/providers/${slug}.svg`)
    sources.push(`/assets/providers/${slug}.webp`)
  }

  const domain = getProviderDomain(provider.website || provider.learnMoreUrl)
  if (domain) {
    sources.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`)
    sources.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`)
  }

  return [...new Set(sources.filter(Boolean))]
}
