import axios from 'axios';

// --- 1. 创建 Axios 实例 ---
// baseURL: 后端服务器地址。
// 本地开发时通常用 localhost，部署上线时换成 Vercel 的域名。
const api = axios.create({
    baseURL: 'https://english-learning-backend-six.vercel.app/api',
    timeout: 10000
});
// --- 2. API 接口定义 ---
// [用户模块]
// 注册新用户
export const registerUser = (data) => api.post('/auth/register', data);
// 用户登录
export const loginUser = (data) => api.post('/auth/login', data);
// [单词模块]
// 查单词 (调用百度翻译)
export const searchWord = (word) => api.get('/word/search', { params: { word } });
// 加入生词本
export const addWordToNotebook = (data) => api.post('/word/notebook', data);
// 获取生词本列表
export const getNotebookList = (userId) => api.get('/word/notebook', { params: { userId } });
// 从生词本删除
export const deleteNotebookWord = (id) => api.delete('/word/notebook', { data: { id } });
// 获取分级词库 (支持分页/跳转)
export const getWordLibrary = (category) => api.get('/word/library', { params: { category } });
// 生成测试题目
export const getTestWords = (source, userId) => api.get('/word/test-generate', { params: { source, userId } });
// [文章模块]
// 获取文章列表
export const getArticleList = () => api.get('/article/list');
// [文章模块]
// 获取文章列表
export const getArticleDetail = (id) => api.get('/article/detail', { params: { id } });
// [博客模块]
// 获取动态广场列表
export const getBlogList = () => api.get('/blog/list');
// 发布新动态
export const createBlog = (data) => api.post('/blog/create', data);
// 删除动态 (仅限作者)
export const deleteBlog = (blogId, userId) => api.delete('/blog/delete', { data: { blogId, userId } });
// 发表评论
export const createComment = (data) => api.post('/blog/comment', data);
// 删除评论
export const deleteComment = (commentId, userId) => api.delete('/blog/comment', { data: { commentId, userId } });
export default api;