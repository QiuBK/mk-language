import { Achievement } from '../types';

export const achievements: Achievement[] = [
  {
    id: 'streak-7',
    title: '坚持一周',
    description: '连续学习7天',
    icon: 'Flame',
    category: 'streak',
    requirement: 7,
    reward: 100,
    unlocked: true,
    unlockedAt: '2024-01-15'
  },
  {
    id: 'streak-30',
    title: '坚持一月',
    description: '连续学习30天',
    icon: 'Flame',
    category: 'streak',
    requirement: 30,
    reward: 500,
    unlocked: false
  },
  {
    id: 'vocab-100',
    title: '词汇达人',
    description: '学习100个单词',
    icon: 'BookOpen',
    category: 'vocabulary',
    requirement: 100,
    reward: 200,
    unlocked: true,
    unlockedAt: '2024-01-10'
  },
  {
    id: 'vocab-500',
    title: '词汇专家',
    description: '学习500个单词',
    icon: 'GraduationCap',
    category: 'vocabulary',
    requirement: 500,
    reward: 800,
    unlocked: false
  },
  {
    id: 'listening-10h',
    title: '听力训练师',
    description: '完成10小时听力训练',
    icon: 'Headphones',
    category: 'listening',
    requirement: 600,
    reward: 300,
    unlocked: false
  },
  {
    id: 'speaking-50',
    title: '开口说',
    description: '完成50次口语练习',
    icon: 'Mic',
    category: 'speaking',
    requirement: 50,
    reward: 300,
    unlocked: false
  },
  {
    id: 'social-first',
    title: '社区新人',
    description: '在社区发布第一条动态',
    icon: 'Users',
    category: 'social',
    requirement: 1,
    reward: 50,
    unlocked: true,
    unlockedAt: '2024-01-08'
  },
  {
    id: 'social-helper',
    title: '热心助人',
    description: '帮助解答10个问题',
    icon: 'Heart',
    category: 'social',
    requirement: 10,
    reward: 200,
    unlocked: false
  },
  {
    id: 'level-5',
    title: '初露锋芒',
    description: '达到5级',
    icon: 'Star',
    category: 'vocabulary',
    requirement: 5,
    reward: 150,
    unlocked: true,
    unlockedAt: '2024-01-12'
  },
  {
    id: 'level-10',
    title: '学有小成',
    description: '达到10级',
    icon: 'Trophy',
    category: 'vocabulary',
    requirement: 10,
    reward: 300,
    unlocked: false
  },
  {
    id: 'perfect-score',
    title: '满分达人',
    description: '获得一次满分',
    icon: 'Zap',
    category: 'vocabulary',
    requirement: 1,
    reward: 100,
    unlocked: true,
    unlockedAt: '2024-01-14'
  },
  {
    id: 'first-course',
    title: '起步课程',
    description: '完成第一个课程',
    icon: 'Award',
    category: 'vocabulary',
    requirement: 1,
    reward: 100,
    unlocked: false
  }
];
