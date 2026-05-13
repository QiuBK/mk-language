<template>
  <div class="vocabulary-page">
    <header class="page-header">
      <el-button text @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1>单词背诵</h1>
      <div class="language-switch">
        <el-select v-model="selectedLanguage" @change="handleLanguageChange" size="small">
          <el-option label="英语" value="en" />
          <el-option label="日语" value="ja" />
          <el-option label="韩语" value="ko" />
        </el-select>
      </div>
    </header>

    <div class="learning-stats" v-if="words.length > 0">
      <div class="stat-item">
        <span class="stat-value">{{ currentIndex + 1 }}</span>
        <span class="stat-label">当前</span>
      </div>
      <div class="stat-item">
        <span class="stat-value mastered">{{ masteredCount }}</span>
        <span class="stat-label">已掌握</span>
      </div>
      <div class="stat-item">
        <span class="stat-value forgot">{{ forgotCount }}</span>
        <span class="stat-label">需复习</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ remainingCount }}</span>
        <span class="stat-label">剩余</span>
      </div>
    </div>

    <div class="card-container" v-if="words.length > 0">
      <div class="flip-card" :class="{ flipped: isFlipped }">
        <div class="flip-card-inner">
          <div class="card-face card-front" @click="handleFlip">
            <div class="language-badge">{{ getLanguageName }}</div>
            <div class="word">{{ words[currentIndex]?.word }}</div>
            <div v-if="words[currentIndex]?.pronunciation" class="pronunciation">
              {{ words[currentIndex].pronunciation }}
            </div>
            <div class="hint">
              <el-icon><Refresh /></el-icon>
              点击翻转查看释义
            </div>
          </div>

          <div class="card-face card-back">
            <div class="translation">{{ words[currentIndex]?.translation }}</div>
            <div v-if="words[currentIndex]?.example" class="example">
              <p class="example-text">{{ words[currentIndex].example }}</p>
              <p class="example-translation">{{ words[currentIndex].exampleTranslation }}</p>
            </div>

            <div class="audio-btn" v-if="words[currentIndex]?.audioUrl" @click="playAudio">
              <el-icon :size="20">
                <VideoPlay v-if="!isPlaying" />
                <VideoPause v-else />
              </el-icon>
            </div>

            <div class="action-buttons" @click.stop>
              <div class="action-btn forgot-btn" @click="handleAction('forgot')">
                <el-icon :size="28"><Close /></el-icon>
                <span>不认识</span>
              </div>
              <div class="action-btn mastered-btn" @click="handleAction('mastered')">
                <el-icon :size="28"><Check /></el-icon>
                <span>认识</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      <p>加载单词中...</p>
    </div>

    <div v-else class="empty-container">
      <el-empty description="暂无单词" />
      <el-button type="primary" @click="loadWords">重新加载</el-button>
    </div>

    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progressPercent + '%' }" />
      <div class="progress-markers">
        <span
          v-for="(word, index) in words"
          :key="word.id"
          class="marker"
          :class="{
            mastered: learnedWords[index] === 'mastered',
            forgot: learnedWords[index] === 'forgot'
          }"
        />
      </div>
    </div>

    <div v-if="isCompleted" class="completion-overlay" @click.self="handleOverlayClick">
      <div class="completion-card">
        <div class="completion-icon">
          <span v-if="masteredCount > forgotCount">🎉</span>
          <span v-else>💪</span>
        </div>
        <h2>学习完成！</h2>
        <div class="completion-message">
          {{ getCompletionMessage }}
        </div>
        <div class="completion-stats">
          <div class="stat">
            <span class="value mastered">{{ masteredCount }}</span>
            <span class="label">已掌握</span>
          </div>
          <div class="stat">
            <span class="value forgot">{{ forgotCount }}</span>
            <span class="label">需复习</span>
          </div>
          <div class="stat">
            <span class="value">{{ accuracyRate }}%</span>
            <span class="label">正确率</span>
          </div>
        </div>
        <div class="completion-actions">
          <el-button @click="reviewWrongWords" v-if="forgotCount > 0">
            <el-icon><Refresh /></el-icon>
            复习错题
          </el-button>
          <el-button type="primary" @click="loadWords">
            <el-icon><Refresh /></el-icon>
            再学一组
          </el-button>
          <el-button @click="goBack">返回</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Loading, Check, Close, Refresh, VideoPlay, VideoPause } from '@element-plus/icons-vue'
