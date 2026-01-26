<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <FormField
      v-for="field in displayFields"
      :key="field.key"
      :field="field"
      v-model="formData[field.key]"
    />
    
    <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        取消
      </button>
      <button
        type="submit"
        :disabled="!isValid"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
      >
        保存
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import FormField from './FormField.vue'
import type { GameDataSchema } from '../../schemas/types'
import { validateData } from '../../schemas/types'

const props = defineProps<{
  schema: GameDataSchema
  initialData?: Record<string, any>
}>()

const emit = defineEmits<{
  submit: [data: Record<string, any>]
  cancel: []
}>()

const formData = ref<Record<string, any>>({})
const fieldErrors = ref<Record<string, string>>({})

// 显示所有字段
const displayFields = computed(() => props.schema.fields)

// 初始化表单数据
function initFormData() {
  const data: Record<string, any> = {}
  // 初始化所有字段（包括不显示的字段），但只显示 displayFields
  for (const field of props.schema.fields) {
    if (props.initialData && props.initialData[field.key] !== undefined) {
      data[field.key] = props.initialData[field.key]
    } else {
      // 设置默认值
      switch (field.type) {
        case 'string':
          data[field.key] = ''
          break
        case 'number':
          data[field.key] = 0
          break
        case 'boolean':
          data[field.key] = false
          break
        case 'array':
          data[field.key] = []
          break
        case 'select':
          data[field.key] = ''
          break
        case 'file':
          data[field.key] = null
          break
      }
    }
  }
  formData.value = data
}

const isValid = computed(() => {
  const result = validateData(props.schema, formData.value)
  return result.valid && Object.keys(fieldErrors.value).length === 0
})

// 验证所有字段
function validateAllFields() {
  fieldErrors.value = {}
  const result = validateData(props.schema, formData.value)
  if (!result.valid) {
    fieldErrors.value = result.errors
  }
}

function handleSubmit() {
  validateAllFields()
  
  const result = validateData(props.schema, formData.value)
  
  if (!result.valid) {
    fieldErrors.value = result.errors
    return
  }
  
  if (Object.keys(fieldErrors.value).length > 0) {
    return
  }
  
  emit('submit', { ...formData.value })
}

watch(() => props.initialData, () => {
  initFormData()
}, { immediate: true, deep: true })

watch(() => props.schema, () => {
  initFormData()
}, { immediate: true })
</script>
