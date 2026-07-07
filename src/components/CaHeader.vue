<template>
  <header class="ca-header">
    <div class="ca-header__inner">
      <!-- 左侧：Logo + 导航 -->
      <div class="ca-header__left">
        <a href="/" class="ca-header__logo" aria-label="NotaSign Home">
          <img :src="assetUrl('assets/header/logo.svg')" alt="NotaSign" width="65" height="38" />
        </a>

        <nav class="ca-header__nav" aria-label="Main navigation">
          <a
            v-for="item in navItems"
            :key="item.key"
            href="#"
            class="ca-header__nav-link"
          >
            <span>{{ ct(item.key) }}</span>
            <img
              v-if="item.hasChevron"
              :src="assetUrl('assets/header/chevron.svg')"
              alt=""
              width="14"
              height="14"
              class="ca-header__chevron"
            />
          </a>
        </nav>
      </div>

      <!-- 右侧：语言 + 合规助手 + 登录 + CTA -->
      <div class="ca-header__right">
        <!-- 语言切换（保留线上 globe 图标） -->
        <div class="ca-header__lang" ref="langRef">
          <button
            class="ca-header__lang-btn"
            :aria-expanded="langOpen"
            aria-haspopup="listbox"
            @click.stop="langOpen = !langOpen"
          >
            <img :src="assetUrl('assets/header/icon-globe.svg')" alt="" width="20" height="20" class="ca-header__globe" />
          </button>
          <ul v-if="langOpen" class="ca-header__lang-menu" role="listbox">
            <li
              v-for="opt in localeOptions"
              :key="opt.value"
              role="option"
              :aria-selected="locale === opt.value"
              class="ca-header__lang-item"
              :class="{ 'ca-header__lang-item--active': locale === opt.value }"
              @click="switchLocale(opt.value)"
            >
              {{ opt.label }}
            </li>
          </ul>
        </div>

        <img :src="assetUrl('assets/header/divider.svg')" alt="" class="ca-header__divider" width="1" height="16" />

        <!-- Compliance Assistant -->
        <a href="#" class="ca-header__compliance">
          <span>{{ ct('compliance') }}</span>
        </a>

        <img :src="assetUrl('assets/header/divider.svg')" alt="" class="ca-header__divider" width="1" height="16" />

        <a href="/login" class="ca-header__login">{{ ct('login') }}</a>

        <a href="/contact" class="ca-header__btn-outline">
          <span>{{ ct('contactSales') }}</span>
        </a>

        <a href="/trial" class="ca-header__btn-primary">{{ ct('freeTrial') }}</a>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { assetUrl } from '@/utils/assetUrl'

const { locale } = useI18n()
const router = useRouter()
const route = useRoute()

const langOpen = ref(false)
const langRef = ref(null)

const navItems = [
  { key: 'products', hasChevron: true },
  { key: 'solutions', hasChevron: true },
  { key: 'resources', hasChevron: true },
  { key: 'pricing', hasChevron: false }
]

const localeOptions = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '简体中文' },
  { value: 'zh-HK', label: '繁體中文' }
]

const content = {
  en: {
    products: 'Products',
    solutions: 'Solutions',
    resources: 'Resources',
    pricing: 'Plans & Pricing',
    compliance: 'Compliance Assistant',
    login: 'Log in',
    contactSales: 'Contact Sales',
    freeTrial: 'Free Trial'
  },
  zh: {
    products: '产品',
    solutions: '解决方案',
    resources: '资源',
    pricing: '套餐与定价',
    compliance: '合规助手',
    login: '登录',
    contactSales: '联系销售',
    freeTrial: '免费试用'
  },
  'zh-HK': {
    products: '產品',
    solutions: '解決方案',
    resources: '資源',
    pricing: '套餐與定價',
    compliance: '合規助手',
    login: '登入',
    contactSales: '聯繫銷售',
    freeTrial: '免費試用'
  }
}

/** @param {string} key */
function ct(key) {
  const lang = locale.value in content ? locale.value : 'en'
  return content[lang]?.[key] || key
}

/** @param {string} value */
function switchLocale(value) {
  locale.value = value
  langOpen.value = false

  const basePath = '/product/ca-hub'
  if (value === 'en') {
    router.replace(basePath)
  } else {
    router.replace(`/${value}${basePath}`)
  }
}

