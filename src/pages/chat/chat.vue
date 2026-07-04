<template>
  <view class="page-container">
    <view v-if="agent" class="chat-container">
      <!-- 顶部信息栏 -->
      <view class="chat-header">
        <view class="header-left">
          <view class="back-btn" @click="goBack">←</view>
          <image class="chat-logo" src="/static/images/logo.png" mode="aspectFit" />
          <text class="chat-agent-icon">{{ agent.icon }}</text>
          <text class="chat-agent-name">{{ agent.name }}</text>
        </view>
        <view class="header-right">
          <text class="external-btn" @click="openExternal">新窗口 ↗</text>
        </view>
      </view>

      <!-- #ifdef MP-WEIXIN -->
      <!-- 小程序端：使用 web-view 嵌入 -->
      <web-view :src="agent.url" class="chat-webview"></web-view>
      <!-- #endif -->

      <!-- #ifdef H5 -->
      <!-- H5 端：iframe 内嵌智能体页面 + 备用提示 -->
      <view class="h5-chat-area">
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

        <!-- iframe 加载失败或被拦截时的备用界面 -->
        <view v-if="iframeError || !iframeLoaded && showFallback" class="fallback-area">
          <view class="fallback-card">
            <text class="fallback-icon">{{ agent.icon }}</text>
            <text class="fallback-title">{{ agent.name }}</text>
            <text class="fallback-subtitle">正在为您连接智能体...</text>

            <!-- 加载动画 -->
            <view v-if="!iframeError" class="loading-dots">
              <span></span><span></span><span></span>
            </view>

            <!-- 加载失败提示 -->
            <view v-if="iframeError" class="error-hint">
              <text class="error-text">该智能体由于安全限制无法在当前窗口内嵌显示</text>
              <button class="btn-primary open-ext-btn" @click="openExternal">
                在新窗口中打开 {{ agent.name }} →
              </button>
              <button class="btn-secondary retry-btn" @click="retryIframe">
                重新加载
              </button>
            </view>

            <!-- 智能体快捷功能入口 -->
            <view class="quick-actions">
              <text class="quick-label">💡 您也可以直接使用以下功能：</text>
              <view v-for="(feat, idx) in agent.features" :key="idx" class="quick-item">
                <text class="quick-dot">✦</text>
                <text class="quick-text">{{ feat }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <!-- #endif -->
    </view>

    <!-- 加载中 -->
    <view v-else class="loading-state">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在加载智能体...</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onHide, onShow } from '@dcloudio/uni-app'
import { useAgentStore } from '@/store/useStores'

const agentStore = useAgentStore()
const agent = ref(null)
const iframeError = ref(false)
const iframeLoaded = ref(false)
const showFallback = ref(true)

let fallbackTimer = null

onLoad((options) => {
  const id = options?.id
  if (id) {
    agentStore.setCurrentAgent(id)
    agent.value = agentStore.currentAgent
  }
  // 3秒后如果 iframe 还没加载成功，显示 fallback 提示
  fallbackTimer = setTimeout(() => {
    if (!iframeLoaded.value) {
      showFallback.value = true
    }
  }, 3000)
})

onHide(() => {
  // 页面隐藏时清理定时器
  if (fallbackTimer) clearTimeout(fallbackTimer)
})

function onIframeLoad() {
  iframeLoaded.value = true
  showFallback.value = false
  if (fallbackTimer) clearTimeout(fallbackTimer)
}

function onIframeError() {
  iframeError.value = true
}

function retryIframe() {
  iframeError.value = false
  iframeLoaded.value = false
  showFallback.value = false
  fallbackTimer = setTimeout(() => {
    if (!iframeLoaded.value) showFallback.value = true
  }, 5000)
}

function goBack() {
  uni.navigateBack({ delta: 1 })
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
</script>

<style lang="scss" scoped>
.page-container {
  background: var(--bg-primary);
  min-height: 100vh;
}

.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ===== 顶部栏 ===== */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 20rpx;
  background: var(--bg-header);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex: 1;
  min-width: 0;
}

.back-btn {
  font-size: 36rpx;
  color: var(--text-secondary);
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-input);
}

.chat-logo {
  width: 36rpx;
  height: 36rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.chat-agent-icon {
  font-size: 32rpx;
  flex-shrink: 0;
}

.chat-agent-name {
  font-size: 26rpx;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-right {
  flex-shrink: 0;
}

.external-btn {
  font-size: 24rpx;
  color: var(--primary-color);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  background: rgba(108, 92, 231, 0.1);
  white-space: nowrap;
}

/* ===== 小程序 web-view ===== */
.chat-webview {
  flex: 1;
  width: 100%;
  height: 100%;
}

/* ===== H5 iframe 区域 ===== */
.h5-chat-area {
  flex: 1;
  position: relative;
  width: 100%;
  min-height: calc(100vh - 90rpx);
}

.chat-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
  display: block;
}

/* ===== Fallback / 备用界面 ===== */
.fallback-area {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  z-index: 10;
}

.fallback-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  padding: 48rpx 32rpx;
  max-width: 600rpx;
  text-align: center;
}

.fallback-icon {
  font-size: 80rpx;
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}

.fallback-title {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.fallback-subtitle {
  font-size: 26rpx;
  color: var(--text-muted);
}

/* 加载动画 */
.loading-dots {
  display: flex;
  gap: 10rpx;
  margin-top: 10rpx;

  span {
    width: 14rpx;
    height: 14rpx;
    border-radius: 50%;
    background: var(--primary-color);
    opacity: 0.4;
    animation: dot-bounce 1.4s infinite ease-in-out both;

    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes dot-bounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 错误提示 */
.error-hint {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  width: 100%;
  margin-top: 8rpx;
}

.error-text {
  font-size: 24rpx;
  color: var(--text-muted);
  line-height: 1.6;
}

.open-ext-btn {
  width: 100%;
  border-radius: 40rpx;
  padding: 24rpx 0;
  font-size: 28rpx;
}

.retry-btn {
  width: 100%;
  border-radius: 40rpx;
  padding: 18rpx 0;
  font-size: 26rpx;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

/* 快捷功能 */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  align-self: stretch;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 28rpx 24rpx;
  margin-top: 12rpx;
  border: 1px solid var(--border-color);
}

.quick-label {
  font-size: 24rpx;
  font-weight: 600;
  color: var(--text-secondary);
  text-align: left;
  margin-bottom: 6rpx;
}

.quick-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
  text-align: left;
}

.quick-dot {
  font-size: 20rpx;
  color: var(--primary-color);
  flex-shrink: 0;
}

.quick-text {
  font-size: 24rpx;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* ===== 加载状态 ===== */
.loading-state {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 28rpx;
  color: var(--text-muted);
}
</style>
