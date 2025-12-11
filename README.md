# 🎓 English Master - 全栈英语学习平台

> 一个基于 **Vue.js 3** + **Node.js (Express)** + **MySQL** 的前后端分离全栈实训项目。
> 旨在打造一个集单词查询、沉浸式学习、在线测试、文章阅读及社区互动于一体的现代化英语学习平台。


## 📱 在线演示 (Live Demo)

- **前端访问地址**: [https://english-learning-frontend-seven.vercel.app/]
- **后端 API 地址**: [https://english-learning-backend-six.vercel.app/]
- **测试账号**: `admin` / `123456` (或自行注册新账号)

---

## ✨ 核心功能 (Features)

### 1. 🎨 用户体验 & UI
- **极致美学**: 采用 Glassmorphism (磨砂玻璃拟态) 设计风格，清新呼吸渐变背景。
- **移动端适配**: 响应式布局设计，完美支持 PC 端与手机端访问 (CSS Media Queries)。
- **安全鉴权**: 完整的注册/登录流程，基于数据库的用户验证。

### 2. 🧠 单词学习系统
- **实时查词**: 集成 **百度翻译 API**，支持中英互译。
- **生词本**: 一键收藏陌生单词，支持查看列表及移除已掌握单词。
- **沉浸式词库**: 
    - 内置 **CET-4 / CET-6 / 考研** 三大核心词库。
    - Flashcard 卡片式学习模式。
    - 支持键盘左右键切换单词。
    - 支持输入页码快速跳转进度。
    - **数据导入**: 包含自动化脚本 (`import-data.js`) 用于批量导入 JSON/TXT 词库数据。

### 3. 📝 在线测试系统
- **多源出题**: 支持从“内置词库”或“个人生词本”中生成考题。
- **智能组卷**: 随机抽取题目 + 自动生成 3 个干扰选项。
- **实时反馈**: 答题后即时显示正确/错误状态，并在结束后生成分数报告。

### 4. 📰 阅读与社区
- **文章阅读**: 瀑布流文章列表 + 沉浸式阅读详情页。
- **博客动态**: 类似“朋友圈”的社区功能，支持发布动态。
- **互动评论**: 支持对博客进行评论，并包含权限控制（仅作者可删除自己的动态/评论）。

---

## 🛠️ 技术栈 (Tech Stack)

### 前端 (Frontend)
- **核心框架**: Vue 3 (Composition API, `<script setup>`)
- **构建工具**: Vite
- **路由管理**: Vue Router 4
- **HTTP 请求**: Axios
- **样式处理**: CSS3 (Flexbox, Grid, Animations, Responsive Design)

### 后端 (Backend)
- **运行环境**: Node.js
- **Web 框架**: Express
- **数据库驱动**: mysql2
- **工具库**: md5 (API 签名), cors (跨域处理)
- **部署适配**: 针对 Vercel Serverless 环境进行了适配

### 数据库 & 部署 (Infra)
- **数据库**: TiDB Cloud (Serverless MySQL)
- **托管平台**: Vercel (同时托管前端静态页面与后端 Serverless API)

---

## 📂 项目目录结构

```text
english-learning-project/
├── backend/                  # 后端工程
│   ├── config/
│   │   └── db.js             # 数据库连接配置 (SSL连接)
│   ├── controllers/          # 业务逻辑层 (Auth, Word, Article, Blog)
│   ├── routes/               # 路由层
│   ├── app.js                # 后端入口 (适配 Vercel)
│   ├── vercel.json           # 后端部署配置
│   └── import-data.js        # 词库导入工具脚本
│
├── frontend/                 # 前端工程
│   ├── public/
│   │   └── covers/           # 文章封面图片资源
│   ├── src/
│   │   ├── api/              # Axios 接口封装
│   │   ├── views/            # 页面组件
│   │   │   ├── Login.vue     # 登录注册页
│   │   │   ├── Home.vue      # 主页框架
│   │   │   ├── WordLearn.vue # 单词学习
│   │   │   ├── Notebook.vue  # 生词本
│   │   │   ├── Test.vue      # 单词测试
│   │   │   ├── ArticleList.vue # 文章列表
│   │   │   └── Blog.vue      # 博客社区
│   │   ├── App.vue
│   │   └── main.js
│   └── vite.config.js
└── README.md



🚀 本地运行指南 (Run Locally)
1. 克隆项目
git clone https://github.com/your-username/english-learning-app.git
cd english-learning-app

2. 数据库准备
请在您的 MySQL 或 TiDB 数据库中运行以下 SQL 语句以创建表结构：
-- 用户表
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- 单词表
CREATE TABLE `words` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `word` varchar(100) NOT NULL,
  `phonetic` varchar(100),
  `definition` text,
  `category` varchar(20),
  PRIMARY KEY (`id`)
);

-- 生词本
CREATE TABLE `notebook` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `word` varchar(100) NOT NULL,
  `translation` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_word` (`user_id`, `word`)
);

-- 文章表
CREATE TABLE `articles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `summary` varchar(500),
  `content` longtext,
  `cover` varchar(500),
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- 博客表
CREATE TABLE `blogs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- 评论表
CREATE TABLE `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `blog_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

3. 配置与启动后端
code
Bash
cd backend
npm install

# 配置数据库信息
# 请在 config/db.js 中填入您的 MySQL 连接信息

# 启动后端
npm run dev
# 后端运行在 http://localhost:3000

4. 启动前端
code
Bash
cd frontend
npm install

# 确保 src/api/index.js 中的 baseURL 指向您的本地后端 (http://localhost:3000/api)

# 启动前端
npm run dev
# 前端运行在 http://localhost:5173