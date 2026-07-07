<template>
  <footer class="ca-footer">
    <div class="ca-footer__inner">
      <div class="ca-footer__top">
        <div class="ca-footer__brand">
          <a href="/" class="ca-footer__logo" aria-label="NotaSign Home">
            <img :src="assetUrl('assets/header/logo.svg')" alt="NotaSign" width="109" height="64" />
          </a>
          <p class="ca-footer__tagline">{{ ct('tagline') }}</p>
        </div>

        <div class="ca-footer__links">
          <div v-for="group in linkGroups" :key="group.titleKey" class="ca-footer__col">
            <p class="ca-footer__col-title">{{ ct(group.titleKey) }}</p>
            <a
              v-for="link in group.links"
              :key="link.key"
              :href="link.href"
              class="ca-footer__link"
            >{{ ct(link.key) }}</a>
          </div>
        </div>
      </div>

      <div class="ca-footer__bottom">
        <div class="ca-footer__social-row">
          <a href="https://www.linkedin.com/company/notasign" class="ca-footer__social" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <img :src="assetUrl('assets/footer/icon-linkedin.svg')" alt="" width="24" height="24" />
          </a>
          <a href="https://www.youtube.com/@notasign" class="ca-footer__social" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
            <img :src="assetUrl('assets/footer/icon-youtube.svg')" alt="" width="24" height="24" />
          </a>

          <div ref="langRef" class="ca-footer__lang">
            <button
              class="ca-footer__lang-btn"
              type="button"
              :aria-expanded="langOpen"
              aria-haspopup="listbox"
              @click.stop="langOpen = !langOpen"
            >
              <span class="ca-footer__lang-label">{{ currentLocaleLabel }}</span>
              <img
                :src="assetUrl('assets/footer/icon-chevron-down.svg')"
                alt=""
                width="20"
                height="20"
                class="ca-footer__lang-chevron"
              />
            </button>
            <ul v-if="langOpen" class="ca-footer__lang-menu" role="listbox">
              <li
                v-for="opt in localeOptions"
                :key="opt.value"
                role="option"
                :aria-selected="locale === opt.value"
                class="ca-footer__lang-item"
                :class="{ 'ca-footer__lang-item--active': locale === opt.value }"
                @click="switchLocale(opt.value)"
              >{{ opt.label }}</li>
            </ul>
          </div>
        </div>

        <div class="ca-footer__legal-row">
          <div class="ca-footer__legal-links">
            <a href="/cookie-settings" class="ca-footer__legal-link">{{ ct('cookieSettings') }}</a>
            <span class="ca-footer__divider" aria-hidden="true" />
            <a href="/terms" class="ca-footer__legal-link">{{ ct('termsOfUse') }}</a>
            <span class="ca-footer__divider" aria-hidden="true" />
            <a href="/privacy" class="ca-footer__legal-link">{{ ct('privacyPolicy') }}</a>
            <span class="ca-footer__divider" aria-hidden="true" />
            <span class="ca-footer__copyright">{{ ct('copyright') }}</span>
          </div>

          <div class="ca-footer__badges" aria-label="Compliance certifications">
            <img
              class="ca-footer__badge-csc"
              :src="assetUrl('assets/footer/badge-csc.png')"
              alt="Cloud Signature Consortium"
              width="102"
              height="32"
            />
            <img :src="assetUrl('assets/footer/badge-eidas.svg')" alt="eIDAS" width="32" height="32" />
            <img :src="assetUrl('assets/footer/badge-soc2.svg')" alt="AICPA SOC" width="32" height="32" />
            <img :src="assetUrl('assets/footer/badge-gdpr.svg')" alt="GDPR" width="32" height="32" />
            <img :src="assetUrl('assets/footer/badge-ccpa.svg')" alt="CCPA" width="32" height="32" />
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { assetUrl } from '@/utils/assetUrl'

const { locale } = useI18n()
const router = useRouter()

const langOpen = ref(false)
const langRef = ref(null)

const localeOptions = [
  { value: 'en', label: 'English (United States)' },
  { value: 'zh', label: '简体中文' },
  { value: 'zh-HK', label: '繁體中文' }
]

const linkGroups = [
  {
    titleKey: 'productTitle',
    links: [
      { key: 'eSignature', href: '/e-signature' },
      { key: 'identity', href: '/identity' },
      { key: 'pricing', href: '/pricing' }
    ]
  },
  {
    titleKey: 'resourcesTitle',
    links: [
      { key: 'blog', href: '/blog' },
      { key: 'supportCenter', href: '/support' },
      { key: 'trustCenter', href: '/trust' },
      { key: 'complianceAssistant', href: '/compliance' },
      { key: 'developerCenter', href: '/developers' },
      { key: 'apiDocs', href: '/api-docs' }
    ]
  },
  {
    titleKey: 'companyTitle',
    links: [
      { key: 'aboutUs', href: '/about' },
      { key: 'contactUs', href: '/contact' }
    ]
  }
]

