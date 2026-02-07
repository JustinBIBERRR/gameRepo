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
      <div class="flex gap-2 items-center">
        <button
          v-if="movies.length === 0"
          :disabled="importingDefaults"
          @click="handleImportDefaults"
          class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          导入默认数据
        </button>
        <div v-if="importingDefaults" class="flex items-center gap-2 text-sm text-blue-600">
          <div class="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
          <span>{{ importProgressText }}</span>
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
    </div>

    <!-- 导入中遮罩 -->
    <div
      v-if="importingDefaults"
      class="flex flex-col items-center justify-center py-12 px-4 rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/80 mb-6"
    >
      <div class="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent mb-3" />
      <p class="text-blue-700 font-medium">{{ importProgressText }}</p>
      <p class="text-sm text-blue-600 mt-1">请稍候，正在写入本地存储...</p>
    </div>

    <!-- 电影列表表格 -->
    <div v-show="!importingDefaults" class="w-full overflow-x-auto border border-gray-200 rounded-lg">
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
                v-else-if="fileStatus[movie.id] === 'default'"
                class="inline-flex items-center gap-1 text-green-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                默认资源
              </span>
              <span
                v-else-if="movie.videoUrl && fileStatus[movie.id] === 'ready'"
                class="inline-flex items-center gap-1 text-blue-600"
                :title="movie.videoUrl"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.172-1.172a4 4 0 00-.5-6.086z" />
                </svg>
                视频地址（URL）
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
                <span v-if="!userMovieIds.has(movie.id)" class="text-gray-400 text-xs mr-1">默认</span>
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
import { getAllMovies, getDefaultMoviesData } from '../utils/movieUtils'
import type { Movie } from '../utils/movieUtils'
import {
  getAllUserMovies,
  getUserMovie,
  deleteUserMovie,
  saveUserMovie,
  getMovieFiles,
  deleteMovieFiles,
  saveMovieFiles
} from '../utils/movieStorage'
import { videoPreloader } from '../utils/videoPreloader'
import { getVideoDuration } from '../utils/videoUtils'
import { getLocalVideoUrl } from '../utils/videoUrlResolver'
import type { UserMovie } from '../utils/movieStorage'
import { useModal } from '../composables/useModal'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { confirm: showConfirm, success: showSuccess, error: showError } = useModal()

const movies = ref<Movie[]>([])
const userMovieIds = ref<Set<string>>(new Set())
const searchQuery = ref('')
const showEditModal = ref(false)
const editingMovie = ref<UserMovie | null>(null)
const savingMovie = ref(false)
const loadingMovies = ref<Record<string, boolean>>({})
const fileStatus = ref<Record<string, 'ready' | 'error' | 'loading' | 'default'>>({})
const importingDefaults = ref(false)
const importProgress = ref({ current: 0, total: 0 })

const importProgressText = computed(() => {
  const { current, total } = importProgress.value
  if (total <= 0) return '正在准备...'
  return `正在导入默认数据 ${current}/${total}...`
})

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

// 加载电影列表（仅用户数据，不再自动回退默认数据；默认通过「导入默认数据」加入）
async function loadMovies() {
  try {
    movies.value = await getAllMovies()
    const userMovies = await getAllUserMovies()
    userMovieIds.value = new Set(userMovies.map((m) => m.id))
    await preloadAllMovies()
  } catch (error) {
    console.error('加载电影列表失败:', error)
    showError({
      title: t('modal.loadFailed'),
      message: t('modal.loadFailedMessage')
    })
  }
}

