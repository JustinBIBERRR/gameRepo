<template>
  <div class="min-h-screen">
    <Navigation />
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">游戏设置</h1>

        <!-- 全局默认设置 -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">全局默认设置</h2>
          <div class="space-y-4">
            <!-- 倒计时时长 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                倒计时时长（分钟）
              </label>
              <input
                v-model.number="localSettings.defaults.timerDuration"
                type="number"
                min="1"
                max="60"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                @input="validateTimerDuration"
              />
              <p v-if="timerDurationError" class="mt-1 text-sm text-red-600">
                {{ timerDurationError }}
              </p>
            </div>

            <!-- 最大尝试次数 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                最大尝试次数
              </label>
              <input
                v-model.number="localSettings.defaults.maxAttempts"
                type="number"
                min="3"
                max="10"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                @input="validateMaxAttempts"
              />
              <p v-if="maxAttemptsError" class="mt-1 text-sm text-red-600">
                {{ maxAttemptsError }}
              </p>
            </div>

            <!-- 显示初始提示 -->
            <div class="flex items-center">
              <input
                v-model="localSettings.defaults.showInitialHint"
                type="checkbox"
                id="showInitialHint"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label for="showInitialHint" class="ml-2 text-sm font-medium text-gray-700">
                显示初始提示
              </label>
            </div>
          </div>
        </div>

        <!-- 游戏类型覆盖设置 -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">游戏类型覆盖</h2>
          <p class="text-sm text-gray-600 mb-4">
            为特定游戏设置独立的配置，留空则使用全局默认值
          </p>
          
          <div class="space-y-4">
            <!-- 城市猜测覆盖 -->
            <Collapse title="城市猜测" :default-open="false">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    倒计时时长（分钟，留空使用全局默认）
                  </label>
                  <input
                    v-model.number="localSettings.overrides.city!.timerDuration"
                    type="number"
                    min="1"
                    max="60"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="使用全局默认"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    最大尝试次数（留空使用全局默认）
                  </label>
                  <input
                    v-model.number="localSettings.overrides.city!.maxAttempts"
                    type="number"
                    min="3"
                    max="10"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="使用全局默认"
                  />
                </div>
                <div class="flex items-center">
                  <input
                    v-model="localSettings.overrides.city!.showInitialHint"
                    type="checkbox"
                    id="cityShowInitialHint"
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label for="cityShowInitialHint" class="ml-2 text-sm font-medium text-gray-700">
                    显示初始提示（留空使用全局默认）
                  </label>
                </div>
              </div>
            </Collapse>

            <!-- 英雄猜测覆盖 -->
            <Collapse title="英雄猜测" :default-open="false">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    倒计时时长（分钟，留空使用全局默认）
                  </label>
                  <input
                    v-model.number="localSettings.overrides.hero!.timerDuration"
                    type="number"
                    min="1"
                    max="60"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="使用全局默认"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    最大尝试次数（留空使用全局默认）
                  </label>
                  <input
                    v-model.number="localSettings.overrides.hero!.maxAttempts"
                    type="number"
                    min="3"
                    max="10"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="使用全局默认"
                  />
                </div>
                <div class="flex items-center">
                  <input
                    v-model="localSettings.overrides.hero!.showInitialHint"
                    type="checkbox"
                    id="heroShowInitialHint"
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label for="heroShowInitialHint" class="ml-2 text-sm font-medium text-gray-700">
                    显示初始提示（留空使用全局默认）
                  </label>
                </div>
              </div>
            </Collapse>

            <!-- 电影猜测覆盖 -->
            <Collapse title="电影猜测" :default-open="false">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    倒计时时长（分钟，留空使用全局默认）
                  </label>
                  <input
                    v-model.number="localSettings.overrides.movie!.timerDuration"
                    type="number"
                    min="1"
                    max="60"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="使用全局默认"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    最大尝试次数（留空使用全局默认）
                  </label>
                  <input
                    v-model.number="localSettings.overrides.movie!.maxAttempts"
                    type="number"
                    min="3"
                    max="10"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="使用全局默认"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    每个片段最大播放次数（留空使用全局默认）
                  </label>
                  <input
                    v-model.number="localSettings.overrides.movie!.maxPlaybackPerSegment"
                    type="number"
                    min="1"
                    max="10"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="使用全局默认"
                  />
                </div>
                <div class="flex items-center">
                  <input
                    v-model="localSettings.overrides.movie!.showInitialHint"
                    type="checkbox"
                    id="movieShowInitialHint"
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label for="movieShowInitialHint" class="ml-2 text-sm font-medium text-gray-700">
                    显示初始提示（留空使用全局默认）
                  </label>
                </div>
              </div>
            </Collapse>
          </div>
        </div>

        <!-- 电影注册和管理 -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900">电影注册和管理</h2>
            <button
              @click="showAddMovieForm = true"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              + 添加电影
            </button>
          </div>
          <p class="text-sm text-gray-600 mb-4">
            注册电影名称和视频文件，然后就可以在游戏中使用了。
          </p>
          
          <!-- 添加电影表单 -->
          <div v-if="showAddMovieForm" class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">添加新电影</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  电影名称 <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="newMovie.name"
                  type="text"
                  placeholder="例如：哪吒之魔童降世"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  别名（用逗号分隔，用于匹配猜测）
                </label>
                <input
                  v-model="newMovie.nameVariantsText"
                  type="text"
                  placeholder="例如：哪吒,魔童降世,哪吒魔童降世"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <p class="mt-1 text-xs text-gray-500">用户输入这些别名也能匹配到这部电影</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  视频文件 <span class="text-red-500">*</span>
                </label>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <input
                      type="file"
                      id="newMovieFile"
                      accept="video/mp4,video/*"
                      class="hidden"
                      @change="handleNewMovieFileSelect"
                    />
                    <label
                      for="newMovieFile"
                      class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors"
                    >
                      选择视频文件
                    </label>
                    <span v-if="newMovie.sourceFile" class="text-sm text-gray-600">
                      {{ newMovie.sourceFile.name }} ({{ formatFileSize(newMovie.sourceFile.size) }})
                    </span>
                  </div>
                  <p v-if="newMovie.durationMinutes > 0" class="text-sm text-green-600">
                    ✓ 视频时长：{{ newMovie.durationMinutes }}分钟
                  </p>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  @click="handleAddMovie"
                  :disabled="!canAddMovie || isProcessing"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {{ isProcessing ? '处理中...' : '保存' }}
                </button>
                <button
                  @click="cancelAddMovie"
                  :disabled="isProcessing"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
          
          <!-- 已注册的电影列表 -->
          <div v-if="userMovies.length > 0" class="space-y-4">
            <div
              v-for="movie in userMovies"
              :key="movie.id"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="font-semibold text-gray-900">{{ movie.name }}</h3>
                  <p class="text-sm text-gray-500">
                    时长：{{ formatDuration(movie.duration) }}
                    <span v-if="movie.year"> | 年份：{{ movie.year }}</span>
                  </p>
                  <p v-if="movie.description" class="text-sm text-gray-600 mt-1">{{ movie.description }}</p>
                </div>
                <button
                  @click="deleteMovie(movie.id)"
                  class="text-sm text-red-600 hover:text-red-700"
                >
                  删除
                </button>
              </div>
              
              <div class="space-y-3">
                <!-- 视频文件状态 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    视频文件
                  </label>
                  <div class="flex items-center gap-2 flex-wrap">
                    <input
                      type="file"
                      :id="`source-${movie.id}`"
                      accept="video/mp4,video/*"
                      class="hidden"
                      @change="(e) => handleSourceFileSelect(movie.id, e)"
                    />
                    <label
                      :for="`source-${movie.id}`"
                      class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors"
                    >
                      {{ movieFileStatus[movie.id]?.sourceFile ? '更换文件' : '选择文件' }}
                    </label>
                    <span v-if="movieFileStatus[movie.id]?.sourceFile" class="text-sm text-gray-600">
                      {{ formatFileSize(movieFileStatus[movie.id].sourceFile.size) }}
                    </span>
                    <span v-else class="text-sm text-red-600">未配置</span>
                    <span v-if="getPreloadStatus(movie.id).isPreloaded" class="text-sm text-green-600">
                      ✓ 已预加载，可以开始游戏
                    </span>
                    <span v-else-if="getPreloadStatus(movie.id).isLoading" class="text-sm text-blue-600">
                      ⏳ 预加载中...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-else class="text-center py-8 text-gray-500">
            <p>还没有注册任何电影</p>
            <p class="text-sm mt-2">点击"添加电影"按钮开始注册</p>
          </div>
        </div>

        <!-- 保存按钮 -->
        <div class="flex justify-end gap-4">
          <button
            @click="resetSettings"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            重置为默认值
          </button>
          <button
            @click="saveSettings"
            class="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            保存设置
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Navigation from '../components/Navigation.vue'
import Collapse from '../components/Collapse.vue'
import { getGameSettings, saveGameSettings, type GameSettings } from '../utils/storageUtils'
import { useModal } from '../composables/useModal'
import { useLoading } from '../composables/useLoading'
import { saveMovieFiles, getMovieFiles, deleteMovieFiles, getAllUserMovies, saveUserMovie, deleteUserMovie, type LocalMovieFiles, type UserMovie } from '../utils/movieStorage'
import { videoPreloader } from '../utils/videoPreloader'
import { getVideoDuration } from '../utils/videoUtils'

