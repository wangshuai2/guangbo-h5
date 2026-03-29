<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: number
  readonly?: boolean
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  size: 'medium'
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const sizeMap = {
  small: 16,
  medium: 24,
  large: 32
}

const starSize = computed(() => sizeMap[props.size])

const stars = computed(() => {
  return [1, 2, 3, 4, 5].map((star) => ({
    value: star,
    filled: star <= props.modelValue,
    half: star === Math.ceil(props.modelValue) && props.modelValue % 1 !== 0
  }))
})

function handleClick(value: number) {
  if (props.readonly) return
  emit('update:modelValue', value)
}

function getStarClass(star: { filled: boolean; half: boolean }) {
  if (star.filled) return 'filled'
  if (star.half) return 'half'
  return 'empty'
}
</script>

<template>
  <div class="rating-stars" :class="{ readonly }">
    <div
      v-for="star in stars"
      :key="star.value"
      class="star-item"
      :class="getStarClass(star)"
      @click="handleClick(star.value)"
    >
      <van-icon
        name="star"
        :size="starSize"
        :color="star.filled || star.half ? '#ff976a' : '#ebedf0'"
      />
    </div>
    <span v-if="!readonly && modelValue > 0" class="rating-text">
      {{ modelValue }} 分
    </span>
  </div>
</template>

<style lang="scss" scoped>
.rating-stars {
  display: flex;
  align-items: center;
  gap: 4px;

  &.readonly {
    .star-item {
      cursor: default;
    }
  }
}

.star-item {
  cursor: pointer;
  transition: transform 0.2s;

  &:hover:not(.readonly) {
    transform: scale(1.2);
  }

  &.filled {
    .van-icon {
      color: #ff976a;
    }
  }

  &.empty {
    .van-icon {
      color: #ebedf0;
    }
  }
}

.rating-text {
  margin-left: 8px;
  font-size: 14px;
  color: #ff976a;
  font-weight: 500;
}
</style>
