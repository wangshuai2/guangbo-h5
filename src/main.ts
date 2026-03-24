import { createApp } from 'vue'
import App from './App.vue'
import { setupRouter } from './router'
import { setupStore } from './stores'
import '@/styles/index.scss'

// 引入 Vant 样式
import 'vant/lib/index.css'

// 开发环境引入 Mock
if (import.meta.env.DEV) {
  import('@/mock')
}

const app = createApp(App)

// 注册插件
setupStore(app)
setupRouter(app)

app.mount('#app')