<template>
  <view class="page-container">
    <!-- ===== 沉浸式头部 ===== -->
    <view class="detail-hero" :style="{ background: headerBg }">
      <view class="hero-particles">
        <view class="particle" v-for="i in 12" :key="i" :style="getParticleStyle(i)"></view>
      </view>
      <view class="hero-nav">
        <view class="back-btn" @click="goBack">
          <text>←</text>
        </view>
        <image class="nav-logo" src="/static/images/logo.png" mode="aspectFit" />
        <view class="hero-nav-title">智能体详情</view>
        <view class="share-btn" @click="shareAgent">
          <text>↗</text>
        </view>
      </view>

      <view class="hero-body">
        <view class="agent-avatar">
          <view class="avatar-glow"></view>
          <text class="avatar-emoji">{{ agent.icon }}</text>
        </view>
        <text class="agent-title">{{ agent.fullName }}</text>
        <view class="agent-tags">
          <text v-for="tag in agent.tags" :key="tag" class="tag">{{ tag }}</text>
          <text v-if="agent.isHot" class="tag tag-hot">热门</text>
          <text v-if="agent.isNew" class="tag tag-new">新品</text>
        </view>
        <view class="agent-metrics">
          <view class="metric">
            <text class="metric-icon">⭐</text>
            <text class="metric-value">{{ agent.rating }}</text>
            <text class="metric-label">评分</text>
          </view>
          <view class="metric-divider"></view>
          <view class="metric">
            <text class="metric-icon">👥</text>
            <text class="metric-value">{{ formatCount(agent.usageCount) }}</text>
            <text class="metric-label">用户</text>
          </view>
          <view class="metric-divider"></view>
          <view class="metric">
            <text class="metric-icon">📅</text>
            <text class="metric-value">24h</text>
            <text class="metric-label">在线</text>
          </view>
        </view>
      </view>
    </view>

    <!-- ===== 主体内容 ===== -->
    <view class="content-body">

      <!-- ===== ★ 对话窗口（核心区域）★ ===== -->
      <view class="chat-section">
        <view class="chat-section-header">
          <view class="chat-header-left">
            <text class="chat-header-icon">💬</text>
            <text class="chat-header-title">与 {{ agent.name }} 对话</text>
          </view>
          <view class="chat-header-right">
            <text class="open-new-btn" @click="openExternal">↗ 新窗口</text>
          </view>
        </view>

        <!-- 对话 iframe 区域 -->
        <view class="chat-iframe-wrapper">
          <!-- #ifdef H5 -->
          <iframe
            v-if="!iframeError"
            :src="agent.url"
            class="chat-iframe"
            frameborder="0"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
            @error="onIframeError"
            @load="onIframeLoad"
          ></iframe>
          <!-- #endif -->

          <!-- #ifdef MP-WEIXIN -->
          <view class="mp-chat-placeholder">
            <text class="mp-icon">{{ agent.icon }}</text>
            <text class="mp-title">点击下方按钮开始对话</text>
            <button class="btn-primary mp-start-btn" @click="goToChat">开始使用 →</button>
          </view>
          <!-- #endif -->

          <!-- 加载中遮罩 -->
          <view v-if="!iframeLoaded && !iframeError" class="iframe-loading">
            <view class="loading-spinner-sm"></view>
            <text class="loading-hint">正在连接智能体...</text>
          </view>

          <!-- iframe 加载失败 -->
          <view v-if="iframeError" class="iframe-error">
            <text class="error-emoji">😕</text>
            <text class="error-title">该智能体无法在当前页面内嵌显示</text>
            <text class="error-desc">腾讯元气的安全策略可能阻止了内嵌加载</text>
            <view class="error-actions">
              <button class="btn-primary error-btn" @click="openExternal">在新窗口中打开 →</button>
              <button class="btn-ghost error-btn-retry" @click="retryIframe">重新加载</button>
            </view>
          </view>
        </view>

        <!-- 未付费遮罩层 -->
        <view v-if="!userStore.canAccess && !iframeError" class="paywall-overlay" @click="scrollToPaywall">
          <view class="overlay-content">
            <text class="overlay-emoji">🔒</text>
            <text class="overlay-title">开通会员，解锁完整对话</text>
            <text class="overlay-subtitle">您还有 <text class="highlight-count">{{ userStore.freeTrialsLeft }}</text> 次免费体验机会</text>
            <view class="overlay-arrow">👇 向下滑动 立即开通</view>
          </view>
        </view>
      </view>

      <!-- ===== 付费墙 / 使用入口 ===== -->
      <view id="paywall-anchor" class="paywall-section">
        <view v-if="!userStore.canAccess" class="paywall-card">
          <view class="paywall-glow"></view>

          <text class="paywall-emoji">🔒</text>
          <text class="paywall-title">开通会员，解锁全部智能体</text>
          <text class="paywall-subtitle">
            您还有 <text class="highlight-count">{{ userStore.freeTrialsLeft }}</text> 次免费体验
          </text>

          <!-- 套餐迷你展示 -->
          <view class="mini-plans">
            <view class="mini-plan" v-for="p in miniPlans" :key="p.label">
              <text class="mp-price">{{ p.price }}</text>
              <text class="mp-label">{{ p.label }}</text>
            </view>
          </view>

          <view class="paywall-btns">
            <button class="btn-vip paywall-main-btn" @click="goToPricing">
              👑 开通会员 · 仅需 ¥9.9/天
            </button>
            <button class="btn-ghost paywall-trial-btn" @click="startFreeTrial">
              免费体验（剩余 {{ userStore.freeTrialsLeft }} 次）
            </button>
          </view>

          <view class="trust-badges">
            <text class="trust-badge">🔒 安全支付</text>
            <text class="trust-badge">↩ 不满意可退款</text>
            <text class="trust-badge">📞 专属客服</text>
          </view>
        </view>

        <!-- 已付费：显示状态 -->
        <view v-else class="access-card">
          <view class="access-badge">
            <text class="access-crown">👑</text>
            <text class="access-text">
              {{ userStore.membership ? userStore.currentPlan?.name + '用户' : '体验中' }}
            </text>
          </view>
          <text class="access-note">对话窗口已解锁，直接在上方与智能体交流</text>
        </view>
      </view>

      <!-- ===== 介绍 + 功能 ===== -->
      <view class="section-card card-glass">
        <view class="section-icon">📋</view>
        <text class="section-heading">智能体介绍</text>
        <text class="section-body">{{ agent.description }}</text>
      </view>

      <view class="section-card card-glass">
        <view class="section-icon">✨</view>
        <text class="section-heading">核心功能</text>
        <view class="feature-list">
          <view v-for="(feat, idx) in agent.features" :key="idx" class="feature-item">
            <view class="feature-check">
              <text>✓</text>
            </view>
            <text class="feature-text">{{ feat }}</text>
          </view>
        </view>
      </view>

      <!-- ===== 用户评价 ===== -->
      <view class="section-card card-glass">
        <view class="section-icon">💬</view>
        <text class="section-heading">用户反馈</text>
        <view class="review-cards">
          <view class="review-item">
            <text class="review-text">"非常实用的工具，帮我省了大量时间！"</text>
            <view class="review-meta">
              <text class="review-stars">⭐⭐⭐⭐⭐</text>
              <text class="review-time">2天前</text>
            </view>
          </view>
          <view class="review-item">
            <text class="review-text">"功能强大，操作简单，新手友好。"</text>
            <view class="review-meta">
              <text class="review-stars">⭐⭐⭐⭐⭐</text>
              <text class="review-time">5天前</text>
            </view>
          </view>
        </view>
      </view>

      <!-- ===== 更多推荐 ===== -->
      <view class="section-card card-glass">
        <view class="section-icon">🔗</view>
        <text class="section-heading">更多推荐</text>
        <view class="related-grid">
          <view
            v-for="related in relatedAgents"
            :key="related.id"
            class="related-card"
            @click="goToDetail(related.id)"
          >
            <text class="related-icon">{{ related.icon }}</text>
            <text class="related-name">{{ related.name }}</text>
            <view class="related-meta">
              <text>⭐ {{ related.rating }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="safe-bottom" style="height: 40rpx;"></view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useAgentStore, useUserStore } from '@/store/useStores'

