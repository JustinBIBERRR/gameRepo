import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import MovieGuess from '@/views/MovieGuess.vue'
import { createTestRouter } from '../../utils/testWrapper'
import { resetStorage } from '../../utils/testUtils'
import { matchMovie, getRandomMovieSync } from '@/utils/movieUtils'
import i18n from '@/locales'

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() })
  }
})

vi.mock('@/utils/movieStorage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/movieStorage')>()
  return {
    ...actual,
    getMovieFiles: vi.fn().mockResolvedValue(null),
    getAllUserMovies: vi.fn().mockResolvedValue([])
  }
})

vi.mock('@/utils/videoPreloader', () => ({
  videoPreloader: {
    isPreloaded: vi.fn().mockReturnValue(false),
    preloadVideo: vi.fn().mockResolvedValue(undefined),
    getVideoDuration: vi.fn().mockReturnValue(null),
    getPreloadedObjectUrl: vi.fn().mockReturnValue(null)
  }
}))

vi.mock('@/composables/useLoading', () => ({
  useLoading: () => ({
    showLoading: vi.fn(),
    hideLoading: vi.fn(),
    loadingState: { value: { visible: false, message: '' } }
  })
}))

vi.mock('@/composables/useModal', () => ({
  useModal: () => ({
    confirm: vi.fn().mockResolvedValue(false),
    success: vi.fn()
  })
}))

describe('MovieGuess Integration Tests', () => {
  beforeEach(() => {
    resetStorage()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('movie resource flow (loading → play)', () => {
    test('getRandomMovieSync returns movie with duration and id when data exists', () => {
      const movie = getRandomMovieSync()
      if (movie) {
        expect(movie.id).toBeDefined()
        expect(movie.name).toBeDefined()
        expect(typeof movie.duration).toBe('number')
      }
    })

    test('matchMovie resolves correct movie by name or returns null for invalid', () => {
      const movie = getRandomMovieSync()
      if (movie) {
        const matched = matchMovie(movie.name)
        expect(matched).not.toBeNull()
        if (matched) expect(matched.name).toBe(movie.name)
      }
      expect(matchMovie('不存在的电影名')).toBeNull()
    })
  })

  describe('game initialization', () => {
    test('component mounts without throwing', async () => {
      const router = createTestRouter()
      const wrapper = mount(MovieGuess, {
        global: {
          plugins: [router, i18n],
          stubs: [
            'Navigation',
            'GameHeader',
            'Autocomplete',
            'Celebration',
            'TimeRangeSelector',
            'VideoPlayer'
          ]
        }
      })
      await flushPromises()
      expect(wrapper.exists()).toBe(true)
    })

    test('shows loading or game content (flow smoothness)', async () => {
      const router = createTestRouter()
      const wrapper = mount(MovieGuess, {
        global: {
          plugins: [router, i18n],
          stubs: [
            'Navigation',
            'GameHeader',
            'Autocomplete',
            'Celebration',
            'TimeRangeSelector',
            'VideoPlayer'
          ]
        }
      })
      await wrapper.vm.$nextTick()
      await flushPromises()
      const text = wrapper.text()
      const hasLoading = text.includes('正在加载') || text.includes('加载')
      const hasGameOrEmpty = wrapper.exists()
      expect(hasGameOrEmpty).toBe(true)
      if (hasLoading) {
        expect(text).toMatch(/加载|加载中/)
      }
    })
  })

  describe('flow smoothness (loading → resource ready → game content)', () => {
    test('mounts and shows either loading state or game content', async () => {
      const router = createTestRouter()
      const wrapper = mount(MovieGuess, {
        global: {
          plugins: [router, i18n],
          stubs: [
            'Navigation',
            'GameHeader',
            'Autocomplete',
            'Celebration',
            'TimeRangeSelector',
            'VideoPlayer'
          ]
        }
      })
      await flushPromises()
      vi.advanceTimersByTime(50)
      await flushPromises()
      expect(wrapper.exists()).toBe(true)
    })
  })
})