async function handleImportDefaults() {
  const list = getDefaultMoviesData()
  if (list.length === 0) return
  importingDefaults.value = true
  importProgress.value = { current: 0, total: list.length }
  try {
    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      importProgress.value = { current: i + 1, total: list.length }
      const userMovie: UserMovie = {
        id: item.id,
        name: item.name,
        nameVariants: item.nameVariants ?? [],
        duration: item.duration ?? 0,
        hint: item.hint,
        description: item.description,
        year: item.year,
        createdAt: Date.now()
      }
      if (item.videoUrl) {
        const trimmed = item.videoUrl.trim()
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          // URL 配置：只存地址，不拉取 blob，游戏内直接按 URL 加载
          userMovie.videoUrl = trimmed
          await saveUserMovie(userMovie)
          continue
        }
      }
      await saveUserMovie(userMovie)
      if (item.videoUrl) {
        // 相对路径（如 videos/xx.mp4）：拉取并存入 IndexedDB，保持原有行为
        const url =
          getLocalVideoUrl(item.videoUrl) ||
          `${window.location.origin}${item.videoUrl.startsWith('/') ? item.videoUrl : '/' + item.videoUrl}`
        if (!url) {
          console.warn(`无法解析默认电影视频 URL: ${item.videoUrl}`)
          continue
        }
        try {
          const res = await fetch(url)
          if (res.ok) {
            const blob = await res.blob()
            const file = new File([blob], `${item.id}.mp4`, { type: blob.type || 'video/mp4' })
            await saveMovieFiles({
              movieId: item.id,
              sourceFile: file,
              selectedAt: Date.now()
            })
          }
        } catch (e) {
          console.warn(`导入默认电影 ${item.name} 视频失败:`, e)
        }
      }
    }
    await loadMovies()
    showSuccess({
      title: '已导入',
      message: `已导入 ${list.length} 部默认电影`
    })
  } catch (e) {
    console.error('导入默认数据失败:', e)
    showError({ title: '导入失败', message: '导入默认数据时出错' })
  } finally {
    importingDefaults.value = false
    importProgress.value = { current: 0, total: 0 }
  }
}

