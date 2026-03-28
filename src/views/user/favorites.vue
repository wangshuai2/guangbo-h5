<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showLoadingToast, closeToast, showToast, showConfirmDialog } from 'vant'
import {
  getCollections,
  getCollectionGroups,
  createCollectionGroup,
  updateCollectionGroup,
  deleteCollectionGroup,
  moveCollectionsToGroup,
  removeFromGroup,
  type CollectionGroup,
  type CollectionItem,
} from '@/api/collections'
import type { Museum } from '@/types'

const router = useRouter()

// 状态
const activeTab = ref(0)
const loading = ref(true)
const collections = ref<CollectionItem[]>([])
const groups = ref<CollectionGroup[]>([])
const selectedItems = ref<number[]>([])
const isBatchMode = ref(false)

// 弹窗状态
const showGroupDialog = ref(false)
const showCreateGroupDialog = ref(false)
const showMoveDialog = ref(false)
const editingGroup = ref<CollectionGroup | null>(null)
const groupForm = ref({ name: '' })
const moveTargetGroupId = ref<number | null>(null)

// 计算属性
const currentGroupId = computed(() => {
  if (activeTab.value === 0) return undefined // 全部
  return groups.value[activeTab.value - 1]?.id
})

const filteredCollections = computed(() => {
  if (activeTab.value === 0) return collections.value
  return collections.value.filter((item) => item.groupId === currentGroupId.value)
})

const selectedCount = computed(() => selectedItems.value.length)

// 获取收藏列表
async function fetchCollections() {
  try {
    const res = await getCollections({
      groupId: currentGroupId.value,
      page: 1,
      pageSize: 100,
    })
    if (res.code === 0 && res.data) {
      collections.value = res.data.list
    }
  } catch (error) {
    showToast('加载收藏失败')
  }
}

// 获取分组列表
async function fetchGroups() {
  try {
    const res = await getCollectionGroups()
    if (res.code === 0 && res.data) {
      groups.value = res.data
    }
  } catch (error) {
    showToast('加载分组失败')
  }
}

// 加载数据
async function loadData() {
  loading.value = true
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0,
  })

  await Promise.all([fetchGroups(), fetchCollections()])

  loading.value = false
  closeToast()
}

// 切换分组
async function onTabChange(index: number) {
  activeTab.value = index
  selectedItems.value = []
  await fetchCollections()
}

// 进入批量模式
function enterBatchMode() {
  isBatchMode.value = true
  selectedItems.value = []
}

// 退出批量模式
function exitBatchMode() {
  isBatchMode.value = false
  selectedItems.value = []
}

// 切换选中
function toggleSelection(id: number) {
  const index = selectedItems.value.indexOf(id)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(id)
  }
}

// 全选
function selectAll() {
  if (selectedItems.value.length === filteredCollections.value.length) {
    selectedItems.value = []
  } else {
    selectedItems.value = filteredCollections.value.map((item) => item.id)
  }
}

// 打开创建分组弹窗
function openCreateGroupDialog() {
  editingGroup.value = null
  groupForm.value = { name: '' }
  showCreateGroupDialog.value = true
}

// 打开编辑分组弹窗
function openEditGroupDialog(group: CollectionGroup) {
  editingGroup.value = group
  groupForm.value = { name: group.name }
  showCreateGroupDialog.value = true
}

// 保存分组
async function saveGroup() {
  if (!groupForm.value.name.trim()) {
    showToast('请输入分组名称')
    return
  }

  try {
    if (editingGroup.value) {
      await updateCollectionGroup(editingGroup.value.id, { name: groupForm.value.name })
      showToast('修改成功')
    } else {
      await createCollectionGroup({ name: groupForm.value.name })
      showToast('创建成功')
    }
    showCreateGroupDialog.value = false
    await fetchGroups()
  } catch (error) {
    showToast('操作失败')
  }
}

// 删除分组
async function onDeleteGroup(group: CollectionGroup) {
  try {
    await showConfirmDialog({
      title: '删除分组',
      message: `确定删除分组"${group.name}"吗？分组内的收藏将被移到"全部"。`,
    })
    await deleteCollectionGroup(group.id)
    showToast('删除成功')
    await fetchGroups()
    if (activeTab.value > groups.value.length) {
      activeTab.value = 0
    }
    await fetchCollections()
  } catch (error) {
    // 用户取消
  }
}

// 打开移动弹窗
function openMoveDialog() {
  if (selectedItems.value.length === 0) {
    showToast('请先选择要移动的收藏')
    return
  }
  moveTargetGroupId.value = null
  showMoveDialog.value = true
}

