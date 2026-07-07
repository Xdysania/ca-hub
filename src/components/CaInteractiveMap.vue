<template>
  <section class="ca-map" id="ca-map">
    <div class="ca-map__container">
      <header class="ca-map__header">
        <h2 class="ca-map__title">{{ ct('title') }}</h2>
      </header>

      <div class="ca-map__card" :class="{ 'ca-map__card--fullscreen': isFullscreen }">
        <div class="ca-map__canvas">
        <!-- 地图（铺满画布，不被顶栏挤压） -->
        <div
          ref="mapWrapRef"
          class="ca-map__svg-wrap"
          :class="{ 'ca-map__svg-wrap--animating': isMapAnimating }"
          @mouseleave="onMapLeave"
        >
          <svg
            :viewBox="viewBoxString"
            class="ca-map__svg"
            role="img"
            :aria-label="ct('title')"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <clipPath id="ca-map-clip">
                <rect
                  :x="mapClipRect.x"
                  :y="mapClipRect.y"
                  :width="mapClipRect.width"
                  :height="mapClipRect.height"
                />
              </clipPath>
            </defs>
            <g clip-path="url(#ca-map-clip)">
            <g class="ca-map__countries">
              <path
                v-for="feature in renderedFeatures"
                :key="feature.numericId || feature.iso || feature.name"
                :d="feature.path"
                :style="{
                  fill: getCountryFill(feature),
                  stroke: getCountryStroke(feature)
                }"
                :stroke-width="COUNTRY_STROKE_WIDTH"
                stroke-linejoin="round"
                stroke-linecap="butt"
                :class="[
                  'ca-map__country',
                  {
                    'ca-map__country--clickable': isCountryClickable(feature),
                    'ca-map__country--supported': isCountrySupportedVisual(feature),
                    'ca-map__country--selected': feature.iso === selectedCountryIso,
                    'ca-map__country--hover': feature.iso === hoveredIso,
                    'ca-map__country--region-hover': isRegionHovered(feature),
                    'ca-map__country--world-dimmed': isWorldDimmed(feature),
                    'ca-map__country--region-dimmed': isRegionDimmed(feature)
                  }
                ]"
                @mouseenter="onCountryHover(feature, $event)"
                @mousemove="onCountryMove(feature, $event)"
                @click.stop="onCountryClick(feature)"
              />
            </g>
            <!-- 国界 mesh：仅绘国家间共享边，保证跨日期线区域也有细分隔线 -->
            <path
              v-if="borderMeshPath"
              :d="borderMeshPath"
              class="ca-map__borders"
              fill="none"
              :stroke="MAP_COLORS.stroke"
              :stroke-width="BORDER_MESH_WIDTH"
              stroke-linejoin="round"
              pointer-events="none"
              aria-hidden="true"
            />
            </g>
          </svg>

          <!-- Hover tooltip（fixed 跟随鼠标，与 Ramp 一致） -->
          <Teleport to="body">
            <transition name="fade">
              <div
                v-if="hoveredFeature"
                class="ca-map__tooltip ca-map__tooltip--fixed"
                :style="{ left: tooltipPos.x + 'px', top: tooltipPos.y + 'px' }"
              >
                <span class="ca-map__tooltip-name">
                  {{ viewLevel === 'world' && hoveredRegionId ? regionLabel(hoveredRegionId) : hoveredFeature.displayName }}
                </span>
                <span
                  v-if="viewLevel === 'world' && hoveredRegionId && hoveredFeature.displayName"
                  class="ca-map__tooltip-meta"
                >
                  {{ hoveredFeature.displayName }}
                </span>
                <span
                  v-if="viewLevel === 'region' && hoveredFeature.iso && isCountrySupported(hoveredFeature.iso)"
                  class="ca-map__tooltip-meta"
                >
                  {{ getProviderCount(hoveredFeature.iso) }} {{ ct('providersLabel') }}
                </span>
                <template v-if="viewLevel === 'world' && hoveredRegionId">
                  <span
                    v-if="hoveredFeature.iso && isCountrySupported(hoveredFeature.iso)"
                    class="ca-map__tooltip-meta"
                  >
                    {{ getProviderCount(hoveredFeature.iso) }} {{ ct('providersLabel') }}
                  </span>
                  <span v-else class="ca-map__tooltip-meta">{{ ct('clickToExplore') }}</span>
                </template>
                <span class="ca-map__tooltip-arrow" aria-hidden="true" />
              </div>
            </transition>
          </Teleport>
        </div>

        <!-- 浮层控件：不占布局空间 -->
        <div class="ca-map__controls">
          <div
            class="ca-map__region-dropdown"
            :class="{ 'ca-map__region-dropdown--open': panelMode === 'regions' }"
          >
            <button
              class="ca-map__region-btn"
              :aria-expanded="panelMode === 'regions'"
              @click.stop="toggleRegionPanel"
            >
              <span>{{ regionButtonLabel }}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            <div class="ca-map__region-menu-wrap" :aria-hidden="panelMode !== 'regions'">
              <div class="ca-map__region-menu">
                <ul class="ca-map__panel-list ca-map__panel-list--regions">
                  <li
                    v-for="(region, index) in availableRegions"
                    :key="region.id"
                    class="ca-map__panel-row ca-map__panel-row--region"
                    :class="{ 'ca-map__panel-row--region-active': hoveredRegionId === region.id }"
                    :style="{ '--item-index': index }"
                    @click.stop="selectRegion(region.id)"
                    @mouseenter="onPanelRegionHover(region.id)"
                    @mouseleave="onPanelRegionLeave"
                  >
                    <span class="ca-map__panel-row-title">{{ regionLabel(region.id) }}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" aria-hidden="true">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <button
            class="ca-map__expand-btn"
            :aria-label="isFullscreen ? ct('exitFullscreen') : ct('enterFullscreen')"
            @click="toggleFullscreen"
          >
            <svg v-if="!isFullscreen" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3"/>
            </svg>
          </button>
        </div>

        <!-- 左侧浮层：国家 / Provider 列表 -->
        <transition name="panel-slide">
          <div
            v-if="panelMode === 'countries' || panelMode === 'providers'"
            class="ca-map__panel"
            @click.stop
          >
            <!-- 第二层：国家列表 -->
            <template v-if="panelMode === 'countries'">
              <button class="ca-map__panel-back" @click="backToWorld">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                {{ ct('backToAll') }}
              </button>
              <div class="ca-map__panel-head">{{ regionLabel(selectedRegionId) }}</div>
              <ul class="ca-map__panel-list">
                <li
                  v-for="country in regionCountries"
                  :key="country.iso2"
                  class="ca-map__panel-row"
                  :class="{ 'ca-map__panel-row--active': country.iso2 === selectedCountryIso }"
                  @click.stop="selectCountry(country.iso2)"
                >
                  <img
                    :src="`https://flagcdn.com/w40/${country.iso2.toLowerCase()}.png`"
                    :alt="country.name"
                    class="ca-map__flag"
                  />
                  <div class="ca-map__panel-row-body">
                    <span class="ca-map__panel-row-title">{{ country.name }}</span>
                    <span class="ca-map__panel-row-meta">
                      {{ getProviderCount(country.iso2) }} {{ ct('providersLabel') }}
                    </span>
                  </div>
                  <div class="ca-map__badges">
                    <span
                      v-for="badge in getCountryBadges(country.iso2)"
                      :key="badge"
                      class="ca-map__badge"
                    >{{ badge }}</span>
                  </div>
                </li>
              </ul>
            </template>

            <!-- 第三层：Provider 列表 -->
            <template v-else-if="panelMode === 'providers'">
              <button class="ca-map__panel-back" @click="backToCountries">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                {{ ct('backToCountries') }}
              </button>
              <div class="ca-map__panel-head">{{ selectedCountryName }}</div>
              <p class="ca-map__panel-count">
                {{ countryProviders.length }} {{ ct('providersLabel') }}
              </p>

              <ul v-if="countryProviders.length" class="ca-map__panel-list">
                <li
                  v-for="provider in countryProviders"
                  :key="provider.slug"
                  class="ca-map__provider-row"
                >
                  <span class="ca-map__provider-name">{{ provider.name }}</span>
                  <span class="ca-map__provider-cat">{{ provider.category }}</span>
                </li>
              </ul>
              <div v-else class="ca-map__empty">
                <p>{{ ct('emptyTitle') }}</p>
                <a href="/contact" class="ca-map__empty-cta">{{ ct('emptyCta') }}</a>
              </div>
            </template>
          </div>
        </transition>

        <!-- 点击遮罩关闭面板 -->
        <transition name="backdrop-fade">
          <div
            v-if="panelMode === 'regions'"
            class="ca-map__backdrop"
            @click.stop="closeRegionPanel"
          />
        </transition>

        </div>
      </div>

      <p class="ca-map__footnote">{{ ct('disclaimer') }}</p>

      <!-- 移动端国家搜索 -->
      <div class="ca-map__mobile-search">
        <input
          v-model="mobileSearch"
          type="search"
          :placeholder="ct('searchPlaceholder')"
          class="ca-map__search-input"
          @keydown.enter="selectFromSearch"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import {
  mapNameToIso,
  isoToRegionId,
  isoToMapRegionId,
  isChinaUnifiedTerritory,
  shouldDrawBorderBetween,
  DIAOYU_ISLAND_COORDS,
  extractPolygonGeometries,
  resolvePolygonDisplayRegion,
  regionIdFromCoordinates,
  REGION_IDS
} from '@/utils/geoRegions'
import cnClaimedTerritoriesData from '/data/cn-claimed-territories.geojson?url'
import worldAtlasData from '/data/world-map-50m.json?url'

