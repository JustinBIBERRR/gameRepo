<template>
  <div
    class="fixed right-6 z-40"
    :style="{ bottom: bottomPx + 'px' }"
  >
    <!-- 同一父级：hover 整块区域时展开，鼠标在主图标与子图标间移动不会收起 -->
    <div
      class="relative w-[140px] h-[140px]"
      @mouseenter="subIconsVisible = true"
      @mouseleave="onParentLeave"
    >
      <!-- 弧形子图标（奖励、惩罚、抽人） -->
      <Transition name="arc">
        <div
          v-if="subIconsVisible"
          class="absolute right-0 bottom-0 pointer-events-auto"
          style="width: 140px; height: 140px;"
        >
          <button
            v-for="(item, i) in subIcons"
            :key="item.type"
            type="button"
            class="absolute w-11 h-11 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:scale-110 transition-transform z-10"
            :style="subIconStyle(i)"
            :title="item.label"
            @click.stop="openDraw(item.type)"
          >
            <component :is="item.icon" class="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </Transition>
      <!-- 主图标：可沿右侧上下拖动，点击展开/收起 -->
      <button
        type="button"
        class="absolute right-0 bottom-0 w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-20 select-none cursor-grab active:cursor-grabbing"
        :title="'年会抽奖（可上下拖动）'"
        @mousedown.prevent="startDrag"
        @click.stop="onMainClick"
      >
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true">
          <path d="M43.72 13.844L18.155 64.97c27.97 13.658 58.89 24.446 91.53 32.436l-89.53 393.438H123.5l41.25-373.438l1.03-9.437l9.44 1.186c52.986 6.706 108.616 6.364 161.56-.594l9.44-1.218l1.06 9.47l41.25 374.03h103.314L402.156 96.75C433.81 88.828 463.8 78.25 491 64.97l-25.53-51.126c-112.422 54.9-309.332 54.9-421.75 0m286 114.344a659 659 0 0 1-42.783 3.562c-21.804 10.4-32.54 26.267-35.312 54.406c27.25-30.575 55.034-36.127 81.188-29.906l-3.094-28.063zm-147.44.53l-10.03 90.97c8.553-37.432 27.04-73.21 54.875-87.625c-15.038-.6-30.02-1.7-44.844-3.344zm64.97 13.313c-34.87 17.008-72.704 109.172-38.156 162.907c-23.665 3.18-37.152-6.345-43.406-26l-4.313 39.125c9.257 32.188 30.822 44 56.844 44c-12.7 21.47-47.05 23.77-62.94 11.188l-1.655 15.188c10.71 28.704 37.626 43.795 74.344 42.093c-18.365 23.685-30.833 24.123-63.064 14c39.07 48.74 103.567 18.582 119.125-31.53c13.896 22.31-2.982 63.977-44.374 67.75c82.914 13.18 105.38-62.936 57.125-124.406c21.172 2.414 47.277 11.1 62.314 38.312l-10.813-98.22c-25.328-31.6-75.52-19.695-66.56-46.373c4.55-13.55 34.584-16.545 42.03 11.093c12.44-41.053-37.255-49.697-52.563-29.78c16.442-29.484 50.19-27.943 69.125-7.157l-5.03-45.5c-33.345-13.155-72.762 8.446-89.188 52.655c-12.81-21.176-21.274-66.546 1.156-89.344zm92.03 255.22c9.187 42.963-7.44 81.635-44.81 93l75.217.25L363 429.875c-7.54-14.486-14.178-24.364-23.72-32.625zm-192.467 52.78l-4.5 40.845h67.843c-27.745-8.302-48.728-18.543-63.344-40.844z"/>
        </svg>
      </button>
    </div>
    <PartyDrawModal
      v-if="drawModalOpen"
      :mode="drawMode"
      @close="drawModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { useI18n } from 'vue-i18n'
import PartyDrawModal from './PartyDrawModal.vue'
import { getPartyPersonnel, getPartyRewardsPunishments } from '../utils/storageUtils'
import { useModal } from '../composables/useModal'

const { t } = useI18n()
const { alert: showAlert } = useModal()

