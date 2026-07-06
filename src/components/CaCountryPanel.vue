<template>
  <div class="ca-country-panel" :class="{ 'ca-country-panel--visible': visible }">
    <header class="ca-country-panel__header">
      <h3 class="ca-country-panel__title">{{ country.name }}</h3>
      <button class="ca-country-panel__close" @click="$emit('close')" aria-label="Close panel">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </header>

    <!-- Provider count -->
    <div v-if="providers.length > 0" class="ca-country-panel__count">
      {{ providers.length }} {{ ct('providerCountLabel') }}
    </div>

    <ul v-if="providers.length > 0" class="ca-country-panel__list">
      <li
        v-for="provider in providers"
        :key="provider.slug || provider.id"
        class="ca-country-panel__item"
      >
        <span :class="['ca-item-cat', getCategoryBadge(provider.category)]">
          {{ getCategoryCode(provider.category) }}
        </span>
        <span class="ca-item-name">{{ provider.name }}</span>
        <span class="ca-item-status" :class="'--' + (provider.status || '').toLowerCase().replace(/\s+/g, '-')">{{ provider.status }}</span>
      </li>
    </ul>

    <div v-else class="ca-country-panel__empty">
      <p>{{ ct('emptyState') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps({
  country: { type: Object, required: true },
  providers: { type: Array, default: () => [] }
})

defineEmits(['close'])

const { locale } = useI18n()
const visible = ref(false)

onMounted(() => {
  requestAnimationFrame(() => { visible.value = true })
})

const content = {
  en: { providerCountLabel: 'providers available', emptyState: 'No provider configured yet' },
  zh: { providerCountLabel: '个 Provider 可用', emptyState: '暂无已配置 Provider' },
  'zh-HK': { providerCountLabel: '個 Provider 可用', emptyState: '暫無已設定 Provider' }
}

function ct(key) {
  const lang = locale.value in content ? locale.value : 'en'
  return content[lang]?.[key] || key
}

const categoryMap = {
  'ESIGNATURE': { code: 'ES', cls: '--es' },
  'ESEALING': { code: 'ESL', cls: '--esl' },
  'EID AUTHENTICATION': { code: 'AU', cls: '--au' },
  'default': { code: 'CA', cls: '--default' }
}

function getCategoryCode(cat) {
  return (categoryMap[cat?.toUpperCase()]?.code) || categoryMap.default.code
}
function getCategoryBadge(cat) {
  return `ca-item-cat${categoryMap[cat?.toUpperCase()]?.cls || categoryMap.default.cls}`
}
</script>

<style scoped>
.ca-country-panel {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  padding: 20px;
  animation: slideIn 0.25s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(12px); }
  to { opacity: 1; transform: translateX(0); }
}

.ca-country-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.ca-country-panel__title {
  font-size: 17px;
  font-weight: 600;
  color: #0F172A;
  margin: 0;
}

.ca-country-panel__close {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F1F5F9;
  border: none;
  border-radius: 8px;
  color: #64748B;
  cursor: pointer;
}

.ca-country-panel__count {
  font-size: 13px;
  font-weight: 500;
  color: #7038f3;
  margin-bottom: 12px;
  padding: 6px 12px;
  background: rgba(112, 56, 243, 0.06);
  border-radius: 8px;
  display: inline-block;
}

.ca-country-panel__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ca-country-panel__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  transition: background 0.15s;
  margin-bottom: 4px;
}

.ca-country-panel__item:hover { background: #F8FAFC; }

/* Category badge */
.ca-item-cat {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 8px;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.ca-item-cat--es { background: #DBEAFE; color: #2563EB; }
.ca-item-cat--esl { background: #D1FAE5; color: #059669; }
.ca-item-cat--au { background: #FEF3C7; color: #D97706; }
.ca-item-cat--default { background: #F1F5F9; color: #475569; }

.ca-item-name {
  font-size: 13px;
  font-weight: 500;
  color: #0F172A;
  flex: 1;
}

.ca-item-status {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 8px;
  white-space: nowrap;
}

.ca-item-status--available { background: #D1FAE5; color: #059669; }
.ca-item-status--sales-assisted { background: #DBEAFE; color: #2563EB; }
.ca-item-status--planned,
.ca-item-status--needs-confirmation { background: #FEF3C7; color: #D97706; }

.ca-country-panel__empty {
  text-align: center;
  padding: 28px 16px;
  color: #94A3B8;
  font-size: 14px;
}
</style>
