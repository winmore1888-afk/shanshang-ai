<template>
  <view class="page-container">
    <view class="about-header">
      <text class="about-logo">⚡</text>
      <text class="about-name">善商AI</text>
      <text class="about-version">v1.0.0</text>
    </view>

    <view class="card about-section">
      <text class="section-title">📖 关于善商AI</text>
      <text class="about-desc">
        善商AI是一个专业的AI智能体聚合平台，汇集了短剧创作、投资理财、教育规划等多个领域的顶尖AI智能体。
        我们致力于让每个人都能用上最好的AI工具，提升工作效率和生活品质。
      </text>
    </view>

    <view class="card about-section">
      <text class="section-title">🤖 我们的智能体</text>
      <view class="agent-summary">
        <view class="summary-row">
          <text class="summary-dot">🎬</text>
          <text class="summary-text">3 个内容创作智能体 — 爆款短剧、剧情带货</text>
        </view>
        <view class="summary-row">
          <text class="summary-dot">💰</text>
          <text class="summary-text">6 个投资理财智能体 — 估值、理财、价值投资</text>
        </view>
        <view class="summary-row">
          <text class="summary-dot">🎓</text>
          <text class="summary-text">1 个教育智能体 — 高考志愿填报</text>
        </view>
      </view>
    </view>

    <view class="card about-section">
      <text class="section-title">💰 定价说明</text>
      <view class="pricing-summary">
        <view class="price-row">
          <text class="price-tag" style="background: rgba(0,212,170,0.15); color: #00d4aa;">体验</text>
          <text class="price-info">¥9.90 / 1天 — 适合初次体验</text>
        </view>
        <view class="price-row">
          <text class="price-tag" style="background: rgba(108,92,231,0.15); color: #6c5ce7;">年度</text>
          <text class="price-info">¥19.90 / 1年 — 超值推荐</text>
        </view>
        <view class="price-row">
          <text class="price-tag" style="background: rgba(255,215,0,0.15); color: #ffd700;">终身</text>
          <text class="price-info">¥99.90 / 永久 — 限时优惠</text>
        </view>
      </view>
    </view>

    <view class="card about-section">
      <text class="section-title">📞 联系我们</text>
      <text class="about-desc">
        如有任何问题或建议，欢迎通过以下方式联系我们：
      </text>
      <view class="contact-links">
        <text class="contact-item">📧 邮箱：support@shanshang.ai</text>
        <text class="contact-item">💬 微信：善商AI官方</text>
      </view>
    </view>

    <view class="about-footer">
      <text class="footer-copyright">© 2025 善商AI 版权所有</text>
    </view>
  </view>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.about-header {
  padding: 60rpx 32rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.about-logo {
  font-size: 72rpx;
}

.about-name {
  font-size: 40rpx;
  font-weight: 800;
  color: var(--primary-color);
}

.about-version {
  font-size: 24rpx;
  color: var(--text-muted);
}

.about-section {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 700;
  display: block;
  margin-bottom: 16rpx;
}

.about-desc {
  font-size: 26rpx;
  color: var(--text-secondary);
  line-height: 1.8;
}

.agent-summary {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.summary-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.summary-dot {
  font-size: 24rpx;
}

.summary-text {
  font-size: 26rpx;
  color: var(--text-secondary);
}

.pricing-summary {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.price-tag {
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.price-info {
  font-size: 26rpx;
  color: var(--text-secondary);
}

.contact-links {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  margin-top: 12rpx;
}

.contact-item {
  font-size: 26rpx;
  color: var(--text-secondary);
}

.about-footer {
  padding: 40rpx;
  text-align: center;
}

.footer-copyright {
  font-size: 22rpx;
  color: var(--text-muted);
}
</style>
