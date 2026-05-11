import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Language = 'zh' | 'en' | 'ja' | 'ko'

export interface LanguageOption {
  code: Language
  name: string
  nativeName: string
  flag: string
}

export const useLanguageStore = defineStore('language', () => {
  // 当前语言
  const currentLanguage = ref<Language>('zh')

  // 支持的语言列表
  const languages: LanguageOption[] = [
    { code: 'zh', name: '中文', nativeName: '中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'ja', name: '日本語', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', nativeName: '한국어', flag: '🇰🇷' }
  ]

  // 获取当前语言信息
  const currentLangInfo = computed(() => {
    return languages.find(l => l.code === currentLanguage.value) || languages[0]
  })

  // 切换语言
  const setLanguage = (lang: Language) => {
    currentLanguage.value = lang
    localStorage.setItem('app_language', lang)
    // 可以在这里触发页面重新渲染或其他副作用
  }

  // 初始化语言
  const initLanguage = () => {
    const savedLang = localStorage.getItem('app_language') as Language
    if (savedLang && languages.some(l => l.code === savedLang)) {
      currentLanguage.value = savedLang
    }
  }

  // 获取翻译文本
  const t = (key: string, replacements?: Record<string, string>): string => {
    const translations = getTranslations(currentLanguage.value)
    let text = translations[key] || key

    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), v)
      })
    }

    return text
  }

  return {
    currentLanguage,
    languages,
    currentLangInfo,
    setLanguage,
    initLanguage,
    t
  }
})

// 获取翻译文本
function getTranslations(lang: Language): Record<string, string> {
  const translations: Record<Language, Record<string, string>> = {
    zh: {
      'nav.home': '首页',
      'nav.courses': '课程',
      'nav.vocabulary': '单词',
      'nav.speaking': '口语',
      'nav.community': '社区',
      'nav.profile': '我的',
      'home.welcome': '欢迎回来',
      'home.todayGoal': '今日目标',
      'home.continue': '继续学习',
      'course.beginner': '初级',
      'course.intermediate': '中级',
      'course.advanced': '高级',
      'vocab.flip': '点击卡片查看释义',
      'vocab.mastered': '记住了',
      'vocab.forgot': '不认识',
      'speaking.record': '点击录音',
      'speaking.submit': '提交评分',
      'speaking.score': '得分'
    },
    en: {
      'nav.home': 'Home',
      'nav.courses': 'Courses',
      'nav.vocabulary': 'Vocabulary',
      'nav.speaking': 'Speaking',
      'nav.community': 'Community',
      'nav.profile': 'Profile',
      'home.welcome': 'Welcome back',
      'home.todayGoal': "Today's Goal",
      'home.continue': 'Continue Learning',
      'course.beginner': 'Beginner',
      'course.intermediate': 'Intermediate',
      'course.advanced': 'Advanced',
      'vocab.flip': 'Click card to see meaning',
      'vocab.mastered': 'Mastered',
      'vocab.forgot': 'Forgot',
      'speaking.record': 'Click to record',
      'speaking.submit': 'Submit for scoring',
      'speaking.score': 'Score'
    },
    ja: {
      'nav.home': 'ホーム',
      'nav.courses': 'コース',
      'nav.vocabulary': '単語',
      'nav.speaking': 'スピーキング',
      'nav.community': 'コミュニティ',
      'nav.profile': 'プロフィール',
      'home.welcome': 'おかえりなさい',
      'home.todayGoal': '今日の目標',
      'home.continue': '学習を続ける',
      'course.beginner': '初級',
      'course.intermediate': '中級',
      'course.advanced': '上級',
      'vocab.flip': 'カードをクリックして意味を確認',
      'vocab.mastered': '覚えた',
      'vocab.forgot': '忘れた',
      'speaking.record': 'クリックして録音',
      'speaking.submit': 'スコア提出',
      'speaking.score': 'スコア'
    },
    ko: {
      'nav.home': '홈',
      'nav.courses': '코스',
      'nav.vocabulary': '단어',
      'nav.speaking': '스피킹',
      'nav.community': '커뮤니티',
      'nav.profile': '프로필',
      'home.welcome': '어서 오세요',
      'home.todayGoal': '오늘의 목표',
      'home.continue': '학습 계속',
      'course.beginner': '초급',
      'course.intermediate': '중급',
      'course.advanced': '고급',
      'vocab.flip': '카드 클릭하여 의미 확인',
      'vocab.mastered': '외웠다',
      'vocab.forgot': '잊었다',
      'speaking.record': '클릭하여 녹음',
      'speaking.submit': '점수 제출',
      'speaking.score': '점수'
    }
  }

  return translations[lang] || translations.zh
}
