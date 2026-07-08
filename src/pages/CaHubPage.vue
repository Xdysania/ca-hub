<template>
  <div class="ca-hub">
    <CaHeader />

    <!-- P1 Hero -->
    <CaHero />

    <!-- P1.5 Highlights -->
    <CaFeatureBlock />

    <!-- P2 Interactive Map -->
    <CaInteractiveMap
      :countries="countries"
      :providers="providers"
      :loading="loading"
      @country-select="handleCountrySelect"
      @country-clear="handleCountryClear"
    />

    <!-- P3 Provider Card List -->
    <section class="ca-providers" id="ca-providers">
      <div class="ca-providers__container">
        <header class="ca-providers__header">
          <h2 class="ca-providers__title">{{ ct('providerDirectoryTitle') }}</h2>
          <p class="ca-providers__desc">{{ ct('providerDirectoryDescription') }}</p>
        </header>

        <CaProviderFilters
          :search-query="searchQuery"
          :selected-country-isos="selectedCountryIsos"
          :selected-category="selectedCategory"
          :country-options="filterCountryOptions"
          :category-options="categoryOptions"
          @update:search-query="searchQuery = $event"
          @update:selected-country-isos="onFilterCountriesChange"
          @update:selected-category="selectedCategory = $event"
          @clear="clearAllFilters"
        />

        <div v-if="paginatedProviders.length > 0" class="ca-providers__grid">
          <CaProviderCard
            v-for="provider in paginatedProviders"
            :key="provider.slug || provider.id"
            :provider="provider"
          />
        </div>

        <div v-else class="ca-providers__empty">
          <p class="ca-providers__empty-title">{{ ct('noResultTitle') }}</p>
          <p class="ca-providers__empty-desc">{{ ct('noResultDesc') }}</p>
          <button class="ca-providers__empty-clear" @click="clearAllFilters">{{ ct('clearFilters') }}</button>
          <a href="/contact" class="ca-providers__empty-cta">{{ ct('ctaLabel') }}</a>
        </div>

        <nav v-if="totalPages > 1" class="ca-providers__pagination" aria-label="Pagination">
          <button
            class="ca-providers__page-btn"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >{{ ct('paginationPrevious') }}</button>

          <button
            v-for="page in totalPages"
            :key="page"
            class="ca-providers__page-num"
            :class="{ 'ca-providers__page-num--active': page === currentPage }"
            :aria-current="page === currentPage ? 'page' : undefined"
            @click="goToPage(page)"
          >{{ page }}</button>

          <button
            class="ca-providers__page-btn"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >{{ ct('paginationNext') }}</button>
        </nav>
      </div>
    </section>

    <!-- P4 Feature Block -->
    <CaTrustFeatures />

    <!-- P5 Final CTA -->
    <CaFinalCta :selected-country="selectedCountryForCta" />

    <CaFooter />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import CaHero from '@/components/CaHero.vue'
import CaHeader from '@/components/CaHeader.vue'
import CaFeatureBlock from '@/components/CaFeatureBlock.vue'
import CaInteractiveMap from '@/components/CaInteractiveMap.vue'
import CaProviderCard from '@/components/CaProviderCard.vue'
import CaProviderFilters from '@/components/CaProviderFilters.vue'
import CaTrustFeatures from '@/components/CaTrustFeatures.vue'
import CaFinalCta from '@/components/CaFinalCta.vue'
import CaFooter from '@/components/CaFooter.vue'
import caRegistryData from '/data/ca-registry.json?url'
import providerIntegrationsData from '/data/provider-integrations.json?url'
import filterCountriesData from '/data/filter-countries.json?url'

const route = useRoute()
const router = useRouter()
const { locale } = useI18n()

const PAGE_SIZE = 9

const CATEGORY_OPTIONS = [
  { value: 'EID AUTHENTICATION', label: 'eID Authentication' },
  { value: 'ESIGNATURE', label: 'eSignature' },
  { value: 'EUDIW', label: 'EUDIW' }
]

const loading = ref(true)
const countries = ref([])
const filterCountries = ref([])
const providers = ref([])
const integrationProviders = ref([])
const selectedCountryIsos = ref([])
const searchQuery = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)

