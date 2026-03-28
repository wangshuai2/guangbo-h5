<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const tabs = [
  { path: '/', name: '首页', icon: 'wap-home-o', activeIcon: 'wap-home' },
  { path: '/checkin', name: '打卡', icon: 'location-o', activeIcon: 'location' },
  { path: '/medal', name: '勋章', icon: 'medal-o', activeIcon: 'medal' },
  { path: '/user', name: '我的', icon: 'user-o', activeIcon: 'user' },
]

const active = ref(route.path)

const onChange = (path: string) => {
  router.push(path)
}
</script>

<template>
  <van-tabbar v-model="active" @change="onChange" fixed placeholder>
    <van-tabbar-item
      v-for="tab in tabs"
      :key="tab.path"
      :name="tab.path"
      :icon="active === tab.path ? tab.activeIcon : tab.icon"
    >
      {{ tab.name }}
    </van-tabbar-item>
  </van-tabbar>
</template>