<template>
  <div class="community-page">
    <header class="page-header">
      <h1>社区</h1>
    </header>

    <!-- 标签筛选 -->
    <div class="tags-filter">
      <el-tag
        v-for="tag in tags"
        :key="tag.value"
        :type="selectedTag === tag.value ? 'primary' : 'info'"
        @click="handleTagChange(tag.value)"
      >
        {{ tag.label }}
      </el-tag>
    </div>

    <!-- 动态列表 -->
    <div class="posts-container">
      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      </div>

      <div v-else-if="posts.length === 0" class="empty-container">
        <el-empty description="暂无动态" />
      </div>

      <div v-else class="posts-list">
        <div v-for="post in posts" :key="post.id" class="post-card">
          <div class="post-header">
            <div class="user-info">
              <img :src="post.userAvatar || defaultAvatar" :alt="post.userName" class="avatar" />
              <div class="info">
                <span class="name">{{ post.userName }}</span>
                <span class="time">{{ formatTime(post.createTime) }}</span>
              </div>
            </div>
            <el-tag v-if="post.language" size="small">{{ getLanguageName(post.language) }}</el-tag>
          </div>

          <div class="post-content">{{ post.content }}</div>

          <div v-if="post.images?.length" class="post-images">
            <img v-for="(img, index) in post.images" :key="index" :src="img" alt="" />
          </div>

          <div class="post-actions">
            <div class="action-item" :class="{ active: post.liked }" @click="handleLike(post)">
              <el-icon><Star /></el-icon>
              <span>{{ post.likes }}</span>
            </div>
            <div class="action-item" @click="handleComment(post)">
              <el-icon><ChatLineSquare /></el-icon>
              <span>{{ post.commentsCount }}</span>
            </div>
            <div class="action-item">
              <el-icon><Share /></el-icon>
              <span>分享</span>
            </div>
          </div>

          <!-- 评论列表 -->
          <div v-if="post.showComments && post.comments?.length" class="comments-list">
            <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
              <img :src="comment.userAvatar" :alt="comment.userName" class="comment-avatar" />
              <div class="comment-content">
                <div class="comment-header">
                  <span class="name">{{ comment.userName }}</span>
                  <span class="time">{{ formatTime(comment.createTime) }}</span>
                </div>
                <p class="comment-text">{{ comment.content }}</p>
              </div>
            </div>
          </div>

          <!-- 添加评论 -->
          <div class="comment-input" v-if="post.showComments">
            <el-input
              v-model="commentText"
              placeholder="写下你的评论..."
              @keyup.enter="submitComment(post)"
            >
              <template #append>
                <el-button @click="submitComment(post)">发送</el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>
    </div>

    <!-- 发布按钮 -->
    <el-button class="publish-button" type="primary" circle @click="showPublishDialog = true">
      <el-icon><Edit /></el-icon>
    </el-button>

    <!-- 发布弹窗 -->
    <el-dialog v-model="showPublishDialog" title="发布动态" width="90%">
      <el-input
        v-model="newPostContent"
        type="textarea"
        :rows="4"
        placeholder="分享你的学习心得..."
      />
      <template #footer>
        <el-button @click="showPublishDialog = false">取消</el-button>
        <el-button type="primary" @click="handlePublish">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Loading, Star, ChatLineSquare, Share, Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { Post, Comment } from '@/types'

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const tags = [
  { label: '全部', value: '' },
  { label: '🇬🇧 英语', value: 'en' },
  { label: '🇯🇵 日语', value: 'ja' },
  { label: '🇰🇷 韩语', value: 'ko' },
  { label: '学习打卡', value: '打卡' },
  { label: '求助', value: '求助' }
]

const selectedTag = ref('')
const posts = ref<Post[]>([])
const loading = ref(false)
const showPublishDialog = ref(false)
const newPostContent = ref('')
const commentText = ref('')

