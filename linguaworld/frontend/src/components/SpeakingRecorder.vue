<template>
  <div class="speaking-recorder">
    <!-- 题目展示 -->
    <div class="topic-section">
      <div class="topic-type">{{ getTopicType }}</div>
      <h3 class="topic-title">{{ topic.title }}</h3>
      <p v-if="topic.content" class="topic-content">{{ topic.content }}</p>

      <!-- 播放示例音频 -->
      <el-button
        v-if="topic.audioUrl"
        type="primary"
        plain
        :icon="VideoPlay"
        @click="playExample"
        :loading="isPlayingExample"
      >
        播放示例
      </el-button>
    </div>

    <!-- 录音区域 -->
    <div class="record-section">
      <!-- 波形动画 -->
      <div class="waveform" :class="{ recording: isRecording }">
        <div
          v-for="i in 20"
          :key="i"
          class="wave-bar"
          :style="{ animationDelay: `${i * 0.05}s` }"
        />
      </div>

      <!-- 录音时长 -->
      <div class="duration">{{ formatDuration(recordDuration) }}</div>

      <!-- 录音按钮 -->
      <div class="record-button" @click="toggleRecording">
        <div class="button-inner" :class="{ recording: isRecording }">
          <el-icon :size="40">
            <Microphone v-if="!isRecording" />
            <VideoPause v-else />
          </el-icon>
        </div>
      </div>

      <p class="record-hint">
        {{ isRecording ? '点击停止录音' : '点击开始录音' }}
      </p>

      <!-- 操作按钮 -->
      <div v-if="audioBlob" class="action-buttons">
        <el-button :icon="Refresh" @click="resetRecording">重新录音</el-button>
        <el-button type="primary" :icon="Upload" @click="submitRecording" :loading="isSubmitting">
          提交评分
        </el-button>
      </div>
    </div>

    <!-- 评分结果 -->
    <div v-if="result" class="result-section">
      <div class="score-card">
        <div class="score">{{ result.score }}</div>
        <div class="score-label">得分</div>
        <div class="stars">
          <el-icon v-for="i in 5" :key="i" :color="i <= Math.floor(result.score / 20) ? '#f59e0b' : '#ddd'">
            <StarFilled />
          </el-icon>
        </div>
      </div>

      <div class="feedback">
        <h4>AI 反馈</h4>
        <p>{{ result.feedback }}</p>
      </div>

      <div v-if="result.errorPoints?.length" class="error-points">
        <h4>需改进点</h4>
        <ul>
          <li v-for="(point, index) in result.errorPoints" :key="index">{{ point }}</li>
        </ul>
      </div>

      <div class="result-actions">
        <el-button @click="$emit('next')">下一题</el-button>
        <el-button type="primary" @click="resetAll">再练一次</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { Microphone, VideoPause, VideoPlay, Refresh, Upload, StarFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { SpeakingTopic, SpeakingResult } from '@/types'
import { submitSpeaking } from '@/api/speaking'

const props = defineProps<{
  topic: SpeakingTopic
}>()

const emit = defineEmits<{
  next: []
  complete: [result: SpeakingResult]
}>()

// 录音状态
const isRecording = ref(false)
const recordDuration = ref(0)
const audioBlob = ref<Blob | null>(null)
const isSubmitting = ref(false)
const result = ref<SpeakingResult | null>(null)
const isPlayingExample = ref(false)

// MediaRecorder实例
let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let durationTimer: number | null = null

// 题目类型
const getTopicType = computed(() => {
  const types: Record<string, string> = {
    reading: '跟读练习',
    free: '自由口语',
    dictation: '听力默写'
  }
  return types[props.topic.type] || props.topic.type
})

// 格式化时长
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 播放示例音频
const playExample = async () => {
  if (!props.topic.audioUrl) return

  isPlayingExample.value = true
  const audio = new Audio(props.topic.audioUrl)

  audio.onended = () => {
    isPlayingExample.value = false
  }

  audio.onerror = () => {
    ElMessage.error('音频播放失败')
    isPlayingExample.value = false
  }

  try {
    await audio.play()
  } catch {
    ElMessage.error('无法播放音频，请检查麦克风权限')
    isPlayingExample.value = false
  }
}

// 开始/停止录音
const toggleRecording = async () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    await startRecording()
  }
}

