<template>
  <div class="speaking-page">
    <header class="page-header">
      <el-button text @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1>口语练习</h1>
      <div class="header-right">
        <el-select v-model="selectedDifficulty" placeholder="难度" size="small" @change="handleDifficultyChange">
          <el-option label="全部" value="" />
          <el-option label="初级" value="beginner" />
          <el-option label="中级" value="intermediate" />
          <el-option label="高级" value="advanced" />
        </el-select>
      </div>
    </header>

    <div class="language-tabs">
      <div
        v-for="lang in languages"
        :key="lang.value"
        class="lang-tab"
        :class="{ active: selectedLanguage === lang.value }"
        @click="handleLanguageChange(lang.value)"
      >
        {{ lang.label }}
      </div>
    </div>

    <div class="practice-container" v-if="currentTopic">
      <SpeakingRecorder
        :topic="currentTopic"
        @next="loadNextTopic"
        @complete="handleComplete"
      />
    </div>

    <div v-else-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      <p>加载题目中...</p>
    </div>

    <div v-else class="empty-container">
      <el-empty description="暂无题目">
        <el-button type="primary" @click="loadTopic">重新加载</el-button>
      </el-empty>
    </div>

    <div class="history-section" v-if="history.length > 0">
      <div class="section-header">
        <h2>练习历史</h2>
        <span class="history-count">{{ history.length }} 条记录</span>
      </div>

      <div class="history-stats">
        <div class="stat-item">
          <span class="stat-value">{{ averageScore }}</span>
          <span class="stat-label">平均分</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ history.length }}</span>
          <span class="stat-label">练习次数</span>
        </div>
        <div class="stat-item">
          <span class="stat-value best">{{ bestScore }}</span>
          <span class="stat-label">最高分</span>
        </div>
      </div>

      <div class="history-list">
        <div
          v-for="item in history"
          :key="item.id"
          class="history-item"
          @click="showHistoryDetail(item)"
        >
          <div class="history-info">
            <span class="history-title">{{ item.topic?.title || '练习' }}</span>
            <div class="history-meta">
              <span class="history-time">{{ formatTime(item.createTime) }}</span>
              <span v-if="item.topic?.difficulty" class="history-difficulty">
                {{ getDifficultyLabel(item.topic.difficulty) }}
              </span>
            </div>
          </div>
          <div class="history-right">
            <div class="history-score" :class="getScoreClass(item.score)">
              <span class="score-value">{{ item.score }}</span>
              <span class="score-label">分</span>
            </div>
            <el-icon class="arrow-icon"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>

      <el-button
        v-if="hasMoreHistory"
        class="load-more-btn"
        :loading="loadingMore"
        @click="loadMoreHistory"
      >
        加载更多
      </el-button>
    </div>

    <el-drawer
      v-model="showDetail"
      title="练习详情"
      direction="rtl"
      size="90%"
    >
      <div v-if="selectedHistory" class="detail-content">
        <div class="detail-header">
          <div class="detail-score" :class="getScoreClass(selectedHistory.score)">
            <span class="score-value">{{ selectedHistory.score }}</span>
            <span class="score-label">分</span>
          </div>
          <div class="detail-meta">
            <span>{{ formatDate(selectedHistory.createTime) }}</span>
            <span>{{ selectedHistory.duration }}秒</span>
          </div>
        </div>

        <div class="detail-section">
          <h4>题目</h4>
          <p class="detail-title">{{ selectedHistory.topic?.title }}</p>
          <p v-if="selectedHistory.topic?.content" class="detail-content-text">
            {{ selectedHistory.topic.content }}
          </p>
        </div>

        <div class="detail-section" v-if="selectedHistory.feedback">
          <h4>AI 反馈</h4>
          <p class="detail-feedback">{{ selectedHistory.feedback }}</p>
        </div>

        <div class="detail-section" v-if="selectedHistory.errorPoints?.length">
          <h4>需改进点</h4>
          <ul class="error-list">
            <li v-for="(point, index) in selectedHistory.errorPoints" :key="index">
              {{ point }}
            </li>
          </ul>
        </div>

        <div class="detail-section" v-if="selectedHistory.audioUrl">
          <h4>录音回放</h4>
          <div class="audio-player">
            <el-button :icon="isPlayingAudio ? VideoPause : VideoPlay" circle @click="toggleAudio" />
            <div class="audio-progress">
              <el-slider v-model="audioProgress" :show-tooltip="false" @input="seekAudio" />
              <span class="audio-time">{{ formatAudioTime(audioCurrentTime) }} / {{ formatAudioTime(audioDuration) }}</span>
            </div>
          </div>
        </div>

        <div class="detail-actions">
          <el-button type="primary" @click="retryTopic">重新练习此题</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ArrowLeft, Loading, ArrowRight, VideoPlay, VideoPause } from '@element-plus/icons-vue'
