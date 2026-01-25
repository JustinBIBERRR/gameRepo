<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden">
    <!-- 标题栏 -->
    <button
      @click="toggle"
      class="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
      :aria-expanded="isOpen"
      :aria-controls="`collapse-content-${id}`"
    >
      <span class="text-lg font-medium text-gray-900">{{ title }}</span>
      <svg
        class="w-5 h-5 text-gray-600 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <!-- 内容区域 -->
    <Transition name="collapse">
      <div
        v-if="isOpen"
        :id="`collapse-content-${id}`"
        class="border-t border-gray-200 bg-white"
      >
        <div class="p-4">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  title: string
  defaultOpen?: boolean
}>()

const id = Math.random().toString(36).substring(7)
const isOpen = ref(props.defaultOpen ?? false)

function toggle() {
  isOpen.value = !isOpen.value
}

defineExpose({
  toggle,
  isOpen
})
</script>

<style scoped>
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  max-height: 1000px;
  opacity: 1;
}
</style>
