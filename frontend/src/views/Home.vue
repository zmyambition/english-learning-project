<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { searchWord, addWordToNotebook } from '../api/index'
import Notebook from './Notebook.vue'
import WordLearn from './WordLearn.vue'
import Test from './Test.vue'
import ArticleList from './ArticleList.vue'
import Blog from './Blog.vue'
const router = useRouter()

// --- 状态数据 ---
const user = ref({})
const searchQuery = ref('')
const showUserMenu = ref(false)
const activeTab = ref('home') 

// 搜索相关的状态
const searchResult = ref(null)
const isSearching = ref(false)

// --- 生命周期 ---
onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
  } else {
    router.push('/')
  }
})

// --- 交互逻辑 ---
const handleSearch = async () => {
  const word = searchQuery.value.trim()
  if (!word) return

  isSearching.value = true
  searchResult.value = null 

  try {
    const res = await searchWord(word)
    if (res.status === 200) {
      searchResult.value = res.data
    }
  } catch (error) {
    console.error(error)
    alert('搜索失败，请检查网络或后台服务')
  } finally {
    isSearching.value = false
  }
}

const closeResult = () => {
  searchResult.value = null
  searchQuery.value = ''
}

const handleAddNotebook = async () => {
  if (!user.value.id) return alert('请先登录')
  if (!searchResult.value) return

  try {
    const res = await addWordToNotebook({
      userId: user.value.id,
      word: searchResult.value.src,
      translation: searchResult.value.dst
    })
    
    if (res.status === 200) {
      alert('✅ ' + res.data.message)
    }
  } catch (error) {
    if (error.response && error.response.status === 409) {
      alert('💡 ' + error.response.data.message)
    } else {
      alert('❌ 收藏失败，请稍后再试')
    }
  }
}

const handleLogout = () => {
  if(confirm('确定要退出登录吗？')) {
    localStorage.removeItem('user')
    router.push('/')
  }
}

const switchAccount = () => {
  localStorage.removeItem('user')
  router.push('/')
}
</script>

<template>
  <div class="home-container">
    <div class="bg-animation"></div>

    <!-- 顶部搜索区域 -->
    <header class="top-search-bar">
      <div class="logo-area">
        <span class="logo-icon">🎓</span>
        <span class="logo-text">English Master</span>
      </div>
      
      <div class="search-wrapper">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search for a word..." 
            @keyup.enter="handleSearch"
          />
          <button @click="handleSearch" class="search-btn">
            {{ isSearching ? '⏳' : '🔍' }}
          </button>
        </div>

        <!-- 搜索结果悬浮卡片 -->
        <transition name="slide-fade">
          <div class="result-card" v-if="searchResult">
            <div class="card-header">
              <span class="word-title">{{ searchResult.src }}</span>
              <button class="close-btn" @click="closeResult">×</button>
            </div>
            
            <div class="card-body">
              <div class="translation">
                <span class="label">中文释义：</span>
                <p>{{ searchResult.dst }}</p>
              </div>
            </div>

            <div class="card-footer">
              <button class="add-notebook-btn" @click="handleAddNotebook">
                ⭐ 加入生词本
              </button>
            </div>
          </div>
        </transition>
      </div>
    </header>

    <!-- 导航栏 -->
    <nav class="nav-bar">
      <div class="nav-links">
        <!-- 注意：点击这些链接会改变 activeTab 的值 -->
        <a :class="{ active: activeTab === 'learn' }" @click="activeTab = 'learn'">📖 单词学习</a>
        <a :class="{ active: activeTab === 'notebook' }" @click="activeTab = 'notebook'">⭐ 生词本</a>
        <a :class="{ active: activeTab === 'test' }" @click="activeTab = 'test'">📝 单词测试</a>
        <a :class="{ active: activeTab === 'article' }" @click="activeTab = 'article'">📰 文章阅读</a>
        <a :class="{ active: activeTab === 'blog' }" @click="activeTab = 'blog'">✍️ 博客分享</a>
      </div>

      <div class="user-profile" @mouseenter="showUserMenu = true" @mouseleave="showUserMenu = false">
        <div class="avatar">{{ user.username ? user.username.charAt(0).toUpperCase() : 'U' }}</div>
        <span class="username">{{ user.username }}</span>
        <div class="dropdown-menu" v-if="showUserMenu">
          <div class="menu-item" @click="switchAccount">🔄 切换账号</div>
          <div class="menu-item logout" @click="handleLogout">🚪 退出登录</div>
        </div>
      </div>
    </nav>

    <!-- 主内容区域：根据 activeTab 决定显示什么 -->
    <main class="content-area">
      
      <!-- 1. 首页欢迎 (activeTab 为 home 时显示) -->
      <div class="welcome-card" v-if="activeTab === 'home' && !searchResult">
        <h1>Hello, {{ user.username }}! 👋</h1>
        <p>准备好开始今天的英语学习了吗？</p>
      </div>

      <!-- 2. 生词本 (activeTab 为 notebook 时显示) -->
      <Notebook v-if="activeTab === 'notebook'" :user="user" />
      <WordLearn v-if="activeTab === 'learn'" :user="user" />
      <Test v-if="activeTab === 'test'" :user="user" />
      <ArticleList v-if="activeTab === 'article'" />
      <Blog v-if="activeTab === 'blog'" :user="user" />
      <!-- 后续其他功能位置... -->

    </main>
  </div>
