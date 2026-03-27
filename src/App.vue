<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import TabBar from '@/components/TabBar.vue'

const route = useRoute()
const showTabBar = computed(() => route.meta.showTabBar)
</script>

<template>
  <div class="app-container">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <TabBar v-if="showTabBar" />
  </div>
</template>

<style lang="scss">
.app-container {
  min-height: 100vh;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
