# 快速开始

本指南将帮助你在本地环境中快速搭建并运行 LinguaWorld 平台。

## 目录

- [环境要求](#环境要求)
- [项目安装](#项目安装)
- [后端启动](#后端启动)
- [前端启动](#前端启动)
- [访问项目](#访问项目)
- [测试账号](#测试账号)

---

## 环境要求

在开始之前，请确保你的开发环境满足以下要求：

| 工具 | 最低版本 | 说明 |
|------|---------|------|
| Node.js | 18.x | 用于运行前端和简化版后端 |
| npm | 9.x | 包管理器 |
| Git | 2.x | 版本控制（可选） |

---

## 项目安装

### 1. 克隆项目

```bash
# 使用 Git 克隆（如果可用）
git clone <repository-url>
cd linguaworld

# 或者直接进入项目目录
cd /workspace/linguaworld
```

### 2. 安装依赖

#### 前端依赖

```bash
cd frontend
npm install
```

#### 后端依赖（简化版）

```bash
cd backend-simple
npm install
```

---

## 后端启动

### 使用简化版后端（推荐）

```bash
cd backend-simple
npm start
```

后端服务将在 `http://localhost:8080` 启动。

### 数据库

简化版后端使用 SQLite 数据库，数据库文件位于：
`backend-simple/linguaworld.db`

数据库已预置示例数据，无需额外配置。

---

## 前端启动

```bash
cd frontend
npm run dev
```

前端开发服务器将在 `http://localhost:5173` 启动。

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `frontend/dist` 目录。

---

## 访问项目

打开浏览器访问：`http://localhost:5173`

---

## 测试账号

平台已预置以下测试账号：

### 普通用户
- 邮箱：`test@example.com`
- 密码：`123456`

### 管理员
- 邮箱：`admin@example.com`
- 密码：`123456`

---

## 开发端口

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端 | 5173 | 开发服务器 |
| 后端 | 8080 | API 服务 |

---

## 常见启动问题

### 端口被占用

如果端口被占用，可以修改配置文件中的端口号：

**前端端口修改：**
编辑 `frontend/vite.config.ts`

**后端端口修改：**
编辑 `backend-simple/server.js` 中的 `PORT` 变量

### 依赖安装失败

尝试清理缓存后重新安装：

```bash
# 清理 npm 缓存
npm cache clean --force

# 删除 node_modules 后重新安装
rm -rf node_modules package-lock.json
npm install
```

### 数据库权限问题

确保对 `backend-simple` 目录有读写权限。

---

## 下一步

- 了解平台 [功能特性](./Features.md)
- 查看 [API 文档](./API-Documentation.md)
- 阅读 [开发指南](./Development.md)
