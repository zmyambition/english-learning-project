import axios from 'axios';

const api = axios.create({
    baseURL: 'https://english-learning-backend-six.vercel.app/api',
    timeout: 10000
});

export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const searchWord = (word) => api.get('/word/search', { params: { word } });
export const addWordToNotebook = (data) => api.post('/word/notebook', data);
export const getNotebookList = (userId) => api.get('/word/notebook', { params: { userId } });
export const deleteNotebookWord = (id) => api.delete('/word/notebook', { data: { id } });
export const getWordLibrary = (category) => api.get('/word/library', { params: { category } });
export const getTestWords = (source, userId) => api.get('/word/test-generate', { params: { source, userId } });
export const getArticleList = () => api.get('/article/list');
export const getArticleDetail = (id) => api.get('/article/detail', { params: { id } });
export const getBlogList = () => api.get('/blog/list');
export const createBlog = (data) => api.post('/blog/create', data);
export const deleteBlog = (blogId, userId) => api.delete('/blog/delete', { data: { blogId, userId } });
export const createComment = (data) => api.post('/blog/comment', data);
export const deleteComment = (commentId, userId) => api.delete('/blog/comment', { data: { commentId, userId } });
export default api;