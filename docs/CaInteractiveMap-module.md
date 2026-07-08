# CaInteractiveMap 交互地图模块代码导出

> 导出日期：2026-07-08
> 用途：供性能优化 Review / 其他 AI 检索分析

---

## 1. 模块概览

| 项目 | 说明 |
|------|------|
| 主组件 | `src/components/CaInteractiveMap.vue`（约 2247 行） |
| 地理工具 | `src/utils/geoRegions.js`（约 403 行） |
| 地图数据 | `public/data/world-map-50m.json`、`public/data/cn-claimed-territories.geojson` |
| 技术栈 | Vue 3 Composition API、D3.js、TopoJSON |

### 视图层级

```
world（全球）
  └─ region（洲，如 Asia）
       └─ country（国家，如 China）
            └─ providers（该国 CA 列表）
```

### UI 结构（统一下拉面板）

- 顶部 `ca-map__region-dropdown` 固定浮层，三层内容共用同一套下拉样式
- `panelMode`: `regions` → `countries` → `providers`
- 左侧不再使用独立大卡片面板（provider 层也已并入下拉）

---

## 2. 性能优化要点

1. **`shallowRef`**：`mapTopology`、`geoFeatures`、`renderedFeatures`、`projection` 等大地理数据不走深层响应式
2. **事件委托**：`mousemove` / `click` 挂在 `.ca-map__countries` 容器，约 600 个 path 无独立监听
3. **`providerMetaByCountry` 缓存**：避免重复扫描 providers
4. **`featurePathNodes` DOM 缓存**：动画帧内 `setAttribute('d')` 原地更新，避免 Vue 全量重绘
5. **Hover 节流**：同国家内移动只更新 tooltip；跨国家才 `syncMapVisuals()`
6. **动画期禁用 path CSS transition**：`ca-map__svg-wrap--animating .ca-map__country { transition: none }`

---

## 3. 地图过渡动画

### 投影插值

- `applyProjection(targetProj, animate)` 在当前投影与目标投影之间做 **单调线性** `scale` / `translate` 插值
- 缓动：`d3.easeCubicInOut`
- 时长：`480ms ~ 720ms`，按缩放与位移幅度自适应
- **不使用** `d3.interpolateZoom`（会在焦点偏移时先缩小再放大）
- **不使用** 外层 CSS `scale` 动画（会与投影动画叠加产生伪影）

### 层级切换继承当前视图

- `selectCountry()` 直接从当前洲视图推进到国家，不先 `selectRegion()` 再跳国家
- `selectFromSearch()` 同样只调用 `selectCountry()`，避免双重动画

### 动画 DOM 同步（2026-07-08 修复）

**问题**：切换层级时 Vue 重建 SVG path，但 `featurePathNodes` 仍指向旧节点，导致中国主张领土等小区域在动画中"卡住"重叠。

**修复**：
1. 动画开始前 `nextTick` → `cacheFeaturePathNodes()` 刷新 DOM 缓存
2. `updatePathsInPlace` 中若节点数与特征数不一致，自动重新缓存
3. 动画结束调用 `renderPaths()` 做最终同步

---

## 4. 中国领土处理

- `isChinaUnifiedTerritory`：台港澳等统一着色为 CN
- `loadChinaTerritoryOverlays`：藏南等主张领土 GeoJSON + 钓鱼岛圆点叠加
- `isChinaOverlay` 特征在描边上与填充同色，消除内部接缝

---

## 5. 关键函数索引

| 函数 | 职责 |
|------|------|
| `loadWorldMap` | 加载 TopoJSON，展开多块国土，注入中国叠加层 |
| `renderPaths` | 全量计算 path d、按面积排序、缓存 DOM |
| `updatePathsInPlace` | 动画帧原地更新 path d |
| `cacheFeaturePathNodes` | 同步 SVG path DOM 节点缓存 |
| `applyProjection` | 投影切换 + 动画插值 |
| `fitMapToWorld/Region/Country` | 各层级 fit 计算 |
| `syncMapVisuals` | 直接操作 DOM 更新 fill/stroke/class |
| `selectRegion/selectCountry` | 层级导航 + 触发地图 fit |
| `getCountryFill` | 按 viewLevel / hover / selected 决定着色 |

---

## 6. 待优化方向（供 Review）

1. 动画期间可考虑 `v-memo` 或去掉 `:d` 绑定，彻底避免 Vue patch 与 DOM 直写冲突
2. `renderPaths` 按面积排序在每次全量渲染时 O(n log n)，可考虑仅在初始加载排序
3. 国界 mesh 每帧 `updateBorderMeshInPlace`，可改为仅在关键帧更新
4. 移动端下拉 `max-height` 仍可进一步贴合设计稿

---

## 7. 主组件完整源码

