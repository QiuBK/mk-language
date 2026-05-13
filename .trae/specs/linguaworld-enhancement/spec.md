# LinguaWorld 多语种在线教育平台完善计划

## Why

当前 LinguaWorld 平台已完成基础功能实现，包括多语种课程、单词背诵、口语练习等核心模块。为提升用户体验和系统稳定性，需要完善前端页面交互、优化后端 API 性能、补充缺失功能模块，并确保前后端联调正常运行。

## What Changes

### 新增功能
- 完整的用户注册/登录页面 UI
- 课程详情页视频播放器集成
- 单词学习页面增加进度追踪
- 口语练习页面增加录音波形可视化
- 个人中心页面完善
- 成就系统页面完善
- 社区交流页面完善

### 优化改进
- 前端路由守卫实现（未登录跳转）
- API 请求错误统一处理
- 响应式布局优化（适配移动端）
- 多语种切换状态持久化
- 学习进度自动保存

### 技术完善
- 前端代理配置（解决跨域问题）
- 后端 CORS 配置优化
- 数据库初始化脚本完善
- 测试用例补充

## Impact

### 受影响的功能模块
- 用户模块：注册、登录、个人中心
- 课程模块：课程列表、详情、播放
- 单词模块：单词卡、学习进度
- 口语模块：录音、提交、评分
- 成就模块：徽章、等级
- 社区模块：帖子、评论

### 受影响的代码文件
- `frontend/src/views/` - 所有页面组件
- `frontend/src/api/` - API 请求模块
- `frontend/src/store/` - 状态管理
- `frontend/src/router/` - 路由配置
- `backend-simple/server.js` - 后端服务
- `frontend/vite.config.ts` - Vite 配置

---

## ADDED Requirements

### Requirement: 用户认证系统

系统应提供完整的用户注册、登录、登出功能，包含 Token 认证机制。

#### Scenario: 新用户注册
- **WHEN** 用户访问注册页面并填写有效信息（用户名、邮箱、密码）
- **THEN** 系统创建用户账户并返回 JWT Token，页面自动跳转至首页

#### Scenario: 用户登录
- **WHEN** 用户输入正确的邮箱和密码
- **THEN** 系统验证通过后返回 Token，用户信息存入本地存储，页面跳转至首页

#### Scenario: 用户登出
- **WHEN** 用户点击退出按钮
- **THEN** 清除本地存储的 Token 和用户信息，跳转至登录页面

#### Scenario: 未登录访问受保护页面
- **WHEN** 用户未登录直接访问需要认证的页面（如个人中心）
- **THEN** 页面自动跳转至登录页面，登录成功后返回原页面

---

### Requirement: 课程学习系统

系统应提供完整的课程浏览、详情查看、视频播放、学习进度记录功能。

#### Scenario: 浏览课程列表
- **WHEN** 用户进入课程列表页
- **THEN** 显示所有课程，支持按语种（英语/日语/韩语）和难度筛选

#### Scenario: 查看课程详情
- **WHEN** 用户点击课程卡片进入详情页
- **THEN** 显示课程基本信息、章节列表、已报名状态

#### Scenario: 视频播放
- **WHEN** 用户点击课时开始学习
- **THEN** 视频播放器加载，可播放/暂停、调节音量、倍速（0.5x-2x）、全屏

#### Scenario: 学习进度记忆
- **WHEN** 用户观看视频时刷新页面或关闭浏览器
- **THEN** 重新打开时自动跳转到上次播放位置

#### Scenario: 课程报名
- **WHEN** 未报名用户点击报名按钮
- **THEN** 系统记录报名信息，页面显示已报名状态

---

### Requirement: 单词学习系统

系统应提供单词卡片展示、翻转查看、状态标记、错题复习功能。

#### Scenario: 单词卡片展示
- **WHEN** 用户进入单词学习页
- **THEN** 显示单词卡片，包含单词、音标、记忆状态

#### Scenario: 翻转查看释义
- **WHEN** 用户点击单词卡片
- **THEN** 卡片翻转显示释义和例句

#### Scenario: 标记单词状态
- **WHEN** 用户点击"认识"或"不认识"按钮
- **THEN** 单词状态更新，切换至下一张卡片

#### Scenario: 错题复习
- **WHEN** 用户进入错题本
- **THEN** 显示所有标记为"不认识"的单词供复习

