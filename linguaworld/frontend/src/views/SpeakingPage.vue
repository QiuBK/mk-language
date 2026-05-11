<template>
  <div class="speaking-page">
    <!-- 顶部导航 -->
    <header class="page-header">
      <el-button text @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1>口语练习</h1>
      <div class="header-right">
        <el-select v-model="selectedDifficulty" placeholder="难度" size="small">
          <el-option label="全部" value="" />
          <el-option label="初级" value="beginner" />
          <el-option label="中级" value="intermediate" />
          <el-option label="高级" value="advanced" />
        </el-select>
      </div>
    </header>

    <!-- 口语练习组件 -->
    <div class="practice-container" v-if="currentTopic">
      <SpeakingRecorder
        :topic="currentTopic"
        @next="loadNextTopic"
        @complete="handleComplete"
      />
    </div>

    <!-- 加载状态 -->
    <div v-else-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      <p>加载题目中...</p>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-container">
      <el-empty description="暂无题目" />
      <el-button type="primary" @click="loadTopic">重新加载</el-button>
    </div>

    <!-- 历史记录 -->
    <section class="history-section" v-if="history.length > 0">
      <h2>练习历史</h2>
      <div class="history-list">
        <div v-for="item in history" :key="item.id" class="history-item">
          <div class="history-info">
            <span class="history-title">{{ item.topic?.title || '练习' }}</span>
            <span class="history-time">{{ formatTime(item.createTime) }}</span>
          </div>
          <div class="history-score" :class="getScoreClass(item.score)">
            {{ item.score }}分
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowLeft, Loading } from '@element-plus/icons-vue'
import SpeakingRecorder from '@/components/SpeakingRecorder.vue'
import { getRandomTopic, getSpeakingHistory } from '@/api/speaking'
import { useLanguageStore } from '@/store/language'
import { useUserStore } from '@/store/user'
import type { SpeakingTopic, SpeakingResult } from '@/types'

const languageStore = useLanguageStore()
const userStore = useUserStore()

// 当前题目
const currentTopic = ref<SpeakingTopic | null>(null)

// 加载状态
const loading = ref(false)

// 难度选择
const selectedDifficulty = ref('')

// 历史记录
const history = ref<SpeakingResult[]>([])

// 加载题目
const loadTopic = async () => {
  loading.value = true
  try {
    const res = await getRandomTopic(languageStore.currentLanguage)
    if (res.code === 200) {
      currentTopic.value = res.data
    }
  } catch (error) {
    console.error('加载题目失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载下一题
const loadNextTopic = () => {
  loadTopic()
}

// 处理完成
const handleComplete = (result: SpeakingResult) => {
  // 添加到历史
  history.value.unshift({
    ...result,
    topic: currentTopic.value || undefined
  })
  userStore.addExp(10) // 增加经验
}

// 加载历史
const loadHistory = async () => {
  try {
    const res = await getSpeakingHistory({ page: 1, pageSize: 10 })
    if (res.code === 200) {
      history.value = res.data.list
    }
  } catch (error) {
    console.error('加载历史失败:', error)
  }
}

// 格式化时间
const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 60) return `${mins}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString()
}

// 获取分数样式
const getScoreClass = (score: number) => {
  if (score >= 80) return 'good'
  if (score >= 60) return 'ok'
  return 'poor'
}

onMounted(() => {
  loadTopic()
  loadHistory()
})
</script>

<style scoped lang="scss">
.speaking-page {
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

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.practice-container {
  padding: 20px;
}

.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
}

.history-section {
  padding: 20px;

  h2 {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 16px;
  }

  .history-list {
    background: var(--card-bg);
    border-radius: 16px;
    overflow: hidden;
  }

  .history-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--border-color);

    &:last-child {
      border-bottom: none;
    }

    .history-info {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .history-title {
        font-size: 14px;
      }

      .history-time {
        font-size: 12px;
        color: var(--text-color-light);
      }
    }

    .history-score {
      font-weight: bold;
      font-size: 18px;

      &.good {
        color: #67c23a;
      }

      &.ok {
        color: #e6a23c;
      }

      &.poor {
        color: #f56c6c;
      }
    }
  }
}
</style>
