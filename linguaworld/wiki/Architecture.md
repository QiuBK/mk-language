# 技术架构

本文档详细介绍 LinguaWorld 平台的技术架构设计。

## 目录

- [架构概览](#架构概览)
- [前端架构](#前端架构)
- [后端架构](#后端架构)
- [数据库设计](#数据库设计)
- [目录结构](#目录结构)

---

## 架构概览

LinguaWorld 采用前后端分离的架构设计。

```
┌─────────────────────────────────────────────────────────┐
│                        用户界面                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   浏览器     │  │  移动端浏览器 │  │   平板设备    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼─────────────────┼─────────────────┼───────────┘
          │                 │                 │
          └─────────────────┴─────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                       前端应用                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Vue 3 SPA (Single Page Application)              │  │
│  │  - 路由管理 (Vue Router)                          │  │
│  │  - 状态管理 (Pinia)                               │  │
│  │  - UI 组件 (Element Plus + Tailwind)              │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼ HTTP/HTTPS + JSON
┌─────────────────────────────────────────────────────────┐
│                       后端服务                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Express.js 服务器                                │  │
│  │  - 路由处理                                       │  │
│  │  - 中间件 (CORS, JWT, 日志)                       │  │
│  │  - 业务逻辑层                                     │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                       数据存储                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │  SQLite 数据库                                    │  │
│  │  - 用户数据                                       │  │
│  │  - 课程数据                                       │  │
│  │  - 学习进度                                       │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 前端架构

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.4.x | 前端框架 |
| TypeScript | 5.4.x | 类型安全 |
| Vite | 5.2.x | 构建工具 |
| Element Plus | 2.6.x | UI 组件库 |
| Tailwind CSS | 3.4.x | CSS 框架 |
| Pinia | 2.1.x | 状态管理 |
| Vue Router | 4.3.x | 路由管理 |
| Axios | 1.6.x | HTTP 客户端 |
| Video.js | 8.10.x | 视频播放器 |

### 项目结构

```
frontend/
├── src/
│   ├── api/                    # API 请求模块
│   │   ├── request.ts          # Axios 实例配置
│   │   ├── user.ts             # 用户相关 API
│   │   ├── course.ts           # 课程相关 API
│   │   ├── vocabulary.ts       # 单词相关 API
│   │   └── speaking.ts         # 口语相关 API
│   ├── assets/                 # 静态资源
│   │   └── styles/
│   │       └── index.scss      # 全局样式
│   ├── components/             # 公共组件
│   │   ├── LanguageSwitch.vue  # 语种切换组件
│   │   ├── SpeakingRecorder.vue # 录音组件
│   │   ├── VideoPlayer.vue     # 视频播放组件
│   │   └── VocabularyCard.vue  # 单词卡片组件
│   ├── router/                 # 路由配置
│   │   └── index.ts            # 路由定义
│   ├── store/                  # 状态管理
│   │   ├── user.ts             # 用户状态
│   │   └── language.ts         # 语言状态
│   ├── types/                  # TypeScript 类型定义
│   │   └── index.ts            # 类型声明
│   ├── views/                  # 页面组件
│   │   ├── HomePage.vue        # 首页
│   │   ├── LoginPage.vue       # 登录页
│   │   ├── RegisterPage.vue    # 注册页
│   │   ├── CoursesPage.vue     # 课程列表
│   │   ├── CourseDetailPage.vue # 课程详情
│   │   ├── VocabularyPage.vue  # 单词学习
│   │   ├── SpeakingPage.vue    # 口语练习
│   │   ├── AchievementsPage.vue # 成就中心
│   │   ├── CommunityPage.vue   # 社区
│   │   └── ProfilePage.vue     # 个人中心
│   ├── App.vue                 # 根组件
│   └── main.ts                 # 入口文件
├── index.html                  # HTML 模板
├── package.json                # 依赖配置
├── vite.config.ts              # Vite 配置
├── tailwind.config.js          # Tailwind 配置
└── postcss.config.js           # PostCSS 配置
```

### 核心模块说明

#### 1. API 层

统一的 API 请求封装，包含：

- Axios 实例配置
- 请求拦截器（添加 Token）
- 响应拦截器（统一错误处理）
- 各模块 API 函数

#### 2. 状态管理

使用 Pinia 管理全局状态：

**User Store (`store/user.ts`):**
- 用户信息
- Token 管理
- 登录状态
- 学习统计数据

**Language Store (`store/language.ts`):**
- 当前界面语言
- 当前学习语言
- 语言切换方法

#### 3. 路由管理

使用 Vue Router 管理页面路由：

- 路由守卫（认证检查）
- 懒加载（代码分割）
- 导航栏配置

#### 4. 组件设计

组件采用原子化设计原则：

- 基础组件（Button, Card, Input）
- 业务组件（CourseCard, VocabularyCard）
- 功能组件（VideoPlayer, SpeakingRecorder）

---

## 后端架构

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18.x | 运行时 |
| Express | 4.18.x | Web 框架 |
| better-sqlite3 | 9.2.x | SQLite 驱动 |
| jsonwebtoken | 9.0.x | JWT 认证 |
| bcryptjs | 2.4.x | 密码加密 |
| cors | 2.8.x | 跨域处理 |

### 项目结构

```
backend-simple/
├── server.js               # 服务器入口
├── linguaworld.db          # SQLite 数据库文件
├── package.json            # 依赖配置
└── package-lock.json
```

### 核心模块

#### 1. 服务器入口 (`server.js`)

主要功能：
- Express 应用初始化
- 中间件配置
- 路由注册
- 数据库连接
- 服务器启动

#### 2. 中间件

- **CORS 中间件：** 处理跨域请求
- **JWT 中间件：** 验证用户身份
- **JSON 解析：** 解析请求体
- **日志中间件：** 记录请求日志

#### 3. 路由设计

```
/api
├── /user
│   ├── POST /register      # 用户注册
│   ├── POST /login         # 用户登录
│   ├── GET /info           # 获取用户信息
│   └── GET /stats          # 获取学习统计
├── /course
│   ├── GET /list           # 课程列表
│   ├── GET /recommend      # 推荐课程
│   ├── GET /:id            # 课程详情
│   ├── POST /enroll        # 报名课程
│   └── POST /progress      # 更新进度
├── /vocabulary
│   ├── GET /list           # 单词列表
│   ├── GET /random         # 随机单词
│   ├── POST /mark          # 标记单词
│   └── GET /wrong          # 错题本
└── /speaking
    ├── GET /topics         # 题目列表
    ├── GET /random         # 随机题目
    ├── POST /submit        # 提交练习
    └── GET /history        # 练习历史
```

---

## 数据库设计

### 数据库表结构

#### 1. 用户表 (tb_user)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | INTEGER | 用户 ID | PRIMARY KEY |
| username | VARCHAR | 用户名 | NOT NULL |
| email | VARCHAR | 邮箱 | UNIQUE, NOT NULL |
| password | VARCHAR | 密码（加密） | NOT NULL |
| avatar | VARCHAR | 头像 URL | NULLABLE |
| level | INTEGER | 等级 | DEFAULT 1 |
| exp | INTEGER | 经验值 | DEFAULT 0 |
| created_at | DATETIME | 创建时间 | DEFAULT NOW |

#### 2. 课程表 (tb_course)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | INTEGER | 课程 ID | PRIMARY KEY |
| title | VARCHAR | 课程标题 | NOT NULL |
| description | TEXT | 课程描述 | NULLABLE |
| language | VARCHAR | 语种 (en/jp/kr) | NOT NULL |
| level | VARCHAR | 难度 | NOT NULL |
| cover | VARCHAR | 封面 URL | NULLABLE |
| rating | DECIMAL | 评分 | DEFAULT 0 |
| students | INTEGER | 学习人数 | DEFAULT 0 |
| teacher_id | INTEGER | 教师 ID | FOREIGN KEY |
| created_at | DATETIME | 创建时间 | DEFAULT NOW |

#### 3. 章节表 (tb_chapter)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | INTEGER | 章节 ID | PRIMARY KEY |
| course_id | INTEGER | 课程 ID | FOREIGN KEY |
| title | VARCHAR | 章节标题 | NOT NULL |
| sort_order | INTEGER | 排序 | NOT NULL |

#### 4. 课时表 (tb_lesson)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | INTEGER | 课时 ID | PRIMARY KEY |
| chapter_id | INTEGER | 章节 ID | FOREIGN KEY |
| title | VARCHAR | 课时标题 | NOT NULL |
| duration | INTEGER | 时长（秒） | NOT NULL |
| video_url | VARCHAR | 视频 URL | NOT NULL |
| sort_order | INTEGER | 排序 | NOT NULL |

#### 5. 单词表 (tb_vocabulary)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | INTEGER | 单词 ID | PRIMARY KEY |
| word | VARCHAR | 单词 | NOT NULL |
| phonetic | VARCHAR | 音标 | NULLABLE |
| translation | VARCHAR | 翻译 | NOT NULL |
| example | TEXT | 例句 | NULLABLE |
| language | VARCHAR | 语种 | NOT NULL |
| level | VARCHAR | 难度 | NOT NULL |

#### 6. 用户单词状态表 (tb_user_word)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | INTEGER | ID | PRIMARY KEY |
| user_id | INTEGER | 用户 ID | FOREIGN KEY |
| word_id | INTEGER | 单词 ID | FOREIGN KEY |
| status | VARCHAR | 状态 (known/unknown) | NOT NULL |
| review_count | INTEGER | 复习次数 | DEFAULT 0 |
| next_review | DATETIME | 下次复习时间 | NULLABLE |
| created_at | DATETIME | 创建时间 | DEFAULT NOW |

#### 7. 口语题目表 (tb_speaking_topic)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | INTEGER | 题目 ID | PRIMARY KEY |
| title | VARCHAR | 题目 | NOT NULL |
| translation | VARCHAR | 翻译 | NOT NULL |
| language | VARCHAR | 语种 | NOT NULL |
| level | VARCHAR | 难度 | NOT NULL |
| example_audio | VARCHAR | 示例音频 | NULLABLE |

#### 8. 用户口语练习表 (tb_user_speaking)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | INTEGER | ID | PRIMARY KEY |
| user_id | INTEGER | 用户 ID | FOREIGN KEY |
| topic_id | INTEGER | 题目 ID | FOREIGN KEY |
| score | INTEGER | 评分 | NOT NULL |
| audio_url | VARCHAR | 音频 URL | NULLABLE |
| feedback | TEXT | 反馈 | NULLABLE |
| created_at | DATETIME | 创建时间 | DEFAULT NOW |

#### 9. 报名表 (tb_enrollment)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | INTEGER | ID | PRIMARY KEY |
| user_id | INTEGER | 用户 ID | FOREIGN KEY |
| course_id | INTEGER | 课程 ID | FOREIGN KEY |
| progress | INTEGER | 进度 (%) | DEFAULT 0 |
| created_at | DATETIME | 报名时间 | DEFAULT NOW |
| UNIQUE | (user_id, course_id) | |

#### 10. 用户进度表 (tb_user_progress)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | INTEGER | ID | PRIMARY KEY |
| user_id | INTEGER | 用户 ID | FOREIGN KEY |
| lesson_id | INTEGER | 课时 ID | FOREIGN KEY |
| progress | INTEGER | 播放进度（秒） | DEFAULT 0 |
| completed | BOOLEAN | 是否完成 | DEFAULT FALSE |
| updated_at | DATETIME | 更新时间 | DEFAULT NOW |

---

## 目录结构

### 完整项目结构

```
linguaworld/
├── wiki/                        # Wiki 文档
│   ├── Home.md
│   ├── Getting-Started.md
│   ├── Features.md
│   ├── API-Documentation.md
│   ├── Architecture.md
│   ├── Development.md
│   └── FAQ.md
├── docs/                        # 项目文档
│   ├── 01_产品设计文档.md
│   └── 02_项目交付文档.md
├── database/                    # 数据库脚本
│   ├── linguaworld.sql
│   └── ER_diagram.md
├── frontend/                    # 前端项目
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── router/
│   │   ├── store/
│   │   ├── types/
│   │   ├── views/
│   │   ├── App.vue
│   │   └── main.ts
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── backend-simple/              # 简化版后端
│   ├── server.js
│   ├── linguaworld.db
│   └── package.json
├── backend/                     # Spring Boot 后端（原始）
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/linguaworld/
│   │       │       ├── controller/
│   │       │       ├── service/
│   │       │       ├── mapper/
│   │       │       ├── entity/
│   │       │       └── ...
│   │       └── resources/
│   │           └── application.yml
│   └── pom.xml
└── README.md
```
