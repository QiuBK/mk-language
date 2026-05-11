<template>
  <div class="video-player" ref="containerRef">
    <video
      ref="videoRef"
      class="video-element"
      :src="videoUrl"
      :poster="poster"
      @loadedmetadata="onLoadedMetadata"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
      @waiting="isBuffering = true"
      @canplay="isBuffering = false"
      @error="onError"
    />

    <!-- 加载状态 -->
    <div v-if="isBuffering" class="loading-overlay">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
    </div>

    <!-- 错误状态 -->
    <div v-if="errorMsg" class="error-overlay">
      <el-icon :size="48"><Warning /></el-icon>
      <p>{{ errorMsg }}</p>
      <el-button type="primary" @click="retryLoad">重试</el-button>
    </div>

    <!-- 控制栏 -->
    <div class="controls" v-show="showControls">
      <!-- 进度条 -->
      <div class="progress-bar" @click="seekTo" @mousemove="updateHoverTime" @mouseleave="hoverTime = null">
        <div class="progress-buffered" :style="{ width: bufferedPercent + '%' }" />
        <div class="progress-played" :style="{ width: playedPercent + '%' }">
          <div class="progress-thumb" />
        </div>
        <div v-if="hoverTime !== null" class="progress-hover" :style="{ left: hoverPosition + 'px' }">
          {{ formatTime(hoverTime) }}
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="control-buttons">
        <div class="left-controls">
          <el-icon @click="togglePlay" :size="24">
            <VideoPlay v-if="!isPlaying" />
            <VideoPause v-else />
          </el-icon>

          <!-- 音量控制 -->
          <div class="volume-control" @click.stop>
            <el-icon @click="toggleMute" :size="20">
              <VolumeMuted v-if="isMuted || volume === 0" />
              <VolumeLow v-else-if="volume < 0.5" />
              <VolumeHigh v-else />
            </el-icon>
            <el-slider
              v-model="volume"
              :show-tooltip="false"
              @input="updateVolume"
              class="volume-slider"
            />
          </div>

          <span class="time-display">
            {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
          </span>
        </div>

        <div class="right-controls">
          <!-- 倍速选择 -->
          <el-dropdown trigger="click" @command="setPlaybackRate">
            <span class="speed-btn">{{ playbackRate }}x</span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="0.5">0.5x</el-dropdown-item>
                <el-dropdown-item :command="0.75">0.75x</el-dropdown-item>
                <el-dropdown-item :command="1">1x</el-dropdown-item>
                <el-dropdown-item :command="1.25">1.25x</el-dropdown-item>
                <el-dropdown-item :command="1.5">1.5x</el-dropdown-item>
                <el-dropdown-item :command="2">2x</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 全屏 -->
          <el-icon @click="toggleFullscreen" :size="20">
            <FullScreen v-if="!isFullscreen" />
            <Close v-else />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import {
  VideoPlay,
  VideoPause,
  VolumeHigh,
  VolumeLow,
  VolumeMuted,
  FullScreen,
  Close,
  Loading,
  Warning
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = withDefaults(defineProps<{
  videoUrl: string
  poster?: string
  autoPlay?: boolean
  startPosition?: number // 开始播放位置（秒）
}>(), {
  autoPlay: false,
  startPosition: 0
})

const emit = defineEmits<{
  timeUpdate: [currentTime: number, duration: number]
  ended: []
  progressSave: [currentTime: number]
}>()

// DOM refs
const containerRef = ref<HTMLElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)

// 状态
const isPlaying = ref(false)
const isBuffering = ref(false)
const isMuted = ref(false)
const isFullscreen = ref(false)
const volume = ref(1)
const playbackRate = ref(1)
const currentTime = ref(0)
const duration = ref(0)
const bufferedPercent = ref(0)
const showControls = ref(true)
const errorMsg = ref('')
const hoverTime = ref<number | null>(null)
const hoverPosition = ref(0)

// 播放进度百分比
const playedPercent = computed(() => {
  return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
})

// 格式化时间
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 视频加载完成
const onLoadedMetadata = () => {
  if (videoRef.value) {
    duration.value = videoRef.value.duration

    // 设置起始位置
    if (props.startPosition > 0 && props.startPosition < duration.value) {
      videoRef.value.currentTime = props.startPosition
    }

    if (props.autoPlay) {
      videoRef.value.play()
      isPlaying.value = true
    }
  }
}

// 时间更新
const onTimeUpdate = () => {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime

    // 更新缓冲进度
    if (videoRef.value.buffered.length > 0) {
      bufferedPercent.value = (videoRef.value.buffered.end(0) / duration.value) * 100
    }

    emit('timeUpdate', currentTime.value, duration.value)

    // 每10秒保存一次进度
    if (Math.floor(currentTime.value) % 10 === 0) {
      emit('progressSave', currentTime.value)
    }
  }
}

