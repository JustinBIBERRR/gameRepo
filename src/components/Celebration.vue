<template>
  <Transition name="celebration">
    <div v-if="show" class="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      <!-- 背景遮罩 -->
      <div class="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      
      <!-- 庆祝内容 -->
      <div class="relative z-10 text-center">
        <!-- 成功动画 -->
        <div v-if="type === 'success'" class="celebration-success">
          <div class="text-8xl mb-4 animate-bounce">🎉</div>
          <h2 class="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            {{ title || '恭喜！' }}
          </h2>
          <p class="text-xl text-white drop-shadow-lg">{{ message }}</p>
          
          <!-- 彩带效果 -->
          <div class="confetti">
            <div v-for="i in 50" :key="i" class="confetti-piece" :style="getConfettiStyle(i)"></div>
          </div>
        </div>
        
        <!-- 失败鼓励 -->
        <div v-else-if="type === 'failure'" class="celebration-failure">
          <div class="text-6xl mb-4 animate-pulse">💪</div>
          <h2 class="text-3xl font-bold text-white mb-2 drop-shadow-lg">
            {{ title || '再试试！' }}
          </h2>
          <p class="text-lg text-white drop-shadow-lg">{{ message }}</p>
        </div>
        
        <!-- 成就解锁 -->
        <div v-else-if="type === 'achievement'" class="celebration-achievement">
          <div class="text-7xl mb-4 animate-bounce">{{ icon }}</div>
          <h2 class="text-3xl font-bold text-white mb-2 drop-shadow-lg">
            {{ title || '成就解锁！' }}
          </h2>
          <p class="text-lg text-white drop-shadow-lg">{{ message }}</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">

const props = withDefaults(defineProps<{
  show: boolean
  type: 'success' | 'failure' | 'achievement'
  title?: string
  message?: string
  icon?: string
  duration?: number // 显示时长（毫秒）
}>(), {
  duration: 2000
})

const emit = defineEmits<{
  'close': []
}>()

const show = ref(props.show)

watch(() => props.show, (newVal) => {
  show.value = newVal
  if (newVal && props.duration > 0) {
    setTimeout(() => {
      show.value = false
      emit('close')
    }, props.duration)
  }
})

function getConfettiStyle(index: number) {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7']
  const color = colors[index % colors.length]
  const delay = Math.random() * 0.5
  const duration = 1 + Math.random() * 2
  const x = Math.random() * 100
  
  return {
    backgroundColor: color,
    left: `${x}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}
</script>

<style scoped>
.celebration-enter-active,
.celebration-leave-active {
  transition: opacity 0.3s ease;
}

.celebration-enter-from,
.celebration-leave-to {
  opacity: 0;
}

.confetti {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.confetti-piece {
  position: absolute;
  width: 10px;
  height: 10px;
  top: -10px;
  animation: confetti-fall linear infinite;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.celebration-success {
  animation: scale-in 0.3s ease-out;
}

.celebration-failure {
  animation: scale-in 0.3s ease-out;
}

.celebration-achievement {
  animation: scale-in 0.3s ease-out;
}

@keyframes scale-in {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