const props = defineProps({
  countries: { type: Array, default: () => [] },
  providers: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['country-select', 'country-clear'])

const { locale } = useI18n()

/** @typedef {'world'|'region'|'country'} ViewLevel */
/** @typedef {'regions'|'countries'|'providers'|null} PanelMode */

/**
 * 画布 1311×666，Mercator fitExtent 居中且不越界
 */
const MAP_WIDTH = 1311
const MAP_HEIGHT = 666
/** viewBox 外扩，避免描边被容器 overflow 裁切 */
const VIEW_BLEED = 8
/** 全球视图水平留白（日期线附近领土需更大边距） */
const MAP_PADDING_X = 88
/** 全球视图垂直留白（偏小以贴合模块高度） */
const MAP_PADDING_Y = 20
/** 按 path 边界二次贴合时的内边距 */
const FIT_PATH_MARGIN = 12
/**
 * 全球 Mercator 经度旋转（大西洋居中、避免日期线领土左右分裂）
 * @type {[number, number]}
 */
const WORLD_MAP_ROTATE = [-10, 0]
/**
 * 区域视图 Mercator 经度旋转（避免跨日期线领土左右分裂）
 * @type {Record<string, [number, number]>}
 */
const REGION_MAP_ROTATE = {
  africa: [10, 0],
  asia: [-95, 0],
  'caribbean-central-america': [82, 0],
  europe: [-10, 0],
  'middle-east': [45, 0],
  'north-america': [96, 0],
  'south-america': [58, 0],
  oceania: [-160, 0]
}
/** 区域/国家视图更紧凑留白 */
const REGION_MAP_PADDING = 20
/** 左侧面板占位：left 28 + width 300 + 间距 16 */
const PANEL_LEFT_INSET = 300
const MAP_ANIMATION_MS = 420
/** 国界 mesh 描边（viewBox 坐标，叠加在国家填充之上） */
const BORDER_MESH_WIDTH = 0.65

/** 国家间隙线宽（配合 paint-order: stroke fill，相邻国合计约 0.9px 缝隙） */
const COUNTRY_STROKE_WIDTH = 0.9

/**
 * SaaS 级单色高级紫（HSL 视觉平衡）
 */
const MAP_COLORS = {
  cardBg: '#f8f7fa',
  supported: '#a78bfa',
  unsupported: '#e8e4f0',
  supportedHover: '#8b5cf6',
  unsupportedHover: '#d9d2e6',
  /** 国界缝隙色，与画布底色一致 */
  stroke: '#f8f7fa',
  landSelected: '#8b5cf6',
  landDimmed: '#e8e4f0',
  landUnsupportedInRegion: '#e8e4f0'
}

/** 南极洲 ISO numeric 010 */
const ANTARCTICA_ID = '010'
/** 格陵兰：不计入全球 fit；全球视图不参与大洲批量高亮，仅直接悬浮时高亮 */
const GREENLAND_ID = '304'
const EXCLUDED_FROM_FIT = new Set([ANTARCTICA_ID, GREENLAND_ID])

const mapWrapRef = ref(null)
const mapTopology = ref(null)
const borderMeshGeo = ref(null)
const geoFeatures = ref([])
const renderedFeatures = ref([])
const borderMeshPath = ref('')
const isMapAnimating = ref(false)
const projection = ref(null)
const pathGen = ref(null)
let animationFrameId = 0
/** @type {number} */
let mapAnimationGeneration = 0

/**
 * 取消进行中的地图投影动画并恢复交互
 */
function cancelMapAnimation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = 0
  }
  isMapAnimating.value = false
}

const viewBoxString = computed(
  () => `${-VIEW_BLEED} ${-VIEW_BLEED} ${MAP_WIDTH + VIEW_BLEED * 2} ${MAP_HEIGHT + VIEW_BLEED * 2}`
)

/** 地图可视区裁剪（全球/区域/国家视图均启用，防止日期线回卷） */
const mapClipRect = computed(() => {
  const [[x0, y0], [x1, y1]] = getMapExtent()
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 }
})

/** @type {import('vue').Ref<ViewLevel>} */
const viewLevel = ref('world')
/** @type {import('vue').Ref<PanelMode>} */
const panelMode = ref(null)
const selectedRegionId = ref(null)
const selectedCountryIso = ref('')
const hoveredIso = ref(null)
const hoveredRegionId = ref(null)
const hoveredGreenland = ref(false)
const hoveredFeature = ref(null)
const tooltipPos = ref({ x: 0, y: 0 })
const isFullscreen = ref(false)
const mobileSearch = ref('')

