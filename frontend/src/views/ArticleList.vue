<script setup>
import { ref, onMounted } from 'vue'
import { getArticleList, getArticleDetail } from '../api/index'

// --- 状态 ---
const viewState = ref('list')
const list = ref([])
const currentArticle = ref(null) // 当前阅读的文章
const loading = ref(false)

// --- 获取列表 ---
const fetchList = async () => {
  loading.value = true
  try {
    const res = await getArticleList()
    list.value = res.data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// --- 查看详情 ---
const handleRead = async (id) => {
  loading.value = true
  try {
    const res = await getArticleDetail(id)
    currentArticle.value = res.data
    viewState.value = 'detail' // 切换视图
  } catch (error) {
    alert('文章加载失败')
  } finally {
    loading.value = false
  }
}

// --- 返回列表 ---
const goBack = () => {
  viewState.value = 'list'
  currentArticle.value = null
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div class="article-wrapper">
    
    <!-- 🟢 视图一：文章列表 -->
    <div v-if="viewState === 'list'" class="list-view">
      <h2 class="page-title">精选阅读</h2>
      
      <div v-if="loading" class="loading">加载中...</div>

      <div v-else class="card-grid">
        <div v-for="item in list" :key="item.id" class="article-card" @click="handleRead(item.id)">
          <!-- 封面图 -->
          <div class="card-cover" :style="{ backgroundImage: `url(${item.cover})` }"></div>
          
          <!-- 内容区 -->
          <div class="card-content">
            <h3 class="card-title">{{ item.title }}</h3>
            <p class="card-summary">{{ item.summary }}</p>
            <div class="card-meta">
              <span>📅 {{ new Date(item.created_at).toLocaleDateString() }}</span>
              <span class="read-more">Read More →</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 🔵 视图二：文章详情 -->
    <div v-else class="detail-view">
      <button class="back-btn" @click="goBack">← 返回列表</button>
      
      <div v-if="currentArticle" class="article-content">
        <!-- 顶部大图 -->
        <div class="detail-banner" v-if="currentArticle.cover" :style="{ backgroundImage: `url(${currentArticle.cover})` }"></div>
        
        <h1 class="detail-title">{{ currentArticle.title }}</h1>
        <div class="detail-meta">
          发布于 {{ new Date(currentArticle.created_at).toLocaleString() }}
        </div>
        
        <!-- 正文 (保留换行格式) -->
        <div class="detail-body">
          {{ currentArticle.content }}
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.article-wrapper {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding-bottom: 50px;
}

/* --- 列表页样式 --- */
.page-title {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 28px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.article-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(255,255,255,0.5);
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.1);
  background: #fff;
}

.card-cover {
  height: 180px;
  background-size: cover;
  background-position: center;
}

.card-content {
  padding: 20px;
}

.card-title {
  margin: 0 0 10px 0;
  font-size: 20px;
  color: #2c3e50;
}

.card-summary {
  font-size: 14px;
  color: #718096;
  line-height: 1.5;
  margin-bottom: 20px;
  /* 限制显示3行 */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #a0aec0;
  align-items: center;
}

.read-more {
  color: #667eea;
  font-weight: bold;
}

/* --- 详情页样式 --- */
.detail-view {
  background: rgba(255, 255, 255, 0.9);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.back-btn {
  border: none;
  background: none;
  font-size: 16px;
  color: #667eea;
  cursor: pointer;
  margin-bottom: 20px;
  font-weight: bold;
}

.detail-banner {
  width: 100%;
  height: 300px;
  background-size: cover;
  background-position: center;
  border-radius: 10px;
  margin-bottom: 30px;
}

.detail-title {
  font-size: 32px;
  color: #2d3748;
  margin-bottom: 10px;
  text-align: center;
}

.detail-meta {
  text-align: center;
  color: #a0aec0;
  font-size: 14px;
  margin-bottom: 40px;
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
}

.detail-body {
  font-size: 18px;
  line-height: 1.8;
  color: #4a5568;
  font-family: 'Georgia', serif;
  white-space: pre-wrap;
}

.loading { text-align: center; color: #fff; }
</style>