```vue
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
            <g
              class="ca-map__countries"
              @mousemove="onCountriesMove"
              @click.stop="onCountriesClick"
            >
              <path
                v-for="(feature, index) in renderedFeatures"
                :key="feature.numericId || feature.iso || feature.name"
                :data-index="index"
                :d="feature.path"
                :stroke-width="COUNTRY_STROKE_WIDTH"
                stroke-linejoin="round"
                stroke-linecap="butt"
                class="ca-map__country"
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
            :class="{ 'ca-map__region-dropdown--open': panelMode === 'regions' || panelMode === 'countries' || panelMode === 'providers' }"
          >
            <button
              class="ca-map__region-btn"
              :aria-expanded="panelMode === 'regions' || panelMode === 'countries'"
              @click.stop="toggleRegionPanel"
            >
              <span class="ca-map__region-btn-label">
                <svg
                  v-if="viewLevel !== 'world'"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  aria-hidden="true"
                >
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                <span>{{ regionButtonLabel }}</span>
              </span>
              <svg v-if="viewLevel === 'world'" class="ca-map__region-btn-caret" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            <div class="ca-map__region-menu-wrap" :aria-hidden="panelMode !== 'regions' && panelMode !== 'countries' && panelMode !== 'providers'">
              <div class="ca-map__region-menu">
                <ul
                  v-if="panelMode === 'regions'"
                  class="ca-map__panel-list ca-map__panel-list--regions"
                >
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

                <ul
                  v-else-if="panelMode === 'countries'"
                  class="ca-map__panel-list ca-map__panel-list--regions ca-map__panel-list--dropdown-countries"
                >
                  <li
                    v-for="country in regionCountries"
                    :key="country.iso2"
                    class="ca-map__panel-row ca-map__panel-row--dropdown-country"
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

                <ul
                  v-else-if="panelMode === 'providers'"
                  class="ca-map__panel-list ca-map__panel-list--regions ca-map__panel-list--dropdown-providers"
                >
                  <li
                    v-for="provider in countryProviders"
                    :key="provider.slug"
                    class="ca-map__panel-row ca-map__panel-row--dropdown-provider"
                  >
                    <div class="ca-map__panel-row-body">
                      <span class="ca-map__panel-row-title">{{ provider.name }}</span>
                      <span class="ca-map__panel-row-meta">{{ provider.category }}</span>
                    </div>
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

        <!-- 点击遮罩关闭面板 -->
        <transition name="backdrop-fade">
          <div
            v-if="panelMode === 'regions' || panelMode === 'countries' || panelMode === 'providers'"
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
import { ref, shallowRef, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
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
const MAP_PADDING_X = 48
/** 全球视图垂直留白（偏小以贴合模块高度） */
const MAP_PADDING_Y = 12
/** 按 path 边界二次贴合时的内边距 */
const FIT_PATH_MARGIN = 6
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
const REGION_MAP_PADDING = 8
const MAP_ANIMATION_MS = 480
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
const mapTopology = shallowRef(null)
const borderMeshGeo = shallowRef(null)
const geoFeatures = shallowRef([])
const renderedFeatures = shallowRef([])
const borderMeshPath = ref('')
const isMapAnimating = ref(false)
const projection = shallowRef(null)
const pathGen = shallowRef(null)
const featurePathNodes = shallowRef([])
let animationFrameId = 0
/** @type {number} */
let mapAnimationGeneration = 0
/** @type {number} */
let mapVisualSyncFrame = 0
/** @type {number} */
let tooltipSyncFrame = 0
/** @type {{ x: number, y: number } | null} */
let pendingTooltipPos = null
/** @type {number} */
let lastHoveredFeatureIndex = -1

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

const providerMetaByCountry = computed(() => {
  /** @type {Map<string, { count: number, providers: any[], badges: string[] }>} */
  const map = new Map()

  props.providers.forEach((provider) => {
    const providerId = provider.slug || provider.id
    const counted = new Set()
    const codes = (provider.countries || []).map(c => (typeof c === 'string' ? c : c.iso2 || c))

    codes.forEach((iso2) => {
      if (!iso2) return
      if (!map.has(iso2)) {
        map.set(iso2, { count: 0, providers: [], badges: [] })
      }
      const entry = map.get(iso2)
      if (!entry) return

      if (!counted.has(iso2) && providerId) {
        entry.count += 1
        counted.add(iso2)
      }
      entry.providers.push(provider)
    })
  })

  map.forEach((entry) => {
    const badges = new Set()
    entry.providers.forEach((provider) => {
      ;(provider.signatureLevels || []).forEach(level => badges.add(level))
      if (!provider.signatureLevels?.length) {
        badges.add(provider.category === 'EID AUTHENTICATION' ? 'eID' : 'QES')
      }
    })
    entry.badges = [...badges].slice(0, 3)
  })

  return map
})

/** @param {string} iso2 */
function getProviderCount(iso2) {
  return providerMetaByCountry.value.get(iso2)?.count || 0
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
  return providerMetaByCountry.value.get(selectedCountryIso.value)?.providers || []
})

const selectedCountryName = computed(() => {
  const c = props.countries.find(co => co.iso2 === selectedCountryIso.value)
  return c?.name || selectedCountryIso.value
})

const regionButtonLabel = computed(() => {
  if (viewLevel.value === 'country') {
    return ct('backToCountries')
  }
  if (viewLevel.value === 'region') {
    return ct('backToAll')
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

/**
 * 直接更新 SVG path 样式，避免 hover/选中时触发 200+ 节点 Vue 重绘
 */
function syncMapVisuals() {
  const nodes = featurePathNodes.value
  if (!nodes?.length || !renderedFeatures.value.length) return

  renderedFeatures.value.forEach((feature, index) => {
    const el = nodes[index]
    if (!el) return

    el.style.fill = getCountryFill(feature)
    el.style.stroke = getCountryStroke(feature)
    el.classList.toggle('ca-map__country--clickable', isCountryClickable(feature))
    el.classList.toggle('ca-map__country--supported', isCountrySupportedVisual(feature))
    el.classList.toggle('ca-map__country--selected', feature.iso === selectedCountryIso.value)
    el.classList.toggle('ca-map__country--hover', feature.iso === hoveredIso.value)
    el.classList.toggle('ca-map__country--region-hover', isRegionHovered(feature))
    el.classList.toggle('ca-map__country--world-dimmed', isWorldDimmed(feature))
    el.classList.toggle('ca-map__country--region-dimmed', isRegionDimmed(feature))
  })
}

/** 合并同一帧内的多次视觉同步请求 */
function scheduleMapVisualSync() {
  if (mapVisualSyncFrame) return
  mapVisualSyncFrame = requestAnimationFrame(() => {
    mapVisualSyncFrame = 0
    syncMapVisuals()
  })
}

/** @param {MouseEvent} e */
function updateTooltipPos(e) {
  pendingTooltipPos = { x: e.clientX, y: e.clientY }
  if (tooltipSyncFrame) return
  tooltipSyncFrame = requestAnimationFrame(() => {
    tooltipSyncFrame = 0
    if (pendingTooltipPos) {
      tooltipPos.value = pendingTooltipPos
    }
  })
}

/** 交互态变更后同步地图着色 */
function refreshMapInteractionState() {
  scheduleMapVisualSync()
}

/** @param {MouseEvent} event */
function getFeatureFromEvent(event) {
  const target = event.target
  if (!(target instanceof SVGPathElement)) return null
  const rawIndex = target.dataset.index
  if (rawIndex === undefined) return null
  const index = Number(rawIndex)
  if (!Number.isInteger(index) || index < 0) return null
  return renderedFeatures.value[index] || null
}

/** @param {MouseEvent} event */
function onCountriesMove(event) {
  const feature = getFeatureFromEvent(event)

  if (!feature) {
    if (lastHoveredFeatureIndex !== -1) {
      onMapLeave()
    }
    return
  }

  const index = event.target instanceof SVGPathElement ? Number(event.target.dataset.index) : -1
  if (index !== lastHoveredFeatureIndex) {
    lastHoveredFeatureIndex = index
    onCountryHover(feature, event)
    return
  }

  if (!hoveredFeature.value) return
  updateTooltipPos(event)
}

/** @param {MouseEvent} event */
function onCountriesClick(event) {
  const feature = getFeatureFromEvent(event)
  if (!feature) return
  onCountryClick(feature)
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
      refreshMapInteractionState()
      return
    }

    hoveredGreenland.value = false
    if (!feature.regionId || !isRegionOnMap(feature.regionId)) {
      hoveredRegionId.value = null
      hoveredIso.value = null
      hoveredFeature.value = null
      refreshMapInteractionState()
      return
    }
    hoveredRegionId.value = feature.regionId
    hoveredIso.value = feature.iso
    hoveredFeature.value = {
      displayName: feature.displayName || feature.name,
      iso: feature.iso
    }
    updateTooltipPos(e)
    refreshMapInteractionState()
    return
  }

  hoveredGreenland.value = false

  if (!isCountryClickable(feature)) {
    hoveredIso.value = null
    hoveredFeature.value = null
    refreshMapInteractionState()
    return
  }
  hoveredRegionId.value = null
  hoveredIso.value = feature.iso
  hoveredFeature.value = feature
  updateTooltipPos(e)
  refreshMapInteractionState()
}

function onMapLeave() {
  lastHoveredFeatureIndex = -1
  hoveredIso.value = null
  hoveredRegionId.value = null
  hoveredGreenland.value = false
  hoveredFeature.value = null
  refreshMapInteractionState()
}

/** @param {string} regionId */
function onPanelRegionHover(regionId) {
  if (viewLevel.value !== 'world') return
  hoveredGreenland.value = false
  hoveredRegionId.value = regionId
  hoveredIso.value = null
  hoveredFeature.value = null
  refreshMapInteractionState()
}

function onPanelRegionLeave() {
  if (viewLevel.value !== 'world') return
  lastHoveredFeatureIndex = -1
  hoveredRegionId.value = null
  hoveredFeature.value = null
  refreshMapInteractionState()
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
  if (viewLevel.value === 'country') {
    backToCountries()
    return
  }
  if (viewLevel.value === 'region') {
    backToWorld()
    return
  }

  const opening = panelMode.value !== 'regions'
  panelMode.value = opening ? 'regions' : null
  if (!opening) {
    hoveredRegionId.value = null
    hoveredFeature.value = null
    refreshMapInteractionState()
  }
}

/** 关闭区域下拉并清除地图悬浮态 */
function closeRegionPanel() {
  panelMode.value = null
  hoveredRegionId.value = null
  hoveredFeature.value = null
  refreshMapInteractionState()
}

/** @param {string} regionId */
function selectRegion(regionId) {
  selectedRegionId.value = regionId
  selectedCountryIso.value = ''
  viewLevel.value = 'region'
  panelMode.value = 'countries'
  emit('country-clear')
  refreshMapInteractionState()
  fitMapToRegion(regionId, true)
}

/** @param {string} iso2 */
function selectCountry(iso2) {
  if (!isCountrySupported(iso2)) return
  const regionId = resolveCountryRegionId({ iso2 }) || selectedRegionId.value
  if (regionId) {
    selectedRegionId.value = regionId
  }
  selectedCountryIso.value = iso2
  viewLevel.value = 'country'
  panelMode.value = 'providers'
  emit('country-select', iso2)
  refreshMapInteractionState()
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
  refreshMapInteractionState()
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
  refreshMapInteractionState()
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
  return providerMetaByCountry.value.get(iso2)?.badges || []
}

function selectFromSearch() {
  const q = mobileSearch.value.toLowerCase().trim()
  if (!q) return
  const match = props.countries.find(
    c => c.name.toLowerCase().includes(q) && providerCountryIsos.value.has(c.iso2)
  )
  if (!match) return
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
  nextTick(() => {
    cacheFeaturePathNodes()
    syncMapVisuals()
  })
}

/** 同步缓存地图 path DOM（层级切换后 Vue 可能重建节点） */
function cacheFeaturePathNodes() {
  const paths = mapWrapRef.value?.querySelectorAll('.ca-map__country')
  featurePathNodes.value = paths ? Array.from(paths) : []
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
  if (featurePathNodes.value.length !== renderedFeatures.value.length) {
    cacheFeaturePathNodes()
  }
  const nodes = featurePathNodes.value
  renderedFeatures.value.forEach((feature, index) => {
    const d = gen(feature.geo) || ''
    feature.path = d
    nodes[index]?.setAttribute('d', d)
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
  return [[padX, padY], [MAP_WIDTH - padX, MAP_HEIGHT - padY]]
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
  const scaleDelta = Math.abs(Math.log(to.scale / from.scale))
  const translateDelta = Math.hypot(
    to.translate[0] - from.translate[0],
    to.translate[1] - from.translate[1]
  ) / Math.max(from.scale, 1)
  const animationDuration = Math.round(
    Math.min(720, Math.max(MAP_ANIMATION_MS, MAP_ANIMATION_MS + scaleDelta * 180 + translateDelta * 120))
  )
  isMapAnimating.value = true

  function frame(now) {
    if (generation !== mapAnimationGeneration) return

    const t = ease(Math.min(1, (now - start) / animationDuration))
    current
      .scale(from.scale + (to.scale - from.scale) * t)
      .translate([
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

    projection.value = targetProj
    pathGen.value = d3.geoPath().projection(targetProj)
    cancelMapAnimation()
    renderPaths()
  }

  nextTick(() => {
    if (generation !== mapAnimationGeneration) return
    cacheFeaturePathNodes()
    animationFrameId = requestAnimationFrame(frame)
  })
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
  featurePathNodes.value = []
  if (mapVisualSyncFrame) cancelAnimationFrame(mapVisualSyncFrame)
  if (tooltipSyncFrame) cancelAnimationFrame(tooltipSyncFrame)
})
</script>

<style scoped>
.ca-map {
  padding: 96px var(--ca-hub-content-padding-x) 80px;
  background: #fff;
  --ca-map-hover-ms: 0ms;
  --ca-map-hover-ease: linear;
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
  --ca-region-duration: 420ms;
  position: absolute;
  top: 32px;
  left: 32px;
  z-index: 31;
  width: 468px;
  max-width: calc(100% - 112px);
  pointer-events: auto;
}

.ca-map__region-btn {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: 52px;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #e6e9f0;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  transition:
    border-color var(--ca-region-duration) var(--ca-region-ease),
    box-shadow var(--ca-region-duration) var(--ca-region-ease),
    border-radius var(--ca-region-duration) var(--ca-region-ease),
    background var(--ca-region-duration) var(--ca-region-ease);
}

.ca-map__region-btn svg {
  flex-shrink: 0;
  transition: transform var(--ca-region-duration) var(--ca-region-ease);
}

.ca-map__region-btn-label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.ca-map__region-dropdown--open .ca-map__region-btn {
  border-color: #e6e9f0;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  border-radius: 8px 8px 0 0;
}

.ca-map__region-dropdown--open .ca-map__region-btn-caret {
  transform: rotate(90deg);
}

.ca-map__region-btn:hover {
  border-color: #dde3eb;
  background: #fff;
}

.ca-map__region-dropdown--open .ca-map__region-btn:hover {
  border-color: #e6e9f0;
}

.ca-map__region-menu-wrap {
  max-height: 0;
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
  transition:
    max-height var(--ca-region-duration) var(--ca-region-ease),
    opacity calc(var(--ca-region-duration) * 0.85) var(--ca-region-ease);
}

.ca-map__region-dropdown--open .ca-map__region-menu-wrap {
  max-height: min(360px, calc(100vh - 320px), calc(100dvh - 320px));
  opacity: 1;
  pointer-events: auto;
}

.ca-map__region-menu {
  overflow: hidden;
  background: #fff;
  border: 1px solid #e6e9f0;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.ca-map__region-dropdown--open .ca-map__panel-list--regions {
  padding-top: 16px;
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
  top: 32px;
  right: 32px;
  pointer-events: auto;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid #e6e9f0;
  border-radius: 50%;
  color: #374151;
  cursor: pointer;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}

.ca-map__expand-btn:hover {
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
  transform: translateY(-1px);
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
  fill: #e8e4f0;
  stroke: #f8f7fa;
  opacity: 1;
  shape-rendering: optimizeSpeed;
  outline: none;
  contain: paint;
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
  top: 108px;
  left: 32px;
  z-index: 25;
  width: 468px;
  max-width: calc(100% - 64px);
  max-height: calc(100% - 140px);
  background: #f4f3fb;
  border-radius: 20px;
  border: 1px solid #e6e9f0;
  box-shadow: 0 28px 56px rgba(15, 23, 42, 0.14);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(8px);
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
  gap: 10px;
  min-height: 52px;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  background: #fff;
  border: none;
  border-bottom: 1px solid rgba(230, 233, 240, 0.7);
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.ca-map__panel-back:hover {
  background: #f8fafc;
}

.ca-map__panel-head {
  padding: 10px 22px 10px;
  font-size: 13px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-bottom: 1px solid #f3f4f6;
}

.ca-map__panel-count {
  padding: 0 22px 14px;
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #7038f3;
}

.ca-map__panel-list {
  list-style: none;
  margin: 0;
  padding: 0 16px 16px;
  overflow-y: auto;
  flex: 1;
}

.ca-map__panel-list--regions {
  padding: 16px;
  max-height: min(360px, calc(100vh - 320px), calc(100dvh - 320px));
  overflow-y: auto;
}

.ca-map__panel-row {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 44px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.ca-map__panel-row:hover {
  background: #f5f5f5;
}

.ca-map__panel-row--active {
  background: #f3f3f3;
  box-shadow: none;
}

.ca-map__panel-row--region {
  justify-content: space-between;
  gap: 12px;
}

.ca-map__panel-list--regions .ca-map__panel-row--region + .ca-map__panel-row--region {
  margin-top: 2px;
}

.ca-map__panel-list--dropdown-countries {
  padding: 16px;
}

.ca-map__panel-list--dropdown-providers {
  padding: 16px;
}

.ca-map__panel-row--dropdown-country {
  gap: 10px;
  min-height: 32px;
  padding: 8px 12px;
  border-radius: 6px;
}

.ca-map__panel-row--dropdown-provider {
  gap: 10px;
  min-height: 32px;
  padding: 8px 12px;
  border-radius: 6px;
  background: #fff;
}

.ca-map__panel-list--dropdown-countries .ca-map__panel-row--dropdown-country + .ca-map__panel-row--dropdown-country {
  margin-top: 10px;
}

.ca-map__panel-list--dropdown-providers .ca-map__panel-row--dropdown-provider + .ca-map__panel-row--dropdown-provider {
  margin-top: 10px;
}

.ca-map__panel-row--dropdown-country.ca-map__panel-row--active {
  background: #fff;
}

.ca-map__panel-row--region:hover,
.ca-map__panel-row--region-active {
  background: #f3f3f3;
  box-shadow: none;
}

.ca-map__panel-row--region .ca-map__panel-row-title {
  font-weight: 500;
  line-height: 1.2;
}

.ca-map__panel-row-body {
  flex: 1;
  min-width: 0;
}

.ca-map__panel-row-title {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.ca-map__panel-row-meta {
  display: block;
  font-size: 11px;
  color: #9ca3af;
  margin-top: 1px;
}

.ca-map__flag {
  width: 26px;
  height: 20px;
  object-fit: cover;
  border-radius: 999px;
  flex-shrink: 0;
}

.ca-map__badges {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.ca-map__badge {
  font-size: 8px;
  font-weight: 700;
  padding: 3px 6px;
  background: #d1fae5;
  color: #059669;
  border-radius: 999px;
}

.ca-map__provider-row {
  padding: 14px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.ca-map__provider-name {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.ca-map__provider-cat {
  font-size: 12px;
  color: #9ca3af;
}

.ca-map__empty {
  padding: 28px 22px;
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
  transition: background 0.2s ease;
}

.ca-map__empty-cta:hover {
  background: #8b5cf6;
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
    opacity 420ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 420ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.985);
  filter: blur(6px);
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
    border-radius: 20px 20px 0 0;
    border-left: none;
    border-right: none;
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.12);
  }

  .ca-map__region-dropdown {
    top: 16px;
    left: 16px;
    width: calc(100% - 88px);
    max-width: none;
  }

  .ca-map__region-btn {
    min-height: 52px;
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 15px;
  }

  .ca-map__expand-btn {
    top: 16px;
    right: 16px;
    width: 42px;
    height: 42px;
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

```

