import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import ja from 'element-plus/dist/locale/ja.mjs'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './assets/styles/index.scss'

const app = createApp(App)
const pinia = createPinia()

// 动态导入语言包
const locales = { 'zh-cn': zhCn, en, ja }

app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: locales['zh-cn'] // 默认中文
})

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误:', err)
  console.error('错误信息:', info)
}

app.mount('#app')
