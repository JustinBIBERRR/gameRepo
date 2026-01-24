<template>
  <div class="relative">
    <input
      v-model="inputValue"
      @input="handleInput"
      @focus="showSuggestions = true"
      @blur="handleBlur"
      @keydown.enter.prevent="selectFirst"
      @keydown.arrow-down.prevent="navigateDown"
      @keydown.arrow-up.prevent="navigateUp"
      type="text"
      :placeholder="placeholder"
      class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
      :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': showError }"
    />
    
    <!-- 下拉建议列表 -->
    <div
      v-if="showSuggestions && (suggestions.length > 0 || showNoMatchMessage)"
      class="autocomplete-dropdown absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
      @mousedown.prevent
    >
      <div
        v-if="suggestions.length === 0 && showNoMatchMessage"
        class="px-4 py-3 text-gray-500 text-sm"
      >
        {{ noMatchMessage }}
      </div>
      <div
        v-for="(suggestion, index) in suggestions"
        :key="index"
        @mousedown="selectSuggestion(suggestion, $event)"
        @mouseenter="selectedIndex = index"
        class="px-4 py-2.5 cursor-pointer hover:bg-blue-50 active:bg-blue-100 transition-colors text-sm"
        :class="{ 'bg-blue-50': selectedIndex === index }"
      >
        {{ suggestion }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  modelValue: string
  suggestions: string[]
  placeholder?: string
  noMatchMessage?: string
  showError?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'select': [value: string]
}>()

const inputValue = ref(props.modelValue)
const showSuggestions = ref(false)
const selectedIndex = ref(-1)

const showNoMatchMessage = computed(() => {
  return props.modelValue.trim() !== '' && props.suggestions.length === 0
})

watch(() => props.modelValue, (newVal) => {
  inputValue.value = newVal
})

function handleInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  inputValue.value = value
  emit('update:modelValue', value)
  showSuggestions.value = true
  selectedIndex.value = -1
}

function handleBlur(event: FocusEvent) {
  // 检查焦点是否移到了下拉列表中
  const relatedTarget = event.relatedTarget as HTMLElement
  if (relatedTarget && relatedTarget.closest('.autocomplete-dropdown')) {
    return // 焦点移到了下拉列表，不隐藏
  }
  // 延迟隐藏，以便点击事件能够触发
  setTimeout(() => {
    showSuggestions.value = false
  }, 150)
}

function selectSuggestion(suggestion: string, event?: MouseEvent) {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  inputValue.value = suggestion
  emit('update:modelValue', suggestion)
  emit('select', suggestion)
  showSuggestions.value = false
  // 确保输入框重新获得焦点
  const input = document.activeElement as HTMLInputElement
  if (input && input.tagName === 'INPUT') {
    input.focus()
  }
}

function selectFirst() {
  if (props.suggestions.length > 0 && selectedIndex.value === -1) {
    selectSuggestion(props.suggestions[0])
  } else if (selectedIndex.value >= 0) {
    selectSuggestion(props.suggestions[selectedIndex.value])
  }
}

function navigateDown() {
  if (props.suggestions.length > 0) {
    selectedIndex.value = Math.min(selectedIndex.value + 1, props.suggestions.length - 1)
  }
}

function navigateUp() {
  if (props.suggestions.length > 0) {
    selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
  }
}
</script>