const subIconsVisible = ref(false)
const drawModalOpen = ref(false)
const drawMode = ref<'draw-person' | 'reward-only' | 'punishment-only'>('draw-person')
let leaveTimer: number | null = null

// 沿右侧上下拖动：距视口底部的距离（px）
const bottomPx = ref(24)
const DRAG_MIN_BOTTOM = 24
const DRAG_MAX_BOTTOM = 400
let dragStartY = 0
let dragStartBottom = 0
let isDragging = false
let justDragged = false

function startDrag(e: MouseEvent) {
  isDragging = false
  justDragged = false
  dragStartY = e.clientY
  dragStartBottom = bottomPx.value
  window.addEventListener('mousemove', onDragMove)
  window.addEventListener('mouseup', onDragEnd)
}

function onDragMove(e: MouseEvent) {
  const dy = dragStartY - e.clientY
  if (!isDragging && Math.abs(dy) > 4) isDragging = true
  const maxBottom = Math.min(DRAG_MAX_BOTTOM, window.innerHeight - 80)
  const next = dragStartBottom + dy
  bottomPx.value = Math.max(DRAG_MIN_BOTTOM, Math.min(maxBottom, next))
}

function onDragEnd() {
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
  if (isDragging) justDragged = true
}

function onMainClick() {
  if (justDragged) {
    justDragged = false
    return
  }
  toggleSubIcons()
}

const subIcons = [
  {
    type: 'reward-only' as const,
    label: '奖励',
    icon: () => h('svg', { class: 'w-5 h-5 text-green-600', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
    ])
  },
  {
    type: 'punishment-only' as const,
    label: '惩罚',
    icon: () => h('svg', { class: 'w-5 h-5 text-red-600', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
    ])
  },
  {
    type: 'draw-person' as const,
    label: '抽人',
    icon: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' })
    ])
  }
]

// 弧形：1/4 圆（90°）上均匀分布 3 个子图标，弧半径约为主按钮半径 + 5px 间距
function subIconStyle(index: number) {
  const mainRadius = 28       // 主按钮 w-14 的一半
  const subHalf = 22          // 子图标 w-11 的一半
  const gap = 5
  const radius = mainRadius + gap + subHalf  // 约 55px，子图标中心距主按钮中心 5px 外
  const totalArc = Math.PI / 2               // 1/4 圆 = 90°
  const count = subIcons.length
  const step = count > 1 ? totalArc / (count - 1) : 0
  const angle = Math.PI / 2 + index * step  // 从正上方 π/2 到正左方 π 均匀分布
  const x = radius * Math.cos(angle)
  const y = -radius * Math.sin(angle)
  const centerRight = mainRadius
  const centerBottom = mainRadius
  return {
    right: `${centerRight - x - subHalf}px`,
    bottom: `${centerBottom - y - subHalf}px`
  }
}

function onParentLeave() {
  leaveTimer = window.setTimeout(() => {
    subIconsVisible.value = false
    leaveTimer = null
  }, 200)
}

function toggleSubIcons() {
  subIconsVisible.value = !subIconsVisible.value
  if (leaveTimer) {
    clearTimeout(leaveTimer)
    leaveTimer = null
  }
}

function openDraw(type: 'draw-person' | 'reward-only' | 'punishment-only') {
  subIconsVisible.value = false
  if (type === 'draw-person') {
    const list = getPartyPersonnel()
    if (list.length < 3) {
      showAlert({ title: t('party.configInsufficientTitle'), message: t('party.configInsufficientPeople') })
      return
    }
  } else {
    const list = getPartyRewardsPunishments()
    const filtered = list.filter((i) => i.type === (type === 'reward-only' ? 'reward' : 'punishment'))
    if (filtered.length < 3) {
      showAlert({
        title: t('party.configInsufficientTitle'),
        message: type === 'reward-only' ? t('party.configInsufficientRewards') : t('party.configInsufficientPunishments')
      })
      return
    }
  }
  drawMode.value = type
  drawModalOpen.value = true
}
</script>

<style scoped>
.arc-enter-active,
.arc-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.arc-enter-from,
.arc-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
