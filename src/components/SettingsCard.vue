<template>
  <div
    class="settings-game-card rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col relative group"
    :class="{ 'opacity-60': !visible }"
    @click="handleCardClick"
  >
    <div class="p-5 flex-1 flex flex-col cursor-pointer">
      <div class="flex items-center gap-4">
        <!-- 游戏图标 -->
        <div
          class="flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center"
          :class="iconBgClass"
        >
          <component :is="game.icon" class="w-5 h-5" :class="iconClass" />
        </div>
        <!-- 标题和描述 -->
        <div class="flex-1 min-w-0 pr-12">
          <h3 class="text-base font-bold text-slate-800 mb-0.5">{{ t(game.title) }}</h3>
          <p class="text-slate-600 text-sm leading-snug">{{ game.description }}</p>
        </div>
        <!-- 右侧：可见性切换 + 箭头 -->
        <div class="flex items-center gap-1 shrink-0">
          <button
            class="p-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            :title="visible ? t('settings.hideGame') : t('settings.showGame')"
            @click.stop="toggleVisibility"
          >
            <svg
              v-if="visible"
              class="w-5 h-5 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg
              v-else
              class="w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          </button>
          <svg class="w-4 h-4 text-slate-300 group-hover:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { updateGameVisibility } from '../utils/storageUtils'

const { t } = useI18n()

const props = defineProps<{
  game: {
    title: string
    description: string
    path: string
    icon: () => any
    iconColor?: 'blue' | 'purple' | 'green' | 'orange' | 'red'
  }
  gameType: 'city' | 'hero' | 'movie' | 'visual' | 'listenSong'
  visible: boolean
}>()

const emit = defineEmits<{
  visibilityChange: [gameType: 'city' | 'hero' | 'movie' | 'visual' | 'listenSong', visible: boolean]
}>()

const router = useRouter()

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

function handleCardClick() {
  router.push(props.game.path)
}

function toggleVisibility() {
  const newVisible = !props.visible
  updateGameVisibility(props.gameType, newVisible)
  emit('visibilityChange', props.gameType, newVisible)
}
</script>

