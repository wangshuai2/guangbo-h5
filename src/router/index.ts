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
    path: '/user/signin',
    name: 'UserSignin',
    component: () => import('@/views/user/signin.vue'),
    meta: {
      title: '每日签到',
      showTabBar: false,
      requireAuth: true,
    },
  },
  {
    path: '/user/level',
    name: 'UserLevel',
    component: () => import('@/views/user/level.vue'),
    meta: {
      title: '等级系统',
      showTabBar: false,
      requireAuth: true,
    },
  },
  {
    path: '/user/checkin-history',
    name: 'CheckinHistory',
    component: () => import('@/views/user/checkin-history.vue'),
    meta: {
      title: '打卡记录',
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
  {
    path: '/search/enhanced',
    name: 'EnhancedSearch',
    component: () => import('@/views/home/search.vue'),
    meta: {
      title: '高级搜索',
      showTabBar: false,
    },
  },
  {
    path: '/collection',
    name: 'Collection',
    component: () => import('@/views/user/favorites.vue'),
    meta: {
      title: '我的收藏',
      showTabBar: false,
      requireAuth: true,
    },
  },
  {
    path: '/team',
    name: 'Team',
    component: () => import('@/views/checkin/index.vue'),
    meta: {
      title: '组队打卡',
      showTabBar: false,
      requireAuth: true,
    },
  },
  {
    path: '/ticket/booking/:id?',
    name: 'TicketBooking',
    component: () => import('@/views/museum/detail.vue'),
    meta: {
      title: '门票预约',
      showTabBar: false,
    },
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
