<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showLoadingToast, closeToast, showToast, showDialog } from 'vant'
import type { CollectionGroup, Collection } from '@/api/collection'

const router = useRouter()

const loading = ref(false)
const activeGroup = ref<number | null>(null)
const groups = ref<CollectionGroup[]>([])
const collections = ref<Collection[]>([])

// 分组管理弹窗
const showGroupManager = ref(false)
const editingGroup = ref<CollectionGroup | null>(null)
const groupForm = ref({ name: '', icon: '' })

// 获取分组列表
async function fetchGroups() {
  try {
    // TODO: 使用真实 API
    // const res = await getCollectionGroups()
    // groups.value = res.data
    
    // Mock 数据
    groups.value = [
      { id: 0, name: '全部', count: 12, sortOrder: 0, createdAt: '' },
      { id: 1, name: '想去', icon: 'star', count: 5, sortOrder: 1, createdAt: '2026-03-27' },
      { id: 2, name: '已去', icon: 'location', count: 7, sortOrder: 2, createdAt: '2026-03-27' }
    ]
  } catch (error) {
    showToast('加载失败')
  }
}

// 获取收藏列表
async function fetchCollections() {
  loading.value = true
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0
  })

  try {
    // TODO: 使用真实 API
    // const res = await getCollections({ groupId: activeGroup.value || undefined })
    // collections.value = res.data.list
    
    // Mock 数据
    await new Promise(resolve => setTimeout(resolve, 500))
    collections.value = [
      {
        id: 1,
        museumId: 1,
        museumName: '故宫博物院',
        museumImage: 'https://picsum.photos/400/300?random=1',
        city: '北京',
        province: '北京',
        rating: 4.9,
        groupId: 1,
        createdAt: '2026-03-27'
      },
      {
        id: 2,
        museumId: 2,
        museumName: '上海博物馆',
        museumImage: 'https://picsum.photos/400/300?random=2',
        city: '上海',
        province: '上海',
        rating: 4.7,
        groupId: 2,
        createdAt: '2026-03-26'
      }
    ]
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

// 切换分组
function switchGroup(groupId: number) {
  activeGroup.value = groupId === 0 ? null : groupId
  fetchCollections()
}

// 打开分组管理
function openGroupManager() {
  showGroupManager.value = true
}

// 创建分组
async function createGroup() {
  if (!groupForm.value.name.trim()) {
    showToast('请输入分组名称')
    return
  }

  try {
    // TODO: 使用真实 API
    // await createCollectionGroup(groupForm.value)
    
    showToast('创建成功')
    groupForm.value = { name: '', icon: '' }
    fetchGroups()
  } catch (error) {
    showToast('创建失败')
  }
}

// 编辑分组
function editGroup(group: CollectionGroup) {
  editingGroup.value = group
  groupForm.value = { name: group.name, icon: group.icon || '' }
}

// 保存编辑
async function saveEdit() {
  if (!editingGroup.value) return
  if (!groupForm.value.name.trim()) {
    showToast('请输入分组名称')
    return
  }

  try {
    // TODO: 使用真实 API
    // await updateCollectionGroup(editingGroup.value.id, groupForm.value)
    
    showToast('保存成功')
    editingGroup.value = null
    groupForm.value = { name: '', icon: '' }
    fetchGroups()
  } catch (error) {
    showToast('保存失败')
  }
}

// 删除分组
async function deleteGroup(group: CollectionGroup) {
  try {
    await showDialog({
      title: '确认删除',
      message: `删除分组"${group.name}"，收藏将移至"全部"`,
      showCancelButton: true
    })
    
    // TODO: 使用真实 API
    // await deleteCollectionGroup(group.id)
    
    showToast('删除成功')
    fetchGroups()
  } catch {
    // 取消
  }
}

// 取消收藏
async function removeCollection(collection: Collection) {
  try {
    await showDialog({
      title: '确认取消收藏',
      message: `取消收藏"${collection.museumName}"？`,
      showCancelButton: true
    })
    
    // TODO: 使用真实 API
    // await removeFromCollection(collection.museumId)
    
    showToast('已取消收藏')
    fetchCollections()
  } catch {
    // 取消
  }
}

// 跳转到博物馆详情
function goToDetail(museumId: number) {
  router.push(`/museum/${museumId}`)
}

onMounted(() => {
  fetchGroups()
  fetchCollections()
})
</script>

<template>
  <div class="collection-page">
    <van-nav-bar
      title="我的收藏"
      left-arrow
      @click-left="router.back()"
    >
      <template #right>
        <van-icon name="setting-o" @click="openGroupManager" />
      </template>
    </van-nav-bar>

    <div class="page-content">
      <!-- 分组标签 -->
      <div class="group-tabs">
        <div
          v-for="group in groups"
          :key="group.id"
          class="group-tab"
          :class="{ active: (activeGroup === null && group.id === 0) || activeGroup === group.id }"
          @click="switchGroup(group.id)"
        >
          <span class="group-name">{{ group.name }}</span>
          <span class="group-count">{{ group.count }}</span>
        </div>
      </div>

      <!-- 收藏列表 -->
      <div class="collections-list">
        <div
          v-for="collection in collections"
          :key="collection.id"
          class="collection-item"
          @click="goToDetail(collection.museumId)"
        >
          <van-image
            :src="collection.museumImage"
            width="100"
            height="75"
            fit="cover"
            radius="8"
          />
          <div class="collection-info">
            <div class="museum-name">{{ collection.museumName }}</div>
            <div class="museum-location">
              <van-icon name="location-o" />
              {{ collection.city }} {{ collection.province }}
            </div>
            <div class="museum-rating">
              <van-icon name="star" color="#ff976a" />
              {{ collection.rating }}
            </div>
          </div>
          <div class="collection-actions">
            <van-icon name="cross" @click.stop="removeCollection(collection)" />
          </div>
        </div>

        <van-empty v-if="collections.length === 0 && !loading" description="暂无收藏" />
      </div>
    </div>

    <!-- 分组管理弹窗 -->
    <van-popup v-model:show="showGroupManager" position="bottom" round style="height: 70vh">
      <div class="group-manager">
        <div class="manager-header">
          <span class="manager-title">分组管理</span>
          <van-icon name="cross" @click="showGroupManager = false" />
        </div>

        <div class="manager-content">
          <!-- 分组列表 -->
          <div class="groups-list">
            <div
              v-for="group in groups.filter(g => g.id !== 0)"
              :key="group.id"
              class="group-item"
            >
              <div class="group-info">
                <van-icon :name="group.icon || 'folder-o'" />
                <span class="group-name">{{ group.name }}</span>
                <span class="group-count">{{ group.count }}个收藏</span>
              </div>
              <div class="group-actions">
                <van-button size="mini" plain @click="editGroup(group)">编辑</van-button>
                <van-button size="mini" plain type="danger" @click="deleteGroup(group)">删除</van-button>
              </div>
            </div>
          </div>

          <!-- 创建/编辑表单 -->
          <div class="group-form">
            <div class="form-title">{{ editingGroup ? '编辑分组' : '创建分组' }}</div>
            <van-field
              v-model="groupForm.name"
              placeholder="请输入分组名称"
              maxlength="20"
            />
            <van-button
              block
              round
              type="primary"
              @click="editingGroup ? saveEdit() : createGroup()"
            >
              {{ editingGroup ? '保存' : '创建' }}
            </van-button>
            <van-button
              v-if="editingGroup"
              block
              round
              plain
              @click="editingGroup = null; groupForm = { name: '', icon: '' }"
            >
              取消编辑
            </van-button>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style lang="scss" scoped>
.collection-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.page-content {
  padding: 12px;
}

.group-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 12px;
  margin-bottom: 12px;

  &::-webkit-scrollbar {
    display: none;
  }
}

