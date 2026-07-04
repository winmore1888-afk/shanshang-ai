import { defineStore } from 'pinia'
import { AGENTS, PRICING_PLANS } from './agents'

export const useAgentStore = defineStore('agent', {
  state: () => ({
    agents: AGENTS,
    currentAgent: null,
    activeCategory: 'all',
    searchKeyword: ''
  }),

  getters: {
    categories() {
      return [
        { id: 'all', name: '全部', icon: '🌟' },
        { id: 'content', name: '内容创作', icon: '✍️' },
        { id: 'finance', name: '投资理财', icon: '💰' },
        { id: 'education', name: '教育', icon: '🎓' }
      ]
    },

    filteredAgents(state) {
      let result = state.agents

      if (state.activeCategory !== 'all') {
        result = result.filter(a => a.category === state.activeCategory)
      }

      if (state.searchKeyword) {
        const kw = state.searchKeyword.toLowerCase()
        result = result.filter(a =>
          a.name.toLowerCase().includes(kw) ||
          a.fullName.toLowerCase().includes(kw) ||
          a.description.toLowerCase().includes(kw) ||
          a.tags.some(t => t.toLowerCase().includes(kw))
        )
      }

      return result
    }
  },

  actions: {
    setCurrentAgent(id) {
      this.currentAgent = this.agents.find(a => a.id === id) || null
    }
  }
})

export const useUserStore = defineStore('user', {
  state: () => ({
    isLogin: false,
    userInfo: null,
    token: '',
    membership: null,
    freeTrialsLeft: 3,
    orders: []
  }),

  getters: {
    isMember(state) {
      if (!state.membership) return false
      if (state.membership.plan_type === 'lifetime') return true
      if (state.membership.status !== 'active') return false
      if (!state.membership.expire_time) return false
      return new Date(state.membership.expire_time) > new Date()
    },

    membershipDaysLeft(state) {
      if (!state.membership || !state.membership.expire_time) return 0
      if (state.membership.plan_type === 'lifetime') return -1
      const now = new Date()
      const expire = new Date(state.membership.expire_time)
      const diff = Math.ceil((expire - now) / (1000 * 60 * 60 * 24))
      return Math.max(0, diff)
    },

    currentPlan(state) {
      if (!state.membership || !this.isMember) return null
      return PRICING_PLANS.find(p => p.id === state.membership.plan_type)
    },

    canAccess(state) {
      if (this.isMember) return true
      return state.freeTrialsLeft > 0
    }
  },

  actions: {
    login(userInfo, token) {
      this.isLogin = true
      this.userInfo = userInfo
      this.token = token
      uni.setStorageSync('token', token)
      uni.setStorageSync('userInfo', JSON.stringify(userInfo))
      this.loadMembership()
    },

    logout() {
      this.isLogin = false
      this.userInfo = null
      this.token = ''
      this.membership = null
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
    },

    loadMembership() {
      const saved = uni.getStorageSync('membership')
      if (saved) {
        try {
          this.membership = JSON.parse(saved)
        } catch (e) {
          this.membership = null
        }
      }
    },

    saveMembership(membership) {
      this.membership = membership
      uni.setStorageSync('membership', JSON.stringify(membership))
    },

    useFreeTrial() {
      if (this.freeTrialsLeft > 0) {
        this.freeTrialsLeft--
        uni.setStorageSync('freeTrialsLeft', this.freeTrialsLeft)
        return true
      }
      return false
    },

    activateMembership(planType) {
      const plan = PRICING_PLANS.find(p => p.id === planType)
      if (!plan) return

      const now = new Date()
      let expireTime = null
      if (plan.durationDays > 0) {
        expireTime = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000).toISOString()
      }

      const membership = {
        plan_type: planType,
        start_time: now.toISOString(),
        expire_time: expireTime,
        status: 'active'
      }
      this.saveMembership(membership)
    },

    checkAccess() {
      if (this.isMember) return true
      if (this.freeTrialsLeft > 0) return true
      return false
    }
  }
})