</template>

<style scoped>
.home-container { position: relative; width: 100%; height: 100%; overflow: hidden; display: flex; flex-direction: column; }
.bg-animation { position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: linear-gradient(-45deg, #ff9a9e, #a18cd1, #8fd3f4, #84fab0, #fccb90); background-size: 400% 400%; animation: gradientMove 15s ease infinite; z-index: -1; }
@keyframes gradientMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
.top-search-bar { height: 80px; display: flex; align-items: center; justify-content: space-between; padding: 0 40px; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255, 255, 255, 0.3); z-index: 100; }
.logo-area { font-size: 24px; font-weight: 800; color: #2c3e50; display: flex; align-items: center; gap: 10px; width: 250px; }
.search-wrapper { position: relative; flex: 1; max-width: 600px; margin: 0 40px; }
.search-box { display: flex; position: relative; }
.search-box input { width: 100%; padding: 12px 20px; padding-right: 50px; border-radius: 30px; border: 2px solid rgba(255, 255, 255, 0.5); background: rgba(255, 255, 255, 0.6); font-size: 16px; outline: none; transition: all 0.3s; }
.search-box input:focus { background: #fff; border-color: #a18cd1; box-shadow: 0 0 15px rgba(161, 140, 209, 0.3); }
.search-btn { position: absolute; right: 5px; top: 3px; background: none; border: none; font-size: 20px; cursor: pointer; padding: 8px; transition: transform 0.2s; }
.search-btn:hover { transform: scale(1.1); }
.result-card { position: absolute; top: 60px; left: 0; right: 0; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); padding: 20px; z-index: 101; border: 1px solid rgba(255,255,255,0.8); }
.card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px; }
.word-title { font-size: 24px; font-weight: bold; color: #2c3e50; }
.close-btn { background: none; border: none; font-size: 24px; color: #999; cursor: pointer; }
.card-body .translation { font-size: 16px; color: #4a5568; }
.card-body .label { font-weight: bold; color: #a18cd1; font-size: 14px; }
.card-footer { margin-top: 20px; text-align: right; }
.add-notebook-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer; font-size: 14px; transition: transform 0.2s; }
.add-notebook-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(118, 75, 162, 0.3); }
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-10px); opacity: 0; }
.nav-bar { height: 60px; display: flex; align-items: center; justify-content: space-between; padding: 0 40px; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255, 255, 255, 0.2); z-index: 9; }
.nav-links { display: flex; gap: 30px; }
.nav-links a { color: #4a5568; font-weight: 600; cursor: pointer; padding: 8px 16px; border-radius: 8px; transition: all 0.3s; text-decoration: none; }
.nav-links a:hover, .nav-links a.active { background: rgba(255, 255, 255, 0.5); color: #6b4c9a; transform: translateY(-2px); }
.user-profile { display: flex; align-items: center; gap: 10px; cursor: pointer; position: relative; padding: 5px 10px; border-radius: 20px; transition: background 0.3s; }
.user-profile:hover { background: rgba(255, 255, 255, 0.3); }
.avatar { width: 35px; height: 35px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.username { font-weight: 600; color: #2d3748; }
.dropdown-menu { position: absolute; top: 100%; right: 0; margin-top: 10px; width: 150px; background: rgba(255, 255, 255, 0.95); border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); overflow: visible; animation: fadeIn 0.2s ease; }
.dropdown-menu::before {content: '';position: absolute;top: -15px;left: 0;width: 100%;height: 20px;background: transparent;}
@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
.menu-item { padding: 12px 15px; color: #4a5568; font-size: 14px; transition: background 0.2s; }
.menu-item:hover { background: #f7fafc; color: #667eea; }
.menu-item.logout { color: #e53e3e; border-top: 1px solid #eee; }
.menu-item.logout:hover { background: #fff5f5; }
.content-area { flex: 1; padding: 40px; overflow-y: auto; display: flex; justify-content: center; align-items: flex-start; }
.welcome-card { margin-top: 50px; background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(20px); padding: 40px 60px; border-radius: 25px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid rgba(255,255,255,0.5); width: 600px; }
.welcome-card h1 { color: #2c3e50; margin-bottom: 10px; }
@media (max-width: 768px) {
  .top-search-bar {
    padding: 10px 15px;
    height: auto;
    flex-direction: column;
    gap: 10px;
  }
  .logo-area {
    width: 100%;
    justify-content: center;
    font-size: 20px;
  }
  .search-wrapper {
    margin: 0;
    width: 100%;
  }
  .nav-bar {
    padding: 0 10px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    justify-content: flex-start;
  }
  .nav-bar::-webkit-scrollbar {
    display: none; 
  }
  .nav-links {
    gap: 10px;
    padding-right: 20px;
  }
  .nav-links a {
    white-space: nowrap;
    font-size: 14px;
    padding: 6px 12px;
  }
  .user-profile {
    position: absolute;
    top: 15px;
    right: 15px;
  }
  .user-profile .username {
    display: none;
  }
  .content-area {
    padding: 15px;
  }
  .welcome-card {
    width: 100%;
    padding: 20px;
  }
}
</style>