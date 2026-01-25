<template>
  <div class="flex items-center justify-center mb-4">
    <div
      class="px-4 py-2 rounded-lg font-mono text-2xl font-bold transition-colors"
      :class="{
        'bg-gray-100 text-gray-800': !isWarning,
        'bg-red-100 text-red-600': isWarning
      }"
    >
      <span class="flex items-center gap-2">
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {{ formattedTime }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  formattedTime: string
  isWarning: boolean
}>()
</script>