const content = {
  en: {
    title: 'Explore NotaSign\'s international coverage',
    subtitle: 'Select a supported region, then choose a country to discover available certificate authorities and signing methods.',
    browseAllRegions: 'Browse supported regions',
    selectRegion: 'Select a region',
    backToAll: 'Back to all regions',
    backToCountries: 'Back to countries',
    countriesLabel: 'countries',
    providersLabel: 'providers',
    emptyTitle: 'No provider configured yet',
    emptyCta: 'Contact Sales',
    enterFullscreen: 'Expand map',
    exitFullscreen: 'Exit fullscreen',
    searchPlaceholder: 'Search country...',
    clickToExplore: 'Click to explore',
    disclaimer: 'Availability varies by country and provider. Contact Nota Sign to confirm coverage for your market.'
  },
  zh: {
    title: '探索 NotaSign 全球覆盖',
    subtitle: '先选择支持的地区，再选择国家，查看可用的 CA 与签署方式。',
    browseAllRegions: '浏览支持的地区',
    selectRegion: '选择地区',
    backToAll: '返回全部地区',
    backToCountries: '返回国家列表',
    countriesLabel: '个国家',
    providersLabel: '个 Provider',
    emptyTitle: '该国家暂无已配置 Provider',
    emptyCta: '联系销售',
    enterFullscreen: '展开地图',
    exitFullscreen: '退出全屏',
    searchPlaceholder: '搜索国家...',
    clickToExplore: '点击查看',
    disclaimer: '可用性因国家和 Provider 而异。请联系 Nota Sign 确认目标市场覆盖能力。'
  },
  'zh-HK': {
    title: '探索 NotaSign 全球覆蓋',
    subtitle: '先選擇支援的地區，再選擇國家，查看可用的 CA 與簽署方式。',
    browseAllRegions: '瀏覽支援的地區',
    selectRegion: '選擇地區',
    backToAll: '返回全部地區',
    backToCountries: '返回國家列表',
    countriesLabel: '個國家',
    providersLabel: '個 Provider',
    emptyTitle: '該國家暫無已設定 Provider',
    emptyCta: '聯繫銷售',
    enterFullscreen: '展開地圖',
    exitFullscreen: '退出全螢幕',
    searchPlaceholder: '搜尋國家...',
    clickToExplore: '點擊查看',
    disclaimer: '可用性因國家和 Provider 而異。請聯繫 Nota Sign 確認目標市場覆蓋能力。'
  }
}

const regionLabels = {
  en: {
    africa: 'Africa',
    asia: 'Asia',
    'caribbean-central-america': 'Caribbean and Central America',
    europe: 'Europe',
    'middle-east': 'Middle East',
    'north-america': 'North America',
    'south-america': 'South America',
    oceania: 'Oceania'
  },
  zh: {
    africa: '非洲',
    asia: '亚洲',
    'caribbean-central-america': '加勒比与中美洲',
    europe: '欧洲',
    'middle-east': '中东',
    'north-america': '北美洲',
    'south-america': '南美洲',
    oceania: '大洋洲'
  },
  'zh-HK': {
    africa: '非洲',
    asia: '亞洲',
    'caribbean-central-america': '加勒比與中美洲',
    europe: '歐洲',
    'middle-east': '中東',
    'north-america': '北美洲',
    'south-america': '南美洲',
    oceania: '大洋洲'
  }
}

/** @param {string} key */
function ct(key) {
  const lang = locale.value in content ? locale.value : 'en'
  return content[lang]?.[key] || key
}

/** @param {string} regionId */
function regionLabel(regionId) {
  const lang = locale.value in regionLabels ? locale.value : 'en'
  return regionLabels[lang][regionId] || regionId
}

/** @param {string} iso2 */
function getProviderCount(iso2) {
  const slugs = new Set()
  props.providers.forEach(p => {
    const codes = (p.countries || []).map(c => (typeof c === 'string' ? c : c.iso2 || c))
    if (codes.includes(iso2)) slugs.add(p.slug || p.id)
  })
  return slugs.size
}

/** @param {string} iso2 */
function hasProviders(iso2) {
  return getProviderCount(iso2) > 0
}

/** 地图高亮：仅已有 Provider 的国家参与底色与区域批量悬浮 */
const mapSupportedIsos = computed(() => {
  const set = new Set()
  props.countries
    .filter(c => c.enabled !== false && hasProviders(c.iso2))
    .forEach(c => set.add(c.iso2))
  return set
})

/** 侧边栏可选国家：仅有 Provider 明细 */
const providerCountryIsos = computed(() => {
  const set = new Set()
  props.countries.forEach(c => {
    if (hasProviders(c.iso2)) set.add(c.iso2)
  })
  return set
})

/** @param {{ region?: string, iso2: string }} country */
function resolveCountryRegionId(country) {
  return isoToMapRegionId(country.iso2) ||
    (country.region ? regionNameToId(country.region) : null)
}

/** 各洲下有数据的国家 */
const availableRegions = computed(() =>
  REGION_IDS.map(id => {
    const countryCount = props.countries.filter(c =>
      resolveCountryRegionId(c) === id && mapSupportedIsos.value.has(c.iso2)
    ).length
    return { id, countryCount }
  })
)

const regionCountries = computed(() => {
  if (!selectedRegionId.value) return []
  return props.countries
    .filter(c =>
      resolveCountryRegionId(c) === selectedRegionId.value &&
      providerCountryIsos.value.has(c.iso2)
    )
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || a.name.localeCompare(b.name))
})

const countryProviders = computed(() => {
  if (!selectedCountryIso.value) return []
  return props.providers.filter(p => {
    const codes = (p.countries || []).map(c => (typeof c === 'string' ? c : c.iso2 || c))
    return codes.includes(selectedCountryIso.value)
  })
})

const selectedCountryName = computed(() => {
  const c = props.countries.find(co => co.iso2 === selectedCountryIso.value)
  return c?.name || selectedCountryIso.value
})

const regionButtonLabel = computed(() => {
  if (viewLevel.value === 'region' && selectedRegionId.value) {
    return regionLabel(selectedRegionId.value)
  }
  if (viewLevel.value === 'country' && selectedRegionId.value) {
    return regionLabel(selectedRegionId.value)
  }
  return ct('browseAllRegions')
})

/** @param {string} regionName */
function regionNameToId(regionName) {
  const map = {
    Europe: 'europe',
    'North America': 'north-america',
    'Latin America': null,
    'South America': 'south-america',
    'Caribbean and Central America': 'caribbean-central-america',
    'Asia Pacific': null,
    Asia: 'asia',
    Oceania: 'oceania',
    'Middle East': 'middle-east',
    Africa: 'africa',
    'Middle East & Africa': null
  }
  return map[regionName] ?? null
}

