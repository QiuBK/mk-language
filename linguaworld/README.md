# LinguaWorld 多语种在线教育平台

## 项目概述

LinguaWorld 是一款功能完善的在线多语种学习平台，支持 **英语、日语、韩语** 三大主流语言。平台提供分级课程体系、互动式学习模块、学习进度追踪、个性化推荐和成就激励系统，帮助用户高效掌握目标语言。

### 核心功能

- 🎓 **多语种课程学习** - 支持英语/日语/韩语课程播放，倍速调节，进度记忆
- 📝 **单词背诵系统** - 智能单词卡，状态标记，艾宾浩斯遗忘曲线复习
- 🎤 **口语练习** - 录音提交，AI智能评分，错误分析反馈
- 📊 **学习数据追踪** - 实时学习统计，连续打卡，进度可视化
- 🏆 **成就激励系统** - 学习成就徽章，等级提升，激励持续学习
- 👥 **社区交流** - 学习心得分享，互相鼓励，共同进步

---

## 技术架构

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.4 | UI框架 |
| TypeScript | ^5.4 | 类型安全 |
| Vite | ^5.2 | 构建工具 |
| Element Plus | ^2.6 | UI组件库 |
| Pinia | ^2.1 | 状态管理 |
| Axios | ^1.6 | HTTP请求 |
| Video.js | ^8.10 | 视频播放 |

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Java | 17 | 开发语言 |
| Spring Boot | 3.2 | 框架 |
| MyBatis Plus | 3.5 | ORM框架 |
| MySQL | 8.0 | 数据库 |
| Redis | 7.x | 缓存 |
| JWT | 0.12 | 认证 |

---

## 目录结构

```
linguaworld/
├── docs/                           # 项目文档
│   ├── 01_产品设计文档.md          # 产品设计文档
│   └── 02_项目交付文档.md          # 项目交付文档
├── database/                       # 数据库脚本
│   ├── linguaworld.sql             # 完整数据库脚本
│   └── ER_diagram.md               # ER图说明
├── frontend/                       # 前端项目 (Vue 3)
│   ├── src/
│   │   ├── api/                    # API请求模块
│   │   ├── assets/                  # 静态资源
│   │   ├── components/             # 公共组件
│   │   │   ├── LanguageSwitch.vue   # 语种切换组件
│   │   │   ├── SpeakingRecorder.vue # 录音组件
│   │   │   ├── VideoPlayer.vue      # 视频播放组件
│   │   │   └── VocabularyCard.vue   # 单词卡片组件
│   │   ├── router/                  # 路由配置
│   │   ├── store/                   # 状态管理
│   │   ├── types/                   # TypeScript类型定义
│   │   ├── views/                   # 页面组件
│   │   │   ├── HomePage.vue         # 首页
│   │   │   ├── CoursesPage.vue      # 课程列表
│   │   │   ├── CourseDetailPage.vue # 课程详情
│   │   │   ├── VocabularyPage.vue   # 单词学习
│   │   │   ├── SpeakingPage.vue     # 口语练习
│   │   │   ├── AchievementsPage.vue # 成就中心
│   │   │   ├── CommunityPage.vue    # 社区
│   │   │   ├── LoginPage.vue       # 登录页
│   │   │   ├── RegisterPage.vue     # 注册页
│   │   │   └── ProfilePage.vue     # 个人中心
│   │   ├── App.vue                 # 根组件
│   │   └── main.ts                 # 入口文件
│   ├── package.json
│   └── vite.config.ts
├── backend/                        # 后端项目 (Spring Boot)
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/
│   │       │       └── linguaworld/
│   │       │           ├── common/           # 通用类
│   │       │           │   └── Result.java  # 统一响应
│   │       │           ├── config/          # 配置类
│   │       │           │   └── WebConfig.java
│   │       │           ├── controller/       # 控制器层
│   │       │           │   ├── UserController.java
│   │       │           │   ├── CourseController.java
│   │       │           │   ├── VocabularyController.java
│   │       │           │   └── SpeakingController.java
│   │       │           ├── entity/           # 实体类
│   │       │           │   ├── User.java
│   │       │           │   ├── Course.java
│   │       │           │   ├── Chapter.java
│   │       │           │   ├── Lesson.java
│   │       │           │   ├── Vocabulary.java
│   │       │           │   ├── SpeakingTopic.java
│   │       │           │   ├── Enrollment.java
│   │       │           │   ├── UserWord.java
│   │       │           │   └── UserSpeaking.java
│   │       │           ├── mapper/           # 数据访问层
│   │       │           ├── service/          # 业务逻辑层
│   │       │           ├── interceptor/      # 拦截器
│   │       │           │   └── JwtInterceptor.java
│   │       │           └── utils/            # 工具类
│   │       │               └── JwtUtil.java
│   │       └── resources/
│   │           └── application.yml           # 配置文件
│   └── pom.xml
└── README.md
```