const content = {
  en: {
    providerDirectoryTitle: 'Provider integrations',
    providerDirectoryDescription: 'Connect with trusted CAs, QTSPs, and identity providers worldwide.',
    noResultTitle: 'No matching providers',
    noResultDesc: 'Clear filters or contact sales to confirm coverage for your market.',
    clearFilters: 'Clear filters',
    ctaLabel: 'Contact Sales',
    paginationPrevious: 'Previous',
    paginationNext: 'Next'
  },
  zh: {
    providerDirectoryTitle: 'Provider 集成',
    providerDirectoryDescription: '连接全球可信 CA、QTSP 和身份认证 Provider。',
    noResultTitle: '暂无匹配 Provider',
    noResultDesc: '请清除筛选，或联系销售确认目标市场覆盖能力。',
    clearFilters: '清除筛选',
    ctaLabel: '联系销售',
    paginationPrevious: '上一页',
    paginationNext: '下一页'
  },
  'zh-HK': {
    providerDirectoryTitle: 'Provider 集成',
    providerDirectoryDescription: '連接全球可信 CA、QTSP 和身分認證 Provider。',
    noResultTitle: '暫無匹配 Provider',
    noResultDesc: '請清除篩選，或聯繫銷售確認目標市場覆蓋能力。',
    clearFilters: '清除篩選',
    ctaLabel: '聯繫銷售',
    paginationPrevious: '上一頁',
    paginationNext: '下一頁'
  }
}

/** @param {string} key */
function ct(key) {
  const lang = locale.value in content ? locale.value : 'en'
  return content[lang]?.[key] || key
}

const categoryOptions = CATEGORY_OPTIONS

/** @type {import('vue').ComputedRef<Array<{ iso2: string, name: string }>>} */
const filterCountryOptions = computed(() => {
  if (filterCountries.value.length) return filterCountries.value
  return countries.value
})

/** @type {import('vue').ComputedRef<{ iso2: string, name: string } | null>} */
const selectedCountryForCta = computed(() => {
  const iso2 = selectedCountryIsos.value[0]
  if (!iso2) return null
  const country = filterCountryOptions.value.find(item => item.iso2 === iso2)
    || countries.value.find(item => item.iso2 === iso2)
  return country || { iso2, name: iso2 }
})

const filteredProviders = computed(() => {
  let result = [...integrationProviders.value]

  if (selectedCountryIsos.value.length) {
    const selected = new Set(selectedCountryIsos.value)
    result = result.filter((provider) => {
      const codes = (provider.countries || []).map(c => typeof c === 'string' ? c : c.iso2 || c)
      return codes.some(code => selected.has(code))
    })
  }

  if (selectedCategory.value) {
    result = result.filter(provider => provider.category === selectedCategory.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    result = result.filter((provider) => {
      const searchable = [
        provider.name,
        provider.slug,
        provider.category,
        provider.providerType,
        provider.cardSummary?.en,
        provider.cardSummary?.zh,
        ...(provider.countries?.map((code) => {
          if (typeof code === 'string') {
            const country = countries.value.find(item => item.iso2 === code)
            return country?.name || code
          }
          return code.name || code.iso2
        }) || [])
      ].join(' ').toLowerCase()
      return searchable.includes(query)
    })
  }

  result.sort((a, b) => {
    if (a.featured !== b.featured) return b.featured ? 1 : -1
    if (a.sortOrder !== undefined && b.sortOrder !== undefined) return a.sortOrder - b.sortOrder
    return (a.name || '').localeCompare(b.name || '')
  })

  const seen = new Set()
  return result.filter((provider) => {
    const id = provider.slug || provider.id
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })
})

const totalPages = computed(() => Math.ceil(filteredProviders.value.length / PAGE_SIZE))

const paginatedProviders = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredProviders.value.slice(start, start + PAGE_SIZE)
})

/** @param {string} iso2 */
function handleCountrySelect(iso2) {
  selectedCountryIsos.value = [iso2]
  currentPage.value = 1
  syncUrlQuery()
}

function handleCountryClear() {
  selectedCountryIsos.value = []
  currentPage.value = 1
  syncUrlQuery()
}

/** @param {string[]} isos */
function onFilterCountriesChange(isos) {
  selectedCountryIsos.value = [...isos]
  currentPage.value = 1
  syncUrlQuery()
}

function clearAllFilters() {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedCountryIsos.value = []
  currentPage.value = 1
  syncUrlQuery()
}

/** @param {number} page */
function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    syncUrlQuery()
    const el = document.getElementById('ca-providers')
    if (el) {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' })
    }
  }
}

function syncUrlQuery() {
  const query = { ...route.query }
  if (selectedCountryIsos.value.length) {
    query.country = selectedCountryIsos.value.join(',')
  } else {
    delete query.country
  }
  if (currentPage.value > 1) {
    query.page = String(currentPage.value)
  } else {
    delete query.page
  }
  router.replace({ query })
}

