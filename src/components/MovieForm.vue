<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- 电影ID -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        电影ID <span class="text-red-500">*</span>
      </label>
      <input
        v-model="formData.id"
        type="text"
        :disabled="!!props.movie"
        placeholder="例如：nezha"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="{ 'bg-gray-100 cursor-not-allowed': !!props.movie }"
        required
        pattern="[a-zA-Z0-9_-]+"
      />
      <p class="mt-1 text-xs text-gray-500">
        只能包含字母、数字、下划线和连字符{{ props.movie ? '（编辑时不可修改）' : '' }}
      </p>
    </div>

    <!-- 电影名称 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        电影名称 <span class="text-red-500">*</span>
      </label>
      <input
        v-model="formData.name"
        type="text"
        placeholder="例如：哪吒之魔童降世"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required
        maxlength="100"
      />
    </div>

    <!-- 电影描述 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        电影描述
      </label>
      <textarea
        v-model="formData.description"
        placeholder="例如：国产动画电影，讲述哪吒的成长故事"
        rows="3"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        maxlength="500"
      ></textarea>
      <p class="mt-1 text-xs text-gray-500">
        {{ (formData.description || '').length }}/500 字符
      </p>
    </div>

    <!-- 初始提示 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        提示信息
      </label>
      <input
        v-model="formData.hint"
        type="text"
        placeholder="例如：国产动画、漫威"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        maxlength="50"
      />
      <p class="mt-1 text-xs text-gray-500">
        {{ (formData.hint || '').length }}/50 字符
      </p>
    </div>

    <!-- 视频地址（URL） -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        视频地址（URL）
      </label>
      <input
        v-model="formData.videoUrl"
        type="url"
        placeholder="例如：http://127.0.0.1:8080/mry.mp4（与下方文件二选一）"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <p class="mt-1 text-xs text-gray-500">填写后直接按 URL 加载，无需上传；与下方本地上传二选一。</p>
    </div>

    <!-- 电影文件 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        电影文件（本地上传，与 URL 二选一）
      </label>
      
      <!-- 自定义文件上传按钮 -->
      <label
        class="relative inline-flex items-center justify-center w-full px-6 py-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 border-dashed rounded-xl cursor-pointer transition-all duration-200 hover:border-blue-400 hover:shadow-md group"
        :class="fileError ? 'border-red-300 bg-red-50' : ''"
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
              支持 MP4 格式
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
      
      <!-- 错误提示 -->
      <p v-if="fileError" class="mt-1 text-sm text-red-600">
        {{ fileError }}
      </p>
    </div>

    <!-- 按钮 -->
    <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
      <button
        type="button"
        @click="$emit('cancel')"
        :disabled="props.loading"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        取消
      </button>
      <button
        type="submit"
        :disabled="!isValid || props.loading"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
      >
        <svg
          v-if="props.loading"
          class="animate-spin h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ props.loading ? '保存中...' : '保存' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { UserMovie } from '../utils/movieStorage'

const props = defineProps<{
  movie?: UserMovie | null
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: {
    id: string
    name: string
    description?: string
    hint?: string
    videoUrl?: string
    videoFile?: File
  }]
  cancel: []
}>()

const formData = ref({
  id: '',
  name: '',
  description: '',
  hint: '',
  videoUrl: '',
  videoFile: null as File | null
})

const filePreview = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const fileError = ref<string | null>(null)

const hasVideoSource = computed(() => {
  const url = formData.value.videoUrl.trim()
  const hasUrl = url.length > 0
  const hasFile = formData.value.videoFile !== null
  return hasUrl || hasFile
})

const isValid = computed(() => {
  return (
    formData.value.id.trim() !== '' &&
    formData.value.name.trim() !== '' &&
    hasVideoSource.value &&
    /^[a-zA-Z0-9_-]+$/.test(formData.value.id)
  )
})

// 初始化表单数据
watch(() => props.movie, (movie) => {
  if (movie) {
    formData.value = {
      id: movie.id,
      name: movie.name,
      description: movie.description || '',
      hint: movie.hint || '',
      videoUrl: (movie as { videoUrl?: string }).videoUrl || '',
      videoFile: null // 编辑时不预填文件
    }
  } else {
    formData.value = {
      id: '',
      name: '',
      description: '',
      hint: '',
      videoUrl: '',
      videoFile: null
    }
  }
  filePreview.value = null
  fileError.value = null
}, { immediate: true })

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // 验证文件类型
    if (!file.type.startsWith('video/')) {
      fileError.value = '请选择视频文件'
      return
    }
    
    // 验证文件大小（例如限制为500MB）
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (file.size > maxSize) {
      fileError.value = '文件大小不能超过500MB'
      return
    }
    
    filePreview.value = file
    formData.value.videoFile = file
    fileError.value = null
  }
}

function clearFile() {
  filePreview.value = null
  formData.value.videoFile = null
  fileError.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

function handleSubmit() {
  if (!isValid.value) {
    if (!hasVideoSource.value) {
      fileError.value = '请填写视频地址（URL）或上传视频文件'
    }
    return
  }

  let url = formData.value.videoUrl.trim()
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'http://' + url
  }
  const useUrl = url.length > 0
  if (!useUrl && !formData.value.videoFile) {
    fileError.value = '请填写视频地址（URL）或上传视频文件'
    return
  }

  emit('submit', {
    id: formData.value.id.trim(),
    name: formData.value.name.trim(),
    description: formData.value.description.trim() || undefined,
    hint: formData.value.hint.trim() || undefined,
    videoUrl: useUrl ? url : undefined,
    videoFile: formData.value.videoFile ?? undefined
  })
}
</script>
