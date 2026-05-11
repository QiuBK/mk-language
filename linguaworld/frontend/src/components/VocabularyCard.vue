<template>
  <div class="vocabulary-card" :class="{ flipped: isFlipped }">
    <div class="card-inner" @click="handleFlip">
      <!-- 正面：单词 -->
      <div class="card-front">
        <div class="language-badge">{{ getLanguageName }}</div>
        <div class="word">{{ vocabulary.word }}</div>
        <div v-if="vocabulary.pronunciation" class="pronunciation">
          {{ vocabulary.pronunciation }}
        </div>
        <div class="hint">点击卡片查看释义</div>
      </div>

      <!-- 背面：释义 -->
      <div class="card-back">
        <div class="translation">{{ vocabulary.translation }}</div>
        <div v-if="vocabulary.example" class="example">
          <p class="example-text">{{ vocabulary.example }}</p>
          <p class="example-translation">{{ vocabulary.exampleTranslation }}</p>
        </div>

        <!-- 操作按钮 -->
        <div class="actions" @click.stop>
          <el-button
            type="danger"
            :icon="Close"
            circle
            @click="handleAction('forgot')"
          />
          <el-button
            type="success"
            :icon="Check"
            circle
            @click="handleAction('mastered')"
          />
        </div>
      </div>
    </div>

    <!-- 音频播放按钮 -->
    <div v-if="vocabulary.audioUrl" class="audio-btn" @click.stop="playAudio">
      <el-icon :size="20">
        <VideoPlay v-if="!isPlaying" />
        <VideoPause v-else />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Check, Close, VideoPlay, VideoPause } from '@element-plus/icons-vue'
import type { Vocabulary } from '@/types'
import { useLanguageStore } from '@/store/language'

const props = defineProps<{
  vocabulary: Vocabulary
}>()

const emit = defineEmits<{
  action: [status: 'mastered' | 'forgot']
}>()

const languageStore = useLanguageStore()

const isFlipped = ref(false)
const isPlaying = ref(false)
const audio = ref<HTMLAudioElement | null>(null)

const getLanguageName = computed(() => {
  const names: Record<string, string> = {
    en: 'English',
    ja: '日本語',
    ko: '한국어'
  }
  return names[props.vocabulary.language] || props.vocabulary.language
})

const handleFlip = () => {
  isFlipped.value = !isFlipped.value
}

const handleAction = (status: 'mastered' | 'forgot') => {
  emit('action', status)
  // 重置卡片状态
  setTimeout(() => {
    isFlipped.value = false
  }, 300)
}

const playAudio = () => {
  if (!props.vocabulary.audioUrl) return

  if (isPlaying.value && audio.value) {
    audio.value.pause()
    isPlaying.value = false
    return
  }

  audio.value = new Audio(props.vocabulary.audioUrl)
  audio.value.onended = () => {
    isPlaying.value = false
  }
  audio.value.play()
  isPlaying.value = true
}
</script>

<style scoped lang="scss">
.vocabulary-card {
  width: 100%;
  max-width: 400px;
  height: 280px;
  perspective: 1000px;
  cursor: pointer;
  position: relative;

  .card-inner {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.6s;
  }

  &.flipped .card-inner {
    transform: rotateY(180deg);
  }

  .card-front,
  .card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
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
    }

    .word {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .pronunciation {
      font-size: 18px;
      opacity: 0.9;
      margin-bottom: 16px;
    }

    .hint {
      position: absolute;
      bottom: 20px;
      font-size: 14px;
      opacity: 0.7;
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

      .example-text {
        font-size: 16px;
        font-style: italic;
        margin-bottom: 4px;
      }

      .example-translation {
        font-size: 14px;
        opacity: 0.9;
      }
    }

    .actions {
      position: absolute;
      bottom: 24px;
      display: flex;
      gap: 24px;

      .el-button {
        width: 56px;
        height: 56px;
        font-size: 24px;
      }
    }
  }

  .audio-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #667eea;
    cursor: pointer;
    transition: transform 0.3s;

    &:hover {
      transform: scale(1.1);
    }
  }
}
</style>
