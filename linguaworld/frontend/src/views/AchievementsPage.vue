<template>
  <div class="achievements-page">
    <header class="page-header">
      <el-button text @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1>我的成就</h1>
    </header>

    <section class="level-section">
      <div class="level-card">
        <div class="level-badge">
          <span class="level-number">{{ userLevel }}</span>
          <span class="level-label">LV</span>
        </div>
        <div class="level-info">
          <div class="level-title">当前等级</div>
          <div class="exp-bar">
            <el-progress :percentage="expPercentage" :show-text="false" :stroke-width="8" color="#677eea" />
            <span class="exp-text">{{ currentExp }} / {{ nextLevelExp }} 经验</span>
          </div>
        </div>
      </div>
    </section>

    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🔥</div>
          <div class="stat-info">
            <span class="value">{{ learningDays }}</span>
            <span class="label">学习天数</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-info">
            <span class="value">{{ unlockedCount }}</span>
            <span class="label">已解锁</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-info">
            <span class="value">{{ totalCount }}</span>
            <span class="label">总成就数</span>
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
        <el-radio-button label="learning">📖 学习</el-radio-button>
        <el-radio-button label="social">👥 社交</el-radio-button>
      </el-radio-group>
    </section>

    <section class="achievements-section">
      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      </div>

      <div v-else class="achievements-grid">
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
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import request from '@/api/request'

interface Achievement {
  id: number
  code: string
  title: string
  description: string
  icon: string
  category: string
  requirement: number
  reward: number
  unlocked: boolean
  unlockedAt?: string
  current?: number
}

const userStore = useUserStore()

const selectedCategory = ref('')
const showDialog = ref(false)
const currentAchievement = ref<Achievement | null>(null)
const achievements = ref<Achievement[]>([])
const loading = ref(false)

const learningDays = computed(() => userStore.userInfo?.streak || 0)
const userLevel = computed(() => userStore.userInfo?.level || 1)
const currentExp = computed(() => userStore.userInfo?.exp || 0)
const nextLevelExp = computed(() => userLevel.value * 100)

const expPercentage = computed(() => {
  const exp = currentExp.value
  const required = nextLevelExp.value
  return Math.min(100, Math.round((exp / required) * 100))
})

const filteredAchievements = computed(() => {
  if (!selectedCategory.value) return achievements.value
  return achievements.value.filter(a => a.category === selectedCategory.value)
})

const unlockedCount = computed(() => achievements.value.filter(a => a.unlocked).length)
const totalCount = computed(() => achievements.value.length)

const getAchievementIcon = (code: string) => {
  const icons: Record<string, string> = {
    streak_7: '🔥', streak_30: '🔥', streak_100: '🔥',
    vocab_50: '📚', vocab_100: '📚', vocab_500: '📖',
    speaking_10: '🎤', speaking_50: '🎤', speaking_100: '🎙️',
    level_5: '⭐', level_10: '🏆',
    course_3: '📖',
    first_post: '✏️', post_10: '💬'
  }
  return icons[code] || '🏅'
}

const getProgress = (achievement: Achievement | null) => {
  if (!achievement) return 0
  if (achievement.unlocked) return 100
  const current = achievement.current || 0
  return Math.min(100, Math.round((current / achievement.requirement) * 100))
}

const getProgressText = (achievement: Achievement | null) => {
  if (!achievement) return ''
  if (achievement.unlocked) return '已完成'
  const current = achievement.current || 0
  return `${current} / ${achievement.requirement}`
}

const handleCategoryChange = () => {
}

const showAchievementDetail = (achievement: Achievement) => {
  currentAchievement.value = achievement
  showDialog.value = true
}

const fetchAchievements = async () => {
  loading.value = true
  try {
    const result = await request.get('/achievement/list')
    if (result.code === 200) {
      achievements.value = result.data
    } else {
      ElMessage.error(result.message || '获取成就列表失败')
    }
  } catch (err) {
    console.error('获取成就列表失败:', err)
    ElMessage.error('获取成就列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchAchievements()
})
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

.level-section {
  padding: 20px;

  .level-card {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    color: white;

    .level-badge {
      width: 70px;
      height: 70px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .level-number {
        font-size: 28px;
        font-weight: bold;
        line-height: 1;
      }

      .level-label {
        font-size: 12px;
        opacity: 0.8;
      }
    }

    .level-info {
      flex: 1;

      .level-title {
        font-size: 16px;
        margin-bottom: 12px;
        font-weight: bold;
      }

      .exp-bar {
        .exp-text {
          display: block;
          margin-top: 8px;
          font-size: 13px;
          opacity: 0.9;
        }
      }
    }
  }
}

.stats-section {
  padding: 0 20px 20px;

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

  .loading-container {
    display: flex;
    justify-content: center;
    padding: 40px;
  }

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
