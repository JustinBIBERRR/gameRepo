<template>
  <div class="movie-data-manager">
    <!-- 工具栏 -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索电影..."
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <span class="text-sm text-gray-600">
          显示 {{ filteredMovies.length }} / {{ movies.length }} 部电影
        </span>
      </div>
      <button
        @click="handleAddMovie"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        新增电影
      </button>
    </div>

    <!-- 电影列表表格 -->
    <div class="w-full overflow-x-auto border border-gray-200 rounded-lg">
      <table class="w-full divide-y divide-gray-200" style="table-layout: auto; width: 100%;">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              电影名称
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              描述
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              提示信息
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              文件状态
            </th>
            <th class="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-24">
              操作
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="movie in filteredMovies"
            :key="movie.id"
            class="hover:bg-gray-50"
          >
            <td class="px-4 py-3 text-sm font-medium text-gray-900">
              {{ movie.name }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">
              <div class="max-w-xs truncate" :title="movie.description || '-'">
                {{ movie.description || '-' }}
              </div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">
              {{ movie.hint || '-' }}
            </td>
            <td class="px-4 py-3 text-sm">
              <span
                v-if="loadingMovies[movie.id]"
                class="inline-flex items-center gap-1 text-blue-600"
              >
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                加载中...
              </span>
              <span
                v-else-if="fileStatus[movie.id] === 'ready'"
                class="inline-flex items-center gap-1 text-green-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                已就绪
              </span>
              <span
                v-else-if="fileStatus[movie.id] === 'error'"
                class="inline-flex items-center gap-1 text-red-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                加载失败
              </span>
              <span v-else class="text-gray-400">未上传</span>
            </td>
            <td class="px-3 py-3 text-right text-sm font-medium w-24">
              <div class="flex items-center justify-end gap-2 whitespace-nowrap">
                <button
                  @click="handleEditMovie(movie)"
                  class="text-blue-600 hover:text-blue-900 flex-shrink-0 px-1"
                >
                  编辑
                </button>
                <button
                  @click="handleDeleteMovie(movie.id)"
                  class="text-red-600 hover:text-red-900 flex-shrink-0 px-1"
                >
                  删除
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredMovies.length === 0">
            <td :colspan="5" class="px-4 py-8 text-center text-gray-500">
              暂无电影数据，点击"新增电影"开始添加
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 电影配置弹窗 -->
    <GlobalModal
      :show="showEditModal"
      @close="closeEditModal"
    >
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900">
          {{ editingMovie ? '编辑电影' : '新增电影' }}
        </h3>
      </template>
      <template #body>
        <MovieForm
          :movie="editingMovie"
          :loading="savingMovie"
          @submit="handleFormSubmit"
          @cancel="closeEditModal"
        />
      </template>
    </GlobalModal>
  </div>
</template>

<script setup lang="ts">
import GlobalModal from './GlobalModal.vue'
import MovieForm from './MovieForm.vue'
import {
  getAllUserMovies,
  deleteUserMovie,
  getUserMovie,
  saveUserMovie,
  getMovieFiles,
  deleteMovieFiles,
  saveMovieFiles
} from '../utils/movieStorage'
import { videoPreloader } from '../utils/videoPreloader'
import { getVideoDuration } from '../utils/videoUtils'
import type { UserMovie } from '../utils/movieStorage'
import { useModal } from '../composables/useModal'

const { confirm: showConfirm, success: showSuccess, error: showError } = useModal()

const movies = ref<UserMovie[]>([])
const searchQuery = ref('')
const showEditModal = ref(false)
const editingMovie = ref<UserMovie | null>(null)
const savingMovie = ref(false)
const loadingMovies = ref<Record<string, boolean>>({})
const fileStatus = ref<Record<string, 'ready' | 'error' | 'loading'>>({})

const filteredMovies = computed(() => {
  if (!searchQuery.value.trim()) {
    return movies.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return movies.value.filter(movie => {
    return (
      movie.name.toLowerCase().includes(query) ||
      (movie.description && movie.description.toLowerCase().includes(query)) ||
      (movie.hint && movie.hint.toLowerCase().includes(query))
    )
  })
})

// 加载电影列表并预加载所有电影文件
async function loadMovies() {
  try {
    movies.value = await getAllUserMovies()
    // 预加载所有电影文件（确保游戏时无需等待）
    await preloadAllMovies()
  } catch (error) {
    console.error('加载电影列表失败:', error)
    showError({
      title: '加载失败',
      message: '无法加载电影列表，请刷新页面重试'
    })
  }
}

// 预加载所有电影文件
async function preloadAllMovies() {
  const preloadPromises = movies.value.map(async (movie) => {
    try {
      const files = await getMovieFiles(movie.id)
      if (files && files.sourceFile) {
        // 设置加载状态
        fileStatus.value[movie.id] = 'loading'
        loadingMovies.value[movie.id] = true
        
        // 检查是否已预加载
        if (videoPreloader.isPreloaded(movie.id)) {
          fileStatus.value[movie.id] = 'ready'
          loadingMovies.value[movie.id] = false
          return
        }
        
        // 预加载视频文件（确保可以0延迟播放）
        try {
          await videoPreloader.preloadVideo(movie.id, files.sourceFile)
          // 预加载完成后更新状态
          fileStatus.value[movie.id] = 'ready'
          loadingMovies.value[movie.id] = false
        } catch (error) {
          console.error(`预加载电影 ${movie.id} 失败:`, error)
          fileStatus.value[movie.id] = 'error'
          loadingMovies.value[movie.id] = false
        }
      } else {
        // 没有文件，标记为未上传
        fileStatus.value[movie.id] = 'loading'
        loadingMovies.value[movie.id] = false
      }
    } catch (error) {
      console.error(`预加载电影 ${movie.id} 失败:`, error)
      fileStatus.value[movie.id] = 'error'
      loadingMovies.value[movie.id] = false
    }
  })
  
  // 等待所有预加载完成
  await Promise.all(preloadPromises)
}

function handleAddMovie() {
  editingMovie.value = null
  showEditModal.value = true
}

function handleEditMovie(movie: UserMovie) {
  editingMovie.value = { ...movie }
  showEditModal.value = true
}

async function handleDeleteMovie(movieId: string) {
  const movie = movies.value.find(m => m.id === movieId)
  const movieName = movie?.name || '该电影'
  
  showConfirm({
    title: '确认删除',
    message: `确定要删除"${movieName}"吗？此操作将删除电影信息和文件，且不可恢复。`,
    confirmText: '删除',
    cancelText: '取消'
  }).then(async (confirmed) => {
    if (confirmed) {
      try {
        // 删除IndexedDB中的文件
        await deleteMovieFiles(movieId)
        // 删除电影信息
        await deleteUserMovie(movieId)
        // 卸载预加载的视频
        videoPreloader.unloadVideo(movieId)
        
        // 重新加载列表以确保数据同步
        await loadMovies()
        
        showSuccess({
          title: '删除成功',
          message: `已删除"${movieName}"`
        })
      } catch (error) {
        console.error('删除电影失败:', error)
        showError({
          title: '删除失败',
          message: '删除电影时发生错误，请重试'
        })
      }
    }
  })
}

async function handleFormSubmit(formData: {
  id: string
  name: string
  description?: string
  hint?: string
  videoFile: File
}) {
  savingMovie.value = true
  const movieId = formData.id
  
  try {
    // 显示加载状态
    loadingMovies.value[movieId] = true
    fileStatus.value[movieId] = 'loading'
    
    // 获取视频时长
    let videoDuration = 0
    try {
      videoDuration = await getVideoDuration(formData.videoFile)
    } catch (error) {
      console.warn('获取视频时长失败，将在预加载后更新:', error)
    }
    
    // 如果正在编辑，先删除旧文件
    if (editingMovie.value) {
      await deleteMovieFiles(movieId)
      videoPreloader.unloadVideo(movieId)
    }
    
    // 保存电影文件到IndexedDB
    await saveMovieFiles({
      movieId: formData.id,
      sourceFile: formData.videoFile,
      selectedAt: Date.now()
    })
    
    // 预加载视频文件（确保可以0延迟播放）
    await videoPreloader.preloadVideo(movieId, formData.videoFile, (progress) => {
      // 可以在这里显示进度，但为了简洁，我们只显示加载状态
      if (progress === 100) {
        fileStatus.value[movieId] = 'ready'
        loadingMovies.value[movieId] = false
      }
    })
    
    // 如果预加载完成，从预加载的视频中获取准确的时长
    if (videoPreloader.isPreloaded(movieId)) {
      const preloadedDuration = videoPreloader.getVideoDuration(movieId)
      if (preloadedDuration && preloadedDuration > 0) {
        videoDuration = preloadedDuration
      }
    }
    
    // 保存电影信息到IndexedDB（包含时长）
    const movieData: UserMovie = {
      id: formData.id,
      name: formData.name,
      description: formData.description,
      hint: formData.hint,
      nameVariants: [],
      duration: Math.floor(videoDuration), // 保存为整数秒
      createdAt: editingMovie.value?.createdAt || Date.now()
    }
    
    // 保存电影信息
    await saveUserMovie(movieData)
    
    // 确保预加载完成后更新状态
    if (videoPreloader.isPreloaded(movieId)) {
      fileStatus.value[movieId] = 'ready'
      loadingMovies.value[movieId] = false
    } else {
      // 如果预加载失败，标记为错误
      fileStatus.value[movieId] = 'error'
      loadingMovies.value[movieId] = false
    }
    
    // 刷新列表
    await loadMovies()
    
    showSuccess({
      title: editingMovie.value ? '更新成功' : '添加成功',
      message: editingMovie.value ? '电影信息已更新' : '电影已添加'
    })
    
    closeEditModal()
  } catch (error) {
    console.error('保存电影失败:', error)
    loadingMovies.value[movieId] = false
    fileStatus.value[movieId] = 'error'
    showError({
      title: '保存失败',
      message: '保存电影时发生错误，请重试'
    })
  } finally {
    savingMovie.value = false
  }
}

function closeEditModal() {
  showEditModal.value = false
  editingMovie.value = null
}

onMounted(() => {
  loadMovies()
})
</script>

<style scoped>
.movie-data-manager {
  @apply w-full;
}
</style>
