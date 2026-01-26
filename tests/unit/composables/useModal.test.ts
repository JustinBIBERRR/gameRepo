import { describe, test, expect, beforeEach } from 'vitest'
import { useModal } from '@/composables/useModal'
import { resetStorage } from '../../utils/setupTest'

describe('useModal', () => {
  beforeEach(() => {
    resetStorage()
  })

  describe('confirm', () => {
    test('should return promise that resolves to true on confirm', async () => {
      const { confirm, handleConfirm } = useModal()
      
      const promise = confirm({
        title: '确认',
        message: '确定要执行吗？'
      })
      
      // 模拟用户点击确认
      handleConfirm()
      
      const result = await promise
      expect(result).toBe(true)
    })

    test('should return promise that resolves to false on cancel', async () => {
      const { confirm, handleCancel } = useModal()
      
      const promise = confirm({
        title: '确认',
        message: '确定要执行吗？'
      })
      
      // 模拟用户点击取消
      handleCancel()
      
      const result = await promise
      expect(result).toBe(false)
    })

    test('should set modal state correctly', () => {
      const { confirm, modalState } = useModal()
      
      confirm({
        title: '测试标题',
        message: '测试消息',
        confirmText: '确定',
        cancelText: '取消'
      })
      
      expect(modalState.value.visible).toBe(true)
      expect(modalState.value.options?.title).toBe('测试标题')
      expect(modalState.value.options?.message).toBe('测试消息')
      expect(modalState.value.options?.confirmText).toBe('确定')
      expect(modalState.value.options?.cancelText).toBe('取消')
    })
  })

  describe('alert', () => {
    test('should return promise that resolves on confirm', async () => {
      const { alert, handleConfirm } = useModal()
      
      const promise = alert({
        title: '提示',
        message: '这是一个提示'
      })
      
      handleConfirm()
      
      await promise
      // alert 应该成功完成（不抛出错误）
    })

    test('should not show cancel button', () => {
      const { alert, modalState } = useModal()
      
      alert({
        title: '提示',
        message: '这是一个提示'
      })
      
      expect(modalState.value.options?.showCancel).toBe(false)
    })
  })

  describe('success', () => {
    test('should show success modal', () => {
      const { success, modalState } = useModal()
      
      success({
        title: '成功',
        message: '操作成功'
      })
      
      expect(modalState.value.visible).toBe(true)
      expect(modalState.value.options?.type).toBe('success')
      expect(modalState.value.options?.showCancel).toBe(false)
    })
  })

  describe('error', () => {
    test('should show error modal', () => {
      const { error, modalState } = useModal()
      
      error({
        title: '错误',
        message: '操作失败'
      })
      
      expect(modalState.value.visible).toBe(true)
      expect(modalState.value.options?.type).toBe('danger')
      expect(modalState.value.options?.showCancel).toBe(false)
    })
  })

  describe('close', () => {
    test('should close modal and resolve to false', async () => {
      const { confirm, close } = useModal()
      
      const promise = confirm({
        title: '确认',
        message: '确定要执行吗？'
      })
      
      close()
      
      const result = await promise
      expect(result).toBe(false)
    })
  })
})