// 播放结束
const onEnded = () => {
  isPlaying.value = false
  emit('ended')
  emit('progressSave', 0) // 重置进度
}

// 播放错误
const onError = () => {
  errorMsg.value = '视频加载失败'
}

// 重试加载
const retryLoad = () => {
  errorMsg.value = ''
  if (videoRef.value) {
    videoRef.value.load()
  }
}

// 切换播放/暂停
const togglePlay = () => {
  if (!videoRef.value) return

  if (isPlaying.value) {
    videoRef.value.pause()
  } else {
    videoRef.value.play()
  }
  isPlaying.value = !isPlaying.value
}

// 静音切换
const toggleMute = () => {
  if (videoRef.value) {
    videoRef.value.muted = !isMuted.value
    isMuted.value = !isMuted.value
  }
}

// 更新音量
const updateVolume = (val: number) => {
  if (videoRef.value) {
    videoRef.value.volume = val
    volume.value = val
    isMuted.value = val === 0
  }
}

// 设置倍速
const setPlaybackRate = (rate: number) => {
  if (videoRef.value) {
    videoRef.value.playbackRate = rate
    playbackRate.value = rate
  }
}

// 跳转
const seekTo = (event: MouseEvent) => {
  if (!videoRef.value || !containerRef.value) return

  const rect = containerRef.value.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  videoRef.value.currentTime = percent * duration.value
}

// 更新hover时间显示
const updateHoverTime = (event: MouseEvent) => {
  if (!containerRef.value) return

  const rect = containerRef.value.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  hoverTime.value = percent * duration.value
  hoverPosition.value = event.clientX - rect.left
}

// 全屏切换
const toggleFullscreen = () => {
  if (!containerRef.value) return

  if (!isFullscreen.value) {
    containerRef.value.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// 监听全屏变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// 显示控制栏定时器
let controlsTimer: number | null = null

const showControlsTemporarily = () => {
  showControls.value = true
  if (controlsTimer) {
    clearTimeout(controlsTimer)
  }
  controlsTimer = window.setTimeout(() => {
    if (isPlaying.value) {
      showControls.value = false
    }
  }, 3000)
}

// 键盘控制
const handleKeydown = (e: KeyboardEvent) => {
  if (!videoRef.value) return

  switch (e.key) {
    case ' ':
    case 'k':
      e.preventDefault()
      togglePlay()
      break
    case 'ArrowLeft':
      videoRef.value.currentTime -= 5
      break
    case 'ArrowRight':
      videoRef.value.currentTime += 5
      break
    case 'ArrowUp':
      e.preventDefault()
      updateVolume(Math.min(1, volume.value + 0.1))
      break
    case 'ArrowDown':
      e.preventDefault()
      updateVolume(Math.max(0, volume.value - 0.1))
      break
    case 'm':
      toggleMute()
      break
    case 'f':
      toggleFullscreen()
      break
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('keydown', handleKeydown)
  if (controlsTimer) {
    clearTimeout(controlsTimer)
  }
})
</script>

<style scoped lang="scss">
.video-player {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 12px;
  overflow: hidden;

  &:hover .controls {
    opacity: 1;
  }

  .video-element {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .loading-overlay,
  .error-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    gap: 16px;

    p {
      font-size: 16px;
    }
  }

  .controls {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
    opacity: 1;
    transition: opacity 0.3s;
  }

  .progress-bar {
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    cursor: pointer;
    margin-bottom: 12px;
    position: relative;

    &:hover {
      height: 6px;
    }

    .progress-buffered {
      position: absolute;
      height: 100%;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 2px;
    }

    .progress-played {
      position: absolute;
      height: 100%;
      background: var(--primary-color);
      border-radius: 2px;

      .progress-thumb {
        position: absolute;
        right: -6px;
        top: 50%;
        transform: translateY(-50%);
        width: 12px;
        height: 12px;
        background: white;
        border-radius: 50%;
        opacity: 0;
        transition: opacity 0.2s;
      }
    }

    &:hover .progress-thumb {
      opacity: 1;
    }

    .progress-hover {
      position: absolute;
      bottom: 16px;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      pointer-events: none;
    }
  }

  .control-buttons {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: white;

    .left-controls,
    .right-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .volume-control {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      .volume-slider {
        width: 80px;
      }
    }

    .time-display {
      font-size: 13px;
      font-variant-numeric: tabular-nums;
    }

    .speed-btn {
      font-size: 13px;
      padding: 4px 8px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }

    > div > div,
    > div > span {
      cursor: pointer;

      &:hover {
        color: var(--primary-color);
      }
    }
  }
}

:deep(.el-slider__runway) {
  background: rgba(255, 255, 255, 0.3);
}

:deep(.el-slider__bar) {
  background: var(--primary-color);
}
</style>
