<template>
  <div class="language-switch">
    <el-dropdown trigger="click" @command="handleCommand">
      <div class="dropdown-trigger">
        <span class="flag">{{ currentLang.flag }}</span>
        <span class="name">{{ currentLang.name }}</span>
        <el-icon class="arrow"><ArrowDown /></el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="lang in languages"
            :key="lang.code"
            :command="lang.code"
            :class="{ active: lang.code === currentLanguage }"
          >
            <span class="flag">{{ lang.flag }}</span>
            <span class="name">{{ lang.name }}</span>
            <el-icon v-if="lang.code === currentLanguage" color="#67c23a"><Check /></el-icon>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowDown, Check } from '@element-plus/icons-vue'
import { useLanguageStore, type Language } from '@/store/language'

const languageStore = useLanguageStore()

const currentLanguage = computed(() => languageStore.currentLanguage)
const currentLang = computed(() => languageStore.currentLangInfo)
const languages = computed(() => languageStore.languages)

const handleCommand = (command: Language) => {
  languageStore.setLanguage(command)
}
</script>

<style scoped lang="scss">
.language-switch {
  .dropdown-trigger {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      border-color: var(--primary-color);
    }

    .flag {
      font-size: 18px;
    }

    .name {
      font-size: 14px;
      color: var(--text-color);
    }

    .arrow {
      font-size: 12px;
      color: var(--text-color-light);
    }
  }
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;

  .flag {
    font-size: 18px;
  }

  .name {
    flex: 1;
  }

  &.active {
    background: var(--primary-color-light);
  }
}
</style>
