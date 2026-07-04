<template>
  <view class="page-container">
    <!-- ===== 导航栏 ===== -->
    <view class="nav-bar">
      <view class="nav-inner">
        <view class="nav-logo-area">
          <image class="nav-logo" src="/static/images/logo.png" mode="aspectFit" />
          <text class="nav-title">我的</text>
        </view>
        <view class="nav-action" @click="goToAbout">
          <text class="nav-action-icon">⚙</text>
        </view>
      </view>
    </view>

    <!-- ===== 用户信息 ===== -->
    <view class="user-header">
      <view class="avatar-section">
        <view class="avatar-ring" :class="{ 'ring-gold': isMember }">
          <view class="avatar-inner">
            <text class="avatar-letter">{{ avatarText }}</text>
          </view>
        </view>
        <view class="user-text">
          <text class="user-name">{{ userName }}</text>
          <text class="user-subtitle">{{ isMember ? '会员用户' : '普通用户' }}</text>
        </view>
      </view>
    </view>

    <!-- ===== 会员卡 ===== -->
    <view class="member-section">
      <view v-if="isMember" class="member-card-vip">
        <view class="mcv-bg"></view>
        <view class="mcv-content">
          <view class="mcv-top">
            <text class="mcv-crown">👑</text>
            <view class="mcv-info">
              <text class="mcv-plan">{{ memberPlanName }}</text>
              <text v-if="daysLeft === -1" class="mcv-expire">永久有效</text>
              <text v-else class="mcv-expire">剩余 {{ daysLeft }} 天</text>
            </view>
          </view>
          <view class="mcv-divider"></view>
          <view class="mcv-benefits">
            <text class="mcv-benefit">✓ 全部智能体畅用</text>
            <text class="mcv-benefit">✓ 无限次使用</text>
            <text class="mcv-benefit">✓ 无广告体验</text>
          </view>
          <button class="btn-ghost mcv-btn" @click="goToPricing">续费 / 升级 →</button>
        </view>
      </view>

      <view v-else class="member-card-free">
        <view class="mcf-content">
          <text class="mcf-icon">🔒</text>
          <text class="mcf-title">尚未开通会员</text>
          <text class="mcf-desc">开通会员，畅享全部 10 个智能体</text>
          <button class="btn-vip mcf-btn" @click="goToPricing">
            👑 立即开通 · 仅需 ¥9.9
          </button>
        </view>
      </view>
    </view>

    <!-- ===== 数据统计 ===== -->
    <view class="stats-section">
      <view class="stats-card">
        <view class="stat" @click="goToPricing">
          <text class="stat-num">{{ freeTrialsLeft }}</text>
          <text class="stat-label">免费次数</text>
        </view>
        <view class="stat-div"></view>
        <view class="stat">
          <text class="stat-num">{{ totalUsed }}</text>
          <text class="stat-label">已使用</text>
        </view>
        <view class="stat-div"></view>
        <view class="stat">
          <text class="stat-num">{{ orderCount }}</text>
          <text class="stat-label">订单数</text>
        </view>
      </view>
    </view>

    <!-- ===== 功能菜单 ===== -->
    <view class="menu-section">
      <view class="menu-card card-glass">
        <view class="menu-item" @click="goToOrders">
          <view class="mi-icon-box" style="background: rgba(0, 212, 170, 0.1);">
            <text>📋</text>
          </view>
          <text class="mi-text">我的订单</text>
          <text class="mi-arrow">→</text>
        </view>
        <view class="menu-item" @click="goToPricing">
          <view class="mi-icon-box" style="background: rgba(255, 215, 0, 0.1);">
            <text>💎</text>
          </view>
          <text class="mi-text">开通 / 续费会员</text>
          <text class="mi-arrow">→</text>
        </view>
        <view class="menu-item" @click="goToAbout">
          <view class="mi-icon-box" style="background: rgba(108, 60, 224, 0.1);">
            <text>ℹ️</text>
          </view>
          <text class="mi-text">关于善商AI</text>
          <text class="mi-arrow">→</text>
        </view>
        <view class="menu-item" @click="shareApp">
          <view class="mi-icon-box" style="background: rgba(255, 107, 129, 0.1);">
            <text>📤</text>
          </view>
          <text class="mi-text">分享给朋友</text>
          <text class="mi-arrow">→</text>
        </view>
      </view>
    </view>

    <!-- ===== 客服 ===== -->
    <view class="contact-section">
      <view class="contact-card card-glass">
        <view class="contact-row">
          <view class="contact-left">
            <text class="contact-icon">💬</text>
            <view>
              <text class="contact-title">需要帮助？</text>
              <text class="contact-desc">使用中遇到问题，随时联系我们</text>
            </view>
          </view>
          <button class="btn-ghost contact-btn" @click="contactService">联系客服</button>
        </view>
      </view>
    </view>

    <view class="safe-bottom" style="height: 40rpx;"></view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const freeTrialsLeft = ref(3)
const totalUsed = ref(0)
const orderCount = ref(0)
const isMember = ref(false)
const memberPlanName = ref('')
const daysLeft = ref(0)

const userName = ref('善商AI用户')

const avatarText = computed(() => userName.value.charAt(0))

onShow(() => loadUserData())