// 移动收藏到分组
async function confirmMove() {
  if (moveTargetGroupId.value === null) {
    showToast('请选择目标分组')
    return
  }

  try {
    await moveCollectionsToGroup({
      ids: selectedItems.value,
      groupId: moveTargetGroupId.value,
    })
    showToast('移动成功')
    showMoveDialog.value = false
    selectedItems.value = []
    await fetchCollections()
  } catch (error) {
    showToast('移动失败')
  }
}

// 从分组移除
async function removeFromCurrentGroup() {
  if (selectedItems.value.length === 0) {
    showToast('请先选择要移除的收藏')
    return
  }

  try {
    await showConfirmDialog({
      title: '移除分组',
      message: '确定将选中的收藏从当前分组移除吗？',
    })
    await removeFromGroup(selectedItems.value)
    showToast('移除成功')
    selectedItems.value = []
    await fetchCollections()
  } catch (error) {
    // 用户取消
  }
}

// 跳转到博物馆详情
function goToDetail(museumId: number) {
  router.push(`/museum/${museumId}`)
}

// 格式化日期
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="favorites-page">
    <van-nav-bar
      :title="isBatchMode ? `已选择 ${selectedCount} 项` : '我的收藏'"
      left-arrow
      @click-left="isBatchMode ? exitBatchMode() : router.back()"
    >
      <template #right>
        <span v-if="!isBatchMode" class="batch-btn" @click="enterBatchMode">管理</span>
        <span v-else class="batch-btn" @click="exitBatchMode">完成</span>
      </template>
    </van-nav-bar>

    <!-- 分组标签栏 -->
    <div class="group-tabs">
      <div class="tab-list">
        <div
          v-for="(group, index) in [{ name: '全部', count: collections.length }, ...groups]"
          :key="index"
          class="tab-item"
          :class="{ active: activeTab === index }"
          @click="onTabChange(index)"
        >
          <span class="tab-name">{{ group.name }}</span>
          <span class="tab-count">{{ group.count || collections.length }}</span>
        </div>
      </div>
      <div class="tab-actions">
        <van-icon name="plus" @click="openCreateGroupDialog" />
        <van-icon name="setting-o" @click="showGroupDialog = true" />
      </div>
    </div>

    <!-- 批量操作栏 -->
    <div v-if="isBatchMode" class="batch-actions">
      <van-checkbox :checked="selectedCount === filteredCollections.length && selectedCount > 0" @click="selectAll">
        全选
      </van-checkbox>
      <div class="batch-btns">
        <van-button v-if="activeTab > 0" size="small" plain @click="removeFromCurrentGroup">
          移出分组
        </van-button>
        <van-button size="small" type="primary" @click="openMoveDialog">
          移动到
        </van-button>
      </div>
    </div>

    <!-- 收藏列表 -->
    <div class="collection-list" :class="{ 'has-batch-bar': isBatchMode }">
      <div
        v-for="item in filteredCollections"
        :key="item.id"
        class="collection-item"
        @click="isBatchMode ? toggleSelection(item.id) : goToDetail(item.museum.id)"
      >
        <van-checkbox
          v-if="isBatchMode"
          class="item-checkbox"
          :checked="selectedItems.includes(item.id)"
        />
        <van-image
          :src="item.museum.coverImage"
          width="100"
          height="80"
          fit="cover"
          radius="8"
        />
        <div class="museum-info">
          <div class="museum-name">{{ item.museum.name }}</div>
          <div class="museum-address">{{ item.museum.province }} · {{ item.museum.city }}</div>
          <div class="museum-meta">
            <span class="rating">
              <van-icon name="star" color="#ff976a" />
              {{ item.museum.rating }}
            </span>
            <span class="date">收藏于 {{ formatDate(item.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <van-empty
      v-if="!loading && filteredCollections.length === 0"
      :description="activeTab === 0 ? '还没有收藏任何博物馆' : '该分组暂无收藏'"
    >
      <van-button type="primary" round @click="router.push('/')">去发现</van-button>
    </van-empty>

    <!-- 分组管理弹窗 -->
    <van-popup v-model:show="showGroupDialog" position="bottom" round :style="{ height: '60%' }">
      <div class="group-manage">
        <div class="popup-header">
          <span>管理分组</span>
          <van-icon name="cross" @click="showGroupDialog = false" />
        </div>
        <div class="group-list">
          <div
            v-for="group in groups"
            :key="group.id"
            class="group-item"
          >
            <div class="group-info">
              <van-icon name="folder-o" />
              <span class="group-name">{{ group.name }}</span>
              <span class="group-count">{{ group.count }}</span>
            </div>
            <div class="group-actions">
              <van-icon name="edit" @click="openEditGroupDialog(group)" />
              <van-icon name="delete-o" @click="onDeleteGroup(group)" />
            </div>
          </div>
        </div>
        <div class="popup-footer">
          <van-button block type="primary" @click="openCreateGroupDialog">
            新建分组
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 创建/编辑分组弹窗 -->
    <van-dialog
      v-model:show="showCreateGroupDialog"
      :title="editingGroup ? '编辑分组' : '新建分组'"
      show-cancel-button
      @confirm="saveGroup"
    >
      <van-field
        v-model="groupForm.name"
        label="分组名称"
        placeholder="请输入分组名称"
        maxlength="20"
      />
    </van-dialog>

    <!-- 移动到分组弹窗 -->
    <van-popup v-model:show="showMoveDialog" position="bottom" round :style="{ height: '50%' }">
      <div class="move-dialog">
        <div class="popup-header">
          <span>移动到分组</span>
          <van-icon name="cross" @click="showMoveDialog = false" />
        </div>
        <div class="group-options">
          <div
            v-for="group in groups"
            :key="group.id"
            class="group-option"
            :class="{ active: moveTargetGroupId === group.id }"
            @click="moveTargetGroupId = group.id"
          >
            <van-icon :name="moveTargetGroupId === group.id ? 'success' : 'circle'" />
            <span>{{ group.name }} ({{ group.count }})</span>
          </div>
        </div>
        <div class="popup-footer">
          <van-button block type="primary" @click="confirmMove">
            确定移动
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style lang="scss" scoped>
.favorites-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.batch-btn {
  font-size: 14px;
  color: #1989fa;
}

.group-tabs {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #fff;
  border-bottom: 1px solid #ebedf0;

  .tab-list {
    flex: 1;
    display: flex;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .tab-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border-radius: 16px;
    background-color: #f7f8fa;
    white-space: nowrap;
    cursor: pointer;

    &.active {
      background-color: #1989fa;
      color: #fff;
    }

    .tab-name {
      font-size: 13px;
    }

    .tab-count {
      font-size: 11px;
      opacity: 0.8;
    }
  }

  .tab-actions {
    display: flex;
    gap: 12px;
    margin-left: 12px;

    .van-icon {
      font-size: 20px;
      color: #646566;
      cursor: pointer;
    }
  }
}

.batch-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #ebedf0;

  .batch-btns {
    display: flex;
    gap: 8px;
  }
}

.collection-list {
  padding: 12px;

  &.has-batch-bar {
    padding-bottom: 80px;
  }
}

.collection-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #fff;
  border-radius: 12px;
  margin-bottom: 12px;

  .item-checkbox {
    margin-right: 4px;
  }

  .museum-info {
    flex: 1;

    .museum-name {
      font-size: 16px;
      font-weight: 600;
      color: #323233;
      margin-bottom: 4px;
    }

    .museum-address {
      font-size: 12px;
      color: #646566;
      margin-bottom: 8px;
    }

    .museum-meta {
      display: flex;
      align-items: center;
      gap: 12px;

      .rating {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: #ff976a;
      }

      .date {
        font-size: 12px;
        color: #969799;
      }
    }
  }
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #ebedf0;

  .van-icon {
    font-size: 20px;
    color: #969799;
    cursor: pointer;
  }
}

.group-manage {
  height: 100%;
  display: flex;
  flex-direction: column;

  .group-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
  }

  .group-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;

    .group-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .van-icon {
        font-size: 20px;
        color: #1989fa;
      }

      .group-name {
        font-size: 14px;
        color: #323233;
      }

      .group-count {
        font-size: 12px;
        color: #969799;
      }
    }

    .group-actions {
      display: flex;
      gap: 16px;

      .van-icon {
        font-size: 18px;
        color: #969799;
        cursor: pointer;

        &:hover {
          color: #646566;
        }
      }
    }
  }

  .popup-footer {
    padding: 12px 16px;
    border-top: 1px solid #ebedf0;
  }
}

.move-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;

  .group-options {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
  }

  .group-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    cursor: pointer;

    &.active {
      color: #1989fa;
    }

    .van-icon {
      font-size: 20px;
    }

    span {
      font-size: 14px;
    }
  }

  .popup-footer {
    padding: 12px 16px;
    border-top: 1px solid #ebedf0;
  }
}
</style>
