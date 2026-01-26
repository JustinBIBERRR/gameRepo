<template>
  <div class="mb-4">
    <label class="block text-sm font-medium text-gray-700 mb-2">
      {{ field.label }}
      <span v-if="field.required" class="text-red-500">*</span>
    </label>
    
    <!-- 字符串类型 -->
    <input
      v-if="field.type === 'string'"
      v-model="localValue"
      type="text"
      :placeholder="field.placeholder"
      :class="inputClass"
      @blur="validate"
    />
    
    <!-- 数字类型 -->
    <input
      v-else-if="field.type === 'number'"
      v-model="numberStringValue"
      type="text"
      :placeholder="field.placeholder"
      :class="inputClass"
      @blur="handleNumberBlur"
      @input="handleNumberInput"
    />
    
    <!-- 布尔类型 -->
    <div v-else-if="field.type === 'boolean'" class="flex items-center">
      <input
        v-model="localValue"
        type="checkbox"
        class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <span class="ml-2 text-sm text-gray-600">{{ field.placeholder || '是/否' }}</span>
    </div>
    
    <!-- 数组类型 -->
    <div v-else-if="field.type === 'array'">
      <div class="space-y-2">
        <div
          v-for="(item, index) in arrayValue"
          :key="index"
          class="flex items-center gap-2"
        >
          <input
            v-model="arrayValue[index]"
            type="text"
            :placeholder="field.placeholder || '输入项'"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @blur="updateArrayValue"
          />
          <button
            @click="removeArrayItem(index)"
            class="px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            删除
          </button>
        </div>
        <button
          @click="addArrayItem"
          class="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          + 添加项
        </button>
      </div>
    </div>
    
    <!-- 选择类型 -->
    <select
      v-else-if="field.type === 'select'"
      v-model="localValue"
      :class="inputClass"
      @change="validate"
    >
      <option value="">{{ field.placeholder || '请选择' }}</option>
      <option
        v-for="option in field.options"
        :key="option"
        :value="option"
      >
        {{ option }}
      </option>
    </select>
    
    <!-- 文件类型 -->
    <div v-else-if="field.type === 'file'" class="space-y-3">
      <!-- 自定义文件上传按钮 -->
      <label
        class="relative inline-flex items-center justify-center w-full px-6 py-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 border-dashed rounded-xl cursor-pointer transition-all duration-200 hover:border-blue-400 hover:shadow-md group"
        :class="error ? 'border-red-300 bg-red-50' : ''"
      >
        <input
          ref="fileInputRef"
          type="file"
          accept="video/mp4,video/*"
          class="hidden"
          @change="handleFileChange"
        />
        <div class="flex flex-col items-center gap-2">
          <svg class="w-10 h-10 text-blue-600 group-hover:text-blue-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <div class="text-center">
            <p class="text-sm font-medium text-blue-700 group-hover:text-blue-800">
              <span v-if="!filePreview">点击选择视频文件</span>
              <span v-else>更换文件</span>
            </p>
            <p class="text-xs text-gray-500 mt-1">
              {{ field.placeholder || '支持 MP4 格式' }}
            </p>
          </div>
        </div>
      </label>
      
      <!-- 文件预览 -->
      <div v-if="filePreview" class="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <div class="flex-shrink-0">
              <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ filePreview.name }}</p>
              <p class="text-xs text-gray-600 mt-1">{{ formatFileSize(filePreview.size) }}</p>
            </div>
          </div>
          <button
            type="button"
            @click="clearFile"
            class="ml-3 flex-shrink-0 px-3 py-2 text-sm font-medium text-red-600 bg-white hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-lg transition-colors"
          >
            清除
          </button>
        </div>
      </div>
    </div>
    
    <!-- 错误提示 -->
    <p v-if="error" class="mt-1 text-sm text-red-600">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { FieldSchema } from '../../schemas/types'
import { validateField } from '../../schemas/types'

const props = defineProps<{
  field: FieldSchema
  modelValue: any
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const arrayValue = ref<string[]>(Array.isArray(props.modelValue) ? [...props.modelValue] : [])

// 数字类型的字符串值（用于输入框显示）
const numberStringValue = ref<string>(
  props.field.type === 'number' 
    ? (props.modelValue !== null && props.modelValue !== undefined ? String(props.modelValue) : '')
    : ''
)

const error = ref<string | null>(null)
const filePreview = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const inputClass = computed(() => {
  const base = 'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors'
  return error.value
    ? `${base} border-red-300`
    : `${base} border-gray-300`
})

function validate() {
  let value: any
  if (props.field.type === 'array') {
    value = arrayValue.value
  } else if (props.field.type === 'file') {
    value = filePreview.value || props.modelValue
  } else {
    value = localValue.value
  }
  const fieldError = validateField(props.field, value)
  error.value = fieldError
  return fieldError === null
}

function handleNumberInput(event: Event) {
  const target = event.target as HTMLInputElement
  numberStringValue.value = target.value
}

function handleNumberBlur() {
  // 尝试转换为数字
  const strValue = numberStringValue.value.trim()
  if (strValue === '') {
    if (props.field.required) {
      error.value = `${props.field.label}不能为空`
      return
    }
    emit('update:modelValue', 0)
    return
  }
  
  const numValue = parseFloat(strValue)
  if (isNaN(numValue)) {
    error.value = `${props.field.label}必须是数字`
    return
  }
  
  // 更新值并验证
  emit('update:modelValue', numValue)
  validate()
}

function updateArrayValue() {
  emit('update:modelValue', [...arrayValue.value])
  validate()
}

function addArrayItem() {
  arrayValue.value.push('')
  updateArrayValue()
}

function removeArrayItem(index: number) {
  arrayValue.value.splice(index, 1)
  updateArrayValue()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    filePreview.value = file
    emit('update:modelValue', file)
    validate()
  }
}

function clearFile() {
  filePreview.value = null
  emit('update:modelValue', null)
  // 重置文件输入
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
  validate()
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

watch(() => props.modelValue, (newValue) => {
  if (props.field.type === 'array') {
    if (Array.isArray(newValue)) {
      arrayValue.value = [...newValue]
    } else {
      arrayValue.value = []
    }
  } else if (props.field.type === 'number') {
    // 更新数字字符串值
    numberStringValue.value = newValue !== null && newValue !== undefined ? String(newValue) : ''
  } else if (props.field.type === 'file') {
    // 更新文件预览
    if (newValue instanceof File) {
      filePreview.value = newValue
    } else {
      filePreview.value = null
    }
  }
}, { immediate: true })

// 初始化时验证（延迟执行，避免在组件挂载前验证）
watch(() => props.field, () => {
  if (props.modelValue !== undefined) {
    validate()
  }
}, { immediate: true })
</script>
