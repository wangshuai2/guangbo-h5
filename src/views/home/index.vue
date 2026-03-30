<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { getMuseumList } from '@/api/museum'
import type { Museum } from '@/types'
import TodayRecommend from '@/components/TodayRecommend.vue'

const router = useRouter()

// 状态
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const museumList = ref<Museum[]>([])
const page = ref(1)
const pageSize = 20

// 筛选条件
const activeProvince = ref('')
const activeCity = ref('')
const provinces = ['全部', '北京市', '上海市', '广东省', '江苏省', '浙江省', '四川省', '陕西省']
const cities = ref<string[]>(['全部'])

// 搜索
const searchValue = ref('')

// 加载博物馆列表
async function loadMuseums(isRefresh = false) {
  if (loading.value) return

  loading.value = true

  if (isRefresh) {
    page.value = 1
    finished.value = false
  }

  try {
    const res = await getMuseumList({
      page: page.value,
      pageSize,
      province: activeProvince.value === '全部' ? undefined : activeProvince.value,
      city: activeCity.value === '全部' ? undefined : activeCity.value,
      keyword: searchValue.value || undefined,
    })

    if (res.code === 0 && res.data) {
      if (isRefresh) {
        museumList.value = res.data.list
      } else {
        museumList.value.push(...res.data.list)
      }

      finished.value = !res.data.pagination.hasMore
      page.value++
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
    refreshing.value = false
    closeToast()
  }
}

// 下拉刷新
function onRefresh() {
  refreshing.value = true
  loadMuseums(true)
}

// 加载更多
function onLoad() {
  loadMuseums()
}

// 省份切换
function onProvinceChange(name: string) {
  activeProvince.value = name
  if (name === '全部') {
    cities.value = ['全部']
  } else {
    cities.value = ['全部', name.replace('省', '市')]
  }
  activeCity.value = '全部'
  loadMuseums(true)
}

// 城市切换
function onCityChange(name: string) {
  activeCity.value = name
  loadMuseums(true)
}

// 搜索
function onSearch() {
  loadMuseums(true)
}

// 跳转详情
function goToDetail(id: number) {
  router.push(`/museum/${id}`)
}

// 初始化
onMounted(() => {
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0,
  })
  loadMuseums()
})
</script>

<template>
  <div class="home-page">
    <!-- 顶部搜索栏 -->
    <van-search
      v-model="searchValue"
      placeholder="搜索博物馆"
      show-action
      @search="onSearch"
    >
      <template #action>
        <van-button size="small" type="primary" @click="onSearch">搜索</van-button>
      </template>
    </van-search>

    <!-- 筛选标签 -->
    <div class="filter-section">
      <van-tabs v-model:active="activeProvince" @change="onProvinceChange">
        <van-tab v-for="province in provinces" :key="province" :name="province" :title="province" />
      </van-tabs>

      <van-tabs v-if="cities.length > 1" v-model:active="activeCity" @change="onCityChange">
        <van-tab v-for="city in cities" :key="city" :name="city" :title="city" />
      </van-tabs>
    </div>

    <!-- 今日推荐 -->
    <TodayRecommend />

    <!-- 博物馆列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div class="museum-list">
          <van-card
            v-for="museum in museumList"
            :key="museum.id"
            class="museum-card"
            @click="goToDetail(museum.id)"
          >
            <template #thumb>
              <van-image
                :src="museum.coverImage"
                width="120"
                height="90"
                fit="cover"
                radius="8"
                lazy-load
              />
            </template>
            <template #title>
              <div class="museum-name">{{ museum.name }}</div>
            </template>
            <template #desc>
              <div class="museum-info">
                <van-icon name="location-o" />
                <span>{{ museum.province }} · {{ museum.city }}</span>
              </div>
              <div class="museum-tags">
                <van-tag v-if="museum.isFree" type="success">免费</van-tag>
                <van-tag type="primary">
                  {{ museum.type === 'history' ? '历史' : museum.type === 'art' ? '艺术' : museum.type === 'science' ? '科技' : '综合' }}
                </van-tag>
              </div>
            </template>
            <template #footer>
              <div class="museum-stats">
                <span class="rating">
                  <van-icon name="star" color="#ff976a" />
                  {{ museum.rating }}
                </span>
                <span class="checkin-count">{{ museum.checkinCount }}人打卡</span>
              </div>
            </template>
          </van-card>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.filter-section {
  background-color: #fff;
  margin-bottom: 12px;
}

.museum-list {
  padding: 12px;
}

.museum-card {
  margin-bottom: 12px;
  border-radius: 12px;
  overflow: hidden;

  .museum-name {
    font-size: 16px;
    font-weight: 600;
    color: #323233;
    margin-bottom: 4px;
  }

  .museum-info {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #646566;
    margin-bottom: 8px;
  }

  .museum-tags {
    display: flex;
    gap: 4px;
  }

  .museum-stats {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: #646566;

    .rating {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #ff976a;
    }
  }
}
</style>