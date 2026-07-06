<template>
  <article class="ca-card">
    <div class="ca-card__top">
      <div class="ca-card__logo-wrap">
        <img
          v-if="activeLogoSrc"
          :src="activeLogoSrc"
          :alt="provider.name"
          class="ca-card__logo"
          loading="lazy"
          decoding="async"
          @error="onLogoError"
        />
        <div v-else class="ca-card__logo-fallback" aria-hidden="true">
          {{ monogram }}
        </div>
      </div>
      <span class="ca-card__category">{{ categoryLabel }}</span>
    </div>

    <h3 class="ca-card__title">{{ provider.name }}</h3>
    <p class="ca-card__desc">{{ localizedSummary }}</p>

    <a :href="learnMoreUrl" class="ca-card__link">
      {{ ct('learnMore') }}
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </a>
  </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getProviderLogoSources } from '@/utils/providerLogo'

const props = defineProps({
  provider: { type: Object, required: true }
})

const { locale } = useI18n()

const content = {
  en: { learnMore: 'Learn more' },
  zh: { learnMore: '了解更多' },
  'zh-HK': { learnMore: '了解更多' }
}

/** @param {string} key */
function ct(key) {
  const lang = locale.value in content ? locale.value : 'en'
  return content[lang]?.[key] || key
}

const categoryLabelMap = {
  ESIGNATURE: 'E-SIGNATURE',
  'EID AUTHENTICATION': 'EID AUTHENTICATION',
  ESEALING: 'E-SEALING'
}

const categoryLabel = computed(() => {
  const cat = (props.provider.category || '').toUpperCase()
  return categoryLabelMap[cat] || cat || 'PROVIDER'
})

const logoSources = computed(() => getProviderLogoSources(props.provider))
const logoSourceIndex = ref(0)
const logoExhausted = ref(false)

const activeLogoSrc = computed(() => {
  if (logoExhausted.value) return ''
  return logoSources.value[logoSourceIndex.value] || ''
})

watch(
  () => props.provider.slug,
  () => {
    logoSourceIndex.value = 0
    logoExhausted.value = false
  }
)

function onLogoError() {
  const next = logoSourceIndex.value + 1
  if (next < logoSources.value.length) {
    logoSourceIndex.value = next
    return
  }
  logoExhausted.value = true
}

const monogram = computed(() => {
  const name = props.provider.name || ''
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

const localizedSummary = computed(() => {
  if (typeof props.provider.cardSummary === 'object') {
    return props.provider.cardSummary[locale.value] ||
           props.provider.cardSummary.en ||
           ''
  }
  return props.provider.cardSummary || ''
})

const learnMoreUrl = computed(() => {
  if (props.provider.learnMoreUrl) return props.provider.learnMoreUrl
  return `/contact?provider=${props.provider.slug}`
})
</script>

<style scoped>
.ca-card {
  background: #fff;
  border: 1px solid #dbd9e1;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  min-height: 220px;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.ca-card:hover {
  border-color: #c9c5d1;
  box-shadow: 0 4px 20px rgba(18, 0, 58, 0.06);
}

.ca-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.ca-card__logo-wrap {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ca-card__logo {
  width: 44px;
  height: 44px;
  object-fit: contain;
  display: block;
}

.ca-card__logo-fallback {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f3f1f6;
  color: #6b6280;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.ca-card__category {
  font-size: 10px;
  font-weight: 600;
  color: #9b93a8;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-align: right;
  line-height: 1.4;
  max-width: 120px;
}

.ca-card__title {
  font-size: 18px;
  font-weight: 700;
  color: #12003a;
  margin: 0 0 10px;
  line-height: 1.3;
}

.ca-card__desc {
  font-size: 13px;
  color: #4c4264;
  line-height: 1.65;
  margin: 0 0 20px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ca-card__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #7038f3;
  text-decoration: none;
  transition: gap 0.2s, opacity 0.2s;
  margin-top: auto;
}

.ca-card__link:hover {
  gap: 10px;
  opacity: 0.85;
}

@media (prefers-reduced-motion: reduce) {
  .ca-card:hover {
    box-shadow: none;
  }
}
</style>