/** @param {string} iso */
function isCountrySupported(iso) {
  return mapSupportedIsos.value.has(iso)
}

/** @param {object} feature */
function isGreenland(feature) {
  return feature?.numericId === GREENLAND_ID || feature?.name === 'Greenland'
}

/**
 * 全球视图初始态：已支持国家显示淡紫底色（格陵兰始终排除）
 * @param {object} feature
 */
function showsWorldStaticSupported(feature) {
  if (!feature.iso || !isCountrySupported(feature.iso)) return false
  if (isGreenland(feature)) return false
  return true
}

/** @param {object} feature */
function isCountrySupportedVisual(feature) {
  if (viewLevel.value === 'world') {
    return showsWorldStaticSupported(feature) ||
      (isGreenland(feature) && hoveredGreenland.value && feature.iso && isCountrySupported(feature.iso))
  }
  return feature.iso && isCountrySupported(feature.iso)
}

/** @param {string} regionId */
function isRegionOnMap(regionId) {
  return geoFeatures.value.some(f => f.regionId === regionId)
}

/** @param {string} regionId */
function isRegionAvailable(regionId) {
  return availableRegions.value.some(r => r.id === regionId)
}

/** @param {object} feature */
function isRegionHovered(feature) {
  if (isGreenland(feature)) return false
  if (!feature.iso || !isCountrySupported(feature.iso)) return false
  return viewLevel.value === 'world' &&
    feature.regionId &&
    feature.regionId === hoveredRegionId.value
}

/** @param {object} feature */
function isWorldDimmed(feature) {
  if (viewLevel.value !== 'world' || !hoveredRegionId.value) return false
  if (!feature.regionId) return true
  return feature.regionId !== hoveredRegionId.value
}

/** @param {object} feature */
function isRegionDimmed(feature) {
  if (viewLevel.value === 'world') return false
  return feature.regionId !== selectedRegionId.value
}

/** @param {object} feature */
function isCountryClickable(feature) {
  if (!feature.regionId && !feature.iso) return false
  if (viewLevel.value === 'world') {
    return isRegionOnMap(feature.regionId)
  }
  if (viewLevel.value === 'region') {
    return (
      feature.regionId === selectedRegionId.value &&
      hasProviders(feature.iso)
    )
  }
  return false
}

/** @param {object} feature */
function isCountryHovered(feature) {
  const iso = feature.iso
  return iso === hoveredIso.value || isRegionHovered(feature)
}

/** @param {object} feature */
function getCountryFill(feature) {
  const iso = feature.iso
  const regionId = feature.regionId
  const supported = iso && isCountrySupported(iso)
  const hovered = isCountryHovered(feature) && supported

  if (viewLevel.value === 'world') {
    const directHover = iso === hoveredIso.value || (isGreenland(feature) && hoveredGreenland.value)
    const regionBatchHover = isRegionHovered(feature)

    if (isGreenland(feature)) {
      if (!hoveredGreenland.value) return MAP_COLORS.unsupported
      return supported ? MAP_COLORS.supportedHover : MAP_COLORS.unsupported
    }

    if (!supported) {
      return MAP_COLORS.unsupported
    }

    return (regionBatchHover || directHover) ? MAP_COLORS.supportedHover : MAP_COLORS.supported
  }

  if (viewLevel.value === 'region' || viewLevel.value === 'country') {
    if (regionId !== selectedRegionId.value) {
      return MAP_COLORS.landDimmed
    }
    if (iso === selectedCountryIso.value) {
      return MAP_COLORS.landSelected
    }
    if (supported) {
      return hovered ? MAP_COLORS.supportedHover : MAP_COLORS.supported
    }
    return MAP_COLORS.landUnsupportedInRegion
  }

  return MAP_COLORS.unsupported
}

/**
 * 国家间隙描边：与画布底色一致
 * 仅台港澳及藏南等叠加层使用填充同色描边，避免内部接缝；大陆保持标准描边以保留对外国界（如中俄）
 * @param {object} feature
 * @returns {string}
 */
function getCountryStroke(feature) {
  if (feature.isChinaOverlay) {
    return getCountryFill(feature)
  }
  const id = feature.numericId ? String(feature.numericId) : ''
  if (isChinaUnifiedTerritory(id, feature.name)) {
    return getCountryFill(feature)
  }
  return MAP_COLORS.stroke
}

/** @param {object} feature @param {MouseEvent} e */
function onCountryHover(feature, e) {
  if (viewLevel.value === 'world') {
    if (isGreenland(feature)) {
      hoveredGreenland.value = true
      hoveredRegionId.value = null
      hoveredIso.value = null
      hoveredFeature.value = {
        displayName: feature.displayName || feature.name,
        iso: feature.iso
      }
      updateTooltipPos(e)
      return
    }

    hoveredGreenland.value = false
    if (!feature.regionId || !isRegionOnMap(feature.regionId)) {
      hoveredRegionId.value = null
      hoveredIso.value = null
      hoveredFeature.value = null
      return
    }
    hoveredRegionId.value = feature.regionId
    hoveredIso.value = feature.iso
    hoveredFeature.value = {
      displayName: feature.displayName || feature.name,
      iso: feature.iso
    }
    updateTooltipPos(e)
    return
  }

  hoveredGreenland.value = false

  if (!isCountryClickable(feature)) {
    hoveredIso.value = null
    hoveredFeature.value = null
    return
  }
  hoveredRegionId.value = null
  hoveredIso.value = feature.iso
  hoveredFeature.value = feature
  updateTooltipPos(e)
}

/** @param {MouseEvent} e */
function updateTooltipPos(e) {
  tooltipPos.value = { x: e.clientX, y: e.clientY }
}

/** @param {MouseEvent} e */
function onCountryMove(_feature, e) {
  if (!hoveredFeature.value) return
  updateTooltipPos(e)
}

function onMapLeave() {
  hoveredIso.value = null
  hoveredRegionId.value = null
  hoveredGreenland.value = false
  hoveredFeature.value = null
}

/** @param {string} regionId */
function onPanelRegionHover(regionId) {
  if (viewLevel.value !== 'world') return
  hoveredGreenland.value = false
  hoveredRegionId.value = regionId
  hoveredIso.value = null
  hoveredFeature.value = null
}

function onPanelRegionLeave() {
  if (viewLevel.value !== 'world') return
  hoveredRegionId.value = null
  hoveredFeature.value = null
}

/** @param {object} feature */
function onCountryClick(feature) {
  if (viewLevel.value === 'world') {
    if (isGreenland(feature) && feature.regionId && isRegionOnMap(feature.regionId)) {
      selectRegion(feature.regionId)
      return
    }
    if (!feature.regionId || !isRegionOnMap(feature.regionId)) return
    selectRegion(feature.regionId)
    return
  }
  if (!isCountryClickable(feature)) return
  selectCountry(feature.iso)
}

function toggleRegionPanel() {
  if (viewLevel.value === 'world') {
    const opening = panelMode.value !== 'regions'
    panelMode.value = opening ? 'regions' : null
    if (!opening) {
      hoveredRegionId.value = null
      hoveredFeature.value = null
    }
    return
  }
  panelMode.value = panelMode.value === 'countries' ? null : 'countries'
  refitCurrentView(true)
}