const content = {
  en: {
    tagline: 'Sign with global trust',
    productTitle: 'Product',
    resourcesTitle: 'Resources',
    companyTitle: 'Company',
    eSignature: 'e-Signature',
    identity: 'Identity',
    pricing: 'Pricing',
    blog: 'Blog',
    supportCenter: 'Support Center',
    trustCenter: 'Trust Center',
    complianceAssistant: 'Compliance Assistant',
    developerCenter: 'Developer Center',
    apiDocs: 'API Documentation',
    aboutUs: 'About Us',
    contactUs: 'Contact Us',
    cookieSettings: 'Cookie settings',
    termsOfUse: 'Terms of use',
    privacyPolicy: 'Privacy policy',
    copyright: 'All Rights Reserved © notasign.com'
  },
  zh: {
    tagline: '以全球信任签署',
    productTitle: '产品',
    resourcesTitle: '资源',
    companyTitle: '公司',
    eSignature: '电子签名',
    identity: '身份认证',
    pricing: '定价',
    blog: '博客',
    supportCenter: '支持中心',
    trustCenter: '信任中心',
    complianceAssistant: '合规助手',
    developerCenter: '开发者中心',
    apiDocs: 'API 文档',
    aboutUs: '关于我们',
    contactUs: '联系我们',
    cookieSettings: 'Cookie 设置',
    termsOfUse: '使用条款',
    privacyPolicy: '隐私政策',
    copyright: '版权所有 © notasign.com'
  },
  'zh-HK': {
    tagline: '以全球信任簽署',
    productTitle: '產品',
    resourcesTitle: '資源',
    companyTitle: '公司',
    eSignature: '電子簽名',
    identity: '身份認證',
    pricing: '定價',
    blog: '博客',
    supportCenter: '支援中心',
    trustCenter: '信任中心',
    complianceAssistant: '合規助手',
    developerCenter: '開發者中心',
    apiDocs: 'API 文檔',
    aboutUs: '關於我們',
    contactUs: '聯繫我們',
    cookieSettings: 'Cookie 設定',
    termsOfUse: '使用條款',
    privacyPolicy: '私隱政策',
    copyright: '版權所有 © notasign.com'
  }
}

/** @param {string} key */
function ct(key) {
  const lang = locale.value in content ? locale.value : 'en'
  return content[lang]?.[key] || key
}

const currentLocaleLabel = computed(() => {
  return localeOptions.find(o => o.value === locale.value)?.label || 'English (United States)'
})

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
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
})
</script>

<style scoped>
.ca-footer {
  --ca-footer-bg: #f8f7fa;
  background: var(--ca-footer-bg);
  border-top: 1px solid #eceaf0;
}

.ca-footer__inner {
  max-width: var(--ca-hub-content-max);
  margin: 0 auto;
  padding: 80px var(--ca-hub-content-padding-x) 48px;
}

.ca-footer__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 48px;
  margin-bottom: 80px;
}

.ca-footer__brand {
  flex-shrink: 0;
  width: min(393px, 100%);
}

.ca-footer__logo {
  display: inline-flex;
  margin-bottom: 16px;
}

.ca-footer__logo img {
  display: block;
  height: 64px;
  width: auto;
}

.ca-footer__tagline {
  margin: 0;
  font-size: 20px;
  line-height: 1.4;
  color: #12003a;
}

.ca-footer__links {
  display: flex;
  flex: 1;
  justify-content: space-between;
  gap: 32px;
  max-width: 778px;
}

.ca-footer__col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ca-footer__col-title {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #12003a;
}

.ca-footer__link {
  font-size: 14px;
  font-weight: 400;
  color: #12003a;
  text-decoration: none;
  line-height: 1.4;
  transition: color 0.2s;
}

.ca-footer__link:hover {
  color: #7038f3;
}

.ca-footer__bottom {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.ca-footer__social-row {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.ca-footer__social {
  display: inline-flex;
  color: #12003a;
  transition: opacity 0.2s;
}

.ca-footer__social:hover {
  opacity: 0.7;
}

.ca-footer__lang {
  position: relative;
  flex-shrink: 0;
}

.ca-footer__lang-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  height: 48px;
  padding: 12px 16px;
  font-family: inherit;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: #262626;
  background: var(--ca-footer-bg);
  border: 1px solid #d4d4d4;
  border-radius: 2px;
  cursor: pointer;
  white-space: nowrap;
}

.ca-footer__lang-label {
  flex-shrink: 0;
}

.ca-footer__lang-chevron {
  flex-shrink: 0;
  display: block;
}

.ca-footer__lang-menu {
  position: absolute;
  left: 0;
  bottom: calc(100% + 8px);
  min-width: 220px;
  margin: 0;
  padding: 6px;
  list-style: none;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(18, 0, 58, 0.08);
  z-index: 10;
}

.ca-footer__lang-item {
  padding: 10px 12px;
  font-size: 14px;
  color: #334155;
  border-radius: 8px;
  cursor: pointer;
}

.ca-footer__lang-item:hover,
.ca-footer__lang-item--active {
  background: #f5f3ff;
  color: #7038f3;
}

.ca-footer__legal-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.ca-footer__legal-links {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.ca-footer__legal-link,
.ca-footer__copyright {
  font-size: 12px;
  color: #12003a;
  text-decoration: none;
  line-height: 1;
}

.ca-footer__legal-link:hover {
  color: #7038f3;
}

.ca-footer__divider {
  width: 1px;
  height: 16px;
  background: #d4d4d4;
}

.ca-footer__badges {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ca-footer__badges img:not(.ca-footer__badge-csc) {
  display: block;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.ca-footer__badge-csc {
  display: block;
  flex-shrink: 0;
  width: 102px;
  height: 32px;
  object-fit: contain;
}

@media (max-width: 1024px) {
  .ca-footer__top {
    flex-direction: column;
  }

  .ca-footer__links {
    width: 100%;
    max-width: none;
  }
}

@media (max-width: 720px) {
  .ca-footer__inner {
    padding: 56px var(--ca-hub-content-padding-x-mobile) 32px;
  }

  .ca-footer__top {
    margin-bottom: 48px;
  }

  .ca-footer__links {
    flex-direction: column;
    gap: 28px;
  }

  .ca-footer__legal-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
