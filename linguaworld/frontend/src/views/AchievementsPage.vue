<template>
  <div class="achievements-page">
    <header class="page-header">
      <el-button text @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1>我的成就</h1>
    </header>

    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-info">
            <span class="value">{{ unlockedCount }}</span>
            <span class="label">已解锁</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-info">
            <span class="value">{{ totalCount }}</span>
            <span class="label">总成就数</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-info">
            <span class="value">{{ totalReward }}</span>
            <span class="label">累计奖励</span>
          </div>
        </div>
      </div>
    </section>

    <section class="filter-section">
      <el-radio-group v-model="selectedCategory" @change="handleCategoryChange">
        <el-radio-button label="">全部</el-radio-button>
        <el-radio-button label="streak">🔥 连续</el-radio-button>
        <el-radio-button label="vocabulary">📚 词汇</el-radio-button>
        <el-radio-button label="speaking">🎤 口语</el-radio-button>
        <el-radio-button label="social">👥 社交</el-radio-button>
      </el-radio-group>
    </section>

    <section class="achievements-section">
      <div class="achievements-grid">
        <div
          v-for="achievement in filteredAchievements"
          :key="achievement.id"
          class="achievement-card"
          :class="{ unlocked: achievement.unlocked }"
          @click="showAchievementDetail(achievement)"
        >
          <div class="achievement-icon">
            {{ getAchievementIcon(achievement.code) }}
          </div>
          <div class="achievement-info">
            <h4>{{ achievement.title }}</h4>
            <p>{{ achievement.description }}</p>
          </div>
          <div class="achievement-reward">
            +{{ achievement.reward }}经验
          </div>
          <div v-if="achievement.unlocked" class="unlocked-badge">
            ✓
          </div>
        </div>
      </div>
    </section>

    <el-dialog v-model="showDialog" :title="currentAchievement?.title" width="90%">
      <div class="achievement-detail">
        <div class="detail-icon">
          {{ getAchievementIcon(currentAchievement?.code || '') }}
        </div>
        <p class="detail-desc">{{ currentAchievement?.description }}</p>
        <div class="detail-progress">
          <el-progress
            :percentage="getProgress(currentAchievement)"
            :status="currentAchievement?.unlocked ? 'success' : undefined"
          />
          <span class="progress-text">
            {{ getProgressText(currentAchievement) }}
          </span>
        </div>
        <div class="detail-reward">
          完成后获得: +{{ currentAchievement?.reward }}经验
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import type { Achievement } from '@/types'

const userStore = useUserStore()

const selectedCategory = ref('')
const showDialog = ref(false)
const currentAchievement = ref<Achievement | null>(null)

const achievements = ref<Achievement[]>([
  { id: 1, code: 'streak_7', title: '坚持一周', description: '连续学习7天', icon: 'Flame', category: 'streak', requirement: 7, reward: 100, unlocked: true, unlockedAt: '2024-01-15' },
  { id: 2, code: 'streak_30', title: '坚持一月', description: '连续学习30天', icon: 'Flame', category: 'streak', requirement: 30, reward: 500, unlocked: false },
  { id: 3, code: 'vocab_100', title: '词汇达人', description: '学习100个单词', icon: 'BookOpen', category: 'vocabulary', requirement: 100, reward: 200, unlocked: true, unlockedAt: '2024-01-10' },
  { id: 4, code: 'vocab_500', title: '词汇专家', description: '学习500个单词', icon: 'GraduationCap', category: 'vocabulary', requirement: 500, reward: 800, unlocked: false },
  { id: 5, code: 'speaking_50', title: '开口说', description: '完成50次口语练习', icon: 'Mic', category: 'speaking', requirement: 50, reward: 300, unlocked: false },
  { id: 6, code: 'level_5', title: '初露锋芒', description: '达到5级', icon: 'Star', category: 'vocabulary', requirement: 5, reward: 150, unlocked: true, unlockedAt: '2024-01-12' }
])

const filteredAchievements = computed(() => {
  if (!selectedCategory.value) return achievements.value
  return achievements.value.filter(a => a.category === selectedCategory.value)
})

const unlockedCount = computed(() => achievements.value.filter(a => a.unlocked).length)
const totalCount = computed(() => achievements.value.length)
const totalReward = computed(() => achievements.value.filter(a => a.unlocked).reduce((sum, a) => sum + a.reward, 0))

const getAchievementIcon = (code: string) => {
  const icons: Record<string, string> = {
    streak_7: '🔥', streak_30: '🔥',
    vocab_100: '📚', vocab_500: '📖',
    speaking_50: '🎤', speaking_100: '🎙️',
    level_5: '⭐', level_10: '🏆',
    social_first: '👋', social_helper: '🤝'
  }
  return icons[code] || '🏅'
}

const getProgress = (achievement: Achievement | null) => {
  if (!achievement) return 0
  if (achievement.unlocked) return 100
  const userProgress = userStore.userInfo?.streak || 0
  return Math.min(100, (userProgress / achievement.requirement) * 100)
}

const getProgressText = (achievement: Achievement | null) => {
  if (!achievement) return ''
  if (achievement.unlocked) return '已完成'
  const userProgress = userStore.userInfo?.streak || 0
  return `${userProgress} / ${achievement.requirement}`
}

const handleCategoryChange = () => {
  // 重新筛选
}

const showAchievementDetail = (achievement: Achievement) => {
  currentAchievement.value = achievement
  showDialog.value = true
}
</script>

<style scoped lang="scss">
.achievements-page {
  min-height: 100vh;
  background: var(--bg-color);
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);

  h1 {
    flex: 1;
    text-align: center;
    font-size: 18px;
    font-weight: bold;
  }
}

.stats-section {
  padding: 20px;

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: var(--card-bg);
    border-radius: 16px;

    .stat-icon {
      font-size: 28px;
    }

    .stat-info {
      display: flex;
      flex-direction: column;

      .value {
        font-size: 20px;
        font-weight: bold;
      }

      .label {
        font-size: 12px;
        color: var(--text-color-light);
      }
    }
  }
}

.filter-section {
  padding: 0 20px 20px;
  overflow-x: auto;
}

.achievements-section {
  padding: 0 20px;

  .achievements-grid {
    display: grid;
    gap: 16px;
  }

  .achievement-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: var(--card-bg);
    border-radius: 16px;
    position: relative;
    cursor: pointer;
    transition: transform 0.3s;

    &:hover {
      transform: scale(1.02);
    }

    &.unlocked {
      background: linear-gradient(135deg, rgba(103, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    }

    .achievement-icon {
      font-size: 40px;
      min-width: 60px;
      text-align: center;
    }

    .achievement-info {
      flex: 1;

      h4 {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 4px;
      }

      p {
        font-size: 13px;
        color: var(--text-color-light);
      }
    }

    .achievement-reward {
      font-size: 12px;
      color: #f59e0b;
      padding: 4px 8px;
      background: rgba(245, 158, 11, 0.1);
      border-radius: 4px;
    }

    .unlocked-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 24px;
      height: 24px;
      background: #67c23a;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }
  }
}

.achievement-detail {
  text-align: center;

  .detail-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  .detail-desc {
    color: var(--text-color-light);
    margin-bottom: 24px;
  }

  .detail-progress {
    margin-bottom: 16px;

    .progress-text {
      display: block;
      margin-top: 8px;
      font-size: 14px;
      color: var(--text-color-light);
    }
  }

  .detail-reward {
    color: #f59e0b;
    font-size: 14px;
  }
}
</style>
