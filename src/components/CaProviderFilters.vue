<template>
  <div class="ca-filters">
    <div class="ca-filters__search">
      <svg class="ca-filters__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
      <input
        type="text"
        :placeholder="ct('searchPlaceholder')"
        :value="searchQuery"
        class="ca-filters__input"
        @input="onInput"
      />
      <button
        v-if="searchQuery || selectedCountry"
        class="ca-filters__clear"
        @click="handleClear"
      >
        {{ ct('clearFilters') }}
      </button>
    </div>

    <div v-if="selectedCountry" class="ca-filters__chip">
      <img
        :src="`https://flagcdn.com/w20/${selectedCountry.iso2.toLowerCase()}.png`"
        :alt="selectedCountry.name"
        class="ca-filters__chip-flag"
      />
      <span>{{ selectedCountry.name }}</span>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const props = defineProps({
  searchQuery: { type: String, default: '' },
  selectedCountry: { type: Object, default: null }
})

const emit = defineEmits(['update:searchQuery', 'clear'])

const { locale } = useI18n()

const content = {
  en: {
    searchPlaceholder: 'Search country, CA, TSP, or method',
    clearFilters: 'Clear filters'
  },
  zh: {
    searchPlaceholder: '搜索国家、CA、TSP 或方式',
    clearFilters: '清除筛选'
  },
  'zh-HK': {
    searchPlaceholder: '搜尋國家、CA、TSP 或方式',
    clearFilters: '清除篩選'
  }
}

/** @param {string} key */
function ct(key) {
  const lang = locale.value in content ? locale.value : 'en'
  return content[lang]?.[key] || key
}

/** @param {Event} e */
function onInput(e) {
  emit('update:searchQuery', e.target.value)
}

function handleClear() {
  emit('update:searchQuery', '')
  emit('clear')
}
</script>

<style scoped>
.ca-filters {
  margin-bottom: 28px;
}

.ca-filters__search {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  background: #fff;
  border: 1px solid #dbd9e1;
  border-radius: 8px;
  transition: border-color 0.2s;
}

.ca-filters__search:focus-within {
  border-color: #7038f3;
  box-shadow: 0 0 0 3px rgba(112, 56, 243, 0.1);
}

.ca-filters__icon {
  flex-shrink: 0;
}

.ca-filters__input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: #0F172A;
  background: transparent;
}

.ca-filters__input::placeholder {
  color: #94A3B8;
}

.ca-filters__clear {
  flex-shrink: 0;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #7038f3;
  background: rgba(112, 56, 243, 0.08);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.ca-filters__clear:hover {
  background: rgba(112, 56, 243, 0.15);
}

.ca-filters__chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #4338CA;
  background: #EEF2FF;
  border-radius: 8px;
}

.ca-filters__chip-flag {
  width: 18px;
  height: 13px;
  object-fit: cover;
  border-radius: 8px;
}
</style>
