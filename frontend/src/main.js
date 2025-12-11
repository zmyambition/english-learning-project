import { createApp } from 'vue'
import './style.css' // 保持默认样式引用
import App from './App.vue'
import router from './router' // 引入路由

const app = createApp(App)
app.use(router) // 挂载路由
app.mount('#app')