const { success: showSuccess, error: showError, confirm: showConfirm } = useModal()
const { showLoading, updateProgress, hideLoading } = useLoading()

const localSettings = ref<GameSettings>({
  defaults: {
    timerDuration: 5,
    maxAttempts: 5,
    showInitialHint: true,
    maxPlaybackPerSegment: 3
  },
  overrides: {
    city: {},
    hero: {},
    movie: {}
  }
})

const timerDurationError = ref('')
const maxAttemptsError = ref('')

// 电影文件管理
const userMovies = ref<UserMovie[]>([])
const movieFileStatus = ref<Record<string, { sourceFile?: File }>>({})
const showAddMovieForm = ref(false)
interface PreloadStatusType {
  isPreloaded: boolean
  isReady: boolean
  isLoading: boolean
}
const preloadStatus = ref<Record<string, PreloadStatusType>>({})
const isProcessing = ref(false)
const newMovie = ref({
  name: '',
  nameVariantsText: '',
  durationMinutes: 0,
  sourceFile: null as File | null
})

const canAddMovie = computed(() => {
  return newMovie.value.name.trim() !== '' &&
         newMovie.value.durationMinutes > 0 &&
         newMovie.value.sourceFile !== null
})

// 格式化时长
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分钟`
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

// 处理原文件选择
async function handleSourceFileSelect(movieId: string, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    showLoading('正在上传视频文件...', true)
    
    const existingFiles = await getMovieFiles(movieId)
    const movieFiles: LocalMovieFiles = {
      movieId,
      sourceFile: file,
      playbackMode: 'auto',
      selectedAt: Date.now(),
      ...existingFiles
    }
    
    await saveMovieFiles(movieFiles)
    updateProgress(30, '视频文件已保存，正在预加载...')
    
    // 更新状态
    movieFileStatus.value[movieId] = {
      sourceFile: file
    }
    
    // 立即开始预加载视频
    await preloadVideo(movieId, file)
    
    hideLoading()
    showSuccess({
      title: '上传成功',
      message: `视频已上传并预加载完成，可以开始游戏了`
    })
  } catch (error) {
    hideLoading()
    console.error('保存电影文件失败:', error)
    showError({
      title: '上传失败',
      message: '无法保存电影文件，请重试'
    })
  }
}

// 加载用户电影和文件状态
async function loadMovieFilesStatus() {
  try {
    userMovies.value = await getAllUserMovies()
    
    // 加载文件状态并预加载视频
    for (const movie of userMovies.value) {
      try {
        const files = await getMovieFiles(movie.id)
        if (files && files.sourceFile) {
          movieFileStatus.value[movie.id] = {
            sourceFile: files.sourceFile
          }
          
          // 检查是否已预加载
          const status = videoPreloader.getPreloadStatus(movie.id)
          preloadStatus.value[movie.id] = status
          
          // 如果未预加载，自动预加载视频（后台静默加载）
          if (!status.isPreloaded && !status.isLoading) {
            preloadVideoSilently(movie.id, files.sourceFile)
          }
        }
      } catch (error) {
        console.error(`加载电影 ${movie.id} 文件状态失败:`, error)
      }
    }
  } catch (error) {
    console.error('加载电影文件状态失败:', error)
  }
}

// 后台静默预加载视频（不显示进度）
async function preloadVideoSilently(movieId: string, file: File) {
  try {
    preloadStatus.value[movieId] = { isPreloaded: false, isReady: false, isLoading: true }
    await videoPreloader.preloadVideo(movieId, file)
    preloadStatus.value[movieId] = { isPreloaded: true, isReady: true, isLoading: false }
    console.log(`视频 ${movieId} 后台预加载完成`)
  } catch (error) {
    preloadStatus.value[movieId] = { isPreloaded: false, isReady: false, isLoading: false }
    console.error(`视频 ${movieId} 后台预加载失败:`, error)
  }
}

// 预加载视频
async function preloadVideo(movieId: string, file: File) {
  try {
    // 更新状态为加载中
    preloadStatus.value[movieId] = { isPreloaded: false, isReady: false, isLoading: true }
    
    await videoPreloader.preloadVideo(movieId, file, (progress) => {
      // 将进度映射到30-100范围
      const mappedProgress = 30 + (progress * 0.7)
      updateProgress(mappedProgress, `正在预加载视频... ${Math.round(progress)}%`)
    })
    
    // 更新状态为已完成
    preloadStatus.value[movieId] = { isPreloaded: true, isReady: true, isLoading: false }
    console.log(`视频 ${movieId} 预加载完成`)
  } catch (error) {
    // 更新状态为失败
    preloadStatus.value[movieId] = { isPreloaded: false, isReady: false, isLoading: false }
    console.error(`视频 ${movieId} 预加载失败:`, error)
    throw error
  }
}

// 获取预加载状态
function getPreloadStatus(movieId: string) {
  if (preloadStatus.value[movieId]) {
    return preloadStatus.value[movieId]
  }
  return videoPreloader.getPreloadStatus(movieId)
}

// 处理新电影文件选择
async function handleNewMovieFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  
  try {
    showLoading('正在读取视频信息...')
    newMovie.value.sourceFile = file
    
    // 自动获取视频时长
    const duration = await getVideoDuration(file)
    newMovie.value.durationMinutes = Math.round(duration / 60)
    
    hideLoading()
  } catch (error) {
    hideLoading()
    console.error('读取视频信息失败:', error)
    showError({
      title: '读取失败',
      message: '无法读取视频信息，请确保文件格式正确'
    })
    newMovie.value.sourceFile = null
    newMovie.value.durationMinutes = 0
  }
}

// 添加新电影
async function handleAddMovie() {
  if (!canAddMovie.value || isProcessing.value) return

  try {
    isProcessing.value = true
    showLoading('正在添加电影...', true)
    
    // 生成电影ID
    const movieId = `movie_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 处理别名
    const nameVariants = newMovie.value.nameVariantsText
      .split(',')
      .map(v => v.trim())
      .filter(v => v !== '')
    
    updateProgress(20, '正在保存电影信息...')
    
    // 创建电影对象
    const movie: UserMovie = {
      id: movieId,
      name: newMovie.value.name.trim(),
      nameVariants: nameVariants,
      duration: newMovie.value.durationMinutes * 60,
      createdAt: Date.now()
    }
    
    // 保存电影信息
    await saveUserMovie(movie)
    
    updateProgress(30, '正在上传视频文件...')
    
    // 保存电影文件并预加载
    if (newMovie.value.sourceFile) {
      const movieFiles: LocalMovieFiles = {
        movieId,
        sourceFile: newMovie.value.sourceFile,
        playbackMode: 'auto',
        selectedAt: Date.now()
      }
      await saveMovieFiles(movieFiles)
      
      updateProgress(40, '视频文件已保存，正在预加载...')
      
      // 立即开始预加载视频
      await preloadVideo(movieId, newMovie.value.sourceFile)
    }
    
    updateProgress(100, '完成')
    
    // 重置表单
    cancelAddMovie()
    
    // 重新加载列表
    await loadMovieFilesStatus()
    
    hideLoading()
    isProcessing.value = false
    
    showSuccess({
      title: '添加成功',
      message: `电影"${movie.name}"已添加并预加载完成，可以开始游戏了`
    })
  } catch (error) {
    hideLoading()
    isProcessing.value = false
    console.error('添加电影失败:', error)
    showError({
      title: '添加失败',
      message: '无法添加电影，请重试'
    })
  }
}

