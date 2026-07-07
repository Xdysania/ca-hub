<template>
  <section class="ca-highlights" id="ca-highlights">
    <div class="ca-highlights__container">
      <article
        v-for="(item, index) in highlights"
        :key="index"
        class="ca-highlight-card"
      >
        <div class="ca-highlight-card__icon" aria-hidden="true">
          <img :src="item.icon" alt="" width="24" height="24" />
        </div>
        <h3 class="ca-highlight-card__title">
          {{ item.title[localeKey] || item.title.en }}
        </h3>
        <p class="ca-highlight-card__desc">
          {{ item.desc[localeKey] || item.desc.en }}
        </p>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { assetUrl } from '@/utils/assetUrl'

const { locale } = useI18n()
const localeKey = computed(() => locale.value)

/** @type {Array<{ icon: string, title: Record<string, string>, desc: Record<string, string> }>} */
const highlights = [
  {
    icon: assetUrl('assets/highlights/icon-market.svg'),
    title: {
      en: 'Route by market',
      zh: '按市场路由',
      'zh-HK': '按市場路由'
    },
    desc: {
      en: 'Find trusted CAs and identity methods available in specific countries.',
      zh: '在各国家找到可用的可信 CA 与身份认证方式。',
      'zh-HK': '在各國家找到可用的可信 CA 與身分認證方式。'
    }
  },
  {
    icon: assetUrl('assets/highlights/icon-shield.svg'),
    title: {
      en: 'Compare assurance',
      zh: '对比保证等级',
      'zh-HK': '對比保證等級'
    },
    desc: {
      en: 'Match assurance levels (AES to QES) to risk and compliance needs.',
      zh: '根据风险与合规需求，匹配 AES 至 QES 保证等级。',
      'zh-HK': '根據風險與合規需求，匹配 AES 至 QES 保證等級。'
    }
  },
  {
    icon: assetUrl('assets/highlights/icon-globe.svg'),
    title: {
      en: 'Connect providers',
      zh: '连接服务商',
      'zh-HK': '連接服務商'
    },
    desc: {
      en: 'Integrate with global trust providers to scale workflows.',
      zh: '集成全球信任服务商，扩展签署流程。',
      'zh-HK': '集成全球信任服務商，擴展簽署流程。'
    }
  }
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600&display=swap');

.ca-highlights {
  padding: 0 var(--ca-hub-content-padding-x) 48px;
  background: #fff;
}

.ca-highlights__container {
  max-width: var(--ca-hub-content-max);
  margin: 0 auto;
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.ca-highlight-card {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
}

.ca-highlight-card__icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #334155;
  opacity: 0.85;
}

.ca-highlight-card__icon img {
  display: block;
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.ca-highlight-card__title {
  margin: 0;
  font-family: 'Nunito Sans', 'Inter', sans-serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 24px;
  color: #1e293b;
  word-break: break-word;
}

.ca-highlight-card__desc {
  margin: 0;
  font-family: 'Nunito Sans', 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  color: #64748b;
  word-break: break-word;
}

@media (max-width: 1024px) {
  .ca-highlights {
    padding: 0 var(--ca-hub-content-padding-x) 40px;
  }

  .ca-highlights__container {
    flex-direction: column;
    gap: 20px;
  }
}

@media (max-width: 640px) {
  .ca-highlights {
    padding: 0 var(--ca-hub-content-padding-x-mobile) 36px;
  }

  .ca-highlight-card {
    gap: 8px;
  }

  .ca-highlight-card__title {
    font-size: 16px;
    line-height: 22px;
  }

  .ca-highlight-card__desc {
    font-size: 13px;
    line-height: 20px;
  }
}
</style>
