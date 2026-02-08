<template>
  <div class="listen-song-data-manager">
    <div class="mb-6 flex items-center justify-between">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索歌曲..."
        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
      />
      <div class="flex gap-2 items-center">
        <button
          v-if="songs.length === 0"
          :disabled="importingDefaults"
          @click="handleImportDefaults"
          class="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          导入示例数据
        </button>
        <div v-if="importingDefaults" class="flex items-center gap-2 text-sm text-green-600">
          <div class="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent" />
          <span>{{ importProgressText }}</span>
        </div>
        <button
          @click="showJsonImportModal = true"
          class="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
        >
          从 JSON 导入（URL 资源）
        </button>
        <button
          @click="handleAdd"
          class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          新增歌曲
        </button>
      </div>
    </div>

    <!-- 导入中遮罩 -->
    <div
      v-if="importingDefaults"
      class="flex flex-col items-center justify-center py-12 px-4 rounded-lg border-2 border-dashed border-green-200 bg-green-50/80"
    >
      <div class="animate-spin rounded-full h-10 w-10 border-2 border-green-500 border-t-transparent mb-3" />
      <p class="text-green-700 font-medium">{{ importProgressText }}</p>
      <p class="text-sm text-green-600 mt-1">请稍候，正在写入本地存储...</p>
    </div>

    <div v-else class="w-full overflow-x-auto border border-gray-200 rounded-lg">
      <table class="w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">歌曲</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">答案</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">歌手</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="song in filteredSongs" :key="song.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ song.answer }}</td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ song.answer }}</td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ song.artist || '—' }}</td>
            <td class="px-4 py-3 text-right">
              <button
                @click="handleEdit(song)"
                class="text-green-600 hover:text-green-900 mr-2"
              >
                编辑
              </button>
              <button
                @click="handleDelete(song.id)"
                class="text-red-600 hover:text-red-900"
              >
                删除
              </button>
            </td>
          </tr>
          <tr v-if="filteredSongs.length === 0">
            <td :colspan="4" class="px-4 py-8 text-center text-gray-500">
              暂无歌曲数据，点击"新增歌曲"开始添加
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <GlobalModal :show="showModal" @close="closeModal">
      <template #header>
        <h3 class="text-lg font-semibold">{{ editingItem ? '编辑歌曲' : '新增歌曲' }}</h3>
      </template>
      <template #body>
        <SchemaForm
          :schema="listenSongSchema"
          :initial-data="editingFormData"
          @submit="handleSubmit"
          @cancel="closeModal"
        />
      </template>
    </GlobalModal>

    <!-- 从 JSON 导入（仅 URL 资源） -->
    <GlobalModal :show="showJsonImportModal" @close="showJsonImportModal = false">
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900">从 JSON 导入歌曲（URL 资源）</h3>
      </template>
      <template #body>
        <p class="text-sm text-gray-700 mb-2">请在下方的 JSON 编辑器中粘贴或编辑数据，支持格式化与语法高亮。字段说明：</p>
        <div class="text-xs text-gray-600 mb-2 rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-1.5">
          <p class="font-medium text-gray-700">songs 数组中每项的字段：</p>
          <ul class="space-y-1 list-none pl-0">
            <li><span class="font-mono bg-green-100 text-green-800 px-1 rounded">id</span> 唯一标识，必填</li>
            <li><span class="font-mono bg-green-100 text-green-800 px-1 rounded">lyrics</span> 歌词内容（用于 AI 听歌猜题），必填</li>
            <li><span class="font-mono bg-green-100 text-green-800 px-1 rounded">answer</span> 歌曲名称（答案），必填</li>
            <li><span class="font-mono bg-green-100 text-green-800 px-1 rounded">audioUrl</span> 音频地址（需为 http(s) 链接，如本地资源服务地址），必填</li>
            <li><span class="font-mono bg-gray-200 text-gray-700 px-1 rounded">artist</span> 歌手，选填</li>
            <li><span class="font-mono bg-gray-200 text-gray-700 px-1 rounded">hints</span> 提示词列表，选填</li>
          </ul>
        </div>
        <p class="text-sm text-gray-600 mb-1">格式示例：</p>
        <pre class="text-xs text-left bg-gray-100 border border-gray-200 rounded-lg p-3 mb-3 overflow-x-auto max-h-28 overflow-y-auto font-mono">{{ songJsonExample }}</pre>
        <JsonEditor v-model="jsonImportText" theme="light" class="mb-2" />
        <p v-if="jsonImportError" class="mt-2 text-sm text-red-600">{{ jsonImportError }}</p>
        <div class="mt-4 flex justify-end gap-2">
          <button
            type="button"
            class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            @click="showJsonImportModal = false"
          >
            取消
          </button>
          <button
            type="button"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            :disabled="importingFromJson"
            @click="handleImportFromJson"
          >
            {{ importingFromJson ? '导入中...' : '确认导入' }}
          </button>
        </div>
      </template>
    </GlobalModal>
  </div>
