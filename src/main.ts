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

// 注册全局组件（目前为空，未来可扩展）
app.use(gameComponents)

app.use(router).mount('#app')
