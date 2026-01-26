<template>
  <div class="json-editor-container">
    <!-- 工具栏 -->
    <div class="flex items-center justify-between mb-2 p-2 bg-gray-50 rounded-t-lg border-b border-gray-200">
      <div class="flex items-center gap-2">
        <button
          @click="formatJson"
          class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
          title="格式化 JSON"
        >
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          格式化
        </button>
        <button
          @click="toggleSearch"
          class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
          title="搜索 (Ctrl+F)"
        >
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          搜索
        </button>
      </div>
      <div v-if="hasErrors" class="flex items-center gap-2 text-sm">
        <span class="text-red-600 font-medium">{{ errors.length }} 个错误</span>
      </div>
    </div>

    <!-- CodeMirror 编辑器容器 -->
    <div ref="editorRef" class="json-editor-wrapper border border-gray-300 rounded-b-lg overflow-hidden max-h-[600px] overflow-y-auto"></div>

    <!-- 错误面板 -->
    <Transition name="slide-up">
      <div v-if="hasErrors && showErrorPanel" class="mt-2 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm font-semibold text-red-900">验证错误</h4>
          <button
            @click="showErrorPanel = false"
            class="text-red-600 hover:text-red-800"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ul class="space-y-1 max-h-32 overflow-y-auto">
          <li
            v-for="(error, index) in errors"
            :key="index"
            class="text-sm text-red-800 flex items-start gap-2"
          >
            <span class="font-mono text-xs bg-red-100 px-1.5 py-0.5 rounded">行 {{ error.line }}</span>
            <span>{{ error.message }}</span>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { EditorView, keymap as viewKeymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { json } from '@codemirror/lang-json'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { foldGutter, indentOnInput, bracketMatching, foldKeymap } from '@codemirror/language'
import { highlightSelectionMatches, searchKeymap, openSearchPanel, search } from '@codemirror/search'
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'

const props = defineProps<{
  modelValue: string
  schema?: any
  theme?: 'light' | 'dark'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'validate': [errors: Array<{ line: number; message: string }>]
}>()

const editorRef = ref<HTMLDivElement | null>(null)
let editorView: EditorView | null = null
const errors = ref<Array<{ line: number; message: string }>>([])
const showErrorPanel = ref(true)
// const searchOpen = ref(false) // 未使用，保留以备将来使用

const hasErrors = computed(() => errors.value.length > 0)

onMounted(() => {
  if (!editorRef.value) return

  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      const content = update.state.doc.toString()
      emit('update:modelValue', content)
      validateJson(content)
    }
  })

  const state = EditorState.create({
    doc: props.modelValue,
    extensions: [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      highlightSelectionMatches(),
      search(),
      json(),
      updateListener,
      EditorView.theme({
        '&': {
          fontSize: '14px',
          maxHeight: '600px',
          overflow: 'auto'
        },
        '.cm-scroller': {
          overflow: 'auto',
          maxHeight: '600px'
        },
        '.cm-content': {
          padding: '12px',
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace',
          minHeight: '400px'
        },
        '.cm-gutters': {
          backgroundColor: '#f9fafb',
          borderRight: '1px solid #e5e7eb'
        },
        '.cm-activeLine': {
          backgroundColor: '#f3f4f6'
        },
        '.cm-focused': {
          outline: 'none'
        }
      }),
      viewKeymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        {
          key: 'Mod-f',
          run: openSearchPanel,
          preventDefault: true
        }
      ])
    ]
  })

  editorView = new EditorView({
    state,
    parent: editorRef.value
  })

  // 初始验证
  validateJson(props.modelValue)
})

watch(() => props.modelValue, (newValue) => {
  if (!editorView) return
  
  try {
    const currentContent = editorView.state.doc.toString()
    if (currentContent !== newValue) {
      editorView.dispatch({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: newValue
        }
      })
    }
  } catch (error) {
    // 编辑器可能已被销毁，忽略错误
    console.warn('更新编辑器内容失败（可能已销毁）:', error)
  }
})

onUnmounted(() => {
  if (editorView) {
    try {
      editorView.destroy()
    } catch (error) {
      // 忽略销毁时的错误（可能已经销毁）
      console.warn('销毁编辑器时出错:', error)
    } finally {
      editorView = null
    }
  }
})

function formatJson() {
  if (!editorView) return

  try {
    const content = editorView.state.doc.toString()
    const parsed = JSON.parse(content)
    const formatted = JSON.stringify(parsed, null, 2)
    
    editorView.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: formatted
      }
    })
  } catch (error: any) {
    console.error('格式化失败:', error)
  }
}

function toggleSearch() {
  if (!editorView) return
  
  try {
    openSearchPanel(editorView)
  } catch (error) {
    console.error('打开搜索面板失败:', error)
  }
}

function validateJson(content: string) {
  const newErrors: Array<{ line: number; message: string }> = []

  // 1. JSON 格式验证
  try {
    JSON.parse(content)
  } catch (error: any) {
    const match = error.message.match(/position (\d+)/)
    if (match) {
      const position = parseInt(match[1])
      const lines = content.substring(0, position).split('\n')
      newErrors.push({
        line: lines.length,
        message: `JSON 格式错误: ${error.message}`
      })
    } else {
      newErrors.push({
        line: 1,
        message: `JSON 格式错误: ${error.message}`
      })
    }
  }

  // 2. Schema 验证（如果有提供）
  if (props.schema && newErrors.length === 0) {
    try {
      JSON.parse(content) // 验证 JSON 格式
      // 这里可以添加 JSON Schema 验证逻辑
      // 暂时跳过，因为需要额外的库
    } catch (error) {
      // 已经在格式验证中处理
    }
  }

  errors.value = newErrors
  emit('validate', newErrors)
}
</script>

<style scoped>
.json-editor-container {
  @apply w-full;
}

.json-editor-wrapper {
  @apply relative;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