</template>

<script setup lang="ts">
import GlobalModal from './GlobalModal.vue'
import SchemaForm from './SchemaForm/SchemaForm.vue'
import JsonEditor from './JsonEditor.vue'
import { listenSongSchema } from '../schemas/listenSongSchema'
import {
  getAllSongs,
  saveSong,
  deleteSong
} from '../utils/listenSongStorage'
import { defaultListenSongs } from '../data/listenSongDefaults'
import type { ListenSongItem } from '../utils/listenSongStorage'
import { useModal } from '../composables/useModal'

const { confirm: showConfirm, success: showSuccess, error: showError } = useModal()

const songs = ref<ListenSongItem[]>([])
const searchQuery = ref('')
const showModal = ref(false)
const editingItem = ref<ListenSongItem | null>(null)
const editingFormData = ref<Record<string, unknown> | undefined>(undefined)
const importingDefaults = ref(false)
const importProgress = ref({ current: 0, total: 0 })
const showJsonImportModal = ref(false)
const jsonImportText = ref('')
const jsonImportError = ref('')
const importingFromJson = ref(false)
const STORAGE_KEY_HAD_DATA = 'listenSongHasHadDataOnce'

const songJsonExample = `{
  "songs": [
    {
      "id": "s1",
      "lyrics": "歌词内容",
      "answer": "歌名",
      "artist": "歌手",
      "audioUrl": "http://127.0.0.1:8080/xxx.mp3",
      "hints": ["提示1"]
    }
  ]
}`
/** 仅「从未有过数据」时自动导入；用户删光后或之后再次进入均不再自动导入 */
function hasHadDataBefore(): boolean {
  return localStorage.getItem(STORAGE_KEY_HAD_DATA) === '1'
}
function markHasHadData(): void {
  localStorage.setItem(STORAGE_KEY_HAD_DATA, '1')
}

const importProgressText = computed(() => {
  const { current, total } = importProgress.value
  if (total <= 0) return '正在准备...'
  return `正在导入示例数据 ${current}/${total}...`
})

const filteredSongs = computed(() => {
  if (!searchQuery.value.trim()) return songs.value
  const q = searchQuery.value.toLowerCase()
  return songs.value.filter(
    (s) =>
      s.answer.toLowerCase().includes(q) ||
      (s.artist && s.artist.toLowerCase().includes(q)) ||
      s.lyrics.toLowerCase().includes(q) ||
      (s.hints && s.hints.some((h) => h.toLowerCase().includes(q)))
  )
})

async function importDefaultSong(onProgress?: (current: number, total: number) => void) {
  const total = defaultListenSongs.length
  for (let i = 0; i < defaultListenSongs.length; i++) {
    onProgress?.(i + 1, total)
    const item = defaultListenSongs[i]
    const { audioUrl, ...songItem } = item
    if (audioUrl?.startsWith('http://') || audioUrl?.startsWith('https://')) {
      await saveSong(songItem, null, audioUrl)
    } else {
      const audioRes = await fetch(audioUrl)
      const audioBlob = await audioRes.blob()
      const ext = audioUrl.includes('.mp3') ? 'mp3' : 'mp3'
      const audioFile = new File([audioBlob], `${songItem.id}.${ext}`, { type: 'audio/mpeg' })
      await saveSong(songItem, audioFile)
    }
  }
}

/** 歌曲 JSON 项（URL 资源导入用） */
interface SongJsonItem {
  id: string
  lyrics: string
  answer: string
  artist?: string
  hints?: string[]
  audioUrl: string
}

async function handleImportFromJson() {
  jsonImportError.value = ''
  const raw = jsonImportText.value.trim()
  if (!raw) {
    jsonImportError.value = '请粘贴 JSON 内容'
    return
  }
  let data: { songs?: SongJsonItem[] }
  try {
    data = JSON.parse(raw)
  } catch (e) {
    jsonImportError.value = 'JSON 格式错误，请检查'
    return
  }
  const list = data.songs
  if (!Array.isArray(list) || list.length === 0) {
    jsonImportError.value = 'JSON 需包含 songs 数组且至少一项'
    return
  }
  importingFromJson.value = true
  try {
    for (const item of list) {
      const id = String(item.id ?? '').trim()
      const lyrics = String(item.lyrics ?? '').trim()
      const answer = String(item.answer ?? '').trim()
      const audioUrl = String(item.audioUrl ?? '').trim()
      if (!id || !lyrics || !answer || !audioUrl) continue
      if (!audioUrl.startsWith('http://') && !audioUrl.startsWith('https://')) continue
      const songItem: Omit<ListenSongItem, 'createdAt'> = {
        id,
        lyrics,
        answer,
        artist: String(item.artist ?? ''),
        hints: Array.isArray(item.hints) ? item.hints : []
      }
      await saveSong(songItem, null, audioUrl)
    }
    showJsonImportModal.value = false
    jsonImportText.value = ''
    await loadSongs()
    showSuccess({ title: '已导入', message: `已从 JSON 导入 ${list.length} 首歌曲（URL 资源）` })
  } catch (e) {
    console.error(e)
    showError({ title: '导入失败', message: e instanceof Error ? e.message : '导入时出错' })
  } finally {
    importingFromJson.value = false
  }
}