watch([searchQuery, selectedCountryIsos, selectedCategory], () => {
  currentPage.value = 1
  syncUrlQuery()
})

onMounted(async () => {
  await fetchRegistryData()

  if (route.query.country) {
    const isos = String(route.query.country)
      .split(',')
      .map(code => code.trim().toUpperCase())
      .filter(Boolean)
    selectedCountryIsos.value = isos
  }
  if (route.query.page) {
    const page = parseInt(route.query.page, 10)
    if (!isNaN(page) && page >= 1) currentPage.value = page
  }
})

async function fetchRegistryData() {
  loading.value = true
  try {
    const [registryRes, integrationsRes, filterCountriesRes] = await Promise.all([
      fetch(caRegistryData),
      fetch(providerIntegrationsData),
      fetch(filterCountriesData)
    ])
    if (!registryRes.ok) throw new Error(`Registry HTTP ${registryRes.status}`)
    const registry = await registryRes.json()
    countries.value = registry.countries || []
    providers.value = registry.providers || []

    if (filterCountriesRes.ok) {
      const filterData = await filterCountriesRes.json()
      filterCountries.value = filterData.countries || []
    }

    if (integrationsRes.ok) {
      const integrations = await integrationsRes.json()
      integrationProviders.value = integrations.providers || []
    } else {
      integrationProviders.value = registry.providers || []
    }
  } catch (error) {
    console.error('[CA Hub] Failed to load CA registry:', error)
    countries.value = []
    providers.value = []
    integrationProviders.value = []
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.ca-hub {
  min-height: 100vh;
}

.ca-providers {
  padding: 72px var(--ca-hub-content-padding-x);
  background: #fff;
}

.ca-providers__container {
  max-width: var(--ca-hub-content-max);
  margin: 0 auto;
}

.ca-providers__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ca-section-header-gap);
  margin-bottom: var(--ca-section-header-mb);
  text-align: center;
}

.ca-providers__title {
  margin: 0;
  font-family: 'Nunito Sans', 'Inter', sans-serif;
  font-size: var(--ca-section-title-size);
  font-weight: 600;
  line-height: var(--ca-section-title-line);
  color: var(--ca-section-title-color);
  text-align: center;
  letter-spacing: 0;
}

.ca-providers__desc {
  margin: 0;
  max-width: var(--ca-section-subtitle-max);
  font-family: 'Nunito Sans', 'Inter', sans-serif;
  font-size: var(--ca-section-subtitle-size);
  font-weight: 400;
  line-height: var(--ca-section-subtitle-line);
  color: var(--ca-section-subtitle-color);
  text-align: center;
}

.ca-providers__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 36px;
}

.ca-providers__empty {
  text-align: center;
  padding: 56px 24px;
  background: #F8FAFC;
  border-radius: 8px;
  border: 1px dashed #dbd9e1;
  margin-bottom: 36px;
}

.ca-providers__empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 8px;
}

.ca-providers__empty-desc {
  font-size: 14px;
  color: #64748B;
  margin: 0 0 16px;
}

.ca-providers__empty-clear {
  display: inline-flex;
  margin-right: 12px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 500;
  color: #7038f3;
  background: rgba(112, 56, 243, 0.08);
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.ca-providers__empty-cta {
  display: inline-flex;
  padding: 11px 24px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: #7038f3;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;
}

.ca-providers__empty-cta:hover {
  background: #8b5cf6;
}

.ca-providers__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.ca-providers__page-btn,
.ca-providers__page-num {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  min-height: 40px;
  margin: 0;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  color: #475569;
  background: #fff;
  border: 1px solid #dbd9e1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  appearance: none;
  -webkit-appearance: none;
}

.ca-providers__page-btn {
  padding: 0 18px;
  white-space: nowrap;
}

.ca-providers__page-btn:hover:not(:disabled) {
  border-color: #7038f3;
  color: #7038f3;
}

.ca-providers__page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.ca-providers__page-num {
  width: 40px;
  min-width: 40px;
  padding: 0;
}

.ca-providers__page-num:hover {
  border-color: #7038f3;
  color: #7038f3;
}

.ca-providers__page-num--active {
  background: #7038f3;
  border-color: #7038f3;
  color: #fff;
}

@media (max-width: 1024px) {
  .ca-providers__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .ca-providers {
    padding: 52px var(--ca-hub-content-padding-x-mobile);
  }

  .ca-providers__grid {
    grid-template-columns: 1fr;
  }

  .ca-providers__title {
    line-height: 1.25;
  }
}
</style>