/** 关闭区域下拉并清除地图悬浮态 */
function closeRegionPanel() {
  panelMode.value = null
  hoveredRegionId.value = null
  hoveredFeature.value = null
}

/** @param {string} regionId */
function selectRegion(regionId) {
  selectedRegionId.value = regionId
  selectedCountryIso.value = ''
  viewLevel.value = 'region'
  panelMode.value = 'countries'
  emit('country-clear')
  fitMapToRegion(regionId, true)
}

/** @param {string} iso2 */
function selectCountry(iso2) {
  if (!isCountrySupported(iso2)) return
  selectedCountryIso.value = iso2
  viewLevel.value = 'country'
  panelMode.value = 'providers'
  emit('country-select', iso2)
  fitMapToCountry(iso2, true)
}

function backToWorld() {
  cancelMapAnimation()
  selectedRegionId.value = null
  selectedCountryIso.value = ''
  viewLevel.value = 'world'
  panelMode.value = null
  hoveredIso.value = null
  hoveredRegionId.value = null
  hoveredGreenland.value = false
  hoveredFeature.value = null
  emit('country-clear')
  fitMapToWorld(false)
}

function backToCountries() {
  cancelMapAnimation()
  selectedCountryIso.value = ''
  viewLevel.value = 'region'
  panelMode.value = 'countries'
  hoveredIso.value = null
  hoveredFeature.value = null
  emit('country-clear')
  if (selectedRegionId.value) fitMapToRegion(selectedRegionId.value, false)
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  requestAnimationFrame(() => {
    if (geoFeatures.value.length) refitCurrentView(false)
  })
}

/** @param {string} iso2 */
function getCountryBadges(iso2) {
  const providers = props.providers.filter(p => {
    const codes = (p.countries || []).map(c => (typeof c === 'string' ? c : c.iso2 || c))
    return codes.includes(iso2)
  })
  const badges = new Set()
  providers.forEach(p => {
    ;(p.signatureLevels || []).forEach(l => badges.add(l))
    if (!p.signatureLevels?.length) {
      if (p.category === 'EID AUTHENTICATION') badges.add('eID')
      else badges.add('QES')
    }
  })
  return [...badges].slice(0, 3)
}

function selectFromSearch() {
  const q = mobileSearch.value.toLowerCase().trim()
  if (!q) return
  const match = props.countries.find(
    c => c.name.toLowerCase().includes(q) && providerCountryIsos.value.has(c.iso2)
  )
  if (!match) return
  const regionId = resolveCountryRegionId(match)
  if (regionId) selectRegion(regionId)
  selectCountry(match.iso2)
  mobileSearch.value = ''
}

function renderPaths() {
  if (!pathGen.value) return
  const gen = pathGen.value
  const paths = geoFeatures.value.map(f => ({
    ...f,
    path: gen(f.geo) || '',
    area: f.geo ? d3.geoArea(f.geo) : 0
  }))
  paths.sort((a, b) => b.area - a.area)
  renderedFeatures.value = paths
  renderBorderMesh()
}

/** 初始化国界 mesh（仅一次，投影变化时重算 path） */
function initBorderMeshGeo() {
  if (!mapTopology.value) return
  borderMeshGeo.value = topojson.mesh(
    mapTopology.value,
    mapTopology.value.objects.countries,
    (a, b) =>
      a !== b &&
      a !== ANTARCTICA_ID &&
      b !== ANTARCTICA_ID &&
      shouldDrawBorderBetween(a, b)
  )
}

/** @param {import('d3').GeoProjection} [proj] */
function renderBorderMesh(proj = pathGen.value) {
  if (!borderMeshGeo.value || !proj) {
    borderMeshPath.value = ''
    return
  }
  borderMeshPath.value = d3.geoPath().projection(proj)(borderMeshGeo.value) || ''
}

/**
 * @param {import('d3').GeoPath} gen
 */
function updateBorderMeshInPlace(gen) {
  if (!borderMeshGeo.value) return
  const d = gen(borderMeshGeo.value) || ''
  mapWrapRef.value?.querySelector('.ca-map__borders')?.setAttribute('d', d)
}

/**
 * 动画帧内原地更新 path，避免触发 Vue 全量重绘
 * @param {import('d3').GeoPath} gen
 */
function updatePathsInPlace(gen) {
  if (!renderedFeatures.value.length) {
    renderPaths()
    return
  }
  const nodes = mapWrapRef.value?.querySelectorAll('.ca-map__country')
  renderedFeatures.value.forEach((feature, index) => {
    const d = gen(feature.geo) || ''
    feature.path = d
    nodes?.[index]?.setAttribute('d', d)
  })
}

/**
 * 根据面板状态计算投影可用区域（保持与 viewBox 同坐标系）
 * @returns {number[][]}
 */
function getMapExtent() {
  const padX = viewLevel.value === 'world' ? MAP_PADDING_X : REGION_MAP_PADDING
  const padY = viewLevel.value === 'world' ? MAP_PADDING_Y : REGION_MAP_PADDING
  if (viewLevel.value === 'world') {
    return [[padX, padY], [MAP_WIDTH - padX, MAP_HEIGHT - padY]]
  }
  const left = panelMode.value ? PANEL_LEFT_INSET : padX
  return [[left, padY], [MAP_WIDTH - padX, MAP_HEIGHT - padY]]
}

/**
 * @param {object[]|object} items GeoJSON Feature 或 Geometry
 * @returns {object}
 */
function toFeatureCollection(items) {
  const list = Array.isArray(items) ? items : [items]
  return {
    type: 'FeatureCollection',
    features: list.map(item =>
      item?.type === 'Feature' ? item : { type: 'Feature', geometry: item }
    )
  }
}

/**
 * @param {[number, number]} [rotate] 全球视图经度旋转，区域/国家视图不传
 * @returns {import('d3').GeoProjection}
 */
function createMercatorProjection(rotate) {
  const proj = d3.geoMercator()
  if (rotate) proj.rotate(rotate)
  return proj
}

/**
 * 按实际渲染 path 边界缩放/居中，使地图贴合模块且保留安全边距（避免日期线领土贴边被裁）
 * @param {import('d3').GeoProjection} projection
 * @param {object[]|object} items
 * @param {number[][]} extent
 * @param {number} [margin]
 */
function fitProjectionToPathBounds(projection, items, extent, margin = FIT_PATH_MARGIN) {
  const fc = toFeatureCollection(items)
  const path = d3.geoPath().projection(projection)
  const [[x0, y0], [x1, y1]] = path.bounds(fc)
  const dw = x1 - x0
  const dh = y1 - y0
  if (dw <= 0 || dh <= 0) return projection

  const scale = Math.min(
    (extent[1][0] - extent[0][0] - margin * 2) / dw,
    (extent[1][1] - extent[0][1] - margin * 2) / dh
  )
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  const targetX = (extent[0][0] + extent[1][0]) / 2
  const targetY = (extent[0][1] + extent[1][1]) / 2
  const t = projection.translate()
  const s = projection.scale()

  projection
    .scale(s * scale)
    .translate([
      targetX - scale * (cx - t[0]),
      targetY - scale * (cy - t[1])
    ])

  return projection
}

