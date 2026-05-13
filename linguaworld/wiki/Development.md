# 开发指南

本文档为开发者提供 LinguaWorld 平台的开发指南和最佳实践。

## 目录

- [开发环境搭建](#开发环境搭建)
- [代码规范](#代码规范)
- [前端开发](#前端开发)
- [后端开发](#后端开发)
- [调试技巧](#调试技巧)
- [部署指南](#部署指南)

---

## 开发环境搭建

### 必要工具

1. **VS Code**（推荐）或其他 IDE
2. **Git** 版本控制
3. **Node.js** 18+
4. **npm** 9+

### VS Code 推荐插件

- Vue - Official
- TypeScript Vue Plugin
- ESLint
- Prettier
- Tailwind CSS IntelliSense

---

## 代码规范

### 命名规范

#### 文件命名

- Vue 组件：`PascalCase.vue`（如 `UserProfile.vue`）
- TypeScript 文件：`camelCase.ts`（如 `userService.ts`）
- 工具函数：`camelCase.ts`（如 `formatDate.ts`）

#### 变量命名

- 普通变量：`camelCase`
- 常量：`UPPER_SNAKE_CASE`
- 组件名：`PascalCase`
- 私有属性：`_camelCase`（带下划线前缀）

### 注释规范

#### 函数注释

```typescript
/**
 * 获取用户信息
 * @param userId - 用户 ID
 * @returns 用户信息对象
 */
async function getUserInfo(userId: number): Promise<User> {
  // ...
}
```

#### 组件注释

```vue
<script setup lang="ts">
/**
 * 单词卡片组件
 * @prop word - 单词对象
 * @prop onFlip - 翻转回调
 */
interface Props {
  word: Word;
  onFlip?: () => void;
}
</script>
```

### Git 提交规范

使用 Conventional Commits 规范：

```
<type>(<scope>): <subject>

<type> 类型：
- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 重构
- test: 测试
- chore: 构建/工具

示例：
feat(user): 添加用户头像上传功能
fix(course): 修复视频播放进度保存问题
docs: 更新 API 文档
```

---

## 前端开发

### 添加新页面

1. 在 `src/views/` 创建新页面组件
2. 在 `src/router/index.ts` 添加路由配置
3. 在导航栏中添加链接（如需要）

**示例：**

```typescript
// src/views/NewPage.vue
<template>
  <div class="new-page">
    <h1>新页面</h1>
  </div>
</template>

<script setup lang="ts">
// 页面逻辑
</script>

<style scoped>
.new-page {
  padding: 20px;
}
</style>
```

```typescript
// src/router/index.ts
{
  path: '/new-page',
  name: 'NewPage',
  component: () => import('@/views/NewPage.vue'),
  meta: { requiresAuth: true }
}
```

### 添加新 API

1. 在 `src/api/` 对应的模块文件中添加函数
2. 使用统一的 request 实例

**示例：**

```typescript
// src/api/course.ts
import request from './request';

export interface Course {
  id: number;
  title: string;
  // ...
}

export function getCourseDetail(id: number) {
  return request.get<Course>(`/course/${id}`);
}
```

### 添加新状态

在 `src/store/` 中创建或更新 Pinia store：

```typescript
// src/store/newStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNewStore = defineStore('new', () => {
  const data = ref<string>('');

  function setData(value: string) {
    data.value = value;
  }

  return { data, setData };
});
```

### 组件开发最佳实践

1. **使用 Composition API**
2. **Props 类型定义**
3. **Emits 类型定义**
4. **合理使用 computed 和 watch**
5. **组件样式使用 scoped**

**示例：**

```vue
<template>
  <div class="example-component">
    <h3>{{ title }}</h3>
    <p>{{ formattedText }}</p>
    <button @click="handleClick">点击</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  title: string;
  text: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const formattedText = computed(() => {
  return props.text.toUpperCase();
});

function handleClick() {
  emit('click');
}
</script>

<style scoped>
.example-component {
  padding: 16px;
  border-radius: 8px;
}
</style>
```

---

## 后端开发

### 添加新接口

在 `backend-simple/server.js` 中添加新的路由：

```javascript
// 添加新的 GET 接口
app.get('/api/new-endpoint', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {}
  });
});

// 添加需要认证的接口
app.post('/api/protected-endpoint', authenticateToken, (req, res) => {
  const userId = req.user.id;
  // 业务逻辑
  res.json({ code: 200, message: 'success' });
});
```

### 数据库操作

使用 better-sqlite3 进行数据库操作：

```javascript
// 查询
const stmt = db.prepare('SELECT * FROM tb_user WHERE id = ?');
const user = stmt.get(userId);

// 插入
const stmt = db.prepare(
  'INSERT INTO tb_user (username, email, password) VALUES (?, ?, ?)'
);
const result = stmt.run(username, email, hashedPassword);
const newUserId = result.lastInsertRowid;

// 更新
const stmt = db.prepare('UPDATE tb_user SET level = ? WHERE id = ?');
stmt.run(newLevel, userId);
```

### JWT 认证中间件

```javascript
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      code: 401,
      message: '未提供认证 Token'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        code: 401,
        message: 'Token 无效或已过期'
      });
    }
    req.user = user;
    next();
  });
}
```

---

## 调试技巧

### 前端调试

1. **Vue DevTools**
   - 安装 Vue.js devtools 浏览器扩展
   - 检查组件状态和 props
   - 跟踪 Pinia store 变化

2. **Console 调试**
   ```typescript
   console.log('调试信息', data);
   console.warn('警告信息');
   console.error('错误信息');
   ```

3. **断点调试**
   - 在 VS Code 中配置调试
   - 或在浏览器开发者工具中设置断点

### 后端调试

1. **日志输出**
   ```javascript
   console.log('[DEBUG]', '请求参数:', req.body);
   ```

2. **错误处理**
   ```javascript
   try {
     // 业务逻辑
   } catch (error) {
     console.error('[ERROR]', error);
     res.status(500).json({
       code: 500,
       message: '服务器内部错误'
     });
   }
   ```

3. **使用 nodemon 自动重启**
   ```bash
   npm install -g nodemon
   nodemon server.js
   ```

### 网络请求调试

1. **浏览器 Network 面板**
   - 查看请求/响应
   - 检查 Header 和 Payload
   - 查看响应时间

2. **使用 curl 测试**
   ```bash
   curl -X GET http://localhost:8080/api/course/list
   curl -X POST http://localhost:8080/api/user/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"123456"}'
   ```

---

## 部署指南

### 前端部署

#### 1. 构建生产版本

```bash
cd frontend
npm run build
```

构建产物在 `dist/` 目录。

#### 2. Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/linguaworld/frontend/dist;
    index index.html;

    # 前端路由（Vue Router history 模式）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 后端部署

#### 1. 使用 PM2 管理进程

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
cd backend-simple
pm2 start server.js --name linguaworld-api

# 查看状态
pm2 status

# 查看日志
pm2 logs linguaworld-api

# 重启服务
pm2 restart linguaworld-api

# 停止服务
pm2 stop linguaworld-api
```

#### 2. PM2 配置文件

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'linguaworld-api',
    script: './server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    }
  }]
};
```

启动：

```bash
pm2 start ecosystem.config.js
```

### 数据库备份

定期备份 SQLite 数据库：

```bash
# 备份脚本
#!/bin/bash
BACKUP_DIR="/var/backups/linguaworld"
DATE=$(date +%Y%m%d_%H%M%S)
cp /path/to/linguaworld.db $BACKUP_DIR/linguaworld_$DATE.db

# 删除 7 天前的备份
find $BACKUP_DIR -name "linguaworld_*.db" -mtime +7 -delete
```

添加到 crontab：

```bash
crontab -e

# 每天凌晨 2 点备份
0 2 * * * /path/to/backup-script.sh
```

### 安全建议

1. **使用 HTTPS**
   - 配置 SSL 证书（Let's Encrypt）
   - 强制 HTTPS 跳转

2. **环境变量**
   - 使用 dotenv 管理敏感信息
   - 不要将密钥提交到代码库

3. **CORS 配置**
   - 限制允许的来源
   - 不要使用 `*` 通配符

4. **速率限制**
   - 添加请求频率限制
   - 防止暴力攻击

5. **输入验证**
   - 验证所有用户输入
   - 防止 SQL 注入和 XSS
