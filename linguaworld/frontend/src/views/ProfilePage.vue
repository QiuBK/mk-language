<template>
  <div class="profile-page">
    <header class="profile-header">
      <div class="user-info">
        <img :src="userInfo?.avatar || defaultAvatar" :alt="userInfo?.nickname" class="avatar" />
        <div class="info">
          <h2>{{ userInfo?.nickname }}</h2>
          <p>{{ userInfo?.email }}</p>
          <el-tag size="small">Lv.{{ userInfo?.level }}</el-tag>
        </div>
      </div>
    </header>

    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-item">
          <span class="value">🔥 {{ userInfo?.streak || 0 }}</span>
          <span class="label">连续天数</span>
        </div>
        <div class="stat-item">
          <span class="value">📚 {{ userInfo?.totalWords || 0 }}</span>
          <span class="label">已学单词</span>
        </div>
        <div class="stat-item">
          <span class="value">⏱️ {{ formatMinutes(userInfo?.totalMinutes || 0) }}</span>
          <span class="label">学习时长</span>
        </div>
        <div class="stat-item">
          <span class="value">⭐ {{ userInfo?.exp || 0 }}</span>
          <span class="label">经验值</span>
        </div>
      </div>
    </section>

    <section class="achievements-section">
      <div class="section-header">
        <h3>我的成就</h3>
        <el-button text @click="$router.push('/achievements')">查看全部</el-button>
      </div>
      <div class="achievements-grid">
        <div
          v-for="achievement in achievements"
          :key="achievement.id"
          class="achievement-item"
          :class="{ unlocked: achievement.unlocked }"
        >
          <span class="icon">{{ getAchievementIcon(achievement.code) }}</span>
          <span class="name">{{ achievement.title }}</span>
        </div>
      </div>
    </section>

    <section class="menu-section">
      <el-menu>
        <el-menu-item @click="$router.push('/courses')">
          <el-icon><Reading /></el-icon>
          <span>我的课程</span>
        </el-menu-item>
        <el-menu-item @click="$router.push('/vocabulary')">
          <el-icon><Notebook /></el-icon>
          <span>单词本</span>
        </el-menu-item>
        <el-menu-item @click="$router.push('/speaking')">
          <el-icon><Microphone /></el-icon>
          <span>口语记录</span>
        </el-menu-item>
        <el-menu-item>
          <el-icon><Setting /></el-icon>
          <span>设置</span>
        </el-menu-item>
        <el-menu-item @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          <span>退出登录</span>
        </el-menu-item>
      </el-menu>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Reading, Notebook, Microphone, Setting, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const userInfo = ref(userStore.userInfo)

const achievements = ref([
  { id: 1, code: 'streak_7', title: '坚持一周', unlocked: true },
  { id: 2, code: 'vocab_100', title: '词汇达人', unlocked: true },
  { id: 3, code: 'speaking_50', title: '开口说', unlocked: false },
  { id: 4, code: 'level_5', title: '初露锋芒', unlocked: true },
  { id: 5, code: 'streak_30', title: '坚持一月', unlocked: false }
])

const getAchievementIcon = (code: string) => {
  const icons: Record<string, string> = {
    streak_7: '🔥',
    streak_30: '🔥',
    vocab_100: '📚',
    vocab_500: '📖',
    speaking_50: '🎤',
    level_5: '⭐',
    level_10: '🏆'
  }
  return icons[code] || '🏅'
}

const formatMinutes = (minutes: number) => {
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  return `${hours}小时`
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // 取消
  }
}

onMounted(() => {
  userInfo.value = userStore.userInfo
})
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
  background: var(--bg-color);
  padding-bottom: 80px;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  text-align: center;

  .user-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 3px solid white;
    }

    .info {
      text-align: center;

      h2 {
        color: white;
        font-size: 20px;
        margin-bottom: 4px;
      }

      p {
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;
        margin-bottom: 8px;
      }
    }
  }
}

.stats-section {
  padding: 20px;

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    background: var(--card-bg);
    border-radius: 16px;
    padding: 20px;

    .stat-item {
      text-align: center;

      .value {
        display: block;
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 4px;
      }

      .label {
        font-size: 12px;
        color: var(--text-color-light);
      }
    }
  }
}

.achievements-section {
  padding: 0 20px 20px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    h3 {
      font-size: 16px;
      font-weight: bold;
    }
  }

  .achievements-grid {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding-bottom: 8px;

    .achievement-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background: var(--card-bg);
      border-radius: 12px;
      min-width: 80px;

      .icon {
        font-size: 28px;
      }

      .name {
        font-size: 12px;
        white-space: nowrap;
      }

      &.unlocked {
        .icon {
          filter: none;
        }
      }

      &:not(.unlocked) {
        opacity: 0.4;

        .icon {
          filter: grayscale(1);
        }
      }
    }
  }
}

.menu-section {
  :deep(.el-menu) {
    border: none;
    background: transparent;

    .el-menu-item {
      background: var(--card-bg);
      margin: 0 20px 8px;
      border-radius: 12px;

      &:last-child {
        color: #f56c6c;
      }
    }
  }
}
</style>
