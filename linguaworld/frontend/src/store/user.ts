import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, register as apiRegister, getUserInfo } from '@/api/user'
import type { User, LoginParams, RegisterParams } from '@/types'

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const userInfo = ref<User | null>(null)

  // Token
  const token = ref<string>(localStorage.getItem('token') || '')

  // 登录状态
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)

  // 登录
  const login = async (params: LoginParams): Promise<boolean> => {
    try {
      const res = await apiLogin(params)
      if (res.code === 200 && res.data) {
        token.value = res.data.token
        userInfo.value = res.data.userInfo
        localStorage.setItem('token', res.data.token)
        return true
      }
      return false
    } catch (error) {
      console.error('登录失败:', error)
      return false
    }
  }

  // 注册
  const register = async (params: RegisterParams): Promise<boolean> => {
    try {
      const res = await apiRegister(params)
      if (res.code === 200) {
        return true
      }
      return false
    } catch (error) {
      console.error('注册失败:', error)
      return false
    }
  }

  // 获取用户信息
  const fetchUserInfo = async (): Promise<void> => {
    if (!token.value) return

    try {
      const res = await getUserInfo()
      if (res.code === 200 && res.data) {
        userInfo.value = res.data
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  // 退出登录
  const logout = () => {
    userInfo.value = null
    token.value = ''
    localStorage.removeItem('token')
  }

  // 更新用户信息
  const updateUserInfo = (info: Partial<User>) => {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...info }
    }
  }

  // 增加经验值
  const addExp = (amount: number) => {
    if (userInfo.value) {
      userInfo.value.exp += amount
      // 检查是否升级
      const newLevel = Math.floor(userInfo.value.exp / 1000) + 1
      if (newLevel > userInfo.value.level) {
        userInfo.value.level = newLevel
      }
    }
  }

  // 初始化
  const init = () => {
    if (token.value) {
      fetchUserInfo()
    }
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    login,
    register,
    fetchUserInfo,
    logout,
    updateUserInfo,
    addExp,
    init
  }
})
