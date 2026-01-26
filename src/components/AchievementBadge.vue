<template>
  <div
    class="relative inline-flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-300"
    :class="badgeClass"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- 解锁动画 -->
    <Transition name="unlock">
      <div
        v-if="achievement.unlockedAt && showUnlockAnimation"
        class="absolute inset-0 flex items-center justify-center bg-yellow-400/90 rounded-lg z-10"
      >
        <div class="text-4xl animate-bounce">✨</div>
      </div>
    </Transition>
    
    <!-- 图标 -->
    <div class="text-4xl mb-2">{{ achievement.icon }}</div>
    
    <!-- 名称 -->
    <div class="text-sm font-semibold text-center mb-1" :class="textClass">
      {{ achievement.name }}
    </div>
    
    <!-- 描述 -->
    <div class="text-xs text-center mb-2" :class="descriptionClass">
      {{ achievement.description }}
    </div>
    
    <!-- 进度条（未解锁时显示） -->
    <div v-if="!achievement.unlockedAt" class="w-full">
      <div class="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div
          class="h-full rounded-full bg-blue-500 transition-all duration-500"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
      <div class="text-xs text-center mt-1 text-gray-600">
        {{ achievement.progress }} / {{ achievement.maxProgress }}
      </div>
    </div>
    
    <!-- 解锁时间（已解锁时显示） -->
    <div v-else class="text-xs text-gray-500">
      {{ unlockDate }}
    </div>
    
    <!-- 悬停提示 -->
    <Transition name="tooltip">
      <div
        v-if="isHovered && achievement.unlockedAt"
        class="absolute bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-20"
      >
        解锁于 {{ unlockDate }}
        <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Achievement } from '../utils/storageUtils'

const props = defineProps<{
  achievement: Achievement
  showUnlockAnimation?: boolean
}>()

const emit = defineEmits<{
  'animation-end': []
}>()

const isHovered = ref(false)
const showUnlockAnimation = ref(props.showUnlockAnimation || false)

watch(() => props.showUnlockAnimation, (newVal) => {
  if (newVal) {
    showUnlockAnimation.value = true
    setTimeout(() => {
      showUnlockAnimation.value = false
      emit('animation-end')
    }, 2000)
  }
})

const progressPercentage = computed(() => {
  if (props.achievement.maxProgress === 0) return 0
  return Math.min((props.achievement.progress / props.achievement.maxProgress) * 100, 100)
})

const badgeClass = computed(() => {
  if (props.achievement.unlockedAt) {
    return 'border-yellow-400 bg-yellow-50 shadow-md'
  }
  return 'border-gray-300 bg-gray-50 opacity-60'
})

const textClass = computed(() => {
  return props.achievement.unlockedAt ? 'text-gray-900' : 'text-gray-600'
})

const descriptionClass = computed(() => {
  return props.achievement.unlockedAt ? 'text-gray-700' : 'text-gray-500'
})

const unlockDate = computed(() => {
  if (!props.achievement.unlockedAt) return ''
  const date = new Date(props.achievement.unlockedAt)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
})
</script>

<style scoped>
.unlock-enter-active,
.unlock-leave-active {
  transition: opacity 0.3s ease;
}

.unlock-enter-from,
.unlock-leave-to {
  opacity: 0;
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateY(5px);
}
</style>
