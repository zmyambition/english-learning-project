<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { registerUser, loginUser } from '../api/index'

const router = useRouter()
const isLoginMode = ref(true)

const formData = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  formData.value.password = ''
  formData.value.confirmPassword = ''
}

// --- 核心提交逻辑 ---
const handleSubmit = async () => {
  const { username, password, confirmPassword } = formData.value

  // 1. 基础校验
  if (!username || !password) return alert('请输入完整的账号信息')
  if (!isLoginMode.value && password !== confirmPassword) return alert('两次输入的密码不一致！')

  try {
    if (isLoginMode.value) {
      // --- 登录 ---
      const res = await loginUser({ username, password })
      if (res.status === 200) {
        console.log('登录成功，用户信息:', res.data)
        
        // 把用户信息存到本地，方便以后用
        localStorage.setItem('user', JSON.stringify(res.data.user))
        
        alert('登录成功！欢迎回来')
        router.push('/home') // 跳转主页
      }
    } else {
      // --- 注册 ---
      const res = await registerUser({ username, password })
      if (res.status === 201) {
        alert('注册成功！请直接登录')
        toggleMode() // 切回登录模式
      }
    }
  } catch (error) {
    // 处理错误 (比如用户名已存在，或者密码错误)
    console.error(error)
    const msg = error.response?.data?.message || '请求失败，请检查网络'
    alert(msg)
  }
}

const titleText = computed(() => isLoginMode.value ? 'Welcome Back' : 'Create Account')
const btnText = computed(() => isLoginMode.value ? '登 录' : '注 册')
</script>

<template>
  <div class="container">
    <!-- 动态呼吸背景：颜色更多元 -->
    <div class="bg-animation"></div>

    <!-- 磨砂玻璃卡片 -->
    <div class="glass-box">
      <h2 class="title">{{ titleText }}</h2>
      <p class="subtitle">英语学习实训平台</p>

      <div class="form-content">
        <div class="input-group">
          <input type="text" placeholder="用户名" v-model="formData.username" />
        </div>
        <div class="input-group">
          <input type="password" placeholder="密码" v-model="formData.password" />
        </div>
        <div class="input-group" v-if="!isLoginMode">
          <input type="password" placeholder="确认密码" v-model="formData.confirmPassword" />
        </div>

        <button class="submit-btn" @click="handleSubmit">{{ btnText }}</button>

        <div class="toggle-link">
          <span v-if="isLoginMode">还没有账号？ <a href="#" @click.prevent="toggleMode">去注册</a></span>
          <span v-else>已有账号？ <a href="#" @click.prevent="toggleMode">去登录</a></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 1. 容器设置 */
.container {
  position: relative;
  width: 100%;
  height: 100%; /* 配合全局样式，彻底占满 */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 2. 多元炫彩呼吸背景 */
.bg-animation {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  /* 
     新配色方案：
     #ff9a9e (暖粉) -> #fad0c4 (柔肤) -> #a18cd1 (梦幻紫) -> 
     #fbc2eb (亮粉) -> #8fd3f4 (天空蓝) -> #84fab0 (清新绿)
  */
  background: linear-gradient(-45deg, 
    #ff9a9e, 
    #a18cd1, 
    #8fd3f4, 
    #84fab0, 
    #fccb90
  );
  background-size: 400% 400%;
  animation: gradientMove 12s ease infinite;
  z-index: -1;
}

@keyframes gradientMove {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 3. 磨砂玻璃盒子 */
.glass-box {
  width: 380px;
  padding: 40px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
  text-align: center;
  transition: all 0.3s ease;
}

.title {
  color: #2c3e50;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 5px;
}

.subtitle {
  color: #4a5568;
  font-size: 14px;
  margin-bottom: 35px;
  opacity: 0.8;
}

/* 4. 输入框 */
.input-group {
  margin-bottom: 20px;
}
.input-group input {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.5);
  color: #333;
  font-size: 15px;
  outline: none;
  transition: all 0.3s;
  box-sizing: border-box;
}
.input-group input::placeholder { color: #666; }
.input-group input:focus {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 3px rgba(161, 140, 209, 0.3);
}

/* 5. 按钮 */
.submit-btn {
  width: 100%;
  padding: 15px;
  margin-top: 10px;
  border: none;
  border-radius: 10px;
  /* 按钮使用紫色到蓝色的渐变 */
  background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(161, 140, 209, 0.5);
}

.toggle-link {
  margin-top: 25px;
  font-size: 14px;
  color: #4a5568;
}
.toggle-link a {
  color: #6b4c9a;
  text-decoration: none;
  font-weight: bold;
  margin-left: 5px;
}
</style>