import { getRandomWords, markWordStatus } from '@/api/vocabulary'
import { useLanguageStore } from '@/store/language'
import type { Vocabulary } from '@/types'
import type { Language } from '@/store/language'

const router = useRouter()
const languageStore = useLanguageStore()

const selectedLanguage = ref(languageStore.currentLanguage || 'en')
const words = ref<Vocabulary[]>([])
const currentIndex = ref(0)
const loading = ref(false)
const isFlipped = ref(false)
const masteredCount = ref(0)
const forgotCount = ref(0)
const learnedWords = ref<Record<number, 'mastered' | 'forgot'>>({})
const isPlaying = ref(false)
let audio: HTMLAudioElement | null = null

const remainingCount = computed(() => {
  return Math.max(0, words.value.length - currentIndex.value)
})

const progressPercent = computed(() => {
  if (words.value.length === 0) return 0
  return (currentIndex.value / words.value.length) * 100
})

const isCompleted = computed(() => {
  return currentIndex.value >= words.value.length && words.value.length > 0
})

const accuracyRate = computed(() => {
  const total = masteredCount.value + forgotCount.value
  if (total === 0) return 0
  return Math.round((masteredCount.value / total) * 100)
})

const getLanguageName = computed(() => {
  const names: Record<string, string> = {
    en: 'English',
    ja: '日本語',
    ko: '한국어'
  }
  return names[selectedLanguage.value] || selectedLanguage.value
})

const getCompletionMessage = computed(() => {
  if (accuracyRate.value >= 80) {
    return '太棒了！继续保持这个势头！'
  } else if (accuracyRate.value >= 60) {
    return '不错的开始，继续加油！'
  } else {
    return '别灰心，多复习几次就会越来越好！'
  }
})

const handleFlip = () => {
  isFlipped.value = !isFlipped.value
}

const handleLanguageChange = () => {
  languageStore.setLanguage(selectedLanguage.value as Language)
  loadWords()
}

const loadWords = async () => {
  loading.value = true
  isFlipped.value = false
  try {
    const res = await getRandomWords(selectedLanguage.value, 20)
    if (res.code === 200) {
      words.value = res.data
      currentIndex.value = 0
      masteredCount.value = 0
      forgotCount.value = 0
      learnedWords.value = {}
    }
  } catch (error) {
    console.error('加载单词失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAction = async (status: 'mastered' | 'forgot') => {
  const word = words.value[currentIndex.value]
  if (!word) return

  try {
    await markWordStatus(word.id, status === 'mastered' ? 1 : 2)
  } catch (error) {
    console.error('标记失败:', error)
  }

  learnedWords.value[word.id] = status

  if (status === 'mastered') {
    masteredCount.value++
  } else {
    forgotCount.value++
  }

  isFlipped.value = false

  setTimeout(() => {
    currentIndex.value++
  }, 200)
}

const playAudio = () => {
  const word = words.value[currentIndex.value]
  if (!word?.audioUrl) return

  if (isPlaying.value && audio) {
    audio.pause()
    isPlaying.value = false
    return
  }

  audio = new Audio(word.audioUrl)
  audio.onended = () => {
    isPlaying.value = false
  }
  audio.play()
  isPlaying.value = true
}

const reviewWrongWords = () => {
  const wrongWords = words.value.filter(word => learnedWords.value[word.id] === 'forgot')
  if (wrongWords.length > 0) {
    words.value = wrongWords
    currentIndex.value = 0
    masteredCount.value = 0
    forgotCount.value = 0
    learnedWords.value = {}
  }
}

const handleOverlayClick = () => {}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadWords()
})
</script>