---

## 8. 地理工具完整源码

```javascript
/**
 * 地图国家名 → ISO2 映射（适配 world-map.json 中的 name 字段）
 */
export const NAME_TO_ISO = {
  Afghanistan: 'AF',
  Albania: 'AL',
  Algeria: 'DZ',
  Andorra: 'AD',
  'Antigua and Barb.': 'AG',
  Angola: 'AO',
  Argentina: 'AR',
  Armenia: 'AM',
  Australia: 'AU',
  Austria: 'AT',
  Azerbaijan: 'AZ',
  Bahamas: 'BS',
  Bahrain: 'BH',
  Bangladesh: 'BD',
  Barbados: 'BB',
  Belarus: 'BY',
  Belgium: 'BE',
  Belize: 'BZ',
  Benin: 'BJ',
  Bhutan: 'BT',
  Bolivia: 'BO',
  'Bosnia and Herz.': 'BA',
  Botswana: 'BW',
  Brazil: 'BR',
  Brunei: 'BN',
  Bulgaria: 'BG',
  'Burkina Faso': 'BF',
  Burundi: 'BI',
  'Cabo Verde': 'CV',
  Cambodia: 'KH',
  Cameroon: 'CM',
  Canada: 'CA',
  'Central African Rep.': 'CF',
  Chad: 'TD',
  Chile: 'CL',
  China: 'CN',
  Colombia: 'CO',
  Comoros: 'KM',
  Congo: 'CG',
  'Cook Is.': 'CK',
  'Costa Rica': 'CR',
  Croatia: 'HR',
  Cuba: 'CU',
  Cyprus: 'CY',
  Czechia: 'CZ',
  "Côte d'Ivoire": 'CI',
  'Dem. Rep. Congo': 'CD',
  Denmark: 'DK',
  Djibouti: 'DJ',
  Dominica: 'DM',
  'Dominican Rep.': 'DO',
  Ecuador: 'EC',
  Egypt: 'EG',
  'El Salvador': 'SV',
  'Eq. Guinea': 'GQ',
  Eritrea: 'ER',
  Estonia: 'EE',
  Ethiopia: 'ET',
  Fiji: 'FJ',
  Finland: 'FI',
  France: 'FR',
  Gabon: 'GA',
  Gambia: 'GM',
  Georgia: 'GE',
  Germany: 'DE',
  Ghana: 'GH',
  Greece: 'GR',
  Grenada: 'GD',
  Greenland: 'GL',
  Guatemala: 'GT',
  Guinea: 'GN',
  'Guinea-Bissau': 'GW',
  Guyana: 'GY',
  Haiti: 'HT',
  Honduras: 'HN',
  'Hong Kong': 'HK',
  Hungary: 'HU',
  Iceland: 'IS',
  India: 'IN',
  Indonesia: 'ID',
  Iran: 'IR',
  Iraq: 'IQ',
  Ireland: 'IE',
  Israel: 'IL',
  Italy: 'IT',
  Jamaica: 'JM',
  Japan: 'JP',
  Jordan: 'JO',
  Kazakhstan: 'KZ',
  Kenya: 'KE',
  Kiribati: 'KI',
  Kosovo: 'XK',
  Kuwait: 'KW',
  Kyrgyzstan: 'KG',
  Laos: 'LA',
  Latvia: 'LV',
  Lebanon: 'LB',
  Lesotho: 'LS',
  Liberia: 'LR',
  Libya: 'LY',
  Lithuania: 'LT',
  Luxembourg: 'LU',
  Macao: 'MO',
  Macedonia: 'MK',
  Madagascar: 'MG',
  Malawi: 'MW',
  Malaysia: 'MY',
  Maldives: 'MV',
  Mali: 'ML',
  Malta: 'MT',
  'Marshall Is.': 'MH',
  Mauritius: 'MU',
  Mauritania: 'MR',
  Mexico: 'MX',
  Micronesia: 'FM',
  Moldova: 'MD',
  Monaco: 'MC',
  Mongolia: 'MN',
  Montenegro: 'ME',
  Morocco: 'MA',
  Mozambique: 'MZ',
  Myanmar: 'MM',
  Nauru: 'NR',
  Namibia: 'NA',
  Nepal: 'NP',
  Netherlands: 'NL',
  'New Zealand': 'NZ',
  Nicaragua: 'NI',
  Niger: 'NE',
  Nigeria: 'NG',
  'North Korea': 'KP',
  Norway: 'NO',
  Oman: 'OM',
  Pakistan: 'PK',
  Palau: 'PW',
  Palestine: 'PS',
  Panama: 'PA',
  'Papua New Guinea': 'PG',
  Paraguay: 'PY',
  Peru: 'PE',
  Philippines: 'PH',
  Poland: 'PL',
  Portugal: 'PT',
  Qatar: 'QA',
  Romania: 'RO',
  Russia: 'RU',
  Rwanda: 'RW',
  'Saint Lucia': 'LC',
  Samoa: 'WS',
  'San Marino': 'SM',
  'São Tomé and Principe': 'ST',
  'S. Sudan': 'SS',
  'Saudi Arabia': 'SA',
  Senegal: 'SN',
  Serbia: 'RS',
  Seychelles: 'SC',
  'Sierra Leone': 'SL',
  Singapore: 'SG',
  'Solomon Is.': 'SB',
  Slovakia: 'SK',
  Slovenia: 'SI',
  Somalia: 'SO',
  'South Africa': 'ZA',
  'South Korea': 'KR',
  Spain: 'ES',
  'Sri Lanka': 'LK',
  'St. Kitts and Nevis': 'KN',
  'St. Vin. and Gren.': 'VC',
  Sudan: 'SD',
  Suriname: 'SR',
  Sweden: 'SE',
  Switzerland: 'CH',
  Syria: 'SY',
  Tajikistan: 'TJ',
  Tanzania: 'TZ',
  Thailand: 'TH',
  'Timor-Leste': 'TL',
  Togo: 'TG',
  Tonga: 'TO',
  'Trinidad and Tobago': 'TT',
  Tunisia: 'TN',
  Turkey: 'TR',
  Turkmenistan: 'TM',
  Uganda: 'UG',
  Ukraine: 'UA',
  'United Arab Emirates': 'AE',
  'United Kingdom': 'GB',
  'United States of America': 'US',
  Uruguay: 'UY',
  Uzbekistan: 'UZ',
  Vanuatu: 'VU',
  Venezuela: 'VE',
  Vietnam: 'VN',
  Yemen: 'YE',
  Zambia: 'ZM',
  Zimbabwe: 'ZW',
  eSwatini: 'SZ'
}

/** ISO2 → 地图展示区域 ID（8 区，对齐 Ramp Browse regions） */
export const REGION_IDS = [
  'africa',
  'asia',
  'caribbean-central-america',
  'europe',
  'middle-east',
  'north-america',
  'south-america',
  'oceania'
]

export const ISO_TO_REGION = {
  US: 'north-america', CA: 'north-america', MX: 'north-america', GL: 'north-america',
  GT: 'caribbean-central-america', BZ: 'caribbean-central-america', SV: 'caribbean-central-america',
  HN: 'caribbean-central-america', NI: 'caribbean-central-america', CR: 'caribbean-central-america',
  PA: 'caribbean-central-america', CU: 'caribbean-central-america', DO: 'caribbean-central-america',
  HT: 'caribbean-central-america', JM: 'caribbean-central-america', TT: 'caribbean-central-america',
  BB: 'caribbean-central-america', AG: 'caribbean-central-america', DM: 'caribbean-central-america',
  GD: 'caribbean-central-america', KN: 'caribbean-central-america', LC: 'caribbean-central-america',
  VC: 'caribbean-central-america', BS: 'caribbean-central-america',
  BR: 'south-america', AR: 'south-america', CL: 'south-america', CO: 'south-america',
  PE: 'south-america', VE: 'south-america', EC: 'south-america', BO: 'south-america',
  PY: 'south-america', UY: 'south-america', GY: 'south-america', SR: 'south-america',
  GB: 'europe', IE: 'europe', FR: 'europe', DE: 'europe', ES: 'europe', PT: 'europe',
  IT: 'europe', NL: 'europe', BE: 'europe', LU: 'europe', AT: 'europe', CH: 'europe',
  SE: 'europe', NO: 'europe', DK: 'europe', FI: 'europe', IS: 'europe', PL: 'europe',
  CZ: 'europe', SK: 'europe', HU: 'europe', RO: 'europe', BG: 'europe', GR: 'europe',
  HR: 'europe', SI: 'europe', RS: 'europe', BA: 'europe', ME: 'europe', MK: 'europe',
  AL: 'europe', EE: 'europe', LV: 'europe', LT: 'europe', XK: 'europe', CY: 'europe',
  MT: 'europe', AD: 'europe', MC: 'europe', SM: 'europe',
  /** 波兰–罗马尼亚以东：不计入欧洲批量高亮（对齐 Ramp 全球视图） */
  RU: 'asia', BY: 'asia', UA: 'asia', MD: 'asia',
  CN: 'asia', JP: 'asia', KR: 'asia', TW: 'asia', HK: 'asia', MO: 'asia',
  IN: 'asia', PK: 'asia', BD: 'asia', TH: 'asia', VN: 'asia', MY: 'asia', SG: 'asia',
  ID: 'asia', PH: 'asia', KZ: 'asia', UZ: 'asia', MN: 'asia', NP: 'asia', LK: 'asia',
  MM: 'asia', KH: 'asia', LA: 'asia', TL: 'asia', BN: 'asia', AF: 'asia', BT: 'asia',
  MV: 'asia', KP: 'asia', KG: 'asia', TJ: 'asia', TM: 'asia', AZ: 'asia', AM: 'asia',
  GE: 'asia',
  AU: 'oceania', NZ: 'oceania', FJ: 'oceania', PG: 'oceania', CK: 'oceania', KI: 'oceania',
  MH: 'oceania', FM: 'oceania', PW: 'oceania', NR: 'oceania', TV: 'oceania', WS: 'oceania',
  TO: 'oceania', SB: 'oceania', VU: 'oceania',
  AE: 'middle-east', SA: 'middle-east', IL: 'middle-east', TR: 'middle-east',
  IQ: 'middle-east', IR: 'middle-east', JO: 'middle-east', LB: 'middle-east',
  KW: 'middle-east', OM: 'middle-east', QA: 'middle-east', BH: 'middle-east',
  YE: 'middle-east', PS: 'middle-east', SY: 'middle-east',
  EG: 'africa', ZA: 'africa', NG: 'africa', KE: 'africa', GH: 'africa', TZ: 'africa',
  ET: 'africa', MA: 'africa', DZ: 'africa', TN: 'africa', AO: 'africa', MZ: 'africa',
  ZM: 'africa', ZW: 'africa', UG: 'africa', SN: 'africa', CI: 'africa', CM: 'africa',
  SD: 'africa', SS: 'africa', RW: 'africa', BW: 'africa', NA: 'africa', MG: 'africa',
  ML: 'africa', BF: 'africa', NE: 'africa', TD: 'africa', LY: 'africa', SO: 'africa',
  CD: 'africa', CG: 'africa', GA: 'africa', GN: 'africa', SL: 'africa', LR: 'africa',
  BJ: 'africa', BI: 'africa', CF: 'africa', DJ: 'africa', ER: 'africa', GM: 'africa',
  GW: 'africa', CV: 'africa', KM: 'africa', ST: 'africa', SC: 'africa', MU: 'africa',
  MR: 'africa', MW: 'africa', LS: 'africa', SZ: 'africa', TG: 'africa', GQ: 'africa'
}

/** Natural Earth 50m：中国大陆 numeric id */
export const CHINA_MAINLAND_ID = '156'

/** 地图上与中国同一视觉/交互主体的属地块（台湾、港澳） */
export const CHINA_UNIFIED_TERRITORY_IDS = new Set(['158', '344', '446'])

/** 钓鱼岛诸岛近似中心坐标 [lng, lat]（Natural Earth 划入日本，叠加中国属地块） */
export const DIAOYU_ISLAND_COORDS = [
  [123.473, 25.746],
  [123.478, 25.756],
  [123.455, 25.746]
]

/**
 * 藏南等争议区叠加数据（由 scripts/build-cn-claimed-overlays.py 生成）
 * 来源：Natural Earth 50m ne_50m_admin_0_breakaway_disputed_areas，ADM0_A3_CN === CHN
 */
export const CN_CLAIMED_TERRITORIES_SOURCE =
  'Natural Earth 50m disputed areas (China administrative perspective)'

/**
 * 是否为需与中国大陆统一展示/交互的属地块
 * @param {string|null|undefined} numericId
 * @param {string} [mapName]
 * @returns {boolean}
 */
export function isChinaUnifiedTerritory(numericId, mapName) {
  const id = numericId ? String(numericId) : ''
  if (id && CHINA_UNIFIED_TERRITORY_IDS.has(id)) return true
  return mapName === 'Taiwan' || mapName === 'Hong Kong' || mapName === 'Macao'
}

/**
 * 国界 mesh 是否应绘制（中国大陆与合一属地块之间不画分隔缝）
 * @param {string} idA
 * @param {string} idB
 * @returns {boolean}
 */
export function shouldDrawBorderBetween(idA, idB) {
  const chinaGroup = new Set([CHINA_MAINLAND_ID, ...CHINA_UNIFIED_TERRITORY_IDS])
  if (chinaGroup.has(String(idA)) && chinaGroup.has(String(idB))) return false
  return true
}

/**
 * @param {string} mapName
 * @returns {string|null}
 */
export function mapNameToIso(mapName) {
  return NAME_TO_ISO[mapName] || null
}

/**
 * @param {string} iso
 * @returns {string|null}
 */
export function isoToRegionId(iso) {
  return ISO_TO_REGION[iso] || null
}

/**
 * 地图交互用区域 ID（批量悬浮高亮、区域面板归属）
 * @param {string} iso
 * @returns {string|null}
 */
export function isoToMapRegionId(iso) {
  return isoToRegionId(iso)
}

/**
 * 按质心经纬度判定地图展示区域（地理分区）
 * @param {number} lng
 * @param {number} lat
 * @returns {string|null}
 */
export function regionIdFromCoordinates(lng, lat) {
  if (lat < -60) return null

  if (
    (lng >= 110 && lat <= -8) ||
    (lng >= 140 && lat < 12 && lat >= -50) ||
    (lng >= 165 && lat < 5)
  ) {
    return 'oceania'
  }

  if (lng >= -170 && lng <= -30) {
    if (lat >= 23) return 'north-america'
    if (lat >= 7 && lng >= -118 && lng <= -77) return 'caribbean-central-america'
    if (lat >= 10 && lat < 23 && lng >= -95) return 'caribbean-central-america'
    if (lat >= 5 && lat < 25 && lng >= -85) return 'caribbean-central-america'
    if (lat < 15) return 'south-america'
    return 'north-america'
  }

  if (lat >= 36 && lng >= -12 && lng <= 32) return 'europe'
  if (lat >= 35 && lng >= -25 && lng <= 28) return 'europe'

  if (lat >= 12 && lat <= 42 && lng >= 26 && lng <= 63) return 'middle-east'

  if (lat >= -35 && lat < 38 && lng >= -20 && lng <= 55) return 'africa'

  if (lng > 25 || lat > 5) return 'asia'

  return 'africa'
}

/**
 * 欧洲母国海外属地在美洲时按地理区域展示，避免法属圭亚那等误归入欧洲
 * @param {string|null} primaryRegionId
 * @param {number} lng
 * @param {number} lat
 * @param {boolean} isPrimaryPart
 * @returns {string|null}
 */
export function resolvePolygonDisplayRegion(primaryRegionId, lng, lat, isPrimaryPart) {
  if (!primaryRegionId || isPrimaryPart) return primaryRegionId

  const geoRegion = regionIdFromCoordinates(lng, lat)
  const europeOverseasTargets = new Set([
    'caribbean-central-america',
    'south-america',
    'north-america'
  ])
  if (primaryRegionId === 'europe' && europeOverseasTargets.has(geoRegion)) {
    return geoRegion
  }

  return primaryRegionId
}

/**
 * @param {import('geojson').Geometry|object} geometry
 * @returns {object[]}
 */
export function extractPolygonGeometries(geometry) {
  if (!geometry) return []
  if (geometry.type === 'Polygon') return [geometry]
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.map(coords => ({ type: 'Polygon', coordinates: coords }))
  }
  return []
}

```
