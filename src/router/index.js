import { createRouter, createWebHistory } from 'vue-router'
import i18n from '@/i18n'
import CaHubPage from '@/pages/CaHubPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/product/ca-hub'
    },
    {
      path: '/product/ca-hub',
      name: 'ca-hub',
      component: CaHubPage,
      meta: { title: 'CA Hub - Global CA Coverage' }
    },
    {
      path: '/:locale(en|zh|zh-HK)/product/ca-hub',
      name: 'ca-hub-locale',
      component: CaHubPage,
      meta: { title: 'CA Hub - Global CA Coverage' }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    /** 同页仅 query 变化（地图选国家、分页等）时保持当前滚动位置 */
    if (from.name && to.name === from.name && to.path === from.path) {
      return false
    }
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  const locale = to.params.locale
  if (locale && ['en', 'zh', 'zh-HK'].includes(locale)) {
    i18n.global.locale.value = locale
  }
  if (to.meta?.title) {
    document.title = to.meta.title
  }
})

export default router