/**
 * 区域 fit 时是否纳入该地块（欧洲视图排除俄罗斯远东，避免跨日期线分裂）
 * @param {object} feature
 * @param {string} regionId
 * @returns {boolean}
 */
function shouldIncludeInRegionFit(feature, regionId) {
  return feature.regionId === regionId
}

/**
 * 区域 fit：仅用该洲有 Provider 的国家，避免斐济/新西兰等拉满全球视野
 * @param {string} regionId
 * @returns {object[]}
 */
function getRegionFitFeatures(regionId) {
  const supportedIsosInRegion = props.countries
    .filter(c => {
      const r = resolveCountryRegionId(c)
      return r === regionId && mapSupportedIsos.value.has(c.iso2)
    })
    .map(c => c.iso2)

  let candidates = []
  if (supportedIsosInRegion.length) {
    const isoSet = new Set(supportedIsosInRegion)
    candidates = geoFeatures.value.filter(f => f.iso && isoSet.has(f.iso))
  } else {
    candidates = geoFeatures.value.filter(f => f.regionId === regionId && f.iso)
  }

  const fitFeatures = candidates
    .filter(f => shouldIncludeInRegionFit(f, regionId))
    .map(f => f.geo)

  return fitFeatures.length ? fitFeatures : candidates.map(f => f.geo)
}

/**
 * 国家 fit：含统一属地块与主张领土叠加层
 * @param {string} iso2
 * @returns {object[]}
 */
function getCountryFitFeatures(iso2) {
  return geoFeatures.value
    .filter(f => f.iso === iso2)
    .map(f => f.geo)
}

/**
 * 全球 fit 用特征（排除南极洲、格陵兰，避免北极区域撑大画布）
 * @returns {object[]}
 */
function getWorldFitFeatures() {
  return geoFeatures.value
    .filter(f => !EXCLUDED_FROM_FIT.has(f.numericId))
    .map(f => f.geo)
}

/**
 * 全球视图：Mercator fitExtent，地图居中且不超出画布
 * @returns {import('d3').GeoProjection}
 */
function buildWorldProjection() {
  const features = getWorldFitFeatures()
  const extent = getMapExtent()
  const proj = createMercatorProjection(WORLD_MAP_ROTATE)
  if (features.length) {
    proj.fitExtent(extent, toFeatureCollection(features))
    fitProjectionToPathBounds(proj, features, extent)
    proj.clipExtent(extent)
  }
  return proj
}

/**
 * 区域缩放：Mercator + fitExtent + path 边界微调 + 裁剪
 * @param {object[]} features
 * @param {number[][]} extent
 * @param {string} [regionId]
 * @returns {import('d3').GeoProjection}
 */
function buildRegionProjection(features, extent, regionId) {
  const rotate = regionId ? REGION_MAP_ROTATE[regionId] : null
  const proj = createMercatorProjection(rotate)
  proj.fitExtent(extent, toFeatureCollection(features))
  fitProjectionToPathBounds(proj, features, extent)
  proj.clipExtent(extent)
  return proj
}

function fitMapToWorld(animate = false) {
  applyProjection(buildWorldProjection(), animate)
}

/**
 * @param {import('d3').GeoProjection} targetProj
 * @param {boolean} [animate]
 */
function applyProjection(targetProj, animate = true) {
  const current = projection.value

  if (!animate || !current) {
    cancelMapAnimation()
    projection.value = targetProj
    pathGen.value = d3.geoPath().projection(targetProj)
    renderPaths()
    return
  }

  const fromRotate = current.rotate()
  const toRotate = targetProj.rotate()
  const rotateChanged =
    Math.abs(fromRotate[0] - toRotate[0]) > 0.5 ||
    Math.abs(fromRotate[1] - toRotate[1]) > 0.5 ||
    Math.abs((fromRotate[2] || 0) - (toRotate[2] || 0)) > 0.5

  if (rotateChanged) {
    cancelMapAnimation()
    projection.value = targetProj
    pathGen.value = d3.geoPath().projection(targetProj)
    renderPaths()
    return
  }

  cancelMapAnimation()
  const generation = ++mapAnimationGeneration

  const from = { scale: current.scale(), translate: current.translate() }
  const to = { scale: targetProj.scale(), translate: targetProj.translate() }
  const start = performance.now()
  const ease = d3.easeCubicInOut
  isMapAnimating.value = true

  function frame(now) {
    if (generation !== mapAnimationGeneration) return

    const t = ease(Math.min(1, (now - start) / MAP_ANIMATION_MS))
    current.scale(from.scale + (to.scale - from.scale) * t)
    current.translate([
      from.translate[0] + (to.translate[0] - from.translate[0]) * t,
      from.translate[1] + (to.translate[1] - from.translate[1]) * t
    ])
    const gen = d3.geoPath().projection(current)
    updatePathsInPlace(gen)
    updateBorderMeshInPlace(gen)

    if (t < 1) {
      animationFrameId = requestAnimationFrame(frame)
      return
    }

    cancelMapAnimation()
    projection.value = targetProj
    pathGen.value = d3.geoPath().projection(targetProj)
    renderPaths()
  }

  animationFrameId = requestAnimationFrame(frame)
}

/** @param {string} regionId */
function fitMapToRegion(regionId, animate = true) {
  const features = getRegionFitFeatures(regionId)

  if (!features.length) {
    fitMapToWorld(animate)
    return
  }

  const proj = buildRegionProjection(features, getMapExtent(), regionId)
  applyProjection(proj, animate)
}

/** @param {string} iso2 */
function fitMapToCountry(iso2, animate = true) {
  const features = getCountryFitFeatures(iso2)

  if (!features.length) {
    if (selectedRegionId.value) fitMapToRegion(selectedRegionId.value, animate)
    return
  }

  const regionId = selectedRegionId.value || isoToRegionId(iso2) || undefined
  const proj = buildRegionProjection(features, getMapExtent(), regionId)
  applyProjection(proj, animate)
}

/** 按当前视图层级重新 fit */
function refitCurrentView(animate = true) {
  if (!geoFeatures.value.length) return
  if (viewLevel.value === 'country' && selectedCountryIso.value) {
    fitMapToCountry(selectedCountryIso.value, animate)
  } else if (viewLevel.value === 'region' && selectedRegionId.value) {
    fitMapToRegion(selectedRegionId.value, animate)
  } else {
    fitMapToWorld(animate)
  }
}

/**
 * 钓鱼岛诸岛叠加层（数据源划入日本，按中国属地块着色）
 * @param {string} chinaDisplayName
 * @returns {object[]}
 */
