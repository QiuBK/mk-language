<template>
  <div class="community-page">
    <header class="page-header">
      <h1>社区</h1>
    </header>

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
              <img :src="post.user_avatar || defaultAvatar" :alt="post.user_name" class="avatar" />
              <div class="info">
                <span class="name">{{ post.user_name }}</span>
                <span class="time">{{ formatTime(post.create_time) }}</span>
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
            <div class="action-item" @click="toggleComments(post)">
              <el-icon><ChatLineSquare /></el-icon>
              <span>{{ post.comments_count || 0 }}</span>
            </div>
            <div class="action-item">
              <el-icon><Share /></el-icon>
              <span>分享</span>
            </div>
          </div>

          <div v-if="post.showComments" class="comments-section">
            <div v-if="post.comments?.length" class="comments-list">
              <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
                <img :src="comment.user_avatar || defaultAvatar" :alt="comment.user_name" class="comment-avatar" />
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="name">{{ comment.user_name }}</span>
                    <span class="time">{{ formatTime(comment.create_time) }}</span>
                  </div>
                  <p class="comment-text">{{ comment.content }}</p>
                </div>
              </div>
            </div>

            <div class="comment-input">
              <el-input
                v-model="commentText[post.id]"
                placeholder="写下你的评论..."
                size="small"
                @keyup.enter="submitComment(post)"
              >
                <template #append>
                  <el-button @click="submitComment(post)" :disabled="!commentText[post.id]?.trim()">发送</el-button>
                </template>
              </el-input>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-button class="publish-button" type="primary" circle @click="showPublishDialog = true">
      <el-icon><Edit /></el-icon>
    </el-button>

    <el-dialog v-model="showPublishDialog" title="发布动态" width="90%">
      <el-input
        v-model="newPostContent"
        type="textarea"
        :rows="4"
        placeholder="分享你的学习心得..."
        maxlength="500"
        show-word-limit
      />
      <div class="language-select">
        <span class="label">选择语言：</span>
        <el-radio-group v-model="selectedLanguage" size="small">
          <el-radio-button label="">不选择</el-radio-button>
          <el-radio-button label="en">🇬🇧 英语</el-radio-button>
          <el-radio-button label="ja">🇯🇵 日语</el-radio-button>
          <el-radio-button label="ko">🇰🇷 韩语</el-radio-button>
        </el-radio-group>
      </div>
      <template #footer>
        <el-button @click="showPublishDialog = false">取消</el-button>
        <el-button type="primary" @click="handlePublish" :loading="publishing">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Loading, Star, ChatLineSquare, Share, Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { getPostList, getPostComments, likePost, createPost, createComment, type Post, type Comment } from '@/api/post'

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
const userStore = useUserStore()

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
const selectedLanguage = ref('')
const publishing = ref(false)
const commentText = reactive<Record<number, string>>({})

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

const loadPosts = async () => {
  loading.value = true
  try {
    let params: Record<string, any> = {}
    if (selectedTag.value) {
      if (['en', 'ja', 'ko'].includes(selectedTag.value)) {
        params.language = selectedTag.value
      } else {
        params.tag = selectedTag.value
      }
    }

    const result = await getPostList(params)

    if (result.code === 200) {
      posts.value = result.data.map((p: any) => ({
        ...p,
        showComments: false,
        comments: []
      }))
    } else {
      ElMessage.error(result.message || '获取帖子列表失败')
    }
  } catch (err) {
    console.error('获取帖子列表失败:', err)
    ElMessage.error('获取帖子列表失败')
  } finally {
    loading.value = false
  }
}

const toggleComments = async (post: Post) => {
  post.showComments = !post.showComments

  if (post.showComments && post.comments?.length === 0) {
    await loadComments(post)
  }
}

const loadComments = async (post: Post) => {
  try {
    const result = await getPostComments(post.id)

    if (result.code === 200) {
      post.comments = result.data
    }
  } catch (err) {
    console.error('获取评论失败:', err)
  }
}

const handleLike = async (post: Post) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    const result = await likePost(post.id)

    if (result.code === 200) {
      post.liked = !post.liked
      post.likes += post.liked ? 1 : -1
    } else {
      ElMessage.error(result.message)
    }
  } catch (err) {
    console.error('点赞失败:', err)
    ElMessage.error('操作失败')
  }
}

const submitComment = async (post: Post) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  const content = commentText[post.id]?.trim()
  if (!content) return

  try {
    const result = await createComment(post.id, { content })

    if (result.code === 200) {
      ElMessage.success('评论成功')
      if (!post.comments) {
        post.comments = []
      }
      post.comments.push(result.data)
      post.comments_count = (post.comments_count || 0) + 1
      commentText[post.id] = ''
    } else {
      ElMessage.error(result.message || '评论失败')
    }
  } catch (err) {
    console.error('评论失败:', err)
    ElMessage.error('评论失败')
  }
}

const handlePublish = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  if (!newPostContent.value.trim()) {
    ElMessage.warning('请输入内容')
    return
  }

  publishing.value = true
  try {
    const result = await createPost({
      content: newPostContent.value,
      language: selectedLanguage.value || undefined
    })

    if (result.code === 200) {
      ElMessage.success('发布成功')
      showPublishDialog.value = false
      newPostContent.value = ''
      selectedLanguage.value = ''
      await loadPosts()
    } else {
      ElMessage.error(result.message || '发布失败')
    }
  } catch (err) {
    console.error('发布失败:', err)
    ElMessage.error('发布失败')
  } finally {
    publishing.value = false
  }
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

.loading-container {
  display: flex;
  justify-content: center;
  padding: 40px;
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
    word-break: break-word;
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

  .comments-section {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border-color);
  }

  .comments-list {
    margin-bottom: 12px;
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
        color: var(--text-color);
      }
    }
  }

  .comment-input {
    margin-top: 8px;
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

.language-select {
  margin-top: 16px;

  .label {
    font-size: 14px;
    color: var(--text-color-light);
    margin-bottom: 8px;
    display: block;
  }
}
</style>
