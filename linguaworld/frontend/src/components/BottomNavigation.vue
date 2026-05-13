<template>
  <div class="bottom-nav">
    <div
      v-for="item in navItems"
      :key="item.path"
      class="nav-item"
      :class="{ active: isActive(item.path) }"
      @click="$router.push(item.path)"
    >
      <div class="nav-icon">{{ item.icon }}</div>
      <div class="nav-label">{{ item.label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const navItems = [
  { path: '/', icon: '🏠', label: '首页' },
  { path: '/courses', icon: '📚', label: '课程' },
  { path: '/vocabulary', icon: '📖', label: '单词' },
  { path: '/speaking', icon: '🎤', label: '口语' },
  { path: '/community', icon: '💬', label: '社区' },
  { path: '/profile', icon: '👤', label: '我的' }
]

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<style scoped lang="scss">
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: var(--card-bg);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom, 0);
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    opacity: 0.8;
  }

  &.active {
    .nav-icon {
      transform: scale(1.1);
    }
    .nav-label {
      color: #667eea;
      font-weight: bold;
    }
  }
}

.nav-icon {
  font-size: 24px;
  transition: transform 0.3s;
}

.nav-label {
  font-size: 12px;
  color: var(--text-color);
}
</style>
