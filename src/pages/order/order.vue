<template>
  <view class="page-container">
    <!-- ===== 导航栏 ===== -->
    <view class="order-nav">
      <view class="back-btn" @click="goBack">←</view>
      <view class="nav-center">
        <image class="nav-logo" src="/static/images/logo.png" mode="aspectFit" />
        <text class="nav-title">确认订单</text>
      </view>
      <view class="nav-placeholder"></view>
    </view>

    <!-- ===== 套餐信息 ===== -->
    <view class="order-hero">
      <text class="hero-icon">🛒</text>
      <text class="hero-plan">{{ displayName }}</text>
      <text class="hero-price">¥{{ displayPrice }}</text>
      <text class="hero-duration">{{ displayDuration }}</text>
    </view>

    <!-- ===== 订单明细 ===== -->
    <view class="order-detail-card">
      <view class="od-row">
        <text class="od-label">套餐名称</text>
        <text class="od-value">{{ displayName }}</text>
      </view>
      <view class="od-row">
        <text class="od-label">有效期</text>
        <text class="od-value">{{ displayDuration }}</text>
      </view>
      <view class="od-divider"></view>
      <view class="od-row">
        <text class="od-label">原价</text>
        <text class="od-value od-strikethrough">¥{{ (displayPrice + displayDiscount).toFixed(1) }}</text>
      </view>
      <view class="od-row">
        <text class="od-label">优惠</text>
        <text class="od-value od-discount">- ¥{{ displayDiscount.toFixed(1) }}</text>
      </view>
      <view class="od-divider"></view>
      <view class="od-row od-total-row">
        <text class="od-label">应付</text>
        <text class="od-total">¥{{ displayPrice }}</text>
      </view>
    </view>

    <!-- ===== 支付方式 ===== -->
    <view class="pay-section">
      <text class="section-label">选择支付方式</text>
      <view class="pay-methods">
        <view
          v-for="method in payMethods"
          :key="method.id"
          class="pm-item"
          :class="{ 'pm-active': selectedMethod === method.id }"
          @click="selectedMethod = method.id"
        >
          <text class="pm-icon">{{ method.icon }}</text>
          <view class="pm-info">
            <text class="pm-name">{{ method.name }}</text>
            <text class="pm-desc">{{ method.desc }}</text>
          </view>
          <view class="pm-radio" :class="{ 'pm-checked': selectedMethod === method.id }">
            <view v-if="selectedMethod === method.id" class="pm-dot"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- ===== 支付按钮 ===== -->
    <view class="pay-bottom">
      <view class="pay-total-row">
        <text class="pay-total-label">合计</text>
        <text class="pay-total-price">¥{{ displayPrice }}</text>
      </view>
      <button class="btn-primary pay-submit-btn" @click="handlePay" :disabled="paying">
        <text v-if="!paying">立即支付</text>
        <text v-else>支付中...</text>
      </button>
      <view class="pay-trust">
        <text>🔒 安全加密支付</text>
        <text>·</text>
        <text>不满意可退款</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { PRICING_PLANS } from '@/store/agents'

const planId = ref('')
const planName = ref('')
const price = ref(0)
const duration = ref('')
const discount = ref(0)

// 默认套餐：体验套餐
const defaultPlan = PRICING_PLANS[0]

// 计算属性：确保价格等字段有默认值
const displayPrice = computed(() => price.value > 0 ? price.value : defaultPlan.price)
const displayName = computed(() => planName.value || defaultPlan.name)
const displayDuration = computed(() => duration.value || defaultPlan.duration)
const displayDiscount = computed(() => discount.value || (defaultPlan.originalPrice - defaultPlan.price))
const selectedMethod = ref('wechat')
const paying = ref(false)

const payMethods = ref([
  { id: 'wechat', name: '微信支付', desc: '推荐安装微信用户使用', icon: '💚' },
  { id: 'alipay', name: '支付宝', desc: '推荐支付宝用户使用', icon: '💙' }
])

onLoad((options) => {
  // 支持两种参数名：planId 或 plan（兼容不同来源）
  const pid = options?.planId || options?.plan || ''
  
  if (pid) {
    // 尝试从 PRICING_PLANS 中查找匹配的套餐
    const matched = PRICING_PLANS.find(p => p.id === pid)
    if (matched) {
      planId.value = matched.id
      planName.value = matched.name
      price.value = matched.price
      duration.value = matched.duration
      discount.value = matched.originalPrice - matched.price
    } else {
      planId.value = pid
      planName.value = decodeURIComponent(options?.planName || '')
      price.value = parseFloat(options?.price || 0)
      duration.value = options?.duration || ''
      // 根据 planId 计算优惠
      if (pid === 'trial') discount.value = 20.0
      else if (pid === 'yearly') discount.value = 80.0
      else if (pid === 'lifetime') discount.value = 200.0
    }
  } else {
    // 无参数时使用默认套餐
    planId.value = defaultPlan.id
    planName.value = defaultPlan.name
    price.value = defaultPlan.price
    duration.value = defaultPlan.duration
    discount.value = defaultPlan.originalPrice - defaultPlan.price
  }
})

