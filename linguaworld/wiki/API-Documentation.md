# API 文档

本文档详细介绍 LinguaWorld 平台的后端 API 接口。

## 目录

- [API 基础信息](#api-基础信息)
- [认证机制](#认证机制)
- [用户接口](#用户接口)
- [课程接口](#课程接口)
- [单词接口](#单词接口)
- [口语接口](#口语接口)
- [响应格式](#响应格式)

---

## API 基础信息

### 基础 URL

**开发环境：** `http://localhost:8080/api`

**生产环境：** `https://api.your-domain.com/api`

### 数据格式

所有请求和响应均使用 JSON 格式。

### Content-Type

```
Content-Type: application/json
```

---

## 认证机制

### JWT Token

平台使用 JWT (JSON Web Token) 进行身份认证。

### 获取 Token

通过登录接口获取 Token：

```json
POST /api/user/login
{
  "email": "test@example.com",
  "password": "123456"
}
```

响应：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com"
    }
  }
}
```

### 使用 Token

在后续请求的 Header 中携带 Token：

```
Authorization: Bearer <your-token>
```

### Token 过期

Token 有效期为 24 小时，过期后需要重新登录。

---

## 用户接口

### 用户注册

**接口：** `POST /api/user/register`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| email | string | 是 | 邮箱 |
| password | string | 是 | 密码 |

**请求示例：**

```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "123456"
}
```

**响应示例：**

```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "token": "...",
    "user": {
      "id": 2,
      "username": "newuser",
      "email": "newuser@example.com"
    }
  }
}
```

---

### 用户登录

**接口：** `POST /api/user/login`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 邮箱 |
| password | string | 是 | 密码 |

**请求示例：**

```json
{
  "email": "test@example.com",
  "password": "123456"
}
```

**响应示例：**

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "...",
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "avatar": null,
      "level": 1,
      "exp": 0
    }
  }
}
```

---

### 获取用户信息

**接口：** `GET /api/user/info`

**请求头：** `Authorization: Bearer <token>`

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "avatar": null,
    "level": 1,
    "exp": 150,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 获取学习统计

**接口：** `GET /api/user/stats`

**请求头：** `Authorization: Bearer <token>`

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "studyDays": 15,
    "wordsLearned": 156,
    "speakingPractice": 45,
    "totalHours": 8,
    "coursesCompleted": 3
  }
}
```

---

## 课程接口

### 获取课程列表

**接口：** `GET /api/course/list`

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| language | string | 否 | 语种筛选 (en/jp/kr) |
| level | string | 否 | 难度筛选 (beginner/intermediate/advanced) |

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "title": "英语基础入门",
      "description": "适合零基础学习者的英语入门课程",
      "language": "en",
      "level": "beginner",
      "cover": "https://example.com/cover.jpg",
      "rating": 4.8,
      "students": 1234,
      "chapters": 10,
      "duration": "10h"
    }
  ]
}
```

---

### 获取课程详情

**接口：** `GET /api/course/:id`

**路径参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 课程 ID |

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "英语基础入门",
    "description": "适合零基础学习者的英语入门课程",
    "language": "en",
    "level": "beginner",
    "cover": "https://example.com/cover.jpg",
    "rating": 4.8,
    "students": 1234,
    "teacher": {
      "name": "张老师",
      "avatar": "https://example.com/avatar.jpg"
    },
    "chapters": [
      {
        "id": 1,
        "title": "第一章 发音基础",
        "lessons": [
          {
            "id": 1,
            "title": "1.1 元音发音",
            "duration": "15:00",
            "videoUrl": "https://example.com/video.mp4",
            "completed": false
          }
        ]
      }
    ],
    "enrolled": true,
    "progress": 30
  }
}
```

---

### 获取推荐课程

**接口：** `GET /api/course/recommend`

**请求头：** `Authorization: Bearer <token>`

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 2,
      "title": "英语进阶课程",
      "description": "适合有一定基础的学习者",
      "language": "en",
      "level": "intermediate",
      "cover": "https://example.com/cover2.jpg",
      "rating": 4.9,
      "students": 856
    }
  ]
}
```

---

### 报名课程

**接口：** `POST /api/course/enroll`