/** @param {Event} e */
function onDocClick(e) {
  if (langRef.value && !langRef.value.contains(e.target)) {
    langOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  if (route.params.locale && localeOptions.some(o => o.value === route.params.locale)) {
    locale.value = route.params.locale
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@700;800&display=swap');

.ca-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid #ddd;
}

.ca-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1440px;
  margin: 0 auto;
  padding: 12px 16px 12px 24px;
  min-height: 72px;
  box-sizing: border-box;
}

/* 左侧 */
.ca-header__left {
  display: flex;
  align-items: center;
  gap: 64px;
  min-width: 0;
}

.ca-header__logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  text-decoration: none;
}

.ca-header__logo img {
  display: block;
  width: 65px;
  height: 38px;
}

.ca-header__nav {
  display: flex;
  align-items: center;
  gap: 32px;
}

.ca-header__nav-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'Nunito Sans', 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #12003a;
  text-decoration: none;
  white-space: nowrap;
  transition: opacity 0.15s;
}

.ca-header__nav-link:hover {
  opacity: 0.75;
}

.ca-header__chevron {
  flex-shrink: 0;
  opacity: 0.85;
}

/* 右侧 */
.ca-header__right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 24px;
  flex: 1;
  min-width: 0;
}

/* 语言切换 */
.ca-header__lang {
  position: relative;
  flex-shrink: 0;
}

.ca-header__lang-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.ca-header__lang-btn:hover {
  background: #f3f4f6;
}

.ca-header__globe {
  display: block;
}

.ca-header__lang-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 30;
  min-width: 140px;
  margin: 0;
  padding: 6px;
  list-style: none;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.ca-header__lang-item {
  padding: 9px 12px;
  font-family: 'Nunito Sans', 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.ca-header__lang-item:hover {
  background: #f3f4f6;
}

.ca-header__lang-item--active {
  color: #7038f3;
  background: #f5f3ff;
}

.ca-header__divider {
  flex-shrink: 0;
  opacity: 0.5;
}

/* Compliance Assistant */
.ca-header__compliance {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-family: 'Nunito Sans', 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  background: linear-gradient(90deg, #7038f3 0%, #04d79b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: opacity 0.15s;
}

.ca-header__compliance:hover {
  opacity: 0.85;
}

/* Log in */
.ca-header__login {
  font-family: 'Nunito Sans', 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #12003a;
  text-decoration: none;
  white-space: nowrap;
  transition: opacity 0.15s;
}

.ca-header__login:hover {
  opacity: 0.75;
}

/* Contact Sales - 渐变描边 */
.ca-header__btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  padding: 0 24px;
  font-family: 'Nunito Sans', 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  border-radius: 4px;
  border: 1px solid #7038f3;
  background: linear-gradient(90deg, rgba(112, 56, 243, 0.1) 0%, rgba(4, 215, 155, 0.1) 100%);
  box-sizing: border-box;
  transition: transform 0.15s;
}

.ca-header__btn-outline span {
  background: linear-gradient(90deg, #7038f3 0%, #04d79b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.ca-header__btn-outline:hover {
  transform: translateY(-1px);
}

/* Free Trial */
.ca-header__btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  padding: 0 24px;
  font-family: 'Nunito Sans', 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  background: #7038f3;
  border: 1px solid #7038f3;
  border-radius: 4px;
  text-decoration: none;
  white-space: nowrap;
  box-sizing: border-box;
  transition: background 0.2s, transform 0.15s;
}

.ca-header__btn-primary:hover {
  background: #5b21b6;
  border-color: #5b21b6;
  transform: translateY(-1px);
}

/* 响应式 */
@media (max-width: 1200px) {
  .ca-header__nav {
    display: none;
  }

  .ca-header__left {
    gap: 0;
  }
}

@media (max-width: 900px) {
  .ca-header__compliance {
    font-size: 14px;
  }
}

@media (max-width: 720px) {
  .ca-header__btn-outline,
  .ca-header__login {
    display: none;
  }

  .ca-header__divider {
    display: none;
  }

  .ca-header__right {
    gap: 12px;
  }

  .ca-header__inner {
    padding: 10px 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ca-header__btn-outline:hover,
  .ca-header__btn-primary:hover {
    transform: none;
  }
}
</style>