// 开始录音
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      audioBlob.value = new Blob(audioChunks, { type: 'audio/webm' })
      stream.getTracks().forEach(track => track.stop())
    }

    mediaRecorder.start()
    isRecording.value = true
    recordDuration.value = 0

    // 开始计时
    durationTimer = window.setInterval(() => {
      recordDuration.value++
    }, 1000)

  } catch (error) {
    console.error('录音失败:', error)
    ElMessage.error('无法访问麦克风，请检查权限设置')
  }
}

// 停止录音
const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  isRecording.value = false

  if (durationTimer) {
    clearInterval(durationTimer)
    durationTimer = null
  }
}

// 重置录音
const resetRecording = () => {
  audioBlob.value = null
  recordDuration.value = 0
  result.value = null
}

// 重置所有
const resetAll = () => {
  resetRecording()
}

// 提交录音
const submitRecording = async () => {
  if (!audioBlob.value) {
    ElMessage.warning('请先录音')
    return
  }

  isSubmitting.value = true

  try {
    const res = await submitSpeaking({
      topicId: props.topic.id,
      audioBlob: audioBlob.value,
      duration: recordDuration.value
    })

    if (res.code === 200) {
      result.value = res.data
      emit('complete', res.data)
      ElMessage.success('评分完成')
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

// 清理
onUnmounted(() => {
  if (durationTimer) {
    clearInterval(durationTimer)
  }
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
})
</script>

<style scoped lang="scss">
.speaking-recorder {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
}

.topic-section {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  text-align: center;

  .topic-type {
    display: inline-block;
    padding: 4px 12px;
    background: var(--primary-color-light);
    color: var(--primary-color);
    border-radius: 20px;
    font-size: 12px;
    margin-bottom: 12px;
  }

  .topic-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .topic-content {
    color: var(--text-color-light);
    margin-bottom: 16px;
  }
}

.record-section {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 32px;
  text-align: center;

  .waveform {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    height: 60px;
    margin-bottom: 16px;

    .wave-bar {
      width: 4px;
      height: 20px;
      background: var(--border-color);
      border-radius: 2px;
      animation: wave 1s ease-in-out infinite;
    }

    &.recording .wave-bar {
      background: var(--primary-color);
      animation: wave 0.5s ease-in-out infinite;
    }
  }

  @keyframes wave {
    0%, 100% { height: 20px; }
    50% { height: 50px; }
  }

  .duration {
    font-size: 24px;
    font-weight: bold;
    color: var(--text-color);
    margin-bottom: 24px;
  }

  .record-button {
    display: inline-block;
    cursor: pointer;

    .button-inner {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--primary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;

      &:hover {
        transform: scale(1.05);
      }

      &.recording {
        background: #ef4444;
        animation: pulse 1s infinite;
      }
    }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  .record-hint {
    color: var(--text-color-light);
    margin-top: 12px;
    font-size: 14px;
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 24px;
  }
}

.result-section {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 24px;
  margin-top: 24px;

  .score-card {
    text-align: center;
    margin-bottom: 24px;

    .score {
      font-size: 64px;
      font-weight: bold;
      color: var(--primary-color);
    }

    .score-label {
      color: var(--text-color-light);
      margin-bottom: 8px;
    }

    .stars {
      display: flex;
      justify-content: center;
      gap: 4px;
      font-size: 24px;
    }
  }

  .feedback, .error-points {
    margin-bottom: 16px;

    h4 {
      font-size: 16px;
      margin-bottom: 8px;
      color: var(--text-color);
    }

    p, li {
      color: var(--text-color-light);
      line-height: 1.6;
    }

    ul {
      padding-left: 20px;
    }
  }

  .result-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 24px;
  }
}
</style>
