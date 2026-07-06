<template>
  <section class="ca-hero" id="ca-hero">
    <div class="ca-hero__container">
      <div class="ca-hero__left">
        <span class="ca-hero__eyebrow">{{ ct('eyebrow') }}</span>
        <h1 class="ca-hero__title">{{ ct('title') }}</h1>
        <p class="ca-hero__description">{{ ct('description') }}</p>

        <div class="ca-hero__cta-row">
          <a href="#ca-map" class="ca-hero__btn-primary">{{ ct('primaryCta') }}</a>
          <a href="/contact" class="ca-hero__btn-secondary">{{ ct('secondaryCta') }}</a>
        </div>
      </div>

      <!-- CA routing visual -->
      <div class="ca-hero__visual">
        <div class="ca-hero__visual-frame">
          <div class="ca-hero__routing-card">
            <div class="ca-hero__routing-header">
              <span class="ca-hero__routing-dot" />
              <span class="ca-hero__routing-dot" />
              <span class="ca-hero__routing-dot" />
              <span class="ca-hero__routing-label">{{ ct('routingLabel') }}</span>
            </div>

            <div class="ca-hero__routing-body">
            <div class="ca-hero__routing-source">
              <div class="ca-hero__doc-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7038f3" stroke-width="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <span>{{ ct('documentLabel') }}</span>
            </div>

            <div class="ca-hero__routing-lines">
              <svg class="ca-hero__lines-svg" viewBox="0 0 200 120" preserveAspectRatio="none">
                <path d="M100 0 C100 40, 30 50, 30 100" stroke="#C7D2FE" stroke-width="2" fill="none" stroke-dasharray="4 4"/>
                <path d="M100 0 C100 40, 100 50, 100 100" stroke="#C7D2FE" stroke-width="2" fill="none" stroke-dasharray="4 4"/>
                <path d="M100 0 C100 40, 170 50, 170 100" stroke="#C7D2FE" stroke-width="2" fill="none" stroke-dasharray="4 4"/>
              </svg>
            </div>

            <div class="ca-hero__routing-targets">
              <div
                v-for="target in routingTargets"
                :key="target.name"
                class="ca-hero__target-card"
              >
                <div class="ca-hero__target-info">
                  <span class="ca-hero__target-name">{{ target.name }}</span>
                  <span class="ca-hero__target-level">{{ target.level }}</span>
                </div>
                <span class="ca-hero__target-check">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const content = {
  en: {
    eyebrow: 'CA Hub',
    title: 'Find the right CA for every signing market',
    description: 'Explore CAs, QTSPs, and identity methods by country, assurance level, and signing workflow.',
    primaryCta: 'Explore coverage',
    secondaryCta: 'Contact Sales',
    routingLabel: 'CA routing',
    documentLabel: 'Document'
  },
  zh: {
    eyebrow: 'CA Hub',
    title: '为每个签署市场找到合适的 CA',
    description: '按国家、保证等级和签署场景，探索 CA、信任服务商与身份认证方式。',
    primaryCta: '查看覆盖能力',
    secondaryCta: '联系销售',
    routingLabel: 'CA 路由',
    documentLabel: '文档'
  },
  'zh-HK': {
    eyebrow: 'CA Hub',
    title: '為每個簽署市場找到合適的 CA',
    description: '按國家、保證等級和簽署場景，探索 CA、信任服務商與身分認證方式。',
    primaryCta: '查看覆蓋能力',
    secondaryCta: '聯繫銷售',
    routingLabel: 'CA 路由',
    documentLabel: '文檔'
  }
}

/** @param {string} key */
function ct(key) {
  const lang = locale.value in content ? locale.value : 'en'
  return content[lang][key] || key
}

const routingTargets = computed(() => [
  { name: 'certSIGN WebSign', level: 'QES' },
  { name: 'Chave Movel', level: 'AES' },
  { name: 'Belgian ID Card', level: 'eID' }
])
</script>

<style scoped>
.ca-hero {
  padding: 96px 48px 72px;
  background: #fff;
  overflow: hidden;
}

.ca-hero__container {
  max-width: 1320px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 500px) minmax(0, 1fr);
  gap: 72px;
  align-items: center;
}

.ca-hero__left {
  min-width: 0;
}