function loadUserData() {
  const membership = uni.getStorageSync('membership')
  if (membership) {
    try {
      const m = JSON.parse(membership)
      isMember.value = true
      const planNames = { trial: '体验套餐', yearly: '年度套餐', lifetime: '终身套餐' }
      memberPlanName.value = planNames[m.plan_type] || '会员'

      if (m.expire_time && m.plan_type !== 'lifetime') {
        const now = new Date()
        const expire = new Date(m.expire_time)
        daysLeft.value = Math.max(0, Math.ceil((expire - now) / (1000 * 60 * 60 * 24)))
      } else if (m.plan_type === 'lifetime') {
        daysLeft.value = -1
      }
    } catch (e) {
      isMember.value = false
    }
  }

  const saved = uni.getStorageSync('freeTrialsLeft')
  if (saved !== '' && saved !== undefined && saved !== null) {
    freeTrialsLeft.value = parseInt(saved)
  } else {
    freeTrialsLeft.value = 3
    uni.setStorageSync('freeTrialsLeft', 3)
  }
  totalUsed.value = 3 - freeTrialsLeft.value
}

function goToPricing() { uni.switchTab({ url: '/pages/pricing/pricing' }) }
function goToOrders() { uni.showToast({ title: '订单功能开发中', icon: 'none' }) }
function goToAbout() { uni.navigateTo({ url: '/pages/about/about' }) }

function shareApp() {
  // #ifdef H5
  uni.showToast({ title: '请复制链接分享', icon: 'none' })
  // #endif
}

function contactService() { uni.showToast({ title: '客服功能开发中', icon: 'none' }) }
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
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo-area {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.nav-logo {
  width: 44rpx;
  height: 44rpx;
  border-radius: 10rpx;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 800;
}

.nav-action {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-action-icon {
  font-size: 26rpx;
  color: var(--text-secondary);
}

/* ===== 用户头像 ===== */
.user-header {
  padding: 28rpx 28rpx 0;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.avatar-ring {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  padding: 3rpx;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
}

.ring-gold {
  background: linear-gradient(135deg, #f5a623, #ffd700);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--bg-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-letter {
  font-size: 44rpx;
  font-weight: 800;
  color: var(--text-primary);
}

.user-text {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.user-name {
  font-size: 34rpx;
  font-weight: 700;
}

.user-subtitle {
  font-size: 24rpx;
  color: var(--text-muted);
}

/* ===== 会员卡 ===== */
.member-section {
  padding: 24rpx 28rpx;
}

/* 会员卡-VIP */
.member-card-vip {
  position: relative;
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.mcv-bg {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(135deg, rgba(245, 166, 35, 0.15), rgba(255, 215, 0, 0.05));
  z-index: 0;
}

.mcv-content {
  position: relative;
  z-index: 1;
  padding: 28rpx;
}

.mcv-top {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-bottom: 16rpx;
}

.mcv-crown {
  font-size: 40rpx;
}

.mcv-info {
  display: flex;
  flex-direction: column;
}

.mcv-plan {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--accent-gold);
}

.mcv-expire {
  font-size: 22rpx;
  color: var(--text-muted);
}

.mcv-divider {
  height: 1rpx;
  background: rgba(255,255,255,0.06);
  margin-bottom: 16rpx;
}

.mcv-benefits {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  margin-bottom: 20rpx;
}

.mcv-benefit {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.mcv-btn {
  align-self: flex-end;
  font-size: 24rpx;
}

/* 会员卡-免费 */
.member-card-free {
  border-radius: var(--radius-xl);
  background: rgba(24, 24, 48, 0.6);
  border: 1px solid rgba(255,255,255,0.06);
}

.mcf-content {
  padding: 36rpx 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10rpx;
}

.mcf-icon {
  font-size: 48rpx;
  margin-bottom: 4rpx;
}

.mcf-title {
  font-size: 28rpx;
  font-weight: 700;
}

.mcf-desc {
  font-size: 24rpx;
  color: var(--text-secondary);
  margin-bottom: 8rpx;
}

.mcf-btn {
  width: 100%;
  border-radius: var(--radius-full);
  padding: 24rpx 0;
  font-size: 28rpx;
}

/* ===== 数据统计 ===== */
.stats-section {
  padding: 0 28rpx;
  margin-bottom: 24rpx;
}

.stats-card {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 32rpx 16rpx;
  background: rgba(24, 24, 48, 0.4);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255,255,255,0.04);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.stat-num {
  font-size: 44rpx;
  font-weight: 900;
  color: var(--primary);
  letter-spacing: -1rpx;
}

.stat-label {
  font-size: 22rpx;
  color: var(--text-muted);
}

.stat-div {
  width: 1rpx;
  height: 48rpx;
  background: rgba(255,255,255,0.06);
}

/* ===== 功能菜单 ===== */
.menu-section {
  padding: 0 28rpx;
  margin-bottom: 24rpx;
}

.menu-card {
  margin: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 22rpx 8rpx;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  transition: all 0.2s;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  opacity: 0.7;
}

.mi-icon-box {
  width: 52rpx;
  height: 52rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
}

.mi-text {
  flex: 1;
  font-size: 28rpx;
  color: var(--text-primary);
}

.mi-arrow {
  font-size: 22rpx;
  color: var(--text-muted);
}

/* ===== 客服 ===== */
.contact-section {
  padding: 0 28rpx;
}

.contact-card {
  margin: 0;
}

.contact-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.contact-left {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.contact-icon {
  font-size: 36rpx;
}

.contact-title {
  font-size: 26rpx;
  font-weight: 600;
  display: block;
  margin-bottom: 2rpx;
}

.contact-desc {
  font-size: 22rpx;
  color: var(--text-muted);
}

.contact-btn {
  flex-shrink: 0;
  font-size: 24rpx;
}
</style>
