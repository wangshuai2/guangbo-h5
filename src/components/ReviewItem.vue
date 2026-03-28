<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import RatingStars from './RatingStars.vue'

interface Review {
  id: number
  userId: number
  userNickname: string
  userAvatar: string
  museumId: number
  score: number
  content: string
  images?: string[]
  likes: number
  isLiked: boolean
  createdAt: string
}

interface Props {
  review: Review
}

const props = defineProps<Props>()

const emit = defineEmits<{
  like: [reviewId: number]
  click: [review: Review]
}>()

const formattedDate = computed(() => {
  return dayjs(props.review.createdAt).format('YYYY-MM-DD HH:mm')
})

const displayImages = computed(() => {
  return props.review.images?.slice(0, 3) || []
})

function handleLike() {
  emit('like', props.review.id)
}

function handleClick() {
  emit('click', props.review)
}
</script>

<template>
  <div class="review-item" @click="handleClick">
    <div class="review-header">
      <van-image
        :src="review.userAvatar"
        width="40"
        height="40"
        round
        fit="cover"
      />
      <div class="user-info">
        <div class="nickname">{{ review.userNickname }}</div>
        <div class="meta">
          <RatingStars :model-value="review.score" readonly size="small" />
          <span class="date">{{ formattedDate }}</span>
        </div>
      </div>
    </div>

    <div class="review-content">
      {{ review.content }}
    </div>

    <div v-if="displayImages.length > 0" class="review-images">
      <van-image
        v-for="(image, index) in displayImages"
        :key="index"
        :src="image"
        width="80"
        height="80"
        fit="cover"
        radius="4"
      />
    </div>

    <div class="review-footer">
      <div
        class="like-btn"
        :class="{ liked: review.isLiked }"
        @click.stop="handleLike"
      >
        <van-icon :name="review.isLiked ? 'like' : 'like-o'" />
        <span>{{ review.likes }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.review-item {
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  .user-info {
    flex: 1;

    .nickname {
      font-size: 14px;
      font-weight: 500;
      color: #323233;
      margin-bottom: 4px;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: 8px;

      .date {
        font-size: 12px;
        color: #969799;
      }
    }
  }
}

.review-content {
  font-size: 14px;
  color: #323233;
  line-height: 1.6;
  margin-bottom: 12px;
}

.review-images {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.review-footer {
  display: flex;
  justify-content: flex-end;

  .like-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border-radius: 12px;
    background-color: #f7f8fa;
    font-size: 12px;
    color: #969799;
    cursor: pointer;
    transition: all 0.2s;

    &.liked {
      color: #ff976a;
      background-color: #fff5f0;
    }

    &:hover {
      background-color: #ebedf0;
    }
  }
}
</style>
