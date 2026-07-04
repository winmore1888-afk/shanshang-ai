<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('善商AI App Launch')
  // 检查登录状态
  const token = uni.getStorageSync('token')
  if (!token) {
    console.log('用户未登录')
  }
})

onShow(() => {
  console.log('善商AI App Show')
})

onHide(() => {
  console.log('善商AI App Hide')
})
</script>

<style lang="scss">
/* 全局样式 */
@import '@/styles/global.scss';
</style>