const agentStore = useAgentStore()
const userStore = useUserStore()

const agent = computed(() => agentStore.currentAgent || { name: '', features: [], tags: [] })
const iframeError = ref(false)
const iframeLoaded = ref(false)

let fallbackTimer = null

const relatedAgents = computed(() => {
  if (!agentStore.currentAgent) return []
  return agentStore.agents
    .filter(a => a.id !== agentStore.currentAgent.id && a.category === agentStore.currentAgent.category)
    .slice(0, 3)
})

const miniPlans = [
  { price: '¥9.9', label: '体验1天' },
  { price: '¥19.9', label: '畅享1年' },
  { price: '¥99.9', label: '永久使用' }
]

const headerBg = computed(() => {
  const cat = agentStore.currentAgent?.category
  if (cat === 'content') return 'linear-gradient(180deg, #2d1155 0%, #1a0940 40%, var(--bg-root) 100%)'
  if (cat === 'finance') return 'linear-gradient(180deg, #0a2e2a 0%, #061e1c 40%, var(--bg-root) 100%)'
  return 'linear-gradient(180deg, #2d1a0a 0%, #1a0f05 40%, var(--bg-root) 100%)'
})

onLoad((options) => {
  const id = options?.id
  if (id) agentStore.setCurrentAgent(id)

  // 3秒后如果 iframe 还没加载成功，不做额外处理（有加载动画）
  fallbackTimer = setTimeout(() => {
    // keep waiting, loading spinner stays
  }, 3000)
})

