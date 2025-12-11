<script setup>
import { ref, computed } from 'vue'
import { getTestWords } from '../api/index'

const props = defineProps(['user'])

// --- 状态 ---
const step = ref('setup')
const loading = ref(false)

// 题目数据
const questions = ref([]) // 存放生成的题目
const currentIdx = ref(0)
const score = ref(0)
const userAnswers = ref([]) // 记录用户的答题情况，用于最后展示

// 当前题目
const currentQ = computed(() => questions.value[currentIdx.value])
const progress = computed(() => ((currentIdx.value + 1) / questions.value.length) * 100)

// --- 1. 生成试卷 ---
const startTest = async (source) => {
  if (source === 'notebook' && !props.user.id) return alert('请先登录')
  
  loading.value = true
  try {
    // 获取 20 个随机单词
    const res = await getTestWords(source, props.user.id)
    const rawWords = res.data
    
    // 生成 10 道题目 (或者更少，如果单词不够的话)
    const quizLength = Math.min(10, rawWords.length)
    const quizList = []

    for (let i = 0; i < quizLength; i++) {
      const correctWord = rawWords[i]
      
      // 生成干扰项：从剩下的单词里随机挑3个
      const others = rawWords.filter(w => w.id !== correctWord.id)
      // 洗牌算法打乱 others
      others.sort(() => Math.random() - 0.5)
      const distractors = others.slice(0, 3)
      
      // 组合选项 (1对 + 3错) 并再次打乱
      const options = [correctWord, ...distractors].sort(() => Math.random() - 0.5)
      
      quizList.push({
        word: correctWord.word,
        phonetic: correctWord.phonetic,
        correctDef: correctWord.definition || correctWord.translation,
        options: options.map(o => ({
          def: o.definition || o.translation,
          isCorrect: o.id === correctWord.id
        }))
      })
    }
    
    questions.value = quizList
    currentIdx.value = 0
    score.value = 0
    userAnswers.value = []
    step.value = 'playing'
    
  } catch (error) {
    console.error(error)
    if (error.response?.status === 400) {
      alert(error.response.data.message)
    } else {
      alert('生成题目失败，请检查网络')
    }
  } finally {
    loading.value = false
  }
}

// --- 2. 处理答题 ---
const handleAnswer = (isCorrect, optionText) => {
  // 记录答题结果
  userAnswers.value.push({
    word: currentQ.value.word,
    correctDef: currentQ.value.correctDef,
    userSelect: optionText,
    isCorrect: isCorrect
  })

  if (isCorrect) score.value += 10 // 每题10分

  setTimeout(() => {
    if (currentIdx.value < questions.value.length - 1) {
      currentIdx.value++
    } else {
      step.value = 'result' // 结束
    }
  }, 200)
}

// --- 3. 重置 ---
const reset = () => {
  step.value = 'setup'
  questions.value = []
}
</script>

<template>
  <div class="test-container">
    
    <!-- 🟢 阶段一：选择题源 -->
    <div v-if="step === 'setup'" class="setup-view">
      <h2 class="title">选择测试范围</h2>
      <p class="subtitle">随机抽取10道题，检验你的记忆</p>
      
      <div class="grid-box">
        <!-- 生词本入口 -->
        <div class="card notebook" @click="startTest('notebook')">
          <div class="icon">⭐</div>
          <h3>我的生词本</h3>
          <p>攻克难关</p>
        </div>
        <!-- 词库入口 -->
        <div class="card cet4" @click="startTest('CET4')">
          <div class="icon">📘</div>
          <h3>CET-4</h3>
          <p>四级词汇</p>
        </div>
        <div class="card cet6" @click="startTest('CET6')">
          <div class="icon">📙</div>
          <h3>CET-6</h3>
          <p>六级词汇</p>
        </div>
        <div class="card ky" @click="startTest('KY')">
          <div class="icon">📕</div>
          <h3>考研词汇</h3>
          <p>高阶挑战</p>
        </div>
      </div>
      
      <div v-if="loading" class="loading">正在出题中... 🎲</div>
    </div>

    <!-- 🔵 阶段二：答题中 -->
    <div v-if="step === 'playing'" class="playing-view">
      <!-- 进度条 -->
      <div class="progress-header">
        <span>Question {{ currentIdx + 1 }} / {{ questions.length }}</span>
        <div class="progress-bar">
          <div class="fill" :style="{ width: progress + '%' }"></div>
        </div>
      </div>

      <!-- 题目卡片 -->
      <div class="question-card">
        <h1 class="q-word">{{ currentQ.word }}</h1>
        <p class="q-phonetic" v-if="currentQ.phonetic">{{ currentQ.phonetic }}</p>

        <div class="options-grid">
          <button 
            v-for="(opt, idx) in currentQ.options" 
            :key="idx"
            class="option-btn"
            @click="handleAnswer(opt.isCorrect, opt.def)"
          >
            <span class="opt-label">{{ ['A', 'B', 'C', 'D'][idx] }}.</span>
            {{ opt.def }}
          </button>
        </div>
      </div>
    </div>

    <!-- 🟡 阶段三：结果结算 -->
    <div v-if="step === 'result'" class="result-view">
      <div class="score-circle">
        <span class="score-num">{{ score }}</span>
        <span class="score-label">分</span>
      </div>
      
      <h2 v-if="score === 100">🎉 太完美了！全对！</h2>
      <h2 v-else-if="score >= 60">👍 不错，继续加油！</h2>
      <h2 v-else>💪 需要再复习复习哦</h2>

      <div class="result-list">
        <h3>答题详情：</h3>
        <div 
          v-for="(item, index) in userAnswers" 
          :key="index" 
          class="result-item"
          :class="{ wrong: !item.isCorrect }"
        >
          <div class="item-left">
            <span class="r-word">{{ item.word }}</span>
            <span class="r-icon">{{ item.isCorrect ? '✅' : '❌' }}</span>
          </div>
          <div class="item-right" v-if="!item.isCorrect">
            <p>你的选择: {{ item.userSelect }}</p>
            <p class="correct-ans">正确答案: {{ item.correctDef }}</p>
          </div>
        </div>
      </div>

      <button class="restart-btn" @click="reset">再测一次 🔄</button>
    </div>

  </div>
