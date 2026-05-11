<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useLanguageStore } from './store/language'
import { useUserStore } from './store/user'

const route = useRoute()
const languageStore = useLanguageStore()
const userStore = useUserStore()

const isDarkMode = ref(true)

// 监听语言变化，更新Element Plus语言包
watch(() => languageStore.currentLanguage, (newLang) => {
  // 更新页面标题
  document.title = getPageTitle(route.name as string)
})

// 获取页面标题
const getPageTitle = (name?: string): string => {
  const titles: Record<string, Record<string, string>> = {
    home: { zh: '首页', en: 'Home', ja: 'ホーム' },
    courses: { zh: '课程中心', en: 'Courses', ja: 'コース' },
    vocabulary: { zh: '单词学习', en: 'Vocabulary', ja: '単語学習' },
    speaking: { zh: '口语练习', en: 'Speaking', ja: 'スピーキング' },
    community: { zh: '社区', en: 'Community', ja: 'コミュニティ' },
    profile: { zh: '个人中心', en: 'Profile', ja: 'プロフィール' }
  }
  return titles[name || 'home']?.[languageStore.currentLanguage] || 'LinguaWorld'
}
</script>

<style lang="scss">
#app {
  min-height: 100vh;
  background: var(--bg-color);
  color: var(--text-color);
}

.dark-mode {
  --bg-color: #0f172a;
  --text-color: #e2e8f0;
  --card-bg: #1e293b;
  --border-color: #334155;
}
</style>