function onIframeLoad() {
  iframeLoaded.value = true
}

function onIframeError() {
  iframeError.value = true
}

function retryIframe() {
  iframeError.value = false
  iframeLoaded.value = false
}

function goToChat() {
  const id = agentStore.currentAgent?.id
  uni.navigateTo({ url: `/pages/chat/chat?id=${id}` })
}

function scrollToPaywall() {
  // 滚动到付费墙区域
  // #ifdef H5
  const el = document.getElementById('paywall-anchor')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
  // #endif
}

function startFreeTrial() {
  if (userStore.freeTrialsLeft > 0) {
    userStore.useFreeTrial()
    uni.showToast({ title: '体验已激活！对话窗口已解锁', icon: 'success' })
  } else {
    uni.showToast({ title: '体验次数已用完，开通会员吧', icon: 'none' })
    setTimeout(() => goToPricing(), 1000)
  }
}

function goToPricing() {
  uni.switchTab({ url: '/pages/pricing/pricing' })
}

function goToDetail(id) {
  uni.navigateTo({ url: `/pages/detail/detail?id=${id}` })
}

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function shareAgent() {
  uni.showToast({ title: '点击右上角分享', icon: 'none' })
}

function openExternal() {
  if (agent.value?.url) {
    // #ifdef H5
    window.open(agent.value.url, '_blank')
    // #endif
    // #ifdef MP-WEIXIN
    uni.navigateTo({
      url: `/pages/webview/webview?src=${encodeURIComponent(agent.value.url)}&title=${encodeURIComponent(agent.value.name)}`
    })
    // #endif
  }
}

function formatCount(num) {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num
}

