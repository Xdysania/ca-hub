<template>
  <section class="ca-cta" id="ca-cta">
    <div class="ca-cta__container">
      <div class="ca-cta__card">
        <div class="ca-cta__pattern" aria-hidden="true" />
        <div class="ca-cta__content">
          <h2 class="ca-cta__title">{{ ct('title') }}</h2>
          <div class="ca-cta__actions">
            <a :href="startFreeUrl" class="ca-cta__btn ca-cta__btn--primary">
              {{ ct('primaryLabel') }}
            </a>
            <a :href="contactUrl" class="ca-cta__btn ca-cta__btn--secondary">
              {{ ct('secondaryLabel') }}
            </a>
          </div>
        </div>

        <img
          class="ca-cta__image"
          src="/assets/cta/hero.jpg"
          alt=""
          width="509"
          height="503"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  selectedCountry: { type: Object, default: null }
})

const { locale } = useI18n()

const content = {
  en: {
    title: 'Discover a better way to e-sign your documents',
    primaryLabel: 'Start for Free',
    secondaryLabel: 'Contact Sales'
  },
  zh: {
    title: '探索更优质的电子签署体验',
    primaryLabel: '免费试用',
    secondaryLabel: '联系销售'
  },
  'zh-HK': {
    title: '探索更優質的電子簽署體驗',
    primaryLabel: '免費試用',
    secondaryLabel: '聯繫銷售'
  }
}

/** @param {string} key */
function ct(key) {
  const lang = locale.value in content ? locale.value : 'en'
  return content[lang]?.[key] || key
}

const startFreeUrl = '/trial'

const contactUrl = computed(() => {
  if (props.selectedCountry) {
    return `/contact?country=${props.selectedCountry.iso2}`
  }
  return '/contact'
})
</script>

<style scoped>
/**
 * Figma 2742:9984 — 1170×553
 * 文案区 420px @ left 120px；图片 509×503 @ right 50px；紫卡高 530px、上溢 23px
 */
.ca-cta {
  padding: 0 var(--ca-hub-content-padding-x) 80px;
  background: #fff;
}

.ca-cta__container {
  --ca-cta-img-gap: clamp(24px, 4.27%, 56px);
  --ca-cta-img-width: min(509px, 43.5%);
  --ca-cta-img-overlap: clamp(12px, 2%, 23px);
  --ca-cta-img-lift: 16px;
  --ca-cta-text-width: clamp(420px, 45%, 520px);
  --ca-cta-text-indent: clamp(48px, 10.26%, 120px);
  container-type: inline-size;
  position: relative;
  max-width: var(--ca-hub-content-max);
  margin: 0 auto;
  padding-top: calc(var(--ca-cta-img-overlap) + var(--ca-cta-img-lift));
  overflow: visible;
}

.ca-cta__card {
  position: relative;
  display: flex;
  align-items: center;
  min-height: max(
    420px,
    calc(
      min(509px, 43.5cqw) * 503 / 509
      + var(--ca-cta-img-gap)
      - var(--ca-cta-img-overlap)
      - var(--ca-cta-img-lift)
    )
  );
  border-radius: 8px;
  background: #7038f3;
  overflow: visible;
  padding-right: calc(var(--ca-cta-img-width) + var(--ca-cta-img-gap));
}

.ca-cta__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 40px;
  flex-shrink: 0;
  width: var(--ca-cta-text-width);
  min-width: var(--ca-cta-text-width);
  padding: 48px 0 48px var(--ca-cta-text-indent);
  box-sizing: content-box;
}

.ca-cta__title {
  margin: 0;
  width: 100%;
  font-size: clamp(28px, 3.42vw, 40px);
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  letter-spacing: -0.02em;
  word-break: normal;
}

.ca-cta__actions {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 24px;
}

.ca-cta__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  padding: 13px 24px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  white-space: nowrap;
  transition: opacity 0.2s ease, background 0.2s ease;
}

.ca-cta__btn--primary {
  color: #7038f3;
  background: #fff;
}

.ca-cta__btn--primary:hover {
  opacity: 0.92;
}

.ca-cta__btn--secondary {
  color: #fff;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.85);
}

.ca-cta__btn--secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}

.ca-cta__pattern {
  position: absolute;
  right: 0;
  bottom: 0;
  width: min(55%, 640px);
  height: 55%;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.18) 1.5px, transparent 1.5px);
  background-size: 18px 18px;
  pointer-events: none;
}

.ca-cta__image {
  position: absolute;
  right: var(--ca-cta-img-gap);
  bottom: var(--ca-cta-img-gap);
  z-index: 2;
  width: var(--ca-cta-img-width);
  height: auto;
  aspect-ratio: 509 / 503;
  object-fit: cover;
  border-radius: 8px;
  pointer-events: none;
}

@media (max-width: 900px) {
  .ca-cta__container {
    --ca-cta-img-gap: 24px;
    --ca-cta-img-overlap: 0px;
    --ca-cta-img-lift: 0px;
    --ca-cta-text-width: auto;
    padding-top: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .ca-cta__card {
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding-right: 0;
    order: 1;
  }

  .ca-cta__content {
    order: 1;
    width: auto;
    min-width: 0;
    max-width: none;
    padding: 40px 32px 32px;
    box-sizing: border-box;
  }

  .ca-cta__image {
    position: relative;
    right: auto;
    bottom: auto;
    order: 0;
    width: calc(100% - 48px);
    max-width: 420px;
    margin: 0 auto -24px;
    aspect-ratio: 4 / 3;
    pointer-events: auto;
  }
}

@media (max-width: 640px) {
  .ca-cta {
    padding: 0 var(--ca-hub-content-padding-x-mobile) 56px;
  }

  .ca-cta__content {
    padding: 32px 24px 28px;
    gap: 28px;
  }

  .ca-cta__actions {
    flex-direction: column;
    flex-wrap: wrap;
    width: 100%;
  }

  .ca-cta__btn {
    width: 100%;
  }
}
</style>
