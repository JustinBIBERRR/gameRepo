import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import gameComponents from './gameComponents'
import i18n from './locales'
import {
  runVersionUpdateDataCleanup,
  migrateSettings,
  checkAndClearExpiredData
} from './utils/storageUtils'

// 部署后热更新：仅清理游玩数据与记录，保留设置与用户上传（视频/图片/听歌、gameSettings 等）
runVersionUpdateDataCleanup(typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0')
migrateSettings()
checkAndClearExpiredData()

const app = createApp(App)

app.use(i18n)
app.use(gameComponents)
app.use(router).mount('#app')
