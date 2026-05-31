import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import App from './App.vue'
import router from './router'
import './styles/index.css'
import './styles/element-plus.css'
import 'element-plus/dist/index.css'
import { useUserStore } from './stores/user'

const app = createApp(App)
const pinia = createPinia()

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)

const userStore = useUserStore()
userStore.loadStoredUser()

app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
  size: 'default'
})

app.mount('#app')