---

## 快速开始

### 环境要求

- Node.js >= 18
- JDK 17
- MySQL 8.0
- Redis 7.x
- Maven 3.8+

### 1. 数据库初始化

```bash
# 登录MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE linguaworld CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# 导入数据
mysql -u root -p linguaworld < database/linguaworld.sql
```

### 2. 后端启动

```bash
# 进入后端目录
cd backend

# 编译打包
mvn clean package -DskipTests

# 运行项目
java -jar target/linguaworld-backend-1.0.0.jar

# 或开发模式运行
mvn spring-boot:run
```

后端启动后运行在 `http://localhost:8080`

### 3. 前端启动

```bash
# 新开终端，进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

前端启动后运行在 `http://localhost:5173`

### 4. 访问项目

打开浏览器访问 `http://localhost:5173`

**测试账号：**
- 用户：`test@example.com` / 密码：`123456`
- 管理员：`admin@example.com` / 密码：`123456`

---

## 功能演示

### 多语种切换

点击页面右上角语种切换按钮，可选择：
- 🇨🇳 中文
- 🇺🇸 English
- 🇯🇵 日本語
- 🇰🇷 한국어

### 课程学习

1. 进入课程列表，选择感兴趣的课程
2. 点击课程卡片进入详情页
3. 选择章节开始学习
4. 支持 0.5x - 2x 倍速播放
5. 关闭页面后自动记忆播放进度

### 单词背诵

1. 进入单词学习页面
2. 选择语种（英语/日语/韩语）
3. 翻转卡片查看释义
4. 点击"认识"或"不认识"标记状态
5. 系统自动安排复习计划

### 口语练习

1. 进入口语练习页面
2. 选择练习题目
3. 点击录音按钮开始录音
4. 录音完成后提交
5. 查看 AI 评分和错误分析

---

## 接口列表

### 用户接口

| 接口 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 登录 | POST | /api/user/login | 用户登录 |
| 注册 | POST | /api/user/register | 用户注册 |
| 用户信息 | GET | /api/user/info | 获取用户信息 |
| 学习统计 | GET | /api/user/stats | 获取学习统计 |

### 课程接口

| 接口 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 课程列表 | GET | /api/course/list | 获取课程列表 |
| 课程详情 | GET | /api/course/{id} | 获取课程详情 |
| 推荐课程 | GET | /api/course/recommend | 获取推荐课程 |
| 报名课程 | POST | /api/course/enroll | 报名课程 |
| 更新进度 | POST | /api/course/progress | 更新学习进度 |

### 单词接口

| 接口 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 单词列表 | GET | /api/vocabulary/list | 获取单词列表 |
| 随机单词 | GET | /api/vocabulary/random | 获取随机单词 |
| 标记状态 | POST | /api/vocabulary/mark | 标记单词状态 |
| 错题本 | GET | /api/vocabulary/wrong | 获取错题本 |

### 口语接口

| 接口 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 题目列表 | GET | /api/speaking/topics | 获取口语题目 |
| 随机题目 | GET | /api/speaking/random | 获取随机题目 |
| 提交录音 | POST | /api/speaking/submit | 提交口语录音 |
| 练习历史 | GET | /api/speaking/history | 获取练习历史 |

---

## 项目部署

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/linguaworld;
    index index.html;

    # 前端静态资源
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 静态资源
    location /uploads {
        alias /tmp/linguaworld/uploads;
        expires 7d;
    }
}
```

### 常见问题

**Q1: 端口被占用**
```bash
# 查找占用端口的进程
lsof -i:8080
lsof -i:5173
# 杀死进程
kill -9 <PID>
```

**Q2: 数据库连接失败**
检查 `backend/src/main/resources/application.yml` 中的数据库配置

**Q3: 录音权限问题**
确保浏览器麦克风权限已开启

---

## 开发指南

### 前端开发

```bash
# 代码检查
npm run lint

# 类型检查
npm run type-check
```

### 后端开发

```bash
# 运行测试
mvn test

# 跳过测试打包
mvn clean package -DskipTests
```

---

## 许可证

MIT License

---

## 联系方式

- 项目负责人：[团队名称]
- 技术支持：[邮箱地址]
- 文档版本：v1.0
- 最后更新：2024年1月
