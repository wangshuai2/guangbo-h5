import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/index.vue'),
    meta: {
      title: '逛博 - 发现身边的博物馆',
      showTabBar: true,
    },
  },
  {
    path: '/museum/:id',
    name: 'MuseumDetail',
    component: () => import('@/views/museum/detail.vue'),
    meta: {
      title: '博物馆详情',
      showTabBar: false,
    },
  },
  {
    path: '/checkin',
    name: 'CheckIn',
    component: () => import('@/views/checkin/index.vue'),
    meta: {
      title: '打卡',
      showTabBar: true,
      requireAuth: true,
    },
  },
  {
    path: '/medal',
    name: 'Medal',
    component: () => import('@/views/medal/index.vue'),
    meta: {
      title: '勋章',
      showTabBar: true,
      requireAuth: true,
    },
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('@/views/user/index.vue'),
    meta: {
      title: '我的',
      showTabBar: true,
      requireAuth: true,
    },
  },
  {
    path: '/user/footprint',
    name: 'Footprint',
    component: () => import('@/views/user/footprint.vue'),
    meta: {
      title: '我的足迹',
      showTabBar: false,
      requireAuth: true,
    },
  },
  {
    path: '/user/favorites',
    name: 'Favorites',
    component: () => import('@/views/user/favorites.vue'),
    meta: {
      title: '我的收藏',
      showTabBar: false,
      requireAuth: true,
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/login.vue'),
    meta: {
      title: '登录',
      showTabBar: false,
    },
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/home/search.vue'),
    meta: {
      title: '搜索',
      showTabBar: false,
    },
  },
  // 参观攻略
  {
    path: '/guides',
    name: 'Guides',
    component: () => import('@/views/guides/index.vue'),
    meta: { title: '参观攻略', showTabBar: false },
  },
  {
    path: '/guides/:id',
    name: 'GuideDetail',
    component: () => import('@/views/guides/detail.vue'),
    meta: { title: '攻略详情', showTabBar: false },
  },
  // 收藏提醒
  {
    path: '/collection-reminders',
    name: 'CollectionReminders',
    component: () => import('@/views/collection-reminders/index.vue'),
    meta: { title: '收藏提醒', showTabBar: false, requireAuth: true },
  },
  {
    path: '/collection-reminders/create',
    name: 'CollectionReminderCreate',
    component: () => import('@/views/collection-reminders/create.vue'),
    meta: { title: '添加提醒', showTabBar: false, requireAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  document.title = (to.meta.title as string) || '逛博'

  // 检查登录状态
  if (to.meta.requireAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
      return
    }
  }

  next()
})

export const setupRouter = (app: App) => {
  app.use(router)
}

export default router