// 取消添加电影
function cancelAddMovie() {
  if (isProcessing.value) return
  
  showAddMovieForm.value = false
  newMovie.value = {
    name: '',
    nameVariantsText: '',
    durationMinutes: 0,
    sourceFile: null
  }
}

// 删除电影
async function deleteMovie(movieId: string) {
  const movie = userMovies.value.find(m => m.id === movieId)
  if (!movie) return

  const confirmed = await showConfirm({
    title: '确认删除',
    message: `确定要删除电影"${movie.name}"吗？此操作不可恢复。`,
    confirmText: '删除',
    cancelText: '取消'
  })

  if (!confirmed) return

  try {
    await deleteUserMovie(movieId)
    await deleteMovieFiles(movieId)
    
    // 卸载预加载的视频
    videoPreloader.unloadVideo(movieId)
    
    delete movieFileStatus.value[movieId]
    delete preloadStatus.value[movieId]
    
    await loadMovieFilesStatus()
    
    showSuccess({
      title: '删除成功',
      message: '已删除电影'
    })
  } catch (error) {
    console.error('删除电影失败:', error)
    showError({
      title: '删除失败',
      message: '无法删除电影，请重试'
    })
  }
}

function validateTimerDuration() {
  const value = localSettings.value.defaults.timerDuration
  if (value < 1 || value > 60) {
    timerDurationError.value = '倒计时时长必须在1-60分钟之间'
  } else {
    timerDurationError.value = ''
  }
}