**请求头：** `Authorization: Bearer <token>`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| courseId | number | 是 | 课程 ID |

**请求示例：**

```json
{
  "courseId": 1
}
```

**响应示例：**

```json
{
  "code": 200,
  "message": "报名成功",
  "data": null
}
```

---

### 更新学习进度

**接口：** `POST /api/course/progress`

**请求头：** `Authorization: Bearer <token>`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| lessonId | number | 是 | 课时 ID |
| progress | number | 是 | 播放进度（秒） |
| completed | boolean | 否 | 是否完成 |

**请求示例：**

```json
{
  "lessonId": 1,
  "progress": 450,
  "completed": false
}
```

---

## 单词接口

### 获取单词列表

**接口：** `GET /api/vocabulary/list`

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| language | string | 是 | 语种 (en/jp/kr) |
| page | number | 否 | 页码，默认 1 |
| limit | number | 否 | 每页数量，默认 20 |

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "words": [
      {
        "id": 1,
        "word": "hello",
        "phonetic": "/həˈləʊ/",
        "translation": "你好",
        "example": "Hello, world!",
        "language": "en",
        "level": "beginner"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

---

### 获取随机单词

**接口：** `GET /api/vocabulary/random`

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| language | string | 是 | 语种 (en/jp/kr) |
| count | number | 否 | 数量，默认 10 |

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "word": "hello",
      "phonetic": "/həˈləʊ/",
      "translation": "你好",
      "example": "Hello, world!"
    }
  ]
}
```

---

### 标记单词状态

**接口：** `POST /api/vocabulary/mark`

**请求头：** `Authorization: Bearer <token>`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| wordId | number | 是 | 单词 ID |
| status | string | 是 | 状态 (known/unknown) |

**请求示例：**

```json
{
  "wordId": 1,
  "status": "known"
}
```

---

### 获取错题本

**接口：** `GET /api/vocabulary/wrong`

**请求头：** `Authorization: Bearer <token>`

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "word": "complicated",
      "phonetic": "/ˈkɒmplɪkeɪtɪd/",
      "translation": "复杂的",
      "example": "This is a complicated problem."
    }
  ]
}
```

---

## 口语接口

### 获取口语题目列表

**接口：** `GET /api/speaking/topics`

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| language | string | 是 | 语种 (en/jp/kr) |
| level | string | 否 | 难度 |

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "title": "How do you pronounce this word?",
      "translation": "这个词怎么发音？",
      "language": "en",
      "level": "beginner",
      "exampleAudio": "https://example.com/example.mp3"
    }
  ]
}
```

---

### 获取随机题目

**接口：** `GET /api/speaking/random`

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| language | string | 是 | 语种 (en/jp/kr) |

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "Introduce yourself",
    "translation": "介绍你自己",
    "language": "en",
    "level": "beginner"
  }
}
```

---

### 提交口语练习

**接口：** `POST /api/speaking/submit`

**请求头：** `Authorization: Bearer <token>`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| topicId | number | 是 | 题目 ID |
| audio | string | 是 | 音频文件 (base64 或 URL) |

**请求示例：**

```json
{
  "topicId": 1,
  "audio": "data:audio/wav;base64,..."
}
```

**响应示例：**

```json
{
  "code": 200,
  "message": "提交成功",
  "data": {
    "score": 85,
    "pronunciation": 88,
    "intonation": 80,
    "fluency": 82,
    "feedback": "发音准确，语调可以更自然一些",
    "suggestions": [
      "注意句子的重音位置",
      "多练习连读技巧"
    ]
  }
}
```

---

### 获取练习历史

**接口：** `GET /api/speaking/history`

**请求头：** `Authorization: Bearer <token>`

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "topicId": 1,
      "topicTitle": "Introduce yourself",
      "score": 85,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## 响应格式

### 统一响应结构

所有 API 响应遵循以下格式：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 状态码说明

| Code | 说明 |
|------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 / Token 过期 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 错误响应示例

```json
{
  "code": 400,
  "message": "邮箱格式不正确",
  "data": null
}
```

```json
{
  "code": 401,
  "message": "Token 已过期，请重新登录",
  "data": null
}
```