</template>

<style scoped>
.test-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  min-height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* --- Setup --- */
.setup-view { text-align: center; width: 100%; }
.title { font-size: 32px; color: #2c3e50; margin-bottom: 10px; }
.subtitle { color: #718096; margin-bottom: 40px; }
.grid-box { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; }
.card {
  background: rgba(255,255,255,0.6); backdrop-filter: blur(10px); padding: 30px 20px;
  border-radius: 20px; cursor: pointer; transition: all 0.3s;
  border: 1px solid rgba(255,255,255,0.5);
}
.card:hover { transform: translateY(-5px); background: #fff; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
.card.notebook .icon { font-size: 40px; }
.card h3 { margin: 15px 0 5px; color: #2d3748; }
.card p { font-size: 13px; color: #a0aec0; }
.loading { margin-top: 30px; font-size: 18px; color: #667eea; font-weight: bold; }

/* --- Playing --- */
.playing-view { width: 100%; }
.progress-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px; color: #4a5568; font-weight: bold; }
.progress-bar { width: 200px; height: 8px; background: rgba(0,0,0,0.1); border-radius: 4px; overflow: hidden; }
.fill { height: 100%; background: #667eea; transition: width 0.3s; }

.question-card {
  background: rgba(255,255,255,0.9); padding: 40px; border-radius: 25px; text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}
.q-word { font-size: 40px; color: #2d3748; margin-bottom: 5px; }
.q-phonetic { font-family: 'Times New Roman', serif; color: #718096; font-style: italic; margin-bottom: 40px; }

.options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.option-btn {
  padding: 15px; border: 2px solid #e2e8f0; border-radius: 12px; background: #fff;
  color: #4a5568; font-size: 16px; cursor: pointer; text-align: left; transition: all 0.2s;
}
.option-btn:hover { border-color: #667eea; background: #ebf4ff; }
.opt-label { font-weight: bold; color: #667eea; margin-right: 10px; }

/* --- Result --- */
.result-view { width: 100%; text-align: center; background: rgba(255,255,255,0.8); padding: 40px; border-radius: 25px; }
.score-circle {
  width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
  color: #fff; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
  box-shadow: 0 10px 20px rgba(132, 250, 176, 0.4);
}
.score-num { font-size: 48px; font-weight: bold; }
.score-label { font-size: 16px; margin-top: 15px; margin-left: 5px; }

.result-list { margin-top: 30px; text-align: left; max-height: 300px; overflow-y: auto; }
.result-item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
.result-item.wrong .r-word { color: #e53e3e; font-weight: bold; }
.result-item.wrong .correct-ans { color: #38a169; font-size: 12px; margin-top: 2px; }
.item-right { text-align: right; font-size: 14px; color: #718096; }

.restart-btn {
  margin-top: 30px; padding: 12px 40px; border: none; border-radius: 30px;
  background: #667eea; color: #fff; font-size: 16px; font-weight: bold; cursor: pointer;
  transition: transform 0.2s;
}
.restart-btn:hover { transform: scale(1.05); background: #5a67d8; }
</style>