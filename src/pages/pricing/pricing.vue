<template>
  <view class="page-container">
    <!-- ===== 头部 ===== -->
    <view class="pricing-hero">
      <view class="hero-logo-wrap">
        <image class="hero-logo" src="/static/images/logo.png" mode="aspectFit" />
      </view>
      <text class="hero-crown">👑</text>
      <text class="hero-title">解锁全部智能体</text>
      <text class="hero-subtitle">选择最适合你的方案，开启 AI 之旅</text>

      <!-- 紧迫感提示 -->
      <view class="urgency-banner">
        <text class="urgency-dot">●</text>
        <text class="urgency-text">限时特惠 · 年度套餐低至 ¥19.9/年 · 今日已有 <text class="urgency-num">128</text> 人开通</text>
      </view>
    </view>

    <!-- ===== 套餐卡片 ===== -->
    <view class="plans-container">
      <view
        v-for="(plan, idx) in plans"
        :key="plan.id"
        class="plan-card fade-in"
        :class="[
          'fade-in-' + (idx + 1),
          { 'plan-featured': plan.popular }
        ]"
      >
        <!-- 热门角标 -->
        <view v-if="plan.popular" class="featured-ribbon">
          <text>{{ plan.tag }}</text>
        </view>

        <!-- 头部 -->
        <view class="plan-head">
          <view class="plan-icon-row">
            <text class="plan-icon">{{ planIcons[plan.id] }}</text>
            <view>
              <text class="plan-name">{{ plan.name }}</text>
              <text class="plan-dur">{{ plan.duration }}</text>
            </view>
          </view>
        </view>

        <!-- 价格 -->
        <view class="plan-price-block">
          <view class="price-main">
            <text class="price-symbol">¥</text>
            <text class="price-amount">{{ plan.price }}</text>
          </view>
          <view class="price-original-row">
            <text class="price-original">¥{{ plan.originalPrice }}</text>
            <text class="price-discount">
              省 ¥{{ (plan.originalPrice - plan.price).toFixed(0) }}
            </text>
          </view>
        </view>

        <!-- 每日均价 -->
        <view class="price-daily">
          <text>日均仅需 <text class="daily-highlight">{{ getDailyPrice(plan) }}</text></text>
        </view>

        <!-- 功能列表 -->
        <view class="plan-features">
          <view v-for="(feat, i) in plan.features" :key="i" class="pfeature">
            <view class="pf-check">
              <text>✓</text>
            </view>
            <text class="pf-text">{{ feat }}</text>
          </view>
        </view>

        <!-- CTA 按钮 -->
        <button
          class="plan-cta"
          :class="{ 'cta-featured': plan.popular }"
          @click="selectPlan(plan)"
        >
          <text v-if="plan.popular" class="cta-emoji">🔥</text>
          <text>{{ plan.popular ? '立即开通 · 超值' : '选择此套餐' }}</text>
        </button>
      </view>
    </view>

    <!-- ===== 权益对比 ===== -->
    <view class="compare-section">
      <view class="compare-header">
        <text class="compare-title">📊 详细权益对比</text>
      </view>
      <view class="compare-card card-glass">
        <view class="compare-table">
          <view class="cr cr-header">
            <text class="cl">权益</text>
            <text class="cc">体验</text>
            <text class="cc cc-highlight">年度</text>
            <text class="cc">终身</text>
          </view>
          <view v-for="(row, idx) in compareData" :key="idx" class="cr">
            <text class="cl">{{ row.label }}</text>
            <text class="cc" :class="{ 'cc-yes': row.trial === '✓', 'cc-no': row.trial === '✗' }">
              {{ row.trial }}
            </text>
            <text class="cc cc-highlight" :class="{ 'cc-yes': row.yearly === '✓', 'cc-no': row.yearly === '✗' }">
              {{ row.yearly }}
            </text>
            <text class="cc" :class="{ 'cc-yes': row.lifetime === '✓', 'cc-no': row.lifetime === '✗' }">
              {{ row.lifetime }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- ===== FAQ ===== -->
    <view class="faq-section">
      <text class="faq-title">💡 常见问题</text>
      <view class="faq-card card-glass">
        <view class="faq-item" v-for="(faq, idx) in faqs" :key="idx">
          <view class="faq-q">
            <text class="faq-qmark">Q</text>
            <text class="faq-qtext">{{ faq.q }}</text>
          </view>
          <text class="faq-a">{{ faq.a }}</text>
        </view>
      </view>
    </view>

    <!-- ===== 底部保障 ===== -->
    <view class="guarantee-section">
      <view class="guarantee-card">
        <view class="guarantee-item">
          <text class="gu-icon">🔒</text>
          <text class="gu-text">安全支付</text>
        </view>
        <view class="guarantee-item">
          <text class="gu-icon">↩</text>
          <text class="gu-text">不满意可退款</text>
        </view>
        <view class="guarantee-item">
          <text class="gu-icon">📞</text>
          <text class="gu-text">专属客服</text>
        </view>
        <view class="guarantee-item">
          <text class="gu-icon">⚡</text>
          <text class="gu-text">即时开通</text>
        </view>
      </view>
    </view>

    <view class="safe-bottom" style="height: 40rpx;"></view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { PRICING_PLANS } from '@/store/agents'

const plans = ref(PRICING_PLANS)

const planIcons = {
  trial: '🎯',
  yearly: '💎',
  lifetime: '👑'
}

const compareData = ref([
  { label: '智能体数量', trial: '全部10个', yearly: '全部10个', lifetime: '全部10个' },
  { label: '使用次数', trial: '1天无限', yearly: '365天无限', lifetime: '永久无限' },
  { label: '新功能优先', trial: '✗', yearly: '✓', lifetime: '✓' },
  { label: '专属客服', trial: '✗', yearly: '✓', lifetime: '✓' },
  { label: '用户社群', trial: '✗', yearly: '✗', lifetime: '✓' },
  { label: '无广告', trial: '✓', yearly: '✓', lifetime: '✓' },
  { label: '自动续费', trial: '不续费', yearly: '不续费', lifetime: '不续费' }
])

const faqs = ref([
  { q: '体验套餐到期后会怎样？', a: '到期后自动失效，不会自动扣费。您可以随时购买年度或终身套餐继续使用。' },
  { q: '年度套餐可以退款吗？', a: '购买后7天内如不满意可申请全额退款，联系客服即可。' },
  { q: '终身套餐真的永久有效吗？', a: '是的！一次购买永久使用，包含所有后续新功能和更新。' }
])

function selectPlan(plan) {
  uni.navigateTo({
    url: `/pages/order/order?planId=${plan.id}&planName=${encodeURIComponent(plan.name)}&price=${plan.price}&duration=${plan.duration}`
  })
}

function getDailyPrice(plan) {
  if (plan.id === 'trial') return '¥9.9'
  if (plan.id === 'yearly') return '¥0.05'
  return '¥0.03'
}
</script>

<style lang="scss" scoped>
/* ===== 头部 ===== */
.pricing-hero {
  padding: calc(var(--status-bar-height, 44px) + 40rpx) 32rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hero-logo-wrap {
  margin-bottom: 12rpx;
}

.hero-logo {
  width: 72rpx;
  height: 72rpx;
  border-radius: 18rpx;
  box-shadow: 0 4px 16px rgba(200, 30, 30, 0.25);
}

.hero-crown {
  font-size: 64rpx;
  margin-bottom: 16rpx;
  animation: float 2.5s ease-in-out infinite;
}

.hero-title {
  font-size: 38rpx;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8rpx;
}

.hero-subtitle {
  font-size: 26rpx;
  color: var(--text-secondary);
}

/* 紧迫感 */
.urgency-banner {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 20rpx;
  padding: 12rpx 24rpx;
  background: rgba(245, 166, 35, 0.08);
  border: 1px solid rgba(245, 166, 35, 0.15);
  border-radius: var(--radius-full);
}

.urgency-dot {
  color: #f5a623;
  font-size: 16rpx;
  animation: pulse 2s infinite;
}

.urgency-text {
  font-size: 22rpx;
  color: var(--text-secondary);
}

.urgency-num {
  color: #f5a623;
  font-weight: 700;
}

/* ===== 套餐卡片 ===== */
.plans-container {
  padding: 0 28rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.plan-card {
  background: rgba(24, 24, 48, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: var(--radius-xl);
  padding: 32rpx 28rpx 28rpx;
  position: relative;
  overflow: hidden;
  transition: all 0.3s var(--ease-out);
}

.plan-featured {
  border-color: rgba(255, 215, 0, 0.3);
  box-shadow: 0 4px 30px rgba(255, 215, 0, 0.1);
  background: linear-gradient(180deg, rgba(255, 215, 0, 0.04), rgba(24, 24, 48, 0.6));
}

.featured-ribbon {
  position: absolute;
  top: 0;
  right: 0;
  padding: 8rpx 28rpx;
  background: linear-gradient(135deg, #f5a623, #ffd700);
  border-radius: 0 var(--radius-xl) 0 var(--radius-lg);
  font-size: 20rpx;
  font-weight: 700;
  color: #000;
}

/* 套餐头部 */
.plan-head {
  margin-bottom: 20rpx;
}

.plan-icon-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.plan-icon {
  font-size: 40rpx;
}

.plan-name {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--text-primary);
  display: block;
}

.plan-dur {
  font-size: 22rpx;
  color: var(--text-muted);
}

/* 价格 */
.plan-price-block {
  margin-bottom: 8rpx;
}

.price-main {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.price-symbol {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.price-amount {
  font-size: 64rpx;
  font-weight: 900;
  color: var(--primary);
  line-height: 1;
  letter-spacing: -2rpx;
}

.plan-featured .price-amount {
  color: var(--accent-gold);
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.price-original-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-top: 4rpx;
}

.price-original {
  font-size: 24rpx;
  color: var(--text-muted);
  text-decoration: line-through;
}

.price-discount {
  font-size: 20rpx;
  font-weight: 700;
  color: #ff4757;
  background: rgba(255, 71, 87, 0.1);
  padding: 2rpx 12rpx;
  border-radius: var(--radius-xs);
}

/* 日均价格 */
.price-daily {
  margin-bottom: 20rpx;
  padding: 10rpx 0;
  font-size: 22rpx;
  color: var(--text-muted);
}

.daily-highlight {
  color: var(--primary);
  font-weight: 700;
}

.plan-featured .daily-highlight {
  color: var(--accent-gold);
}

/* 功能列表 */
.plan-features {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  margin-bottom: 28rpx;
  padding-top: 20rpx;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.pfeature {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.pf-check {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: rgba(0, 212, 170, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16rpx;
  color: var(--primary);
  font-weight: 700;
  flex-shrink: 0;
}

.pf-text {
  font-size: 26rpx;
  color: var(--text-secondary);
}

/* CTA 按钮 */
.plan-cta {
  width: 100%;
  border-radius: var(--radius-full);
  padding: 24rpx 0;
  font-size: 28rpx;
  font-weight: 700;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  color: var(--text-primary);
  transition: all 0.25s;
}

.cta-featured {
  background: linear-gradient(135deg, #f5a623, #ffd700);
  color: #000;
  border: none;
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
}

.cta-emoji {
  font-size: 24rpx;
}

.plan-cta:active {
  transform: scale(0.97);
}

/* ===== 权益对比 ===== */
.compare-section {
  padding: 0 28rpx;
  margin-bottom: 28rpx;
}

.compare-header {
  margin-bottom: 16rpx;
}

.compare-title {
  font-size: 28rpx;
  font-weight: 700;
}

.compare-card {
  margin: 0;
  padding: 8rpx 20rpx;
}

.compare-table {
  display: flex;
  flex-direction: column;
}

.cr {
  display: flex;
  align-items: center;
  padding: 18rpx 0;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}

.cr:last-child {
  border-bottom: none;
}

.cr-header {
  border-bottom-color: rgba(255,255,255,0.06);
  padding-bottom: 22rpx;
}

.cl {
  flex: 2.5;
  font-size: 24rpx;
  color: var(--text-secondary);
}

.cr-header .cl {
  font-weight: 700;
  color: var(--text-primary);
}

.cc {
  flex: 1;
  text-align: center;
  font-size: 22rpx;
  color: var(--text-muted);
}

.cc-highlight {
  color: var(--accent-gold);
  font-weight: 600;
}

.cr-header .cc {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 24rpx;
}

.cc-yes {
  color: var(--primary);
}

.cc-no {
  color: var(--text-muted);
}

/* ===== FAQ ===== */
.faq-section {
  padding: 0 28rpx;
  margin-bottom: 28rpx;
}

.faq-title {
  font-size: 28rpx;
  font-weight: 700;
  display: block;
  margin-bottom: 16rpx;
}

.faq-card {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.faq-item {
  padding: 20rpx 0;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-q {
  display: flex;
  align-items: flex-start;
  gap: 10rpx;
  margin-bottom: 8rpx;
}

.faq-qmark {
  font-size: 22rpx;
  font-weight: 800;
  color: var(--primary);
  background: rgba(0, 212, 170, 0.1);
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.faq-qtext {
  font-size: 26rpx;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.5;
}

.faq-a {
  font-size: 24rpx;
  color: var(--text-secondary);
  line-height: 1.6;
  padding-left: 46rpx;
}

/* ===== 底部保障 ===== */
.guarantee-section {
  padding: 0 28rpx;
  margin-bottom: 20rpx;
}

.guarantee-card {
  display: flex;
  justify-content: space-around;
  padding: 24rpx;
  background: rgba(24, 24, 48, 0.4);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255,255,255,0.04);
}

.guarantee-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.gu-icon {
  font-size: 28rpx;
}

.gu-text {
  font-size: 20rpx;
  color: var(--text-muted);
}

/* ===== 动画 ===== */
.fade-in {
  animation: fadeInScale 0.5s var(--ease-out) both;
}

.fade-in-1 { animation-delay: 0.05s; }
.fade-in-2 { animation-delay: 0.15s; }
.fade-in-3 { animation-delay: 0.25s; }

@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.95) translateY(20rpx); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