.group-tab {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background-color: #fff;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    background-color: #1989fa;
    color: #fff;
  }
}

.group-name {
  font-size: 14px;
}

.group-count {
  font-size: 12px;
  opacity: 0.8;
}

.collections-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.collection-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background-color: #fff;
  border-radius: 12px;
  cursor: pointer;
}

.collection-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.museum-name {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.museum-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #969799;
}

.museum-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #ff976a;
  font-weight: 500;
}

.collection-actions {
  display: flex;
  align-items: center;
  padding: 0 8px;
  color: #969799;
  cursor: pointer;
}

.group-manager {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}

.manager-title {
  font-size: 16px;
  font-weight: 600;
}

.manager-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.groups-list {
  margin-bottom: 24px;
}

.group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #f7f8fa;
  border-radius: 8px;
  margin-bottom: 8px;
}

.group-info {
  display: flex;
  align-items: center;
  gap: 8px;

  .van-icon {
    color: #1989fa;
  }
}

.group-name {
  font-size: 14px;
  color: #323233;
}

.group-count {
  font-size: 12px;
  color: #969799;
}

.group-actions {
  display: flex;
  gap: 8px;
}

.group-form {
  padding-top: 16px;
  border-top: 1px solid #ebedf0;
}

.form-title {
  font-size: 14px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 12px;
}
</style>