import SpeakingRecorder from '@/components/SpeakingRecorder.vue'
import { getRandomTopic, getSpeakingHistory } from '@/api/speaking'
import { useLanguageStore } from '@/store/language'
import { useUserStore } from '@/store/user'
import type { SpeakingTopic, SpeakingResult } from '@/types'
import type { Language } from '@/store/language'

const languageStore = useLanguageStore()
const userStore = useUserStore()

const languages = [
  { label: '英语', value: 'en' },
  { label: '日语', value: 'ja' },
  { label: '韩语', value: 'ko' }
]

const selectedLanguage = ref(languageStore.currentLanguage || 'en')
const selectedDifficulty = ref('')
const currentTopic = ref<SpeakingTopic | null>(null)
const loading = ref(false)

const history = ref<SpeakingResult[]>([])
const historyPage = ref(1)
const historyPageSize = ref(10)
const hasMoreHistory = ref(true)
const loadingMore = ref(false)

const showDetail = ref(false)
const selectedHistory = ref<SpeakingResult | null>(null)
const isPlayingAudio = ref(false)
const audioProgress = ref(0)
const audioCurrentTime = ref(0)
const audioDuration = ref(0)
let audioElement: HTMLAudioElement | null = null

const averageScore = computed(() => {
  if (history.value.length === 0) return 0
  const sum = history.value.reduce((acc, item) => acc + item.score, 0)
  return Math.round(sum / history.value.length)
})

const bestScore = computed(() => {
  if (history.value.length === 0) return 0
  return Math.max(...history.value.map(item => item.score))
})

const handleLanguageChange = (lang: string) => {
  selectedLanguage.value = lang
  languageStore.setLanguage(lang as Language)
  loadTopic()
}

const handleDifficultyChange = () => {
  loadTopic()
}

const loadTopic = async () => {
  loading.value = true
  try {
    const res = await getRandomTopic(selectedLanguage.value)
    if (res.code === 200) {
      currentTopic.value = res.data
    }
  } catch (error) {
    console.error('加载题目失败:', error)
  } finally {
    loading.value = false
  }
}

const loadNextTopic = () => {
  loadTopic()
}

const handleComplete = (result: SpeakingResult) => {
  history.value.unshift({
    ...result,
    topic: currentTopic.value || undefined
  })
  userStore.addExp(10)
}

const loadHistory = async () => {
  try {
    const res = await getSpeakingHistory({
      page: historyPage.value,
      pageSize: historyPageSize.value
    })
    if (res.code === 200) {
      if (historyPage.value === 1) {
        history.value = res.data.list
      } else {
        history.value = [...history.value, ...res.data.list]
      }
      hasMoreHistory.value = history.value.length < res.data.total
    }
  } catch (error) {
    console.error('加载历史失败:', error)
  }
}

const loadMoreHistory = async () => {
  loadingMore.value = true
  historyPage.value++
  await loadHistory()
  loadingMore.value = false
}

const showHistoryDetail = (item: SpeakingResult) => {
  selectedHistory.value = item
  showDetail.value = true
  audioProgress.value = 0
  audioCurrentTime.value = 0
  audioDuration.value = item.duration
}

const retryTopic = () => {
  if (selectedHistory.value?.topic) {
    currentTopic.value = selectedHistory.value.topic
    showDetail.value = false
  }
}

const getDifficultyLabel = (difficulty: string) => {
  const labels: Record<string, string> = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级'
  }
  return labels[difficulty] || difficulty
}

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString()
}

const formatDate = (time: string) => {
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}

const getScoreClass = (score: number) => {
  if (score >= 80) return 'good'
  if (score >= 60) return 'ok'
  return 'poor'
}

const toggleAudio = () => {
  if (!selectedHistory.value?.audioUrl) return

  if (isPlayingAudio.value && audioElement) {
    audioElement.pause()
    isPlayingAudio.value = false
    return
  }

  if (!audioElement) {
    audioElement = new Audio(selectedHistory.value.audioUrl)
    audioElement.onloadedmetadata = () => {
      audioDuration.value = audioElement!.duration
    }
    audioElement.ontimeupdate = () => {
      audioCurrentTime.value = audioElement!.currentTime
      audioProgress.value = (audioElement!.currentTime / audioElement!.duration) * 100
    }
    audioElement.onended = () => {
      isPlayingAudio.value = false
      audioProgress.value = 0
      audioCurrentTime.value = 0
    }
  }

  audioElement.play()
  isPlayingAudio.value = true
}