/** 仅拉取列表，不自动导入；自动导入仅在 onMounted 首次无数据时执行一次 */
async function loadSongs() {
  try {
    songs.value = await getAllSongs()
  } catch (e) {
    console.error('加载歌曲失败:', e)
    showError({ title: '加载失败', message: '无法加载歌曲列表' })
  }
}

/** 仅当从未有过数据时执行一次默认数据导入；用户删光后不再自动导入 */
async function runInitialAutoImportIfNeeded() {
  if (songs.value.length > 0) {
    markHasHadData()
    return
  }
  if (hasHadDataBefore()) return
  importingDefaults.value = true
  importProgress.value = { current: 0, total: defaultListenSongs.length }
  try {
    await importDefaultSong((current, total) => {
      importProgress.value = { current, total }
    })
    songs.value = await getAllSongs()
    markHasHadData()
  } catch (e) {
    console.error('首次导入示例数据失败:', e)
    showError({ title: '导入失败', message: '首次加载示例数据时出错' })
  } finally {
    importingDefaults.value = false
    importProgress.value = { current: 0, total: 0 }
  }
}

function handleAdd() {
  editingItem.value = null
  editingFormData.value = undefined
  showModal.value = true
}

function handleEdit(song: ListenSongItem) {
  editingItem.value = song
  editingFormData.value = {
    id: song.id,
    lyrics: song.lyrics,
    answer: song.answer,
    artist: song.artist ?? '',
    hints: song.hints ?? [],
    audioUrl: song.audioUrl ?? ''
  }
  showModal.value = true
}

async function handleImportDefaults() {
  importingDefaults.value = true
  importProgress.value = { current: 0, total: defaultListenSongs.length }
  try {
    await importDefaultSong((current, total) => {
      importProgress.value = { current, total }
    })
    await loadSongs()
    showSuccess({ title: '已导入', message: `已导入 ${defaultListenSongs.length} 首示例歌曲` })
  } catch (e) {
    showError({ title: '导入失败', message: '导入示例数据时出错' })
  } finally {
    importingDefaults.value = false
    importProgress.value = { current: 0, total: 0 }
  }
}

async function handleDelete(id: string) {
  const song = songs.value.find((s) => s.id === id)
  showConfirm({
    title: '确认删除',
    message: `确定要删除「${song?.answer ?? id}」吗？`,
    confirmText: '删除',
    cancelText: '取消'
  }).then(async (ok) => {
    if (ok) {
      await deleteSong(id)
      await loadSongs()
      showSuccess({ title: '已删除', message: '歌曲已删除' })
    }
  })
}

async function handleSubmit(data: Record<string, unknown>) {
  const audioFile = data.audioClip instanceof File ? data.audioClip : null
  const audioUrlRaw = typeof data.audioUrl === 'string' ? data.audioUrl.trim() : ''
  const audioUrl =
    audioUrlRaw && (audioUrlRaw.startsWith('http://') || audioUrlRaw.startsWith('https://'))
      ? audioUrlRaw
      : undefined
  const isNew = !editingItem.value
  const hasSource = Boolean(audioFile || audioUrl)
  if (isNew && !hasSource) {
    showError({ title: '保存失败', message: '请填写音频地址（URL）或上传 AI 生成歌（MP3）' })
    return
  }
  const item: Omit<ListenSongItem, 'createdAt'> = {
    id: String(data.id),
    lyrics: String(data.lyrics),
    answer: String(data.answer),
    artist: String(data.artist ?? ''),
    hints: Array.isArray(data.hints) ? (data.hints as string[]) : []
  }
  try {
    await saveSong(item, audioFile ?? undefined, audioUrl ?? undefined)
    await loadSongs()
    closeModal()
    showSuccess({ title: '保存成功', message: '歌曲已保存' })
  } catch (e) {
    showError({
      title: '保存失败',
      message: e instanceof Error ? e.message : '保存时发生错误'
    })
  }
}

function closeModal() {
  showModal.value = false
  editingItem.value = null
}

onMounted(async () => {
  await loadSongs()
  await runInitialAutoImportIfNeeded()
})
</script>
