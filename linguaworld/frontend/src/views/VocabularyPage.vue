<template>
  <div class="vocabulary-page">
    <!-- 顶部导航 -->
    <header class="page-header">
      <el-button text @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1>单词背诵</h1>
      <span class="progress-text">{{ currentIndex + 1 }} / {{ words.length }}</span>
    </header>

    <!-- 单词卡片 -->
    <div class="card-container" v-if="words.length > 0">
      <VocabularyCard
        :vocabulary="words[currentIndex]"
        @action="handleCardAction"
      />
    </div>

    <!-- 加载状态 -->
    <div v-else-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      <p>加载单词中...</p>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-container">
      <el-empty description="暂无单词" />
      <el-button type="primary" @click="loadWords">重新加载</el-button>
    </div>

    <!-- 进度条 -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progressPercent + '%' }" />
    </div>

    <!-- 学习完成 -->
    <div v-if="isCompleted" class="completion-overlay">
      <div class="completion-card">
        <div class="completion-icon">🎉</div>
        <h2>学习完成！</h2>
        <div class="completion-stats">
          <div class="stat">
            <span class="value">{{ masteredCount }}</span>
            <span class="label">已掌握</span>
          </div>
          <div class="stat">
            <span class="value">{{ forgotCount }}</span>
            <span class="label">需复习</span>
          </div>
        </div>
        <div class="completion-actions">
          <el-button @click="resetLearning">再学一遍</el-button>
          <el-button type="primary" @click="goBack">返回</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Loading } from '@element-plus/icons-vue'
import VocabularyCard from '@/components/VocabularyCard.vue'
import { getRandomWords, markWordStatus } from '@/api/vocabulary'
import { useLanguageStore } from '@/store/language'
import type { Vocabulary } from '@/types'

const router = useRouter()
const languageStore = useLanguageStore()

// 单词列表
const words = ref<Vocabulary[]>([])

// 当前索引
const currentIndex = ref(0)

// 加载状态
const loading = ref(false)

// 统计数据
const masteredCount = ref(0)
const forgotCount = ref(0)

// 进度百分比
const progressPercent = computed(() => {
  if (words.value.length === 0) return 0
  return ((currentIndex.value) / words.value.length) * 100
})

// 是否完成
const isCompleted = computed(() => {
  return currentIndex.value >= words.value.length && words.value.length > 0
})

// 加载单词
const loadWords = async () => {
  loading.value = true
  try {
    const res = await getRandomWords(languageStore.currentLanguage, 20)
    if (res.code === 200) {
      words.value = res.data
      currentIndex.value = 0
      masteredCount.value = 0
      forgotCount.value = 0
    }
  } catch (error) {
    console.error('加载单词失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理卡片操作
const handleCardAction = async (status: 'mastered' | 'forgot') => {
  const word = words.value[currentIndex.value]

  try {
    // 调用API标记单词状态
    await markWordStatus(word.id, status === 'mastered' ? 1 : 2)
  } catch (error) {
    console.error('标记失败:', error)
  }

  // 更新统计
  if (status === 'mastered') {
    masteredCount.value++
  } else {
    forgotCount.value++
  }

  // 下一题
  currentIndex.value++
}

// 重置学习
const resetLearning = () => {
  loadWords()
}

// 返回
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

  .progress-text {
    position: absolute;
    right: 20px;
    font-size: 14px;
    color: var(--text-color-light);
  }
}

.card-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 40px 20px;
}

.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  gap: 16px;
}

.progress-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--border-color);

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transition: width 0.3s ease;
  }
}

.completion-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.completion-card {
  background: var(--card-bg);
  border-radius: 24px;
  padding: 40px;
  text-align: center;
  max-width: 400px;
  width: 90%;

  .completion-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  h2 {
    font-size: 24px;
    margin-bottom: 24px;
  }

  .completion-stats {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-bottom: 32px;

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;

      .value {
        font-size: 36px;
        font-weight: bold;
        color: var(--primary-color);
      }

      .label {
        font-size: 14px;
        color: var(--text-color-light);
      }
    }
  }

  .completion-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
  }
}
</style>