const seekAudio = () => {
  if (audioElement) {
    audioElement.currentTime = (audioProgress.value / 100) * audioDuration.value
  }
}

const formatAudioTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  loadTopic()
  loadHistory()
})

onUnmounted(() => {
  if (audioElement) {
    audioElement.pause()
    audioElement = null
  }
})
</script>

<style scoped lang="scss">
.speaking-page {
  min-height: 100vh;
  background: var(--bg-color);
  padding-bottom: 40px;
}

.page-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 10;

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
    min-width: 80px;
  }
}

.language-tabs {
  display: flex;
  padding: 12px 20px;
  gap: 12px;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);

  .lang-tab {
    flex: 1;
    text-align: center;
    padding: 10px;
    border-radius: 12px;
    font-size: 14px;
    color: var(--text-color-light);
    background: var(--bg-color);
    transition: all 0.3s;
    cursor: pointer;

    &.active {
      background: var(--primary-color);
      color: white;
      font-weight: bold;
    }

    &:not(.active):hover {
      background: var(--border-color);
    }
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
  min-height: 40vh;
  gap: 16px;
}

.history-section {
  padding: 20px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h2 {
      font-size: 16px;
      font-weight: bold;
    }

    .history-count {
      font-size: 12px;
      color: var(--text-color-light);
    }
  }

  .history-stats {
    display: flex;
    justify-content: space-around;
    padding: 16px;
    background: var(--card-bg);
    border-radius: 16px;
    margin-bottom: 16px;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;

      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: var(--text-color);

        &.best {
          color: #f59e0b;
        }
      }

      .stat-label {
        font-size: 12px;
        color: var(--text-color-light);
      }
    }
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
    cursor: pointer;
    transition: background 0.3s;

    &:last-child {
      border-bottom: none;
    }

    &:active {
      background: var(--bg-color);
    }

    .history-info {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .history-title {
        font-size: 14px;
        font-weight: 500;
      }

      .history-meta {
        display: flex;
        gap: 12px;
        font-size: 12px;
        color: var(--text-color-light);

        .history-difficulty {
          padding: 2px 8px;
          background: var(--primary-color-light);
          color: var(--primary-color);
          border-radius: 10px;
        }
      }
    }

    .history-right {
      display: flex;
      align-items: center;
      gap: 12px;

      .history-score {
        display: flex;
        align-items: baseline;
        gap: 2px;

        .score-value {
          font-size: 24px;
          font-weight: bold;
        }

        .score-label {
          font-size: 12px;
          color: var(--text-color-light);
        }

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

      .arrow-icon {
        color: var(--text-color-light);
        font-size: 16px;
      }
    }
  }

  .load-more-btn {
    width: 100%;
    margin-top: 16px;
  }
}

.detail-content {
  padding: 0 20px;

  .detail-header {
    text-align: center;
    padding: 24px;
    background: var(--card-bg);
    border-radius: 16px;
    margin-bottom: 20px;

    .detail-score {
      display: inline-flex;
      align-items: baseline;
      gap: 4px;
      margin-bottom: 12px;

      .score-value {
        font-size: 64px;
        font-weight: bold;
      }

      .score-label {
        font-size: 24px;
        color: var(--text-color-light);
      }

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

    .detail-meta {
      display: flex;
      justify-content: center;
      gap: 16px;
      font-size: 14px;
      color: var(--text-color-light);
    }
  }

  .detail-section {
    background: var(--card-bg);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;

    h4 {
      font-size: 14px;
      color: var(--text-color-light);
      margin-bottom: 12px;
    }

    .detail-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .detail-content-text {
      color: var(--text-color-light);
      line-height: 1.6;
    }

    .detail-feedback {
      color: var(--text-color);
      line-height: 1.6;
    }

    .error-list {
      padding-left: 20px;
      color: var(--text-color);

      li {
        margin-bottom: 8px;
        line-height: 1.5;
      }
    }
  }

  .audio-player {
    display: flex;
    align-items: center;
    gap: 16px;

    .audio-progress {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;

      .audio-time {
        font-size: 12px;
        color: var(--text-color-light);
      }
    }
  }

  .detail-actions {
    margin-top: 24px;

    .el-button {
      width: 100%;
    }
  }
}
</style>
