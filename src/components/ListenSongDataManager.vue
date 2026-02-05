<template>
  <div class="listen-song-data-manager">
    <div class="mb-6 flex items-center justify-between">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索歌曲..."
        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
      />
      <div class="flex gap-2">
        <button
          v-if="songs.length === 0"
          @click="handleImportDefaults"
          class="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg"
        >
          导入示例数据
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

    <div class="w-full overflow-x-auto border border-gray-200 rounded-lg">
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
  </div>
</template>

<script setup lang="ts">
import GlobalModal from './GlobalModal.vue'
import SchemaForm from './SchemaForm/SchemaForm.vue'
import { listenSongSchema } from '../schemas/listenSongSchema'
import {
  getAllSongs,
  saveSong,
  deleteSong
} from '../utils/listenSongStorage'
import { defaultListenSongs, defaultListenSongAudioUrl } from '../data/listenSongDefaults'
import type { ListenSongItem } from '../utils/listenSongStorage'
import { useModal } from '../composables/useModal'

const { confirm: showConfirm, success: showSuccess, error: showError } = useModal()

const songs = ref<ListenSongItem[]>([])
const searchQuery = ref('')
const showModal = ref(false)
const editingItem = ref<ListenSongItem | null>(null)
const editingFormData = ref<Record<string, unknown> | undefined>(undefined)

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

async function importDefaultSong() {
  const audioRes = await fetch(defaultListenSongAudioUrl)
  const audioBlob = await audioRes.blob()
  const audioFile = new File([audioBlob], 'specialPerson.mp3', { type: 'audio/mpeg' })
  for (const item of defaultListenSongs) {
    await saveSong(item, audioFile)
  }
}

async function loadSongs() {
  try {
    songs.value = await getAllSongs()
    if (songs.value.length === 0) {
      await importDefaultSong()
      songs.value = await getAllSongs()
    }
  } catch (e) {
    console.error('加载歌曲失败:', e)
    showError({ title: '加载失败', message: '无法加载歌曲列表' })
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
    hints: song.hints ?? []
  }
  showModal.value = true
}

async function handleImportDefaults() {
  try {
    await importDefaultSong()
    await loadSongs()
    showSuccess({ title: '已导入', message: `已导入 ${defaultListenSongs.length} 首示例歌曲` })
  } catch (e) {
    showError({ title: '导入失败', message: '导入示例数据时出错' })
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
  const isNew = !editingItem.value
  if (isNew && !audioFile) {
    showError({ title: '保存失败', message: '新建歌曲时请上传 AI 生成歌（MP3）' })
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
    await saveSong(item, audioFile instanceof File ? audioFile : undefined)
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

onMounted(loadSongs)
</script>
