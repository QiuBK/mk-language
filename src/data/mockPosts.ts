import { Post } from '../types';

export const mockPosts: Post[] = [
  {
    id: 'post-1',
    authorId: 'user-1',
    authorName: '语言爱好者',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    content: '学习英语三个月了，从零基础到现在能进行简单对话，感觉进步很大！分享一下我的学习方法：每天早起听英语播客，午餐时间背单词，晚上练习口语。希望大家也能坚持下去！💪',
    likes: 128,
    comments: [
      {
        id: 'comment-1',
        authorId: 'user-2',
        authorName: '日语达人',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
        content: '太棒了！我也是用类似的方法学习日语，坚持真的很重要！',
        createdAt: '2024-01-15T10:30:00Z'
      }
    ],
    language: 'en',
    tags: ['学习方法', '英语', '进步'],
    createdAt: '2024-01-15T08:00:00Z',
    liked: false
  },
  {
    id: 'post-2',
    authorId: 'user-3',
    authorName: '韩剧迷',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mimi',
    content: '推荐一个超好用的韩语学习APP！通过看韩剧学韩语真的很有趣，朋友们都说我发音越来越地道了。有没有人也在追《黑暗荣耀》？一起来交流呀～',
    images: ['https://images.unsplash.com/photo-1538485399081-7191377e8241?w=400&h=300&fit=crop'],
    likes: 256,
    comments: [
      {
        id: 'comment-2',
        authorId: 'user-4',
        authorName: '韩语小白',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bobby',
        content: '我也是韩剧迷！正在用这个APP，感觉确实不错～',
        createdAt: '2024-01-14T16:20:00Z'
      }
    ],
    language: 'ko',
    tags: ['韩语', '韩剧', '学习方法'],
    createdAt: '2024-01-14T15:00:00Z',
    liked: true
  },
  {
    id: 'post-3',
    authorId: 'user-5',
    authorName: '日语学习者',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
    content: '五十音图终于背完了！虽然过程很痛苦，但是很有成就感。接下来开始学习基本的语法和单词，有没有一起打卡的小伙伴？🙋‍♀️',
    likes: 89,
    comments: [],
    language: 'ja',
    tags: ['日语', '五十音', '打卡'],
    createdAt: '2024-01-13T12:00:00Z',
    liked: false
  },
  {
    id: 'post-4',
    authorId: 'user-6',
    authorName: '英语老师',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    content: '给初学者的建议：不要害怕犯错！语言学习就是一个不断犯错、不断纠正的过程。我的学生里，那些敢于开口的进步最快。大家加油！',
    likes: 345,
    comments: [
      {
        id: 'comment-3',
        authorId: 'user-7',
        authorName: '学习小白',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily',
        content: '老师说得对！我之前就是太害怕说错了，结果一直不敢开口...',
        createdAt: '2024-01-12T09:15:00Z'
      }
    ],
    language: 'en',
    tags: ['英语', '学习方法', '建议'],
    createdAt: '2024-01-12T08:30:00Z',
    liked: true
  },
  {
    id: 'post-5',
    authorId: 'user-8',
    authorName: '学习打卡王',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
    content: '今日学习打卡 ✅\n📚 学习时长：2小时\n📝 新学单词：25个\n🎯 完成目标：听力训练\n\n连续学习第45天！距离下一个徽章只差5天了，冲鸭！🔥',
    likes: 67,
    comments: [
      {
        id: 'comment-4',
        authorId: 'user-9',
        authorName: '萌新',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom',
        content: '太强了！我才坚持7天，要向你学习！',
        createdAt: '2024-01-11T20:45:00Z'
      }
    ],
    language: 'ko',
    tags: ['打卡', '学习记录', '坚持'],
    createdAt: '2024-01-11T19:00:00Z',
    liked: false
  }
];

export const studyGroups = [
  { id: 'group-1', name: '英语口语练习群', members: 1234, language: 'en', description: '每日英语口语对练' },
  { id: 'group-2', name: '日语N1备考小组', members: 856, language: 'ja', description: '一起备考日语能力考' },
  { id: 'group-3', name: '韩语追星族', members: 2341, language: 'ko', description: '通过K-pop学韩语' },
  { id: 'group-4', name: '早起晨读团', members: 678, language: 'en', description: '每天早上7点晨读' },
];