function buildDiaoyuOverlayFeatures(chinaDisplayName) {
  return DIAOYU_ISLAND_COORDS.map((coord, i) => ({
    iso: 'CN',
    numericId: `cn-overlay-diaoyu-${i}`,
    name: 'Diaoyu Islands',
    displayName: chinaDisplayName,
    regionId: 'asia',
    isChinaOverlay: true,
    geo: d3.geoCircle().center(coord).radius(0.065)()
  }))
}

/**
 * 加载中国主张领土叠加层（藏南等 Natural Earth 争议区 + 钓鱼岛）
 * @param {string} chinaDisplayName
 * @returns {Promise<object[]>}
 */
async function loadChinaTerritoryOverlays(chinaDisplayName) {
  const overlays = []

  try {
    const res = await fetch(cnClaimedTerritoriesData)
    const collection = await res.json()
    collection.features.forEach(feature => {
      const id = feature.properties?.id || 'claimed'
      overlays.push({
        iso: 'CN',
        numericId: `cn-overlay-${id}`,
        name: feature.properties?.brkName || feature.properties?.name || 'China',
        displayName: chinaDisplayName,
        regionId: 'asia',
        isChinaOverlay: true,
        geo: feature
      })
    })
  } catch (err) {
    console.warn('[CA Map] cn-claimed-territories load failed:', err)
  }

  overlays.push(...buildDiaoyuOverlayFeatures(chinaDisplayName))
  return overlays
}

/**
 * 将国家几何拆分为独立地块，海外属地按地理坐标修正展示区域
 * @param {object} feature
 * @returns {object[]}
 */
function expandCountryGeoFeatures(feature) {
  const polygons = extractPolygonGeometries(feature.geo)
  if (!polygons.length) return [feature]
  if (polygons.length === 1) return [feature]

  const parts = polygons.map(geo => ({
    geo,
    area: d3.geoArea(geo),
    centroid: d3.geoCentroid(geo)
  }))
  const maxArea = Math.max(...parts.map(part => part.area))

  return parts.map((part, index) => {
    const isPrimaryPart = part.area >= maxArea
    const [lng, lat] = part.centroid
    const regionId = feature.regionId
      ? resolvePolygonDisplayRegion(feature.regionId, lng, lat, isPrimaryPart)
      : regionIdFromCoordinates(lng, lat)

    return {
      ...feature,
      geo: part.geo,
      regionId,
      numericId: `${feature.numericId}-${index}`
    }
  })
}

async function loadWorldMap() {
  try {
    const res = await fetch(worldAtlasData)
    const topology = await res.json()
    mapTopology.value = topology
    const collection = topojson.feature(topology, topology.objects.countries)
    const chinaCms = props.countries.find(c => c.iso2 === 'CN')
    const chinaDisplayName = chinaCms?.name || 'China'

    geoFeatures.value = collection.features
      .filter(geo => geo.id !== ANTARCTICA_ID)
      .flatMap(geo => {
        const mapName = geo.properties?.name || ''
        const unified = isChinaUnifiedTerritory(geo.id, mapName)
        const rawIso = mapNameToIso(mapName)
        const iso = unified ? 'CN' : rawIso
        const cmsCountry = iso ? props.countries.find(c => c.iso2 === iso) : null
        const baseFeature = {
          iso,
          numericId: geo.id,
          name: mapName,
          displayName: unified ? chinaDisplayName : (cmsCountry?.name || mapName),
          regionId: mapName === 'Greenland'
            ? 'north-america'
            : (iso ? isoToMapRegionId(iso) : null),
          geo
        }
        return expandCountryGeoFeatures(baseFeature)
      })

    const territoryOverlays = await loadChinaTerritoryOverlays(chinaDisplayName)
    geoFeatures.value.push(...territoryOverlays)

    initBorderMeshGeo()
    fitMapToWorld()
  } catch (err) {
    console.error('[CA Map] load failed:', err)
  }
}

watch(
  () => props.countries,
  () => {
    if (geoFeatures.value.length) refitCurrentView(false)
  },
  { deep: true }
)

function onDocClick(e) {
  const card = mapWrapRef.value?.closest('.ca-map__card')
  if (card?.contains(e.target)) return
  if (panelMode.value === 'regions') panelMode.value = null
}

