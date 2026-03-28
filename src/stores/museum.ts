import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Museum, MuseumListParams } from '@/types'
import { getMuseumList, getMuseumNearby } from '@/api/museum'

export const useMuseumStore = defineStore('museum', () => {
  // 状态
  const museumList = ref<Museum[]>([])
  const nearbyMuseums = ref<Museum[]>([])
  const hotMuseums = ref<Museum[]>([])
  const currentMuseum = ref<Museum | null>(null)
  const loading = ref(false)
  const listParams = ref<MuseumListParams>({
    page: 1,
    pageSize: 20,
  })
  const hasMore = ref(true)

  // Actions
  async function fetchMuseumList(params?: MuseumListParams) {
    loading.value = true
    try {
      const res = await getMuseumList({ ...listParams.value, ...params })
      if (res.code === 0 && res.data) {
        if (params?.page === 1) {
          museumList.value = res.data.list
        } else {
          museumList.value.push(...res.data.list)
        }
        hasMore.value = res.data.pagination.hasMore
        listParams.value = { ...listParams.value, ...params }
      }
    } catch (error) {
      console.error('获取博物馆列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  async function fetchNearbyMuseums(lat: number, lng: number, distance = 5000) {
    loading.value = true
    try {
      const res = await getMuseumNearby({ lat, lng, distance })
      if (res.code === 0 && res.data) {
        nearbyMuseums.value = res.data.list
      }
    } catch (error) {
      console.error('获取附近博物馆失败:', error)
    } finally {
      loading.value = false
    }
  }

  function setCurrentMuseum(museum: Museum) {
    currentMuseum.value = museum
  }

  function clearMuseumList() {
    museumList.value = []
    listParams.value = { page: 1, pageSize: 20 }
    hasMore.value = true
  }

  return {
    // 状态
    museumList,
    nearbyMuseums,
    hotMuseums,
    currentMuseum,
    loading,
    listParams,
    hasMore,
    // Actions
    fetchMuseumList,
    fetchNearbyMuseums,
    setCurrentMuseum,
    clearMuseumList,
  }
})