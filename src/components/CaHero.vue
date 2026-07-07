<template>
  <section class="ca-hero" id="ca-hero">
    <div class="ca-hero__container">
      <div class="ca-hero__left">
        <h1 class="ca-hero__title">{{ ct('title') }}</h1>
        <p class="ca-hero__description">{{ ct('description') }}</p>

        <div class="ca-hero__cta-row">
          <a href="#ca-map" class="ca-hero__btn-primary">{{ ct('primaryCta') }}</a>
          <a href="/contact" class="ca-hero__btn-secondary">{{ ct('secondaryCta') }}</a>
        </div>
      </div>

      <!-- Hero 轮播视频（Ramp 式右侧画幅） -->
      <div class="ca-hero__visual">
        <div class="ca-hero__visual-frame">
          <video
            ref="heroVideoRef"
            class="ca-hero__video"
            :src="heroVideoSrc"
            autoplay
            muted
            loop
            playsinline
            preload="auto"
            :aria-label="ct('videoLabel')"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { assetUrl } from '@/utils/assetUrl'

const heroVideoSrc = assetUrl('assets/hero/ca-hub-globe.mp4')

const { locale } = useI18n()
const heroVideoRef = ref(null)

const content = {
  en: {
    title: 'Find the right CA for every signing market',
    description: 'Explore CAs, QTSPs, and identity methods by country, assurance level, and signing workflow.',
    primaryCta: 'Explore coverage',
    secondaryCta: 'Contact Sales',
    videoLabel: 'Global CA coverage animation'
  },
  zh: {
    title: '为每个签署市场找到合适的 CA',
    description: '按国家、保证等级和签署场景，探索 CA、信任服务商与身份认证方式。',
    primaryCta: '查看覆盖能力',
    secondaryCta: '联系销售',
    videoLabel: '全球 CA 覆盖能力动画'
  },
  'zh-HK': {
    title: '為每個簽署市場找到合適的 CA',
    description: '按國家、保證等級和簽署場景，探索 CA、信任服務商與身分認證方式。',
    primaryCta: '查看覆蓋能力',
    secondaryCta: '聯繫銷售',
    videoLabel: '全球 CA 覆蓋能力動畫'
  }
}

/** @param {string} key */
function ct(key) {
  const lang = locale.value in content ? locale.value : 'en'
  return content[lang][key] || key
}

onMounted(() => {
  const video = heroVideoRef.value
  if (!video) return

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.pause()
    return
  }

  video.play().catch(() => {})
})
</script>

<style scoped>
.ca-hero {
  padding: 72px 48px 72px;
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

.ca-hero__title {
  margin-top: 0;
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
  border-radius: 4px;
  text-decoration: none;
  transition: background 0.2s ease, transform 0.2s ease;
}

.ca-hero__btn-primary:hover {
  background: #5b21b6;
  transform: translateY(-1px);
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
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.ca-hero__btn-secondary:hover {
  border-color: #CBD5E1;
  background: #F8FAFC;
}

/* Hero 视频画幅 — 等比缩至 80%，完整展示不裁剪 */
.ca-hero__visual {
  width: 100%;
  min-width: 0;
  display: flex;
  justify-content: center;
}

.ca-hero__visual-frame {
  width: 80%;
  padding: 0;
  background: #f4f6f9;
  border: 1px solid #e8ecf2;
  border-radius: 8px;
  box-sizing: border-box;
  overflow: hidden;
}

.ca-hero__video {
  display: block;
  width: 100%;
  height: auto;
  vertical-align: top;
  background: #f4f6f9;
}

@media (max-width: 1100px) {
  .ca-hero__container {
    grid-template-columns: 1fr;
    gap: 48px;
    max-width: 720px;
    align-items: stretch;
  }

  .ca-hero__visual-frame {
    width: 100%;
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

}

@media (max-width: 640px) {
  .ca-hero {
    padding: 48px 20px 40px;
  }

  .ca-hero__title {
    font-size: 32px;
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
