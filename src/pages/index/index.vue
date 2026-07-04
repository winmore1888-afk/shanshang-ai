<template>
  <view class="page-container">
    <!-- ===== 沉浸式导航栏 ===== -->
    <view class="nav-bar">
      <view class="nav-inner">
        <view class="logo-area">
          <image class="logo-img" src="/static/images/logo.png" mode="aspectFit" />
          <text class="logo-text">善商AI</text>
        </view>
        <view class="nav-actions">
          <view class="nav-badge" v-if="userStore.isMember">
            <text class="badge-dot"></text>
            <text class="badge-text">PRO</text>
          </view>
          <view class="avatar-btn" @click="goToUser">
            <text class="avatar-icon">👤</text>
          </view>
        </view>
      </view>
    </view>

    <!-- ===== 搜索栏 ===== -->
    <view class="search-bar">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="agentStore.searchKeyword"
          placeholder="搜索你需要的智能体..."
          placeholder-style="color: #5a5a72"
          @input="onSearch"
        />
        <view v-if="agentStore.searchKeyword" class="search-clear" @click="clearSearch">
          <text>✕</text>
        </view>
      </view>
    </view>

    <!-- ===== 精选 Banner 轮播 ===== -->
    <view class="hero-section">
      <swiper class="hero-swiper"
        :autoplay="true" :interval="5000" :circular="true"
        :indicator-dots="true" indicator-color="rgba(255,255,255,0.15)"
        indicator-active-color="#00d4aa"
      >
        <swiper-item v-for="(banner, idx) in banners" :key="idx">
          <view class="hero-card" :style="{ background: banner.bg }">
            <view class="hero-content">
              <view class="hero-badge" v-if="banner.badge">{{ banner.badge }}</view>
              <text class="hero-title">{{ banner.title }}</text>
              <text class="hero-desc">{{ banner.desc }}</text>
              <view class="hero-action" @click="goToDetail(banner.agentId)">
                <text>立即体验</text>
                <text class="action-arrow">→</text>
              </view>
            </view>
            <view class="hero-visual">
              <text class="hero-emoji">{{ banner.emoji }}</text>
              <view class="hero-orb" :style="{ background: banner.orbColor }"></view>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- ===== 快捷分类 ===== -->
    <view class="category-bar">
      <scroll-view scroll-x class="cat-scroll" :show-scrollbar="false" enhanced>
        <view class="cat-list">
          <view
            v-for="cat in agentStore.categories"
            :key="cat.id"
            class="cat-chip"
            :class="{ 'cat-active': agentStore.activeCategory === cat.id }"
            @click="switchCategory(cat.id)"
          >
            <text class="cat-emoji">{{ cat.icon }}</text>
            <text class="cat-label">{{ cat.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- ===== 智能体列表 ===== -->
    <view class="agent-feed">
      <view class="feed-header">
        <view class="feed-title-row">
          <text class="feed-title">
            {{ agentStore.activeCategory === 'all' ? '全部智能体' : agentStore.categories.find(c => c.id === agentStore.activeCategory)?.name }}
          </text>
          <text class="feed-count">{{ agentStore.filteredAgents.length }} 个</text>
        </view>
        <view class="feed-sort">
          <text class="sort-label">按热度</text>
        </view>
      </view>

      <!-- 智能体卡片网格 -->
      <view class="agent-grid">
        <view
          v-for="(agent, idx) in agentStore.filteredAgents"
          :key="agent.id"
          class="agent-card fade-in"
          :class="'fade-in-' + (idx % 4 + 1)"
          @click="goToDetail(agent.id)"
        >
          <!-- 顶部：图标 + 标签 -->
          <view class="ac-top">
            <view class="ac-icon-box" :style="{ background: getAgentGradient(agent) }">
              <text class="ac-icon">{{ agent.icon }}</text>
            </view>
            <view class="ac-badges">
              <text v-if="agent.isHot" class="tag tag-hot">热门</text>
              <text v-if="agent.isNew" class="tag tag-new">新品</text>
            </view>
          </view>

          <!-- 名称 -->
          <text class="ac-name">{{ agent.name }}</text>

          <!-- 描述 -->
          <text class="ac-desc">{{ agent.description }}</text>

          <!-- 底部：数据 + 按钮 -->
          <view class="ac-footer">
            <view class="ac-stats">
              <view class="ac-stat">
                <text class="stat-star">⭐</text>
                <text class="stat-val">{{ agent.rating }}</text>
              </view>
              <view class="ac-stat">
                <text class="stat-label">使用</text>
                <text class="stat-val">{{ formatCount(agent.usageCount) }}</text>
              </view>
            </view>
            <view class="ac-cta">
              <text class="cta-text">体验</text>
              <text class="cta-arrow">→</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="agentStore.filteredAgents.length === 0" class="empty-state">
        <text class="empty-emoji">🔮</text>
        <text class="empty-title">没有找到相关智能体</text>
        <text class="empty-hint">试试换个关键词搜索吧</text>
      </view>
    </view>

    <!-- 底部安全区 -->
    <view class="safe-bottom" style="height: 140rpx;"></view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useAgentStore, useUserStore } from '@/store/useStores'

const agentStore = useAgentStore()
const userStore = useUserStore()

const banners = ref([
  {
    title: '爆款短剧 2.0 上线',
    desc: 'AI 创作力全面升级，爆款命中率提升 300%',
    emoji: '🎬',
    badge: '🔥 热门',
    bg: 'linear-gradient(135deg, #6c3ce0 0%, #a855f7 50%, #6366f1 100%)',
    orbColor: 'rgba(168, 85, 247, 0.4)',
    agentId: 'agent_001'
  },
  {
    title: '巴菲特投资顾问',
    desc: '用护城河理论，寻找值得持有十年的好公司',
    emoji: '💎',
    badge: '⭐ 4.9',
    bg: 'linear-gradient(135deg, #0d9488 0%, #00d4aa 50%, #059669 100%)',
    orbColor: 'rgba(0, 212, 170, 0.4)',
    agentId: 'agent_009'
  },
  {
    title: '高考志愿填报',
    desc: '20 年经验专家，98% 成功率帮你选对方向',
    emoji: '🎓',
    badge: '🏆 TOP 1',
    bg: 'linear-gradient(135deg, #e04e3d 0%, #f97316 50%, #fb923c 100%)',
    orbColor: 'rgba(249, 115, 22, 0.4)',
    agentId: 'agent_010'
  }
])

function switchCategory(id) {
  agentStore.activeCategory = id
}

function onSearch(e) {
  agentStore.searchKeyword = e.detail.value
}

function clearSearch() {
  agentStore.searchKeyword = ''
}

function goToDetail(id) {
  uni.navigateTo({ url: `/pages/detail/detail?id=${id}` })
}

function goToUser() {
  uni.switchTab({ url: '/pages/user/user' })
}

function getAgentGradient(agent) {
  const gradients = {
    content: 'linear-gradient(135deg, #6c3ce0, #a855f7)',
    finance: 'linear-gradient(135deg, #0d9488, #00d4aa)',
    education: 'linear-gradient(135deg, #e04e3d, #f97316)'
  }
  return gradients[agent.category] || gradients.content
}

function formatCount(num) {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num
}
</script>

<style lang="scss" scoped>
/* ===== 导航栏 ===== */
.nav-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0 28rpx;
  padding-top: calc(var(--status-bar-height, 44px) + 12rpx);
  padding-bottom: 12rpx;
  background: rgba(10, 10, 20, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.logo-img {
  width: 52rpx;
  height: 52rpx;
  border-radius: 12rpx;
  box-shadow: 0 2px 10px rgba(200, 30, 30, 0.3);
}

.logo-text {
  font-size: 34rpx;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: 1rpx;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.nav-badge {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 16rpx;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: var(--radius-full);
}

.badge-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #ffd700;
  box-shadow: 0 0 6px #ffd700;
}

.badge-text {
  font-size: 18rpx;
  font-weight: 700;
  color: #ffd700;
  letter-spacing: 1rpx;
}

.avatar-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.avatar-btn:active {
  background: rgba(255,255,255,0.1);
}

.avatar-icon {
  font-size: 26rpx;
}

/* ===== 搜索栏 ===== */
.search-bar {
  padding: 16rpx 28rpx 8rpx;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: var(--radius-full);
  padding: 16rpx 24rpx;
  transition: all 0.25s;
}

.search-box:focus-within {
  border-color: var(--border-active);
  background: rgba(0, 212, 170, 0.04);
}

.search-icon {
  font-size: 26rpx;
  opacity: 0.5;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: var(--text-primary);
}

.search-clear {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: var(--text-muted);
}

/* ===== 精选 Banner ===== */
.hero-section {
  padding: 12rpx 28rpx 20rpx;
}

.hero-swiper {
  height: 300rpx;
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.hero-card {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 36rpx;
  position: relative;
  overflow: hidden;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  z-index: 2;
  max-width: 60%;
}

.hero-badge {
  display: inline-flex;
  align-self: flex-start;
  padding: 4rpx 16rpx;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-full);
  font-size: 20rpx;
  color: #fff;
  font-weight: 600;
}

.hero-title {
  font-size: 34rpx;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
  letter-spacing: 0.5rpx;
}

.hero-desc {
  font-size: 24rpx;
  color: rgba(255,255,255,0.8);
  line-height: 1.4;
}

.hero-action {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  margin-top: 4rpx;
  padding: 8rpx 24rpx;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-full);
  font-size: 24rpx;
  color: #fff;
  font-weight: 600;
  align-self: flex-start;
}

.action-arrow {
  font-size: 22rpx;
}

.hero-visual {
  position: relative;
  z-index: 1;
}

.hero-emoji {
  font-size: 100rpx;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
}

.hero-orb {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.5;
}

/* ===== 分类栏 ===== */
.category-bar {
  padding: 8rpx 0 12rpx;
}

.cat-scroll {
  white-space: nowrap;
}

.cat-list {
  display: inline-flex;
  gap: 12rpx;
  padding: 0 28rpx;
}

.cat-chip {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 14rpx 26rpx;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: var(--radius-full);
  transition: all 0.25s var(--ease-out);
  white-space: nowrap;
}

.cat-chip:active {
  transform: scale(0.96);
}

.cat-active {
  background: rgba(0, 212, 170, 0.12);
  border-color: var(--border-active);
}

.cat-emoji {
  font-size: 22rpx;
}

.cat-label {
  font-size: 26rpx;
  color: var(--text-secondary);
  font-weight: 500;
}

.cat-active .cat-label {
  color: var(--primary);
  font-weight: 600;
}

/* ===== 智能体列表 ===== */
.agent-feed {
  padding: 0 28rpx;
}

.feed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.feed-title-row {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
}

.feed-title {
  font-size: 32rpx;
  font-weight: 800;
  color: var(--text-primary);
}

.feed-count {
  font-size: 22rpx;
  color: var(--text-muted);
}

.feed-sort {
  display: flex;
  align-items: center;
}

.sort-label {
  font-size: 22rpx;
  color: var(--text-muted);
}

/* ===== 智能体卡片 ===== */
.agent-grid {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.agent-card {
  background: rgba(24, 24, 48, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: var(--radius-lg);
  padding: 28rpx;
  transition: all 0.3s var(--ease-out);
  position: relative;
  overflow: hidden;
}

.agent-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
}

.agent-card:active {
  transform: scale(0.985);
  background: rgba(32, 32, 60, 0.8);
  border-color: rgba(255,255,255,0.1);
}

/* 卡片顶部 */
.ac-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.ac-icon-box {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
}

.ac-icon {
  font-size: 32rpx;
}

.ac-badges {
  display: flex;
  gap: 6rpx;
}

/* 名称 */
.ac-name {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8rpx;
  display: block;
  line-height: 1.3;
}

/* 描述 */
.ac-desc {
  font-size: 24rpx;
  color: var(--text-secondary);
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 18rpx;
}

/* 底部 */
.ac-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ac-stats {
  display: flex;
  gap: 20rpx;
}

.ac-stat {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.stat-star {
  font-size: 20rpx;
}

.stat-label {
  font-size: 20rpx;
  color: var(--text-muted);
}

.stat-val {
  font-size: 22rpx;
  color: var(--text-secondary);
  font-weight: 600;
}

/* CTA 按钮 */
.ac-cta {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 10rpx 22rpx;
  background: rgba(0, 212, 170, 0.1);
  border: 1px solid rgba(0, 212, 170, 0.2);
  border-radius: var(--radius-full);
  transition: all 0.25s;
}

.ac-cta:active {
  background: rgba(0, 212, 170, 0.2);
}

.cta-text {
  font-size: 22rpx;
  color: var(--primary);
  font-weight: 600;
}

.cta-arrow {
  font-size: 18rpx;
  color: var(--primary);
}

/* ===== 空状态 ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
  gap: 16rpx;
}

.empty-emoji {
  font-size: 72rpx;
  animation: float 3s ease-in-out infinite;
}

.empty-title {
  font-size: 28rpx;
  color: var(--text-secondary);
  font-weight: 600;
}

.empty-hint {
  font-size: 24rpx;
  color: var(--text-muted);
}

/* ===== 动画 ===== */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.5s var(--ease-out) both;
}

.fade-in-1 { animation-delay: 0.05s; }
.fade-in-2 { animation-delay: 0.1s; }
.fade-in-3 { animation-delay: 0.15s; }
.fade-in-4 { animation-delay: 0.2s; }
</style>
