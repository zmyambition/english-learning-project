<script setup>
import { ref, onMounted } from 'vue'
import { getBlogList, createBlog, deleteBlog, createComment, deleteComment } from '../api/index'

const props = defineProps(['user'])

const list = ref([])
const newBlogContent = ref('')
const loading = ref(false)

const commentInputs = ref({}) 

// --- 获取数据 ---
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getBlogList()
    list.value = res.data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// --- 发布博客 ---
const handlePost = async () => {
  if (!props.user.id) return alert('请先登录')
  if (!newBlogContent.value.trim()) return alert('写点什么吧...')

  try {
    await createBlog({
      userId: props.user.id,
      content: newBlogContent.value
    })
    newBlogContent.value = '' // 清空输入框
    fetchData() // 刷新列表
  } catch (error) {
    alert('发布失败')
  }
}

// --- 删除博客 ---
const handleDeleteBlog = async (blogId) => {
  if (!confirm('确定要删除这条动态吗？')) return
  try {
    await deleteBlog(blogId, props.user.id)
    fetchData()
  } catch (error) {
    alert('删除失败')
  }
}

// --- 发布评论 ---
const handleComment = async (blogId) => {
  if (!props.user.id) return alert('请先登录')
  const content = commentInputs.value[blogId]
  if (!content || !content.trim()) return

  try {
    await createComment({
      blogId,
      userId: props.user.id,
      content
    })
    commentInputs.value[blogId] = '' // 清空该输入框
    fetchData() // 刷新
  } catch (error) {
    alert('评论失败')
  }
}

// --- 删除评论 ---
const handleDeleteComment = async (commentId) => {
  if (!confirm('确定删除这条评论？')) return
  try {
    await deleteComment(commentId, props.user.id)
    fetchData()
  } catch (error) {
    alert('删除失败')
  }
}

// 辅助：获取头像首字母
const getAvatar = (name) => name ? name.charAt(0).toUpperCase() : 'U'

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="blog-container">
    
    <!-- 1. 顶部发布区 -->
    <div class="post-box">
      <textarea 
        v-model="newBlogContent" 
        placeholder="分享你的学习心得..."
        rows="3"
      ></textarea>
      <div class="post-actions">
        <button class="post-btn" @click="handlePost">发 布</button>
      </div>
    </div>

    <!-- 2. 动态列表 -->
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else class="feed-list">
      <div v-for="blog in list" :key="blog.id" class="feed-item">
        
        <!-- 动态头部：头像+名字 -->
        <div class="feed-header">
          <div class="avatar">{{ getAvatar(blog.username) }}</div>
          <div class="user-info">
            <span class="name">{{ blog.username }}</span>
            <span class="time">{{ new Date(blog.created_at).toLocaleString() }}</span>
          </div>
          <!-- 🗑️ 删除博客按钮：只有自己能看 -->
          <button 
            v-if="user.id === blog.user_id" 
            class="delete-btn"
            @click="handleDeleteBlog(blog.id)"
          >删除</button>
        </div>

        <!-- 动态内容 -->
        <div class="feed-content">
          {{ blog.content }}
        </div>

        <!-- 评论区 (气泡风格) -->
        <div class="comments-section">
          <!-- 评论列表 -->
          <div 
            v-for="comment in blog.comments" 
            :key="comment.id" 
            class="comment-row"
          >
            <span class="c-user">{{ comment.username }}:</span>
            <span class="c-content">{{ comment.content }}</span>
            
            <!-- 🗑️ 删除评论按钮：只有自己能看 -->
            <span 
              v-if="user.id === comment.user_id" 
              class="c-delete"
              @click="handleDeleteComment(comment.id)"
            >×</span>
          </div>

          <!-- 发评论输入框 -->
          <div class="comment-input-row">
            <input 
              type="text" 
              v-model="commentInputs[blog.id]" 
              placeholder="评论一句..."
              @keyup.enter="handleComment(blog.id)"
            />
            <button @click="handleComment(blog.id)">发送</button>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
.blog-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 50px;
}

/* --- 发布区样式 --- */
.post-box {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  margin-bottom: 30px;
}
.post-box textarea {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 15px;
  font-size: 16px;
  resize: none;
  outline: none;
  box-sizing: border-box;
}
.post-box textarea:focus { border-color: #667eea; }
.post-actions { text-align: right; margin-top: 10px; }
.post-btn {
  background: #667eea; color: white; border: none; padding: 8px 25px;
  border-radius: 20px; cursor: pointer; font-weight: bold;
}
.post-btn:hover { background: #5a67d8; }

/* --- 动态流样式 --- */
.feed-item {
  background: white;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
  border: 1px solid rgba(255,255,255,0.5);
}

.feed-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
  color: white; display: flex; align-items: center; justify-content: center;
  font-weight: bold; margin-right: 15px;
}

.user-info { flex: 1; display: flex; flex-direction: column; }
.name { font-weight: bold; color: #2d3748; }
.time { font-size: 12px; color: #a0aec0; margin-top: 2px; }

.delete-btn {
  color: #e53e3e; background: none; border: none; cursor: pointer; font-size: 13px;
}
.delete-btn:hover { text-decoration: underline; }

.feed-content {
  font-size: 16px; color: #4a5568; line-height: 1.6; margin-bottom: 20px;
  white-space: pre-wrap;
}

/* --- 评论区样式 --- */
.comments-section {
  background: #f7fafc;
  padding: 15px;
  border-radius: 10px;
}

.comment-row {
  font-size: 14px;
  margin-bottom: 8px;
  display: flex;
  align-items: flex-start;
}
.c-user { font-weight: bold; color: #667eea; margin-right: 5px; }
.c-content { color: #4a5568; flex: 1; }
.c-delete {
  color: #cbd5e0; cursor: pointer; margin-left: 10px; font-weight: bold;
}
.c-delete:hover { color: #e53e3e; }

.comment-input-row {
  display: flex; margin-top: 10px;
}
.comment-input-row input {
  flex: 1; border: 1px solid #e2e8f0; border-radius: 5px; padding: 8px; font-size: 13px; outline: none;
}
.comment-input-row button {
  margin-left: 10px; background: none; border: none; color: #667eea; cursor: pointer; font-weight: bold;
}
</style>