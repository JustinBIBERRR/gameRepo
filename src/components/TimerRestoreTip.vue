<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[40%] max-w-md"
    >
      <div class="bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
        <svg
          class="w-6 h-6 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div class="flex-1 text-sm">
          {{ message }}
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

defineProps<{
  message: string
}>()

const show = ref(false)

onMounted(() => {
  show.value = true
  setTimeout(() => {
    show.value = false
  }, 3000)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translate(-50%, -10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}
</style>
