<template>
  <div class="ca-filters">
    <div class="ca-filters__layout">
      <label class="ca-filters__search">
        <span class="ca-filters__sr-only">{{ ct('searchPlaceholder') }}</span>
        <input
          type="text"
          :placeholder="ct('searchPlaceholder')"
          :value="searchQuery"
          class="ca-filters__input"
          @input="onSearchInput"
        />
      </label>

      <div ref="countryRootRef" class="ca-filters__country">
        <button
          type="button"
          class="ca-filters__country-toggle"
          :class="{ 'ca-filters__country-toggle--open': countryOpen }"
          :aria-expanded="countryOpen"
          aria-haspopup="listbox"
          @click="toggleCountryPanel"
        >
          <span class="ca-filters__country-toggle-text">{{ countryToggleLabel }}</span>
          <svg class="ca-filters__country-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="square"/>
          </svg>
        </button>

        <div v-if="countryOpen" class="ca-filters__country-panel" role="listbox" :aria-label="ct('countryPlaceholder')">
          <div class="ca-filters__country-list">
            <label
              v-for="country in countryOptions"
              :key="country.iso2"
              class="ns-check ca-filters__country-option"
            >
              <input
                type="checkbox"
                class="ns-check__input"
                :checked="isCountrySelected(country.iso2)"
                @change="toggleCountry(country.iso2)"
              />
              <span class="ca-filters__country-name">{{ country.name }}</span>
            </label>
          </div>
        </div>
      </div>

      <div class="ca-filters__tags" role="group" :aria-label="ct('categoryGroupLabel')">
        <button
          v-for="tag in categoryOptions"
          :key="tag.value"
          type="button"
          class="ca-filters__tag"
          :class="{ 'ca-filters__tag--active': selectedCategory === tag.value }"
          :aria-pressed="selectedCategory === tag.value"
          @click="toggleCategory(tag.value)"
        >
          <span class="ca-filters__tag-dot" aria-hidden="true" />
          {{ tag.label }}
        </button>
      </div>
    </div>

    <div v-if="selectedCountryIsos.length" class="ca-filters__active-row">
      <div class="ca-filters__active-values">
        <span
          v-for="iso in selectedCountryIsos"
          :key="iso"
          class="ca-filters__active-chip"
        >
          {{ countryNameByIso(iso) }}
          <button
            type="button"
            class="ca-filters__active-remove"
            :aria-label="ct('removeCountry', { name: countryNameByIso(iso) })"
            @click="removeCountry(iso)"
          >
            ×
          </button>
        </span>
      </div>
      <button type="button" class="ca-filters__active-clear" @click="clearCountries">
        {{ ct('clearCountryFilter') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  searchQuery: { type: String, default: '' },
  selectedCountryIsos: { type: Array, default: () => [] },
  selectedCategory: { type: String, default: '' },
  countryOptions: { type: Array, default: () => [] },
  categoryOptions: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'update:searchQuery',
  'update:selectedCountryIsos',
  'update:selectedCategory',
  'clear'
])

const { locale } = useI18n()

const countryOpen = ref(false)
const countryRootRef = ref(null)

const content = {
  en: {
    searchPlaceholder: 'Search by name...',
    countryPlaceholder: 'Filter by country...',
    clearCountryFilter: 'Clear',
    removeCountry: 'Remove {name}',
    categoryGroupLabel: 'Filter by category',
    clearFilters: 'Clear filters'
  },
  zh: {
    searchPlaceholder: '按名称搜索…',
    countryPlaceholder: '按国家筛选…',
    clearCountryFilter: '清除',
    removeCountry: '移除 {name}',
    categoryGroupLabel: '按类别筛选',
    clearFilters: '清除筛选'
  },
  'zh-HK': {
    searchPlaceholder: '按名稱搜尋…',
    countryPlaceholder: '按國家篩選…',
    clearCountryFilter: '清除',
    removeCountry: '移除 {name}',
    categoryGroupLabel: '按類別篩選',
    clearFilters: '清除篩選'
  }
}

/**
 * @param {string} key
 * @param {Record<string, string>} [params]
 * @returns {string}
 */
function ct(key, params = {}) {
  const lang = locale.value in content ? locale.value : 'en'
  let text = content[lang]?.[key] || key
  Object.entries(params).forEach(([name, value]) => {
    text = text.replace(`{${name}}`, value)
  })
  return text
}

const countryOptionMap = computed(() => {
  /** @type {Map<string, string>} */
  const map = new Map()
  props.countryOptions.forEach((country) => {
    map.set(country.iso2, country.name)
  })
  return map
})

const countryToggleLabel = computed(() => {
  if (!props.selectedCountryIsos.length) return ct('countryPlaceholder')
  if (props.selectedCountryIsos.length === 1) {
    return countryNameByIso(props.selectedCountryIsos[0])
  }
  return `${props.selectedCountryIsos.length} ${locale.value === 'en' ? 'countries' : '个国家'}`
})

/**
 * @param {string} iso2
 * @returns {string}
 */
function countryNameByIso(iso2) {
  return countryOptionMap.value.get(iso2) || iso2
}

/**
 * @param {string} iso2
 * @returns {boolean}
 */
function isCountrySelected(iso2) {
  return props.selectedCountryIsos.includes(iso2)
}

