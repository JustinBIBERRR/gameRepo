<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="loadingState.visible"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      >
        <div class="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
          <!-- Loading图标 -->
          <div class="flex justify-center mb-4">
            <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
          
          <!-- Loading文字 -->
          <p class="text-center text-gray-700 text-lg font-medium mb-4">
            {{ loadingState.message }}
          </p>
          
          <!-- 进度条 -->
          <div v-if="loadingState.showProgress" class="w-full">
            <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                class="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                :style="{ width: `${loadingState.progress}%` }"
              ></div>
            </div>
            <p class="text-center text-sm text-gray-500 mt-2">
              {{ Math.round(loadingState.progress) }}%
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { loadingState } from '../composables/useLoading'
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