<style scoped lang="scss">
.vocabulary-page {
  min-height: 100vh;
  background: var(--bg-color);
  position: relative;
  padding-bottom: 60px;
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

  .language-switch {
    min-width: 80px;
  }
}

.learning-stats {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: var(--text-color);

      &.mastered {
        color: #67c23a;
      }

      &.forgot {
        color: #f56c6c;
      }
    }

    .stat-label {
      font-size: 12px;
      color: var(--text-color-light);
    }
  }
}

.card-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  padding: 40px 20px;
}

.flip-card {
  width: 100%;
  max-width: 400px;
  height: 320px;
  perspective: 1000px;
  cursor: pointer;

  .flip-card-inner {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &.flipped .flip-card-inner {
    transform: rotateY(180deg);
  }
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.card-front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  .language-badge {
    position: absolute;
    top: 16px;
    left: 16px;
    font-size: 12px;
    padding: 4px 12px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    backdrop-filter: blur(10px);
  }

  .word {
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 8px;
    text-align: center;
  }

  .pronunciation {
    font-size: 18px;
    opacity: 0.9;
    margin-bottom: 16px;
  }

  .hint {
    position: absolute;
    bottom: 24px;
    font-size: 14px;
    opacity: 0.7;
    display: flex;
    align-items: center;
    gap: 6px;
    animation: bounce 2s infinite;
  }
}

.card-back {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  transform: rotateY(180deg);

  .translation {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 16px;
    text-align: center;
  }

  .example {
    text-align: center;
    margin-bottom: 24px;
    max-width: 90%;

    .example-text {
      font-size: 16px;
      font-style: italic;
      margin-bottom: 4px;
      opacity: 0.95;
    }

    .example-translation {
      font-size: 14px;
      opacity: 0.85;
    }
  }

  .audio-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 44px;
    height: 44px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f5576c;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
  }

  .action-buttons {
    position: absolute;
    bottom: 24px;
    display: flex;
    gap: 24px;
  }

  .action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px 24px;
    border-radius: 16px;
    transition: all 0.3s;
    cursor: pointer;

    span {
      font-size: 12px;
    }

    &.forgot-btn {
      background: rgba(245, 108, 108, 0.3);
      border: 2px solid rgba(245, 108, 108, 0.5);

      &:hover {
        background: rgba(245, 108, 108, 0.5);
        transform: scale(1.05);
      }
    }

    &.mastered-btn {
      background: rgba(103, 194, 58, 0.3);
      border: 2px solid rgba(103, 194, 58, 0.5);

      &:hover {
        background: rgba(103, 194, 58, 0.5);
        transform: scale(1.05);
      }
    }
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 16px;
}

.progress-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: var(--border-color);

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .progress-markers {
    position: absolute;
    top: -8px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-around;
    padding: 0 10px;

    .marker {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--border-color);
      transition: all 0.3s;

      &.mastered {
        background: #67c23a;
      }

      &.forgot {
        background: #f56c6c;
      }
    }
  }
}

.completion-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.completion-card {
  background: var(--card-bg);
  border-radius: 24px;
  padding: 40px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  animation: slideUp 0.5s ease;

  .completion-icon {
    font-size: 72px;
    margin-bottom: 16px;
  }

  h2 {
    font-size: 24px;
    margin-bottom: 8px;
  }

  .completion-message {
    color: var(--text-color-light);
    margin-bottom: 24px;
  }

  .completion-stats {
    display: flex;
    justify-content: center;
    gap: 32px;
    margin-bottom: 32px;

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;

      .value {
        font-size: 32px;
        font-weight: bold;

        &.mastered {
          color: #67c23a;
        }

        &.forgot {
          color: #f56c6c;
        }
      }

      .label {
        font-size: 14px;
        color: var(--text-color-light);
      }
    }
  }

  .completion-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .el-button {
      width: 100%;
    }
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