function handlePay() {
  if (paying.value) return
  paying.value = true

  uni.showLoading({ title: '正在支付...', mask: true })

  setTimeout(() => {
    uni.hideLoading()
    paying.value = false

    const membership = {
      plan_type: planId.value,
      start_time: new Date().toISOString(),
      expire_time: calculateExpire(),
      status: 'active'
    }

    uni.setStorageSync('membership', JSON.stringify(membership))

    // 重置免费次数（购买后）
    uni.setStorageSync('freeTrialsLeft', 0)

    uni.showToast({ title: '🎉 支付成功！', icon: 'success', duration: 2000 })
    setTimeout(() => uni.switchTab({ url: '/pages/user/user' }), 2000)
  }, 1500)
}

function calculateExpire() {
  const now = new Date()
  if (planId.value === 'trial') return new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString()
  if (planId.value === 'yearly') return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString()
  return null
}

function goBack() { uni.navigateBack({ delta: 1 }) }
</script>

<style lang="scss" scoped>
/* ===== 导航栏 ===== */
.order-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(var(--status-bar-height, 44px) + 12rpx) 28rpx 12rpx;
}

.back-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: var(--text-secondary);
}

.nav-center {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.nav-logo {
  width: 38rpx;
  height: 38rpx;
  border-radius: 9rpx;
}

.nav-title {
  font-size: 30rpx;
  font-weight: 700;
}

.nav-placeholder {
  width: 56rpx;
}

/* ===== 订单头部 ===== */
.order-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx 28rpx 36rpx;
  text-align: center;
}

.hero-icon {
  font-size: 52rpx;
  margin-bottom: 12rpx;
}

.hero-plan {
  font-size: 30rpx;
  font-weight: 700;
  margin-bottom: 8rpx;
}

.hero-price {
  font-size: 72rpx;
  font-weight: 900;
  color: var(--primary);
  line-height: 1;
  letter-spacing: -2rpx;
  margin-bottom: 4rpx;
}

.hero-duration {
  font-size: 24rpx;
  color: var(--text-muted);
}

/* ===== 订单明细 ===== */
.order-detail-card {
  margin: 0 28rpx;
  padding: 28rpx;
  background: rgba(24, 24, 48, 0.5);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: var(--radius-xl);
  margin-bottom: 24rpx;
}

.od-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 0;
}

.od-label {
  font-size: 26rpx;
  color: var(--text-secondary);
}

.od-value {
  font-size: 26rpx;
  font-weight: 600;
}

.od-strikethrough {
  text-decoration: line-through;
  color: var(--text-muted);
  font-weight: 400;
}

.od-discount {
  color: #ff4757;
}

.od-divider {
  height: 1rpx;
  background: rgba(255,255,255,0.05);
  margin: 8rpx 0;
}

.od-total-row {
  padding-top: 16rpx;
}

.od-total {
  font-size: 40rpx;
  font-weight: 900;
  color: var(--primary);
}

/* ===== 支付方式 ===== */
.pay-section {
  padding: 0 28rpx;
  margin-bottom: 40rpx;
}

.section-label {
  font-size: 24rpx;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2rpx;
  display: block;
  margin-bottom: 16rpx;
}

.pay-methods {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.pm-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 20rpx;
  background: rgba(24, 24, 48, 0.4);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: var(--radius-lg);
  transition: all 0.25s;
}

.pm-active {
  border-color: var(--border-active);
  background: rgba(0, 212, 170, 0.05);
}

.pm-icon {
  font-size: 36rpx;
}

.pm-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

.pm-name {
  font-size: 28rpx;
  font-weight: 600;
}

.pm-desc {
  font-size: 22rpx;
  color: var(--text-muted);
}

.pm-radio {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s;
}

.pm-checked {
  border-color: var(--primary);
}

.pm-dot {
  width: 22rpx;
  height: 22rpx;
  border-radius: 50%;
  background: var(--primary);
}

/* ===== 支付底部 ===== */
.pay-bottom {
  position: sticky;
  bottom: 0;
  padding: 20rpx 28rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: rgba(10, 10, 20, 0.95);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-top: 1px solid rgba(255,255,255,0.04);
}

.pay-total-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.pay-total-label {
  font-size: 26rpx;
  color: var(--text-secondary);
}

.pay-total-price {
  font-size: 44rpx;
  font-weight: 900;
  color: var(--primary);
}

.pay-submit-btn {
  width: 100%;
  border-radius: var(--radius-full);
  padding: 28rpx 0;
  font-size: 32rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
}

.pay-submit-btn[disabled] {
  opacity: 0.6;
}

.pay-trust {
  display: flex;
  justify-content: center;
  gap: 8rpx;
  font-size: 20rpx;
  color: var(--text-muted);
}
</style>