onMounted(() => {
  loadWorldMap()
  document.addEventListener('click', onDocClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  cancelMapAnimation()
})
</script>

<style scoped>
.ca-map {
  padding: 96px var(--ca-hub-content-padding-x) 80px;
  background: #fff;
  --ca-map-hover-ms: 320ms;
  --ca-map-hover-ease: cubic-bezier(0.4, 0, 0.2, 1);
}

.ca-map__container {
  max-width: var(--ca-hub-content-max);
  margin: 0 auto;
}

.ca-map__header {
  text-align: center;
  margin-bottom: var(--ca-section-header-mb);
}

.ca-map__title {
  margin: 0;
  font-family: 'Nunito Sans', 'Inter', sans-serif;
  font-size: var(--ca-section-title-size);
  font-weight: 600;
  line-height: var(--ca-section-title-line);
  color: var(--ca-section-title-color);
  text-align: center;
  letter-spacing: 0;
}

/* 画布 1311×666 */
.ca-map__card {
  position: relative;
  width: 100%;
  max-width: var(--ca-hub-content-max);
  height: 666px;
  margin: 0 auto;
  background: #f8f7fa;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

@media (max-width: 768px) {
  .ca-map__card {
    height: auto;
    aspect-ratio: 1311 / 666;
  }
}

.ca-map__card--fullscreen {
  position: fixed;
  inset: 0;
  z-index: 300;
  border-radius: 0;
  width: 100vw;
  height: 100vh;
  aspect-ratio: auto;
  max-width: none;
}

.ca-map__canvas {
  position: absolute;
  inset: 0;
}

.ca-map__controls {
  position: absolute;
  inset: 0;
  z-index: 30;
  pointer-events: none;
}

.ca-map__region-dropdown {
  --ca-region-ease: cubic-bezier(0.4, 0, 0.2, 1);
  --ca-region-duration: 380ms;
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 31;
  width: 260px;
  pointer-events: auto;
}

.ca-map__region-btn {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #e8ecf2;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition:
    border-color var(--ca-region-duration) var(--ca-region-ease),
    box-shadow var(--ca-region-duration) var(--ca-region-ease),
    border-radius var(--ca-region-duration) var(--ca-region-ease),
    background 0.2s ease;
}

.ca-map__region-btn svg {
  flex-shrink: 0;
  transition: transform var(--ca-region-duration) var(--ca-region-ease);
}

.ca-map__region-dropdown--open .ca-map__region-btn {
  border-color: #3b82f6;
  box-shadow:
    inset 0 0 0 1px #3b82f6,
    0 2px 12px rgba(0, 0, 0, 0.04);
  border-bottom-color: #eef2f7;
  border-radius: 8px 8px 0 0;
}

.ca-map__region-dropdown--open .ca-map__region-btn svg {
  transform: rotate(90deg);
}

.ca-map__region-btn:hover {
  border-color: #cbd5e1;
}

.ca-map__region-dropdown--open .ca-map__region-btn:hover {
  border-color: #3b82f6;
}

.ca-map__region-menu-wrap {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  pointer-events: none;
  transition:
    grid-template-rows var(--ca-region-duration) var(--ca-region-ease),
    opacity calc(var(--ca-region-duration) * 0.85) var(--ca-region-ease);
}

.ca-map__region-dropdown--open .ca-map__region-menu-wrap {
  grid-template-rows: 1fr;
  opacity: 1;
  pointer-events: auto;
}

.ca-map__region-menu {
  overflow: hidden;
  background: #fff;
  border: 1px solid #3b82f6;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.1);
}

.ca-map__region-dropdown--open .ca-map__panel-list--regions {
  padding-top: 2px;
}

.ca-map__region-dropdown--open .ca-map__panel-row--region {
  animation: ca-region-item-in 0.42s var(--ca-region-ease) backwards;
  animation-delay: calc(70ms + var(--item-index, 0) * 32ms);
}

@keyframes ca-region-item-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ca-map__expand-btn {
  position: absolute;
  top: 24px;
  right: 24px;
  pointer-events: auto;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid #f9fafb;
  border-radius: 50%;
  color: #374151;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s;
}

.ca-map__expand-btn:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.ca-map__svg-wrap {
  position: absolute;
  inset: 0;
  box-sizing: border-box;
}

.ca-map__card--fullscreen .ca-map__svg-wrap {
  inset: 0;
}

.ca-map__svg {
  width: 100%;
  height: 100%;
  display: block;
  outline: none;
  overflow: visible;
}

.ca-map__country {
  paint-order: stroke fill;
  opacity: 1;
  shape-rendering: geometricPrecision;
  outline: none;
  transition:
    fill var(--ca-map-hover-ms) var(--ca-map-hover-ease),
    stroke var(--ca-map-hover-ms) var(--ca-map-hover-ease),
    opacity var(--ca-map-hover-ms) var(--ca-map-hover-ease);
}

.ca-map__svg-wrap--animating .ca-map__country {
  transition: none;
}

.ca-map__svg-wrap--animating .ca-map__borders {
  pointer-events: none;
}

.ca-map__borders {
  shape-rendering: geometricPrecision;
  pointer-events: none;
}

.ca-map__country--clickable {
  cursor: pointer;
}

.ca-map__country--world-dimmed {
  opacity: 0.32;
}

.ca-map__country--region-dimmed {
  opacity: 0.42;
  pointer-events: none;
}

.ca-map__country--selected {
  filter: none;
}

/* Tooltip */
.ca-map__tooltip {
  pointer-events: none;
  padding: 6px 10px;
  background: #111827;
  border-radius: 8px;
  color: #fff;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
}

.ca-map__tooltip--fixed {
  position: fixed;
  z-index: 400;
  transform: translate(-50%, -180%);
}

.ca-map__tooltip-arrow {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translate(-50%, 100%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid #111827;
}

.ca-map__tooltip-name {
  display: block;
  font-weight: 600;
}

.ca-map__tooltip-meta {
  display: block;
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 320ms cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Left overlay panel */
.ca-map__panel {
  position: absolute;
  top: 68px;
  left: 24px;
  z-index: 25;
  width: 260px;
  max-height: calc(100% - 92px);
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e8ecf2;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ca-map__backdrop {
  position: absolute;
  inset: 0;
  z-index: 18;
  background: rgba(248, 247, 250, 0.01);
}

.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 280ms cubic-bezier(0.4, 0, 0.2, 1);
}

.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}

.ca-map__footnote {
  margin: 24px auto 0;
  max-width: 800px;
  text-align: center;
  font-size: 10px;
  color: #9ca3af;
  line-height: 1.6;
}

.ca-map__panel-back {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #7038f3;
  background: #fafbfc;
  border: none;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.ca-map__panel-back:hover {
  background: #f3f4f6;
}

.ca-map__panel-head {
  padding: 12px 14px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid #f8fafc;
}

.ca-map__panel-count {
  padding: 0 14px 10px;
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #7038f3;
}

.ca-map__panel-list {
  list-style: none;
  margin: 0;
  padding: 4px 6px 8px;
  overflow-y: auto;
  flex: 1;
}

.ca-map__panel-list--regions {
  padding: 6px;
}

.ca-map__panel-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: box-shadow 0.15s ease, background 0.15s ease;
}

.ca-map__panel-row:hover {
  background: transparent;
}

.ca-map__panel-row--active {
  background: #eef2ff;
}

.ca-map__panel-row--region {
  justify-content: space-between;
  gap: 12px;
}

.ca-map__panel-row--region:hover,
.ca-map__panel-row--region-active {
  background: transparent;
  box-shadow: inset 0 0 0 1.5px #3b82f6;
}

.ca-map__panel-row--region .ca-map__panel-row-title {
  font-weight: 500;
  line-height: 1.35;
}

.ca-map__panel-row-body {
  flex: 1;
  min-width: 0;
}

.ca-map__panel-row-title {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #111827;
}

.ca-map__panel-row-meta {
  display: block;
  font-size: 11px;
  color: #9ca3af;
  margin-top: 1px;
}

.ca-map__flag {
  width: 28px;
  height: 20px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.ca-map__badges {
  display: flex;
  gap: 3px;
  flex-shrink: 0;
}

.ca-map__badge {
  font-size: 8px;
  font-weight: 700;
  padding: 3px 5px;
  background: #d1fae5;
  color: #059669;
  border-radius: 8px;
}

.ca-map__provider-row {
  padding: 10px;
  border-bottom: 1px solid #f8fafc;
}

.ca-map__provider-name {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.ca-map__provider-cat {
  font-size: 11px;
  color: #9ca3af;
}

.ca-map__empty {
  padding: 20px 14px;
  text-align: center;
}

.ca-map__empty p {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 12px;
}

.ca-map__empty-cta {
  display: inline-flex;
  padding: 8px 18px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: #7038f3;
  border-radius: 8px;
  text-decoration: none;
}

.ca-map__mobile-search {
  display: none;
  margin-top: 16px;
}

.ca-map__search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition:
    opacity 320ms cubic-bezier(0.4, 0, 0.2, 1),
    transform 320ms cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .ca-map {
    padding: 56px var(--ca-hub-content-padding-x-mobile) 48px;
  }

  .ca-map__header {
    margin-bottom: 32px;
  }

  .ca-map__title {
    font-size: clamp(28px, 6vw, 32px);
    line-height: 1.25;
  }

  .ca-map__panel {
    position: absolute;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    max-height: 42%;
    margin-top: 0;
    border-radius: 8px 8px 0 0;
    border-left: none;
    border-right: none;
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.12);
  }

  .ca-map__mobile-search {
    display: block;
  }

  .ca-map__tooltip {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ca-map__country,
  .ca-map__panel,
  .ca-map__region-dropdown,
  .ca-map__region-menu-wrap,
  .ca-map__region-btn,
  .ca-map__panel-row--region {
    transition: none;
    animation: none;
  }
}
</style>
