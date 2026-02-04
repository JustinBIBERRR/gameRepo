import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import gameComponents from './gameComponents'
import i18n from './locales'
import { migrateSettings, checkAndClearExpiredData } from './utils/storageUtils'

// 应用启动时执行迁移和清理
migrateSettings()
checkAndClearExpiredData()

const app = createApp(App)

app.use(i18n)
app.use(gameComponents)
app.use(router).mount('#app')