function getParticleStyle(i) {
  const size = 3 + Math.random() * 5
  return {
    width: `${size}rpx`,
    height: `${size}rpx`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    opacity: 0.1 + Math.random() * 0.3,
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${3 + Math.random() * 4}s`
  }
}
</script>

<style lang="scss" scoped>
/* ===== 沉浸式头部 ===== */
.detail-hero {
  position: relative;
  padding-bottom: 40rpx;
  overflow: hidden;
}

.hero-particles {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: #fff;
  animation: float-particle 4s ease-in-out infinite;
}

@keyframes float-particle {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
  50% { transform: translateY(-20rpx) scale(1.5); opacity: 0.4; }
}

.hero-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(var(--status-bar-height, 44px) + 12rpx) 28rpx 0;
}

.nav-logo {
  width: 40rpx;
  height: 40rpx;
  border-radius: 10rpx;
  margin-right: 8rpx;
}

.back-btn, .share-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #fff;
  transition: all 0.2s;
}

.back-btn:active, .share-btn:active {
  background: rgba(255,255,255,0.15);
}

.hero-nav-title {
  font-size: 28rpx;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
}

.hero-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 28rpx 0;
  text-align: center;
}

.agent-avatar {
  position: relative;
  margin-bottom: 24rpx;
}

.avatar-glow {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.05);
  filter: blur(20px);
  animation: pulse 3s ease-in-out infinite;
}

.avatar-emoji {
  font-size: 80rpx;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 4px 16px rgba(0,0,0,0.4));
}

.agent-title {
  font-size: 34rpx;
  font-weight: 800;
  color: #fff;
  margin-bottom: 12rpx;
  line-height: 1.3;
}

.agent-tags {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 28rpx;
}

/* 指标 */
.agent-metrics {
  display: flex;
  align-items: center;
  gap: 0;
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-lg);
  padding: 20rpx 0;
  width: 100%;
  border: 1px solid rgba(255,255,255,0.06);
}

.metric {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.metric-icon { font-size: 26rpx; }

.metric-value {
  font-size: 30rpx;
  font-weight: 800;
  color: #fff;
}

.metric-label {
  font-size: 20rpx;
  color: rgba(255,255,255,0.5);
}

.metric-divider {
  width: 1rpx;
  height: 40rpx;
  background: rgba(255,255,255,0.08);
}

/* ===== 内容区 ===== */
.content-body {
  padding: 20rpx 28rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

/* ===== ★ 对话窗口（核心）★ ===== */
.chat-section {
  background: linear-gradient(180deg, rgba(24, 24, 48, 0.9), rgba(18, 18, 40, 0.95));
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}

.chat-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.chat-header-left {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.chat-header-icon { font-size: 26rpx; }

.chat-header-title {
  font-size: 26rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.open-new-btn {
  font-size: 22rpx;
  color: var(--primary);
  padding: 8rpx 18rpx;
  border-radius: 20rpx;
  background: rgba(0, 212, 170, 0.08);
  border: 1px solid rgba(0, 212, 170, 0.15);
}

/* iframe 容器 */
.chat-iframe-wrapper {
  position: relative;
  width: 100%;
  height: 600rpx;
  background: #fff;
  overflow: hidden;
}

.chat-iframe {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

/* 加载中 */
.iframe-loading {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 15, 35, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  z-index: 5;
  transition: opacity 0.4s;
}

.loading-spinner-sm {
  width: 48rpx;
  height: 48rpx;
  border: 3rpx solid rgba(255,255,255,0.1);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.loading-hint {
  font-size: 24rpx;
  color: var(--text-muted);
}

/* iframe 加载失败 */
.iframe-error {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 15, 35, 0.98);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  padding: 40rpx;
  z-index: 5;
  text-align: center;
}

.error-emoji { font-size: 56rpx; }

.error-title {
  font-size: 26rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.error-desc {
  font-size: 22rpx;
  color: var(--text-muted);
  line-height: 1.6;
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  width: 100%;
  margin-top: 8rpx;
}

.error-btn {
  width: 100%;
  border-radius: var(--radius-full);
  padding: 22rpx 0;
  font-size: 26rpx;
}

.error-btn-retry {
  width: 100%;
  border-radius: var(--radius-full);
  padding: 18rpx 0;
  font-size: 24rpx;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--text-secondary);
}

/* 小程序占位 */
.mp-chat-placeholder {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  background: rgba(15, 15, 35, 0.98);
}

.mp-icon { font-size: 64rpx; }

.mp-title {
  font-size: 26rpx;
  color: var(--text-secondary);
}

.mp-start-btn {
  border-radius: var(--radius-full);
  padding: 20rpx 48rpx;
  font-size: 28rpx;
  margin-top: 8rpx;
}

/* ===== 未付费遮罩 ===== */
.paywall-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  z-index: 8;
  background: linear-gradient(0deg, rgba(15,15,35,0.95) 0%, rgba(15,15,35,0.7) 60%, transparent 100%);
  padding: 60rpx 28rpx 24rpx;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  text-align: center;
}

.overlay-emoji { font-size: 40rpx; }

.overlay-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #fff;
}

.overlay-subtitle {
  font-size: 24rpx;
  color: rgba(255,255,255,0.6);
}

.highlight-count {
  color: var(--primary);
  font-weight: 700;
  font-size: 30rpx;
}

.overlay-arrow {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: var(--accent-gold);
  animation: bounce-down 1.5s ease-in-out infinite;
}

@keyframes bounce-down {
  0%, 100% { transform: translateY(0); opacity: 0.7; }
  50% { transform: translateY(6rpx); opacity: 1; }
}

/* ===== 付费墙 ===== */
.paywall-section {
  position: relative;
}

.paywall-card {
  background: linear-gradient(180deg, rgba(24, 24, 48, 0.8), rgba(24, 24, 48, 0.6));
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 215, 0, 0.15);
  border-radius: var(--radius-xl);
  padding: 40rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-gold);
}

.paywall-glow {
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: radial-gradient(circle at 50% 30%, rgba(255, 215, 0, 0.06), transparent 60%);
  pointer-events: none;
}

.paywall-emoji { font-size: 56rpx; margin-bottom: 12rpx; position: relative; z-index: 1; }

.paywall-title {
  font-size: 30rpx; font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8rpx;
  position: relative; z-index: 1;
}

.paywall-subtitle {
  font-size: 26rpx;
  color: var(--text-secondary);
  margin-bottom: 24rpx;
  position: relative; z-index: 1;
}

/* 迷你套餐 */
.mini-plans {
  display: flex;
  gap: 16rpx;
  margin-bottom: 28rpx;
  position: relative; z-index: 1;
  width: 100%;
}

.mini-plan {
  flex: 1;
  padding: 16rpx 12rpx;
  background: rgba(255,255,255,0.03);
  border-radius: var(--radius-md);
  border: 1px solid rgba(255,255,255,0.06);
}

.mp-price {
  font-size: 32rpx; font-weight: 800;
  color: var(--accent-gold);
  display: block; margin-bottom: 4rpx;
}

.mp-label { font-size: 20rpx; color: var(--text-muted); }

/* 付费按钮 */
.paywall-btns {
  width: 100%;
  display: flex; flex-direction: column;
  gap: 14rpx;
  margin-bottom: 24rpx;
  position: relative; z-index: 1;
}

.paywall-main-btn {
  width: 100%;
  border-radius: var(--radius-full);
  padding: 26rpx 0;
  font-size: 30rpx;
}

.paywall-trial-btn { width: 100%; }

.trust-badges {
  display: flex; gap: 20rpx;
  position: relative; z-index: 1;
}

.trust-badge {
  font-size: 20rpx; color: var(--text-muted);
  display: flex; align-items: center; gap: 4rpx;
}

/* ===== 已付费入口 ===== */
.access-card {
  background: linear-gradient(180deg, rgba(24, 24, 48, 0.8), rgba(24, 24, 48, 0.6));
  backdrop-filter: blur(30px);
  border: 1px solid rgba(0, 212, 170, 0.2);
  border-radius: var(--radius-xl);
  padding: 28rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14rpx;
  box-shadow: var(--shadow-glow);
}

.access-badge {
  display: flex; align-items: center; gap: 8rpx;
  padding: 8rpx 20rpx;
  background: rgba(255, 215, 0, 0.1);
  border-radius: var(--radius-full);
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.access-crown { font-size: 24rpx; }

.access-text {
  font-size: 24rpx;
  color: var(--accent-gold);
  font-weight: 600;
}

.access-note {
  font-size: 24rpx;
  color: var(--text-secondary);
}

/* ===== 卡片 ===== */
.section-card {
  margin: 0;
  padding: 28rpx;
}

.section-icon { font-size: 28rpx; margin-bottom: 12rpx; }

.section-heading {
  font-size: 28rpx; font-weight: 700;
  color: var(--text-primary);
  display: block; margin-bottom: 16rpx;
}

.section-body {
  font-size: 26rpx; color: var(--text-secondary);
  line-height: 1.8;
}

/* 功能列表 */
.feature-list { display: flex; flex-direction: column; gap: 14rpx; }

.feature-item {
  display: flex; align-items: flex-start; gap: 12rpx;
}

.feature-check {
  width: 36rpx; height: 36rpx;
  border-radius: 50%;
  background: rgba(0, 212, 170, 0.12);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 2rpx;
  font-size: 18rpx; color: var(--primary); font-weight: 700;
}

.feature-text {
  font-size: 26rpx; color: var(--text-secondary);
  line-height: 1.5; flex: 1;
}

/* 用户评价 */
.review-cards { display: flex; flex-direction: column; gap: 12rpx; }

.review-item {
  padding: 20rpx;
  background: rgba(255,255,255,0.02);
  border-radius: var(--radius-md);
  border: 1px solid rgba(255,255,255,0.04);
}

.review-text {
  font-size: 24rpx; color: var(--text-secondary);
  line-height: 1.6; font-style: italic;
  display: block; margin-bottom: 10rpx;
}

.review-meta { display: flex; align-items: center; gap: 12rpx; }

.review-stars { font-size: 22rpx; }

.review-time { font-size: 20rpx; color: var(--text-muted); }

/* 相关推荐 */
.related-grid { display: flex; gap: 12rpx; flex-wrap: wrap; }

.related-card {
  flex: 1; min-width: 180rpx;
  padding: 20rpx;
  background: rgba(255,255,255,0.02);
  border-radius: var(--radius-md);
  border: 1px solid rgba(255,255,255,0.04);
  display: flex; flex-direction: column; align-items: center;
  gap: 8rpx;
  transition: all 0.25s;
}

.related-card:active {
  background: rgba(255,255,255,0.05);
  transform: scale(0.97);
}

.related-icon { font-size: 36rpx; }

.related-name {
  font-size: 22rpx; color: var(--text-secondary);
  text-align: center; line-height: 1.3;
}

.related-meta { font-size: 20rpx; color: var(--text-muted); }
</style>