function validateMaxAttempts() {
  const value = localSettings.value.defaults.maxAttempts
  if (value < 3 || value > 10) {
    maxAttemptsError.value = '最大尝试次数必须在3-10次之间'
  } else {
    maxAttemptsError.value = ''
  }
}

function saveSettings() {
  if (timerDurationError.value || maxAttemptsError.value) {
    return
  }

  // 清理空的覆盖值
  const cleanedOverrides: GameSettings['overrides'] = {}
  if (localSettings.value.overrides.city) {
    const cityOverrides: any = {}
    if (localSettings.value.overrides.city.timerDuration !== undefined) {
      cityOverrides.timerDuration = localSettings.value.overrides.city.timerDuration
    }
    if (localSettings.value.overrides.city.maxAttempts !== undefined) {
      cityOverrides.maxAttempts = localSettings.value.overrides.city.maxAttempts
    }
    if (localSettings.value.overrides.city.showInitialHint !== undefined) {
      cityOverrides.showInitialHint = localSettings.value.overrides.city.showInitialHint
    }
    if (Object.keys(cityOverrides).length > 0) {
      cleanedOverrides.city = cityOverrides
    }
  }
  if (localSettings.value.overrides.hero) {
    const heroOverrides: any = {}
    if (localSettings.value.overrides.hero.timerDuration !== undefined) {
      heroOverrides.timerDuration = localSettings.value.overrides.hero.timerDuration
    }
    if (localSettings.value.overrides.hero.maxAttempts !== undefined) {
      heroOverrides.maxAttempts = localSettings.value.overrides.hero.maxAttempts
    }
    if (localSettings.value.overrides.hero.showInitialHint !== undefined) {
      heroOverrides.showInitialHint = localSettings.value.overrides.hero.showInitialHint
    }
    if (Object.keys(heroOverrides).length > 0) {
      cleanedOverrides.hero = heroOverrides
    }
  }
  if (localSettings.value.overrides.movie) {
    const movieOverrides: any = {}
    if (localSettings.value.overrides.movie.timerDuration !== undefined) {
      movieOverrides.timerDuration = localSettings.value.overrides.movie.timerDuration
    }
    if (localSettings.value.overrides.movie.maxAttempts !== undefined) {
      movieOverrides.maxAttempts = localSettings.value.overrides.movie.maxAttempts
    }
    if (localSettings.value.overrides.movie.maxPlaybackPerSegment !== undefined) {
      movieOverrides.maxPlaybackPerSegment = localSettings.value.overrides.movie.maxPlaybackPerSegment
    }
    if (localSettings.value.overrides.movie.showInitialHint !== undefined) {
      movieOverrides.showInitialHint = localSettings.value.overrides.movie.showInitialHint
    }
    if (Object.keys(movieOverrides).length > 0) {
      cleanedOverrides.movie = movieOverrides
    }
  }

  const settingsToSave: GameSettings = {
    defaults: localSettings.value.defaults,
    overrides: cleanedOverrides
  }

  saveGameSettings(settingsToSave)
  showSuccess({
    title: '保存成功',
    message: '设置已保存！'
  })
}

