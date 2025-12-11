<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getWordLibrary, addWordToNotebook } from '../api/index'

const props = defineProps(['user'])

// --- 状态管理 ---
const mode = ref('selection') 
const currentCategory = ref('')
const wordList = ref([]) 
const currentIndex = ref(0) 
const loading = ref(false)

// 新增：跳转页码的输入值
const jumpInput = ref('')

// --- 计算属性 ---
const currentWord = computed(() => {
  if (wordList.value.length === 0) return null
  return wordList.value[currentIndex.value]
})

const progress = computed(() => {
  if (wordList.value.length === 0) return 0
  return ((currentIndex.value + 1) / wordList.value.length) * 100
})

// --- 核心逻辑 ---

const selectCategory = async (cat) => {
  currentCategory.value = cat
  loading.value = true
  mode.value = 'learning'
  
  try {
    const res = await getWordLibrary(cat)
    wordList.value = res.data
    currentIndex.value = 0 
    jumpInput.value = '' // 重置跳转框
  } catch (error) {
    alert('加载词库失败')
    mode.value = 'selection' 
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  mode.value = 'selection'
  wordList.value = []
}

const nextWord = () => {
  if (currentIndex.value < wordList.value.length - 1) {
    currentIndex.value++
  } else {
    alert('🎉 恭喜！你已经学完这本词书的所有单词了！')
  }
}

const prevWord = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

// 新增：处理页面跳转
const handleJump = () => {
  const page = parseInt(jumpInput.value)
  if (isNaN(page)) return

  // 验证输入范围
  if (page < 1) {
    currentIndex.value = 0
  } else if (page > wordList.value.length) {
    currentIndex.value = wordList.value.length - 1
  } else {
    currentIndex.value = page - 1
  }
  // 清空输入框
  jumpInput.value = ''
}

const handleCollect = async () => {
  if (!props.user.id) return alert('请先登录')
  if (!currentWord.value) return

  try {
    const res = await addWordToNotebook({
      userId: props.user.id,
      word: currentWord.value.word,
      translation: currentWord.value.definition
    })
    alert('✅ 收藏成功')
  } catch (error) {
    if (error.response?.status === 409) {
      alert('💡 已经在生词本里了')
    } else {
      alert('收藏失败')
    }
  }
}

const handleKeydown = (e) => {
  if (mode.value !== 'learning') return
  if (document.activeElement.tagName === 'INPUT') {
      if (e.key === 'Enter') handleJump()
      return
  }
  
  if (e.key === 'ArrowRight') nextWord()
  if (e.key === 'ArrowLeft') prevWord()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div class="learn-container">
    
    <!-- 🟢 模式一：分类选择页 -->
    <div v-if="mode === 'selection'" class="selection-view">
      <h2 class="section-title">请选择学习词库</h2>
      <div class="category-grid">
        <div class="cat-card cet4" @click="selectCategory('CET4')">
          <div class="icon">📘</div><h3>CET-4</h3><p>大学英语四级核心词汇</p>
        </div>
        <div class="cat-card cet6" @click="selectCategory('CET6')">
          <div class="icon">📙</div><h3>CET-6</h3><p>大学英语六级进阶词汇</p>
        </div>
        <div class="cat-card ky" @click="selectCategory('KY')">
          <div class="icon">📕</div><h3>考研英语</h3><p>研究生入学考试必备</p>
        </div>
      </div>
    </div>

    <!-- 🔵 模式二：沉浸学习页 -->
    <div v-else class="learning-view">
      <!-- 顶部栏：返回 + 进度条 + 跳转 -->
      <div class="learning-header">
        <button class="back-btn" @click="goBack">← 返回</button>
        
        <div class="progress-area">
          <div class="progress-info">
            <span class="page-num">{{ currentIndex + 1 }} / {{ wordList.length }}</span>
            <div class="jump-box">
              <input 
                type="number" 
                v-model="jumpInput" 
                placeholder="Go"
                class="jump-input"
              />
              <button class="jump-btn" @click="handleJump">➜</button>
            </div>
          </div>
          
          <div class="progress-bar">
            <div class="fill" :style="{ width: progress + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- 中间：大单词卡片 -->
      <div class="card-container">
        <div v-if="loading" class="loading-text">加载中...</div>
        
        <div v-else-if="currentWord" class="flash-card">
          <div class="card-content">
            <span class="tag">{{ currentWord.category }}</span>
            <h1 class="word">{{ currentWord.word }}</h1>
            <p class="phonetic">{{ currentWord.phonetic }}</p>
            <div class="divider"></div>
            <p class="definition">{{ currentWord.definition }}</p>
          </div>
        </div>
      </div>

      <!-- 底部：控制按钮 -->
      <div class="controls">
        <button class="nav-btn prev" @click="prevWord" :disabled="currentIndex === 0">
          ⬅️ 上一个
        </button>
        
        <button class="collect-circle" @click="handleCollect" title="加入生词本">⭐</button>
        
        <button class="nav-btn next" @click="nextWord">
          下一个 ➡️
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.learn-container { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.section-title { color: #2c3e50; margin-bottom: 40px; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.category-grid { display: flex; gap: 30px; }
.cat-card { width: 220px; height: 280px; background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(10px); border-radius: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; border: 1px solid rgba(255,255,255,0.5); box-shadow: 0 5px 15px rgba(0,0,0,0.05); text-align: center; padding: 20px; }
.cat-card:hover { transform: translateY(-10px); background: rgba(255, 255, 255, 0.9); box-shadow: 0 15px 30px rgba(0,0,0,0.15); }
.cat-card .icon { font-size: 50px; margin-bottom: 20px; }
.cat-card h3 { margin: 0; color: #2d3748; font-size: 24px; }
.cat-card p { color: #718096; font-size: 14px; margin-top: 10px; }
.cat-card.cet4:hover { border-color: #667eea; }
.cat-card.cet6:hover { border-color: #ed8936; }
.cat-card.ky:hover { border-color: #f56565; }

.learning-view { width: 100%; max-width: 600px; height: 100%; display: flex; flex-direction: column; padding: 20px 0; }
.learning-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.back-btn { background: rgba(255,255,255,0.5); border: none; padding: 8px 15px; border-radius: 20px; cursor: pointer; color: #4a5568; font-weight: bold; transition: background 0.2s; }
.back-btn:hover { background: #fff; }

.progress-area { flex: 1; margin-left: 20px; display: flex; flex-direction: column; gap: 5px; }
.progress-info { display: flex; justify-content: space-between; align-items: center; }
.page-num { font-size: 14px; color: #4a5568; font-weight: bold; }

.jump-box { display: flex; align-items: center; gap: 5px; background: rgba(255,255,255,0.5); padding: 2px 5px; border-radius: 15px; }
.jump-input { width: 50px; border: none; background: transparent; text-align: center; font-size: 14px; outline: none; color: #2c3e50; }

.jump-input::-webkit-outer-spin-button, .jump-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.jump-btn { background: none; border: none; cursor: pointer; color: #667eea; font-weight: bold; font-size: 14px; padding: 0 5px; }
.jump-btn:hover { color: #5a67d8; }

.progress-bar { width: 100%; height: 6px; background: rgba(0,0,0,0.1); border-radius: 3px; overflow: hidden; }
.fill { height: 100%; background: #667eea; transition: width 0.3s ease; }

.card-container { flex: 1; display: flex; justify-content: center; align-items: center; perspective: 1000px; }
.flash-card { width: 100%; height: 400px; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(20px); border-radius: 25px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; text-align: center; padding: 40px; border: 1px solid rgba(255,255,255,1); animation: slideUp 0.4s ease; }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.tag { background: #edf2f7; color: #718096; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
.word { font-size: 48px; color: #2d3748; margin: 20px 0 10px; letter-spacing: 1px; }
.phonetic { font-family: 'Times New Roman', serif; font-size: 20px; color: #718096; font-style: italic; margin-bottom: 30px; }
.divider { width: 50px; height: 3px; background: #cbd5e0; margin: 0 auto 30px; border-radius: 2px; }
.definition { font-size: 22px; color: #4a5568; line-height: 1.6; }
.controls { display: flex; justify-content: space-between; align-items: center; margin-top: 30px; }
.nav-btn { padding: 12px 25px; border: none; border-radius: 15px; background: rgba(255,255,255,0.6); font-size: 16px; font-weight: bold; color: #4a5568; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.nav-btn:hover:not(:disabled) { background: #fff; transform: translateY(-2px); box-shadow: 0 8px 15px rgba(0,0,0,0.1); }
.nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.collect-circle { width: 60px; height: 60px; border-radius: 50%; border: none; background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); color: white; font-size: 24px; cursor: pointer; box-shadow: 0 10px 20px rgba(253, 160, 133, 0.4); transition: transform 0.2s; display: flex; align-items: center; justify-content: center; }
.collect-circle:hover { transform: scale(1.1) rotate(15deg); }
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