// 预加载所有电影文件
async function preloadAllMovies() {
  const preloadPromises = movies.value.map(async (movie) => {
    try {
      // 默认数据中的打包视频（无 IndexedDB 条目）
      if (!userMovieIds.value.has(movie.id) && movie.videoType === 'local' && movie.videoUrl) {
        fileStatus.value[movie.id] = 'default'
        loadingMovies.value[movie.id] = false
        return
      }
      const files = await getMovieFiles(movie.id)
      if (files && files.sourceFile) {
        fileStatus.value[movie.id] = 'loading'
        loadingMovies.value[movie.id] = true
        if (videoPreloader.isPreloaded(movie.id)) {
          fileStatus.value[movie.id] = 'ready'
          loadingMovies.value[movie.id] = false
          return
        }
        try {
          await videoPreloader.preloadVideo(movie.id, files.sourceFile)
          fileStatus.value[movie.id] = 'ready'
          loadingMovies.value[movie.id] = false
        } catch (error) {
          console.error(`预加载电影 ${movie.id} 失败:`, error)
          fileStatus.value[movie.id] = 'error'
          loadingMovies.value[movie.id] = false
        }
      } else if (movie.videoUrl) {
        // URL 配置：按地址预加载，无需 blob
        const url = getLocalVideoUrl(movie.videoUrl)
        if (url) {
          fileStatus.value[movie.id] = 'loading'
          loadingMovies.value[movie.id] = true
          if (videoPreloader.isPreloaded(movie.id)) {
            fileStatus.value[movie.id] = 'ready'
            loadingMovies.value[movie.id] = false
            return
          }
          try {
            await videoPreloader.preloadVideoByUrl(movie.id, url)
            fileStatus.value[movie.id] = 'ready'
            loadingMovies.value[movie.id] = false
          } catch (error) {
            console.error(`预加载电影 ${movie.id}（URL）失败:`, error)
            fileStatus.value[movie.id] = 'error'
            loadingMovies.value[movie.id] = false
          }
        } else {
          fileStatus.value[movie.id] = 'error'
          loadingMovies.value[movie.id] = false
        }
      } else {
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

async function handleEditMovie(movie: Movie | UserMovie) {
  const full = await getUserMovie(movie.id)
  editingMovie.value = full ? { ...full } : { ...movie, nameVariants: movie.nameVariants || [], createdAt: Date.now() }
  showEditModal.value = true
}

async function handleDeleteMovie(movieId: string) {
  const movie = movies.value.find(m => m.id === movieId)
  const movieName = movie?.name || '该电影'

  showConfirm({
    title: t('modal.confirmDelete'),
    message: t('modal.confirmDeleteMovieMessage', { name: movieName }),
    confirmText: t('common.delete'),
    cancelText: t('common.cancel')
  }).then(async (confirmed) => {
    if (confirmed) {
      try {
        await deleteMovieFiles(movieId)
        await deleteUserMovie(movieId)
        // 卸载预加载的视频
        videoPreloader.unloadVideo(movieId)
        
        // 重新加载列表以确保数据同步
        await loadMovies()
        
        showSuccess({
          title: t('modal.deleteSuccess'),
          message: t('modal.deleteSuccessItem', { name: movieName })
        })
      } catch (error) {
        console.error('删除电影失败:', error)
        showError({
          title: t('modal.deleteFailed'),
          message: t('modal.deleteFailedMessage')
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
  videoUrl?: string
  videoFile?: File
}) {
  savingMovie.value = true
  const movieId = formData.id
  const useUrl = Boolean(formData.videoUrl?.trim() && (formData.videoUrl!.startsWith('http://') || formData.videoUrl!.startsWith('https://')))
  const useFile = Boolean(formData.videoFile)

  try {
    loadingMovies.value[movieId] = true
    fileStatus.value[movieId] = 'loading'

    if (editingMovie.value) {
      await deleteMovieFiles(movieId)
      videoPreloader.unloadVideo(movieId)
    }

    let videoDuration = 0

    if (useUrl) {
      const url = getLocalVideoUrl(formData.videoUrl!.trim()) || formData.videoUrl!.trim()
      await videoPreloader.preloadVideoByUrl(movieId, url, (progress) => {
        if (progress === 100) {
          fileStatus.value[movieId] = 'ready'
          loadingMovies.value[movieId] = false
        }
      })
      if (videoPreloader.isPreloaded(movieId)) {
        const d = videoPreloader.getVideoDuration(movieId)
        if (d && d > 0) videoDuration = d
      }
      const movieData: UserMovie = {
        id: formData.id,
        name: formData.name,
        description: formData.description,
        hint: formData.hint,
        nameVariants: [],
        duration: Math.floor(videoDuration),
        videoUrl: formData.videoUrl!.trim(),
        createdAt: (editingMovie.value && 'createdAt' in editingMovie.value)
          ? editingMovie.value.createdAt
          : Date.now()
      }
      await saveUserMovie(movieData)
    } else if (useFile) {
      try {
        videoDuration = await getVideoDuration(formData.videoFile!)
      } catch (e) {
        console.warn('获取视频时长失败，将在预加载后更新:', e)
      }
      await saveMovieFiles({
        movieId: formData.id,
        sourceFile: formData.videoFile!,
        selectedAt: Date.now()
      })
      await videoPreloader.preloadVideo(movieId, formData.videoFile!, (progress) => {
        if (progress === 100) {
          fileStatus.value[movieId] = 'ready'
          loadingMovies.value[movieId] = false
        }
      })
      if (videoPreloader.isPreloaded(movieId)) {
        const d = videoPreloader.getVideoDuration(movieId)
        if (d && d > 0) videoDuration = d
      }
      const movieData: UserMovie = {
        id: formData.id,
        name: formData.name,
        description: formData.description,
        hint: formData.hint,
        nameVariants: [],
        duration: Math.floor(videoDuration),
        createdAt: (editingMovie.value && 'createdAt' in editingMovie.value)
          ? editingMovie.value.createdAt
          : Date.now()
      }
      await saveUserMovie(movieData)
    }

    if (videoPreloader.isPreloaded(movieId)) {
      fileStatus.value[movieId] = 'ready'
      loadingMovies.value[movieId] = false
    } else {
      fileStatus.value[movieId] = 'error'
      loadingMovies.value[movieId] = false
    }

    await loadMovies()
    showSuccess({
      title: editingMovie.value ? t('modal.updateSuccess') : t('modal.addSuccess'),
      message: editingMovie.value ? t('modal.updateSuccessMessage') : t('modal.addSuccessMessage')
    })
    closeEditModal()
  } catch (error) {
    console.error('保存电影失败:', error)
    loadingMovies.value[movieId] = false
    fileStatus.value[movieId] = 'error'
    showError({
      title: t('modal.saveFailed'),
      message: t('modal.saveFailedMessage')
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
