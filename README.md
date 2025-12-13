# 全栈英语学习平台

> **English Master** 是一个基于现代化技术栈构建的前后端分离全栈项目。旨在为英语学习者提供从“单词积累”到“实战阅读”再到“社区互动”的一站式解决方案。本项目采用 Serverless 架构思想，实现了轻量级、高可用的在线教育应用。

---

## 1. 项目简介

本项目采用 **B/S (Browser/Server)** 架构设计。前端使用 **Vue 3 + Vite** 构建响应式单页应用，后端基于 **Node.js + Express** 提供 RESTful API 服务，数据库采用 **MySQL (TiDB Cloud)** 进行云端存储。

项目解决了传统英语学习工具功能碎片化的问题，将查词、背诵、测试、阅读与社交整合在一个平台中，界面设计采用流行的 **Glassmorphism (磨砂玻璃)** 风格，提供极致的用户体验。

## 2. 项目在线地址

- **前端访问地址**: https://english-learning-frontend-seven.vercel.app/
- **测试账号**: `admin`
- **测试密码**: `123456`

---

## 3. 核心功能表

| 模块名称 | 功能点 | 详细描述 |
| :--- | :--- | :--- |
| **用户系统** | 注册/登录 | 完整的账号鉴权流程，包含防重复注册校验与登录状态持久化。 |
| **单词助手** | 实时查词 | 集成百度翻译 API，支持英汉实时互译。 |
| | 生词本 | 一键收藏陌生单词至云端数据库，支持列表查看与移除。 |
| **沉浸学习** | 分级词库 | 内置 CET-4、CET-6、考研英语三大核心词库 (数据清洗自 GitHub)。 |
| | Flashcard | 类似 Anki 的卡片式学习，支持键盘快捷键切换与页码跳转。 |
| **在线测试** | 智能组卷 | 算法随机从“词库”或“生词本”抽取题目，自动生成干扰选项。 |
| | 结果分析 | 实时判题，测试结束后生成分数报告与错题解析。 |
| **阅读阅览室** | 文章列表 | 瀑布流展示精选英语文章，包含封面与摘要。 |
| | 沉浸阅读 | 优化的排版设计，提供舒适的长文本阅读体验。 |
| **博客社区** | 动态发布 | 类似“朋友圈”的功能，用户可发布学习心得。 |
| | 互动评论 | 支持多用户评论互动，包含细粒度的删除权限控制（仅作者可删）。 |

---

## 4. 技术栈

### 前端 (Frontend)
- **核心框架**: Vue.js 3 (Composition API)
- **构建工具**: Vite 4
- **路由管理**: Vue Router 4
- **HTTP 请求**: Axios
- **UI 组件**: 自定义 CSS3 (Flexbox/Grid/Media Queries)
- **图标库**: Lucide-Vue-Next (矢量图标)

### 后端 (Backend)
- **运行环境**: Node.js
- **Web 框架**: Express.js
- **数据库驱动**: mysql2 (支持 Promise)
- **工具库**: md5 (API 签名加密), cors (跨域处理)
- **架构模式**: MVC (Model-View-Controller)

### 数据存储与部署 (Infra)
- **数据库**: TiDB Cloud Serverless (兼容 MySQL 8.0)
- **部署平台**: Vercel (前后端分离部署)

---

## 5. 项目结构

```text
english-learning-project/
├── backend/                  # 后端工程目录
│   ├── config/
│   │   └── db.js             # MySQL 数据库连接池配置
│   ├── controllers/          # 业务逻辑层 (Auth, Word, Article, Blog)
│   ├── routes/               # API 路由定义
│   ├── app.js                # 后端入口文件 (适配 Serverless)
│   ├── vercel.json           # Vercel 后端部署配置
│   └── import-data.js        # 词库批量导入脚本 (ETL)
│
├── frontend/                 # 前端工程目录
│   ├── public/covers/        # 静态资源：文章封面图
│   ├── src/
│   │   ├── api/index.js      # Axios 实例与 API 统一管理
│   │   ├── views/            # 页面组件 (Login, Home, WordLearn, etc.)
│   │   ├── App.vue           # 根组件
│   │   └── main.js           # 前端入口
│   └── vite.config.js        # Vite 配置
└── README.md                 # 项目说明文档

---

## 6. 环境要求
在本地运行此项目，您需要安装以下环境：
## Node.js: v16.0.0 或更高版本
## npm: v8.0.0 或更高版本
## Git: 用于版本控制
## MySQL: 本地 MySQL 数据库 或 TiDB Cloud 云数据库账号

---

## 7. 数据库设计
请在数据库中执行以下 SQL 语句以构建完整的表结构：
SET NAMES utf8mb4;

-- 1. 用户表
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- 2. 单词词库表
CREATE TABLE `words` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `word` varchar(100) NOT NULL,
  `phonetic` varchar(100) COMMENT '音标',
  `definition` text COMMENT '释义',
  `category` varchar(20) COMMENT '分类: CET4/CET6/KY',
  PRIMARY KEY (`id`)
);

-- 3. 生词本表
CREATE TABLE `notebook` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `word` varchar(100) NOT NULL,
  `translation` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_word` (`user_id`, `word`)
);

-- 4. 文章表
CREATE TABLE `articles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `summary` varchar(500),
  `content` longtext,
  `cover` varchar(500),
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- 5. 博客表
CREATE TABLE `blogs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- 6. 评论表
CREATE TABLE `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `blog_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

---

## 8. 快速开始与项目运行流程
按照以下步骤，在您的本地电脑上完整运行项目。
## 第一步：克隆项目
打开终端 (Terminal) 或 CMD：
git clone https://github.com/your-username/english-learning-app.git
cd english-learning-app

## 第二步：配置后端 (Backend)
1.进入目录并安装依赖：
cd backend
npm install

2.配置数据库：
打开 backend/config/db.js，填入您的数据库信息：
const pool = mysql.createPool({
    host: 'your-db-host.com', // 数据库地址
    user: 'root',             // 账号
    password: 'password',     // 密码
    database: 'english_learning_db',
    ssl: { rejectUnauthorized: false } // 如果是云数据库需开启 SSL
});

3.导入词库数据：
如果您有 cet4.txt 等词库文件，放入 backend 目录，运行：
node import-data.js

4.启动后端：
npm run dev
# 成功提示：后端服务器正在运行: http://localhost:3000

##第三步：配置前端 (Frontend)
1.打开新终端，进入目录并安装依赖：
cd ../frontend
npm install

2.配置 API 地址：
打开 frontend/src/api/index.js，确保 baseURL 指向本地后端：
const api = axios.create({
    baseURL: 'http://localhost:3000/api', // 本地开发时使用此地址
    timeout: 10000
});

3.启动前端：
npm run dev
# 成功提示：Local: http://localhost:5173

## 第四步：访问项目
打开浏览器访问 http://localhost:5173，即可开始使用完整功能。