function toggleCountryPanel() {
  countryOpen.value = !countryOpen.value
}

/**
 * @param {string} iso2
 */
function toggleCountry(iso2) {
  const next = isCountrySelected(iso2)
    ? props.selectedCountryIsos.filter(code => code !== iso2)
    : [...props.selectedCountryIsos, iso2]
  emit('update:selectedCountryIsos', next)
}

/**
 * @param {string} iso2
 */
function removeCountry(iso2) {
  emit('update:selectedCountryIsos', props.selectedCountryIsos.filter(code => code !== iso2))
}

function clearCountries() {
  emit('update:selectedCountryIsos', [])
}

/** @param {Event} e */
function onSearchInput(e) {
  emit('update:searchQuery', e.target.value)
}

/** @param {string} value */
function toggleCategory(value) {
  emit('update:selectedCategory', props.selectedCategory === value ? '' : value)
}

/** @param {MouseEvent} event */
function onDocumentClick(event) {
  if (!countryRootRef.value?.contains(event.target)) {
    countryOpen.value = false
  }
}

/** @param {KeyboardEvent} event */
function onDocumentKeydown(event) {
  if (event.key === 'Escape') countryOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onDocumentKeydown)
})
</script>

<style scoped>
.ca-filters {
  width: 100%;
  margin-bottom: 28px;
}

.ca-filters__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(200px, 240px) auto;
  width: 100%;
  align-items: center;
  gap: 12px;
}

.ca-filters__search {
  min-width: 0;
}

.ca-filters__input {
  box-sizing: border-box;
  width: 100%;
  height: 48px;
  padding: 0 16px;
  font-family: 'Nunito Sans', 'Inter', sans-serif;
  font-size: 15px;
  color: #12003a;
  background: #fff;
  border: 1px solid #dbd9e1;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.ca-filters__input::placeholder {
  color: #9b93a8;
}

.ca-filters__input:focus {
  border-color: #7038f3;
  box-shadow: 0 0 0 3px rgba(112, 56, 243, 0.1);
}

.ca-filters__country {
  position: relative;
  min-width: 0;
}

.ca-filters__country-toggle {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  height: 48px;
  padding: 0 14px 0 16px;
  font-family: 'Nunito Sans', 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 400;
  color: #12003a;
  text-align: left;
  background: #fff;
  border: 1px solid #dbd9e1;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.ca-filters__country-toggle:hover {
  border-color: #c9c5d1;
}

.ca-filters__country-toggle--open,
.ca-filters__country-toggle:focus-visible {
  border-color: #7038f3;
  box-shadow: 0 0 0 3px rgba(112, 56, 243, 0.1);
  outline: none;
}

.ca-filters__country-toggle-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ca-filters__country-chevron {
  flex-shrink: 0;
  color: #6b6280;
  transition: transform 0.2s ease;
}

.ca-filters__country-toggle--open .ca-filters__country-chevron {
  transform: rotate(180deg);
}

.ca-filters__country-panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 30;
  width: min(320px, 92vw);
  max-height: 320px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #dbd9e1;
  border-radius: 8px;
  box-shadow: 0 12px 32px rgba(18, 0, 58, 0.12);
}

.ca-filters__country-list {
  max-height: 320px;
  overflow-y: auto;
  padding: 8px 0;
}

.ca-filters__country-option {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.ca-filters__country-option:hover {
  background: #f8f8f8;
}

.ca-filters__country-name {
  font-family: 'Nunito Sans', 'Inter', sans-serif;
  font-size: 14px;
  line-height: 1.4;
  color: #12003a;
}

.ca-filters__tags {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-width: 0;
}

.ca-filters__tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  font-family: 'Nunito Sans', 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #4c4264;
  background: #fff;
  border: 1px solid #dbd9e1;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.ca-filters__tag:hover {
  border-color: #c9c5d1;
}

.ca-filters__tag--active {
  color: #12003a;
  background: #fff;
  border-color: #7038f3;
}

.ca-filters__tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.55;
}

.ca-filters__tag--active .ca-filters__tag-dot {
  opacity: 1;
  background: #7038f3;
}

.ca-filters__active-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 14px;
  background: rgba(112, 56, 243, 0.06);
  border: 1px solid rgba(112, 56, 243, 0.18);
  border-radius: 8px;
}

.ca-filters__active-values {
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
}

.ca-filters__active-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-family: 'Nunito Sans', 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #7038f3;
  background: #fff;
  border: 1px solid rgba(112, 56, 243, 0.28);
  border-radius: 6px;
}

.ca-filters__active-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  font-size: 16px;
  line-height: 1;
  color: #7038f3;
  background: none;
  border: none;
  cursor: pointer;
}

.ca-filters__active-clear {
  flex-shrink: 0;
  margin-left: auto;
  padding: 0;
  font-family: 'Nunito Sans', 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #7038f3;
  background: none;
  border: none;
  cursor: pointer;
}

.ca-filters__active-clear:hover,
.ca-filters__active-remove:hover {
  opacity: 0.85;
}

.ca-filters__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 768px) {
  .ca-filters__layout {
    grid-template-columns: 1fr;
  }

  .ca-filters__tags {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .ca-filters__country-panel {
    width: 100%;
  }
}
</style>
