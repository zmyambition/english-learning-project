<script setup>
import { ref, onMounted } from 'vue'
import { getNotebookList, deleteNotebookWord } from '../api/index'

// 接收父组件传来的用户信息
const props = defineProps(['user'])

const list = ref([])
const loading = ref(true)

// 获取列表数据
const fetchData = async () => {
  if (!props.user.id) return
  loading.value = true
  try {
    const res = await getNotebookList(props.user.id)
    list.value = res.data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 删除单词
const handleDelete = async (id) => {
  if (!confirm('确定要移除这个单词吗？')) return
  
  try {
    await deleteNotebookWord(id)
    // 成功后，直接在前端数据中移除该单词
    list.value = list.value.filter(item => item.id !== id)
  } catch (error) {
    alert('删除失败')
  }
}

// 组件挂载时自动拉取数据
onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="notebook-wrapper">
    <!-- 标题区 -->
    <div class="header">
      <h2>⭐ 我的生词本</h2>
      <span class="count">共 {{ list.length }} 个单词</span>
    </div>

    <!-- 加载中状态 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 空状态 -->
    <div v-else-if="list.length === 0" class="empty">
      <p>生词本空空如也，快去搜索添加吧！🍂</p>
    </div>

    <!-- 单词卡片网格 -->
    <div v-else class="grid-container">
      <div v-for="item in list" :key="item.id" class="word-card">
        <div class="card-top">
          <h3>{{ item.word }}</h3>
          <button class="delete-btn" @click="handleDelete(item.id)">🗑️</button>
        </div>
        <div class="card-bottom">
          <p>{{ item.translation }}</p>
        </div>
        <div class="card-date">
          收藏于: {{ new Date(item.created_at).toLocaleDateString() }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notebook-wrapper {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: #2c3e50;
}

.count {
  background: rgba(255, 255, 255, 0.5);
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 14px;
  color: #667eea;
  font-weight: bold;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.word-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
}

.word-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  padding-bottom: 5px;
}

.card-top h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
  font-size: 16px;
}

.delete-btn:hover {
  opacity: 1;
}

.card-bottom {
  flex: 1;
  color: #4a5568;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 10px;
}

.card-date {
  font-size: 12px;
  color: #a0aec0;
  text-align: right;
}

.empty {
  text-align: center;
  padding: 50px;
  color: #4a5568;
  background: rgba(255,255,255,0.3);
  border-radius: 20px;
}
@media (max-width: 768px) {
  .grid-container, .word-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .word-card {
    padding: 10px;
  }
  .flash-card {
    height: 300px;
    padding: 20px;
  }
  .word {
    font-size: 32px;
  }
}
</style>