const getLanguageName = (lang: string) => {
  const names: Record<string, string> = { en: '英语', ja: '日语', ko: '韩语' }
  return names[lang] || lang
}

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 60) return `${mins}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString()
}

const handleTagChange = (tag: string) => {
  selectedTag.value = tag
  loadPosts()
}

const loadPosts = () => {
  loading.value = true
  // 模拟数据
  setTimeout(() => {
    posts.value = [
      {
        id: 1,
        userId: 1,
        userName: '语言爱好者',
        userAvatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
        content: '学习英语三个月了，从零基础到现在能进行简单对话，感觉进步很大！分享一下我的学习方法：每天早起听英语播客，午餐时间背单词，晚上练习口语。希望大家也能坚持下去！💪',
        language: 'en',
        likes: 128,
        commentsCount: 5,
        liked: false,
        createTime: new Date(Date.now() - 3600000).toISOString(),
        showComments: false,
        comments: []
      },
      {
        id: 2,
        userId: 2,
        userName: '韩剧迷',
        userAvatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
        content: '推荐一个超好用的韩语学习APP！通过看韩剧学韩语真的很有趣，朋友们都说我发音越来越地道了。',
        images: ['https://picsum.photos/400/300'],
        language: 'ko',
        likes: 256,
        commentsCount: 12,
        liked: true,
        createTime: new Date(Date.now() - 86400000).toISOString(),
        showComments: false,
        comments: []
      }
    ]
    loading.value = false
  }, 500)
}

const handleLike = (post: Post) => {
  post.liked = !post.liked
  post.likes += post.liked ? 1 : -1
}

const handleComment = (post: Post) => {
  post.showComments = !post.showComments
}

const submitComment = (post: Post) => {
  if (!commentText.value.trim()) return
  ElMessage.success('评论成功')
  commentText.value = ''
}

const handlePublish = () => {
  if (!newPostContent.value.trim()) {
    ElMessage.warning('请输入内容')
    return
  }
  ElMessage.success('发布成功')
  showPublishDialog.value = false
  newPostContent.value = ''
  loadPosts()
}

onMounted(() => {
  loadPosts()
})
</script>

<style scoped lang="scss">
.community-page {
  min-height: 100vh;
  background: var(--bg-color);
  padding-bottom: 80px;
}

.page-header {
  padding: 16px 20px;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  text-align: center;

  h1 {
    font-size: 18px;
    font-weight: bold;
  }
}

.tags-filter {
  padding: 12px 20px;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);

  .el-tag {
    cursor: pointer;
    flex-shrink: 0;
  }
}

.posts-container {
  padding: 16px 20px;
}

.post-card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;

  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }

      .info {
        display: flex;
        flex-direction: column;

        .name {
          font-weight: bold;
          font-size: 14px;
        }

        .time {
          font-size: 12px;
          color: var(--text-color-light);
        }
      }
    }
  }

  .post-content {
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 12px;
  }

  .post-images {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 12px;

    img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 8px;
    }
  }

  .post-actions {
    display: flex;
    justify-content: space-around;
    padding-top: 12px;
    border-top: 1px solid var(--border-color);

    .action-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      color: var(--text-color-light);
      cursor: pointer;

      &:hover {
        color: var(--primary-color);
      }

      &.active {
        color: #f56c6c;
      }
    }
  }

  .comments-list {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border-color);
  }

  .comment-item {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;

    .comment-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }

    .comment-content {
      flex: 1;

      .comment-header {
        display: flex;
        gap: 8px;
        align-items: center;

        .name {
          font-size: 13px;
          font-weight: bold;
        }

        .time {
          font-size: 11px;
          color: var(--text-color-light);
        }
      }

      .comment-text {
        font-size: 13px;
        margin-top: 4px;
      }
    }
  }

  .comment-input {
    margin-top: 12px;
  }
}

.publish-button {
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 56px;
  height: 56px;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}
</style>