.ca-hero__eyebrow {
  display: inline-block;
  font-size: 13px;
  font-weight: 600;
  color: #7038f3;
  margin-bottom: 20px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.ca-hero__title {
  font-size: clamp(36px, 4vw, 52px);
  font-weight: 700;
  color: #0F172A;
  line-height: 1.1;
  margin-bottom: 24px;
  letter-spacing: -0.03em;
  max-width: 480px;
}

.ca-hero__description {
  font-size: 18px;
  color: #64748B;
  line-height: 1.65;
  margin-bottom: 36px;
  max-width: 440px;
}

.ca-hero__cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.ca-hero__btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 13px 28px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: #7038f3;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.ca-hero__btn-primary:hover {
  background: #5b21b6;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(112, 56, 243, 0.35);
}

.ca-hero__btn-secondary {
  display: inline-flex;
  align-items: center;
  padding: 13px 28px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  background: #fff;
  border: 1.5px solid #E2E8F0;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.ca-hero__btn-secondary:hover {
  border-color: #CBD5E1;
  background: #F8FAFC;
}

/* Routing visual — Ramp 式大画幅右侧容器 */
.ca-hero__visual {
  width: 100%;
  min-width: 0;
}

.ca-hero__visual-frame {
  width: 100%;
  min-height: 540px;
  padding: 48px 56px;
  background: #f4f6f9;
  border: 1px solid #e8ecf2;
  border-radius: 8px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ca-hero__routing-card {
  width: 100%;
  max-width: 620px;
  background: #FAFBFC;
  border: 1.5px solid #E2E8F0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.06);
}

.ca-hero__routing-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 20px;
  background: #fff;
  border-bottom: 1px solid #F1F5F9;
}

.ca-hero__routing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #E2E8F0;
}

.ca-hero__routing-label {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: #94A3B8;
  letter-spacing: 0.03em;
}

.ca-hero__routing-body {
  padding: 36px 32px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ca-hero__routing-source {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #64748B;
}

.ca-hero__doc-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #EEF2FF;
  border-radius: 8px;
  border: 1.5px solid #C7D2FE;
}

.ca-hero__routing-lines {
  width: 100%;
  height: 56px;
  margin: 8px 0;
}

.ca-hero__lines-svg {
  width: 100%;
  height: 100%;
}

.ca-hero__routing-targets {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.ca-hero__target-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: #fff;
  border: 1.5px solid #E2E8F0;
  border-radius: 8px;
  transition: border-color 0.2s;
}

.ca-hero__target-card:hover {
  border-color: #C7D2FE;
}

.ca-hero__target-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ca-hero__target-name {
  font-size: 14px;
  font-weight: 600;
  color: #0F172A;
}

.ca-hero__target-level {
  font-size: 11px;
  font-weight: 500;
  color: #7038f3;
  letter-spacing: 0.04em;
}

.ca-hero__target-check {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #D1FAE5;
  border-radius: 50%;
  flex-shrink: 0;
}

@media (max-width: 1100px) {
  .ca-hero__container {
    grid-template-columns: 1fr;
    gap: 48px;
    max-width: 720px;
  }

  .ca-hero__title {
    max-width: none;
  }

  .ca-hero__description {
    max-width: none;
  }
}

@media (max-width: 1024px) {
  .ca-hero {
    padding: 72px 32px 56px;
  }

  .ca-hero__container {
    text-align: center;
  }

  .ca-hero__cta-row {
    justify-content: center;
  }

  .ca-hero__visual-frame {
    min-height: 480px;
    padding: 40px 32px;
  }
}

@media (max-width: 640px) {
  .ca-hero {
    padding: 48px 20px 40px;
  }

  .ca-hero__title {
    font-size: 32px;
  }

  .ca-hero__visual-frame {
    min-height: auto;
    padding: 28px 20px;
  }

  .ca-hero__routing-card {
    max-width: 100%;
  }

  .ca-hero__cta-row {
    flex-direction: column;
    align-items: stretch;
  }

  .ca-hero__btn-primary,
  .ca-hero__btn-secondary {
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ca-hero__btn-primary:hover,
  .ca-hero__btn-secondary:hover {
    transform: none;
  }
}
</style>
