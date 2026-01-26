import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import gameComponents from './gameComponents'
import { migrateSettings, checkAndClearExpiredData } from './utils/storageUtils'

// 应用启动时执行迁移和清理
migrateSettings()
checkAndClearExpiredData()

const app = createApp(App)

// 全局注册 TinyVue 组件（使用 game-xxx 前缀）
app.use(gameComponents)

app.use(router).mount('#app')
