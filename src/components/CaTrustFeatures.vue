<template>
  <section class="ca-trust-features" id="ca-trust">
    <div class="ca-trust-features__container">
      <header class="ca-trust-features__header">
        <h2 class="ca-trust-features__title">{{ ct('title') }}</h2>
      </header>

      <div class="ca-trust-features__grid">
        <div v-for="(item, index) in features" :key="index" class="ca-trust-card">
          <div class="ca-trust-card__icon" aria-hidden="true">
            <component :is="item.icon()" />
          </div>
          <div class="ca-trust-card__body">
            <h3 class="ca-trust-card__title">{{ item.title[localeKey] || item.title.en }}</h3>
            <p class="ca-trust-card__desc">{{ item.desc[localeKey] || item.desc.en }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, h } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const localeKey = computed(() => locale.value)

/** @type {string} */
const ICON_STROKE = '#12003a'

const content = {
  en: { title: 'Route trust-provider decisions with confidence' },
  zh: { title: '自信地规划信任服务路由决策' },
  'zh-HK': { title: '自信地規劃信任服務路由決策' }
}

/** @param {string} key */
function ct(key) {
  const lang = locale.value in content ? locale.value : 'en'
  return content[lang]?.[key] || key
}

const features = [
  {
    title: { en: 'Coverage by market', zh: '按市场覆盖', 'zh-HK': '按市場覆蓋' },
    desc: { en: 'See available CAs and QTSPs by country.', zh: '按国家查看可用的 CA 与 QTSP。', 'zh-HK': '按國家查看可用的 CA 與 QTSP。' },
    icon: () => h('svg', { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: ICON_STROKE, 'stroke-width': '1.5' }, [
      h('circle', { cx: '12', cy: '12', r: '10' }),
      h('path', { d: 'M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z' })
    ])
  },
  {
    title: { en: 'Assurance-aware routing', zh: '保证等级感知路由', 'zh-HK': '保證等級感知路由' },
    desc: { en: 'Match assurance levels (Standard, AES, QES) based on regulations.', zh: '根据法规要求匹配保证等级（Standard、AES、QES）。', 'zh-HK': '根據法規要求匹配保證等級（Standard、AES、QES）。' },
    icon: () => h('svg', { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: ICON_STROKE, 'stroke-width': '1.5' }, [
      h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' })
    ])
  },
  {
    title: { en: 'Provider detail pages', zh: 'Provider 详情页', 'zh-HK': 'Provider 詳情頁' },
    desc: { en: 'Access guidance on identity methods and technical requirements.', zh: '获取身份认证方式与技术要求的指引。', 'zh-HK': '獲取身分認證方式與技術要求的指引。' },
    icon: () => h('svg', { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: ICON_STROKE, 'stroke-width': '1.5' }, [
      h('path', { d: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })
    ])
  },
  {
    title: { en: 'Sales-assisted setup', zh: '销售协助配置', 'zh-HK': '銷售協助配置' },
    desc: { en: 'Get expert help for complex markets.', zh: '获取专家支持，应对复杂市场。', 'zh-HK': '獲取專家支援，應對複雜市場。' },
    icon: () => h('svg', { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: ICON_STROKE, 'stroke-width': '1.5' }, [
      h('path', { d: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2' }),
      h('circle', { cx: '9', cy: '7', r: '4' }),
      h('path', { d: 'M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' })
    ])
  }
]
</script>

<style scoped>
.ca-trust-features {
  padding: 72px var(--ca-hub-content-padding-x);
  background: #fff;
}

.ca-trust-features__container {
  max-width: var(--ca-hub-content-max);
  margin: 0 auto;
}

.ca-trust-features__header {
  /* 仅主标题时：标题间距 + 区块下间距，与含副标题区块视觉节奏一致 */
  margin-bottom: calc(var(--ca-section-header-gap) + var(--ca-section-header-mb));
  text-align: center;
}

.ca-trust-features__title {
  margin: 0;
  font-family: 'Nunito Sans', 'Inter', sans-serif;
  font-size: var(--ca-section-title-size);
  font-weight: 600;
  line-height: var(--ca-section-title-line);
  color: var(--ca-section-title-color);
  text-align: center;
  letter-spacing: 0;
}

.ca-trust-features__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.ca-trust-card {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding: 32px;
  background: #fff;
  border: 1px solid #dbd9e1;
  border-radius: 8px;
}

.ca-trust-card__icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #12003a;
}

.ca-trust-card__icon :deep(svg) {
  display: block;
}

.ca-trust-card__title {
  margin: 0 0 8px;
  font-family: 'Nunito Sans', 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  color: #12003a;
}

.ca-trust-card__desc {
  margin: 0;
  font-family: 'Nunito Sans', 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: #4c4264;
}

@media (max-width: 700px) {
  .ca-trust-features__grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .ca-trust-features__title {
    line-height: 1.25;
  }
}

@media (max-width: 640px) {
  .ca-trust-features {
    padding: 52px var(--ca-hub-content-padding-x-mobile);
  }

  .ca-trust-card {
    padding: 24px;
  }

  .ca-trust-card__title {
    font-size: 18px;
    line-height: 26px;
  }

  .ca-trust-card__desc {
    font-size: 15px;
    line-height: 22px;
  }
}
</style>
