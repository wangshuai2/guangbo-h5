<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast, showConfirmDialog } from 'vant'
import {
  getCollectionGroups,
  createCollectionGroup,
  updateCollectionGroup,
  deleteCollectionGroup,
  type CollectionGroup,
} from '@/api/collections'

const router = useRouter()

// 分组列表
const groups = ref<CollectionGroup[]>([])
const loading = ref(false)

// 弹窗状态
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const editingGroup = ref<CollectionGroup | null>(null)
const groupForm = ref({ name: '', icon: '' })

// 图标选项
const iconOptions = [
  { name: '默认', value: '' },
  { name: '收藏', value: 'star' },
  { name: '想去', value: 'like' },
  { name: '已去', value: 'checked' },
  { name: '推荐', value: 'good-job' },
]

// 加载分组列表
async function loadGroups() {
  loading.value = true
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0,
  })

  try {
    const res = await getCollectionGroups()
    if (res.code === 0 && res.data) {
      groups.value = res.data
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

// 打开创建弹窗
function openCreateDialog() {
  editingGroup.value = null
  groupForm.value = { name: '', icon: '' }
  showCreateDialog.value = true
}

// 打开编辑弹窗
function openEditDialog(group: CollectionGroup) {
  editingGroup.value = group
  groupForm.value = { name: group.name, icon: group.icon || '' }
  showEditDialog.value = true
}

// 保存分组
async function saveGroup() {
  if (!groupForm.value.name.trim()) {
    showToast('请输入分组名称')
    return
  }

  try {
    if (editingGroup.value) {
      await updateCollectionGroup(editingGroup.value.id, {
        name: groupForm.value.name,
        icon: groupForm.value.icon,
      })
      showToast('修改成功')
      showEditDialog.value = false
    } else {
      await createCollectionGroup({
        name: groupForm.value.name,
        icon: groupForm.value.icon,
      })
      showToast('创建成功')
      showCreateDialog.value = false
    }
    await loadGroups()
  } catch (error) {
    showToast('操作失败')
  }
}

// 删除分组
async function deleteGroup(group: CollectionGroup) {
  try {
    await showConfirmDialog({
      title: '删除分组',
      message: `确定删除分组"${group.name}"吗？分组内的收藏将被移到"全部"。`,
    })
    await deleteCollectionGroup(group.id)
    showToast('删除成功')
    await loadGroups()
  } catch (error) {
    // 用户取消
  }
}

// 查看分组收藏
function viewGroup(group: CollectionGroup) {
  router.push({
    path: '/user/favorites',
    query: { groupId: group.id.toString() }
  })
}

// 返回
function goBack() {
  router.back()
}

onMounted(() => {
  loadGroups()
})
</script>

<template>
  <div class="groups-page">
    <van-nav-bar
      title="收藏分组"
      left-arrow
      @click-left="goBack"
    >
      <template #right>
        <van-icon name="plus" size="20" @click="openCreateDialog" />
      </template>
    </van-nav-bar>

    <div class="page-content">
      <!-- 分组列表 -->
      <div v-if="groups.length > 0" class="groups-list">
        <div
          v-for="group in groups"
          :key="group.id"
          class="group-item"
          @click="viewGroup(group)"
        >
          <div class="group-icon">
            <van-icon :name="group.icon || 'folder-o'" size="24" />
          </div>
          <div class="group-info">
            <div class="group-name">{{ group.name }}</div>
            <div class="group-count">{{ group.count }} 个收藏</div>
          </div>
          <div class="group-actions" @click.stop>
            <van-icon name="edit" class="action-icon" @click="openEditDialog(group)" />
            <van-icon name="delete-o" class="action-icon delete" @click="deleteGroup(group)" />
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <van-empty v-else description="还没有创建分组">
        <van-button type="primary" round @click="openCreateDialog">
          创建分组
        </van-button>
      </van-empty>
    </div>

    <!-- 创建分组弹窗 -->
    <van-dialog
      v-model:show="showCreateDialog"
      title="新建分组"
      show-cancel-button
      @confirm="saveGroup"
    >
      <div class="dialog-content">
        <van-field
          v-model="groupForm.name"
          label="分组名称"
          placeholder="请输入分组名称"
          maxlength="20"
        />
        <div class="icon-selector">
          <div class="selector-label">分组图标</div>
          <div class="icon-options">
            <div
              v-for="icon in iconOptions"
              :key="icon.value"
              class="icon-option"
              :class="{ active: groupForm.icon === icon.value }"
              @click="groupForm.icon = icon.value"
            >
              <van-icon :name="icon.value || 'folder-o'" size="20" />
              <span>{{ icon.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </van-dialog>

    <!-- 编辑分组弹窗 -->
    <van-dialog
      v-model:show="showEditDialog"
      title="编辑分组"
      show-cancel-button
      @confirm="saveGroup"
    >
      <div class="dialog-content">
        <van-field
          v-model="groupForm.name"
          label="分组名称"
          placeholder="请输入分组名称"
          maxlength="20"
        />
        <div class="icon-selector">
          <div class="selector-label">分组图标</div>
          <div class="icon-options">
            <div
              v-for="icon in iconOptions"
              :key="icon.value"
              class="icon-option"
              :class="{ active: groupForm.icon === icon.value }"
              @click="groupForm.icon = icon.value"
            >
              <van-icon :name="icon.value || 'folder-o'" size="20" />
              <span>{{ icon.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<style lang="scss" scoped>
.groups-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.page-content {
  padding: 12px;
}

.groups-list {
  .group-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background-color: #fff;
    border-radius: 12px;
    margin-bottom: 12px;
    cursor: pointer;

    .group-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: #e3f2fd;
      color: #1989fa;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .group-info {
      flex: 1;

      .group-name {
        font-size: 16px;
        font-weight: 600;
        color: #323233;
        margin-bottom: 4px;
      }

      .group-count {
        font-size: 13px;
        color: #969799;
      }
    }

    .group-actions {
      display: flex;
      gap: 16px;

      .action-icon {
        font-size: 18px;
        color: #969799;
        cursor: pointer;
        padding: 4px;

        &:hover {
          color: #646566;
        }

        &.delete:hover {
          color: #ee0a24;
        }
      }
    }
  }
}

.dialog-content {
  padding: 16px;

  .icon-selector {
    margin-top: 16px;

    .selector-label {
      font-size: 14px;
      color: #646566;
      margin-bottom: 12px;
    }

    .icon-options {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;

      .icon-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 12px;
        border-radius: 8px;
        background-color: #f7f8fa;
        cursor: pointer;
        min-width: 60px;

        &.active {
          background-color: #e3f2fd;
          color: #1989fa;
        }

        span {
          font-size: 12px;
        }
      }
    }
  }
}
</style>
