import { describe, test, expect, beforeEach } from 'vitest'
import { useLoading } from '@/composables/useLoading'
import { resetStorage } from '../../utils/setupTest'

describe('useLoading', () => {
  beforeEach(() => {
    resetStorage()
  })

  describe('showLoading', () => {
    test('should show loading with default message', () => {
      const { showLoading, loadingState } = useLoading()
      
      showLoading()
      
      expect(loadingState.value.visible).toBe(true)
      expect(loadingState.value.message).toBe('加载中...')
      expect(loadingState.value.progress).toBe(0)
      expect(loadingState.value.showProgress).toBe(false)
    })

    test('should show loading with custom message', () => {
      const { showLoading, loadingState } = useLoading()
      
      showLoading('正在处理...')
      
      expect(loadingState.value.visible).toBe(true)
      expect(loadingState.value.message).toBe('正在处理...')
    })

    test('should show progress when enabled', () => {
      const { showLoading, loadingState } = useLoading()
      
      showLoading('加载中...', true)
      
      expect(loadingState.value.showProgress).toBe(true)
    })
  })

  describe('updateProgress', () => {
    test('should update progress correctly', () => {
      const { showLoading, updateProgress, loadingState } = useLoading()
      
      showLoading('加载中...', true)
      updateProgress(50)
      
      expect(loadingState.value.progress).toBe(50)
    })

    test('should update message when provided', () => {
      const { showLoading, updateProgress, loadingState } = useLoading()
      
      showLoading('加载中...', true)
      updateProgress(50, '已完成50%')
      
      expect(loadingState.value.progress).toBe(50)
      expect(loadingState.value.message).toBe('已完成50%')
    })

    test('should clamp progress between 0 and 100', () => {
      const { showLoading, updateProgress, loadingState } = useLoading()
      
      showLoading('加载中...', true)
      
      updateProgress(-10)
      expect(loadingState.value.progress).toBe(0)
      
      updateProgress(150)
      expect(loadingState.value.progress).toBe(100)
    })
  })

  describe('hideLoading', () => {
    test('should hide loading and reset progress', () => {
      const { showLoading, updateProgress, hideLoading, loadingState } = useLoading()
      
      showLoading('加载中...', true)
      updateProgress(50)
      hideLoading()
      
      expect(loadingState.value.visible).toBe(false)
      expect(loadingState.value.progress).toBe(0)
    })
  })
})