function resetSettings() {
  localSettings.value = {
    defaults: {
      timerDuration: 5,
      maxAttempts: 5,
      showInitialHint: true,
      maxPlaybackPerSegment: 3
    },
    overrides: {
      city: {},
      hero: {},
      movie: {}
    }
  }
  timerDurationError.value = ''
  maxAttemptsError.value = ''
}

onMounted(async () => {
  try {
    const settings = getGameSettings()
    localSettings.value = {
      defaults: {
        ...settings.defaults,
        maxPlaybackPerSegment: settings.defaults.maxPlaybackPerSegment ?? 3
      },
      overrides: {
        city: settings.overrides.city || {},
        hero: settings.overrides.hero || {},
        movie: settings.overrides.movie || {}
      }
    }
    
    // 异步加载电影文件状态，不阻塞页面渲染
    await loadMovieFilesStatus()
  } catch (error) {
    console.error('Settings页面初始化失败:', error)
    // 即使出错，也确保基本设置可以加载
    try {
      const settings = getGameSettings()
      localSettings.value = {
        defaults: {
          timerDuration: 5,
          maxAttempts: 5,
          showInitialHint: true,
          maxPlaybackPerSegment: 3,
          ...settings.defaults
        },
        overrides: {
          city: settings.overrides?.city || {},
          hero: settings.overrides?.hero || {},
          movie: settings.overrides?.movie || {}
        }
      }
    } catch (e) {
      console.error('加载默认设置也失败:', e)
    }
  }
})
</script>
