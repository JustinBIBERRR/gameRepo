<template>
  <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full flex flex-col">
    <div class="p-6 flex-1 flex flex-col">
      <div class="flex items-start gap-4 mb-4">
        <!-- 游戏图标 -->
        <div class="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
          :class="iconBgClass">
          <component :is="game.icon" class="w-6 h-6" :class="iconClass" />
        </div>
        <!-- 标题和描述 -->
        <div class="flex-1 min-w-0">
          <h3 class="text-xl font-bold text-gray-900 mb-2">{{ game.title }}</h3>
          <p class="text-gray-600 text-sm leading-relaxed">{{ game.description }}</p>
        </div>
      </div>
      <!-- 开始游戏按钮 - 固定在底部 -->
      <div class="mt-auto pt-4">
        <router-link
          :to="game.path"
          class="block w-full text-center bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px] flex items-center justify-center"
        >
          开始游戏
          <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  game: {
    title: string
    description: string
    path: string
    icon: () => any
    iconColor?: 'blue' | 'purple' | 'green' | 'orange' | 'red'
  }
}>()

const iconBgClass = computed(() => {
  const colors = {
    blue: 'bg-blue-100',
    purple: 'bg-purple-100',
    green: 'bg-green-100',
    orange: 'bg-orange-100',
    red: 'bg-red-100'
  }
  return colors[props.game.iconColor || 'blue']
})

const iconClass = computed(() => {
  const colors = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    red: 'text-red-600'
  }
  return colors[props.game.iconColor || 'blue']
})
</script>