---

### Requirement: 口语练习系统

系统应提供口语题目展示、录音提交、AI 评分功能。

#### Scenario: 选择练习题目
- **WHEN** 用户进入口语练习页
- **THEN** 显示当前题目内容、翻译、难度标签

#### Scenario: 录音功能
- **WHEN** 用户点击录音按钮开始录音
- **THEN** 显示录音时长和波形指示器

#### Scenario: 提交评分
- **WHEN** 用户完成录音并点击提交
- **THEN** 系统返回模拟评分（75-95分）和反馈建议

#### Scenario: 查看练习历史
- **WHEN** 用户进入练习历史页面
- **THEN** 显示所有练习记录，包含日期、分数、反馈

---

### Requirement: 多语种切换

系统应支持中文、英文、日文、韩文界面切换。

#### Scenario: 切换语种
- **WHEN** 用户点击语种切换按钮
- **THEN** 页面所有文本切换为对应语言，语种偏好保存至本地

#### Scenario: 刷新页面保持语种
- **WHEN** 用户刷新页面
- **THEN** 页面显示上次选择的语种

---

### Requirement: 成就系统

系统应提供学习成就徽章和等级展示。

#### Scenario: 查看成就
- **WHEN** 用户进入成就页面
- **THEN** 显示已获得和未获得的成就徽章

#### Scenario: 等级展示
- **WHEN** 用户在首页查看个人数据
- **THEN** 显示当前等级、经验值、学习天数

---

## MODIFIED Requirements

### Requirement: API 请求配置

#### 原有配置
- API 请求地址硬编码
- 无统一错误处理
- 无请求 Loading 状态

#### 修改为
- 配置 API 基础地址（开发环境 `/api`，生产环境 `http://api.example.com`）
- 统一拦截响应，显示错误提示
- 请求时显示 Loading 遮罩层
- 401 响应自动跳转登录页

---

## REMOVED Requirements

### Requirement: 原 MySQL 后端依赖

**Reason**: Maven 仓库连接超时导致无法编译。采用 Node.js + SQLite 方案替代，功能完全兼容。

**Migration**: 原 Spring Boot 代码保留在 `backend/` 目录，可在新环境中重新编译部署。

---

## Technical Notes

### 前端技术栈
- Vue 3 + TypeScript
- Vite 5.x 构建工具
- Element Plus UI 组件库
- Pinia 状态管理
- Axios HTTP 请求
- TailwindCSS 样式

### 后端技术栈
- Node.js + Express
- SQLite 数据库（better-sqlite3）
- JWT 认证（jsonwebtoken）
- bcryptjs 密码加密

### 数据库表结构
- tb_user - 用户表
- tb_course - 课程表
- tb_chapter - 章节表
- tb_lesson - 课时表
- tb_vocabulary - 单词表
- tb_user_word - 用户单词状态表
- tb_speaking_topic - 口语题目表
- tb_user_speaking - 口语练习记录表
- tb_enrollment - 报名表
- tb_user_progress - 学习进度表

### 接口列表
| 模块 | 接口 | 方法 | 描述 |
|------|------|------|------|
| 用户 | /api/user/login | POST | 用户登录 |
| 用户 | /api/user/register | POST | 用户注册 |
| 用户 | /api/user/info | GET | 获取用户信息 |
| 用户 | /api/user/stats | GET | 获取学习统计 |
| 课程 | /api/course/list | GET | 课程列表 |
| 课程 | /api/course/recommend | GET | 推荐课程 |
| 课程 | /api/course/:id | GET | 课程详情 |
| 课程 | /api/course/enroll | POST | 课程报名 |
| 课程 | /api/course/progress | POST | 更新进度 |
| 单词 | /api/vocabulary/list | GET | 单词列表 |
| 单词 | /api/vocabulary/random | GET | 随机单词 |
| 单词 | /api/vocabulary/mark | POST | 标记单词 |
| 单词 | /api/vocabulary/wrong | GET | 错题本 |
| 口语 | /api/speaking/topics | GET | 题目列表 |
| 口语 | /api/speaking/random | GET | 随机题目 |
| 口语 | /api/speaking/submit | POST | 提交练习 |
| 口语 | /api/speaking/history | GET | 练习历史 |
