import { Course, DailyTask } from '../types';

export const courses: Course[] = [
  {
    id: 'en-beginner',
    language: 'en',
    title: 'English Essentials',
    titleCn: '英语基础入门',
    level: 'beginner',
    description: '从零开始学习英语，掌握日常交流必备词汇和语法',
    coverImage: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=300&fit=crop',
    totalLessons: 20,
    completedLessons: 5,
    duration: 120,
    lessons: [
      {
        id: 'en-beginner-1',
        title: 'Greetings',
        type: 'vocabulary',
        content: {
          words: [
            { id: '1', term: 'Hello', translation: '你好', pronunciation: '/həˈloʊ/', example: 'Hello, how are you?', exampleTranslation: '你好，你好吗？' },
            { id: '2', term: 'Goodbye', translation: '再见', pronunciation: '/ɡʊdˈbaɪ/', example: 'Goodbye, see you tomorrow!', exampleTranslation: '再见，明天见！' },
            { id: '3', term: 'Thank you', translation: '谢谢', pronunciation: '/θæŋk juː/', example: 'Thank you for your help.', exampleTranslation: '谢谢你的帮助。' },
          ]
        },
        completed: true
      },
      {
        id: 'en-beginner-2',
        title: 'Numbers 1-20',
        type: 'vocabulary',
        content: {
          words: [
            { id: '4', term: 'One', translation: '一', pronunciation: '/wʌn/', example: 'One apple, please.', exampleTranslation: '请给我一个苹果。' },
            { id: '5', term: 'Two', translation: '二', pronunciation: '/tuː/', example: 'Two tickets, please.', exampleTranslation: '请给我两张票。' },
          ]
        },
        completed: true
      }
    ]
  },
  {
    id: 'en-intermediate',
    language: 'en',
    title: 'Business English',
    titleCn: '商务英语',
    level: 'intermediate',
    description: '提升商务场景下的英语沟通能力',
    coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
    totalLessons: 30,
    completedLessons: 0,
    duration: 180,
    lessons: []
  },
  {
    id: 'ja-beginner',
    language: 'ja',
    title: '日本語の基礎',
    titleCn: '日语基础入门',
    level: 'beginner',
    description: '学习日语假名和日常用语',
    coverImage: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400&h=300&fit=crop',
    totalLessons: 25,
    completedLessons: 8,
    duration: 150,
    lessons: [
      {
        id: 'ja-beginner-1',
        title: 'あ行の五十音',
        type: 'vocabulary',
        content: {
          words: [
            { id: '1', term: 'あ', translation: 'a', pronunciation: 'a', example: 'あおい (blue)', exampleTranslation: '蓝色的' },
            { id: '2', term: 'い', translation: 'i', pronunciation: 'i', example: 'いぬ (dog)', exampleTranslation: '狗' },
            { id: '3', term: 'う', translation: 'u', pronunciation: 'u', example: 'うみ (sea)', exampleTranslation: '大海' },
          ]
        },
        completed: true
      }
    ]
  },
  {
    id: 'ko-beginner',
    language: 'ko',
    title: '한국어 기초',
    titleCn: '韩语基础入门',
    level: 'beginner',
    description: '学习韩文字母和基础会话',
    coverImage: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=400&h=300&fit=crop',
    totalLessons: 25,
    completedLessons: 3,
    duration: 150,
    lessons: [
      {
        id: 'ko-beginner-1',
        title: '한글 자모음',
        type: 'vocabulary',
        content: {
          words: [
            { id: '1', term: 'ㄱ', translation: 'g/k', pronunciation: 'giyeok', example: '가다 (去)', exampleTranslation: '去' },
            { id: '2', term: 'ㄴ', translation: 'n', pronunciation: 'nieun', example: '나 (我)', exampleTranslation: '我' },
            { id: '3', term: 'ㄷ', translation: 'd/t', pronunciation: 'digeut', example: '다 (多)', exampleTranslation: '多' },
          ]
        },
        completed: true
      }
    ]
  }
];

export const dailyTasks: DailyTask[] = [
  { id: 'task-1', title: '学习10个新单词', type: 'vocabulary', exp: 20, completed: false },
  { id: 'task-2', title: '完成1节语法课', type: 'grammar', exp: 30, completed: false },
  { id: 'task-3', title: '口语跟读练习', type: 'speaking', exp: 25, completed: false },
  { id: 'task-4', title: '听力训练10分钟', type: 'listening', exp: 20, completed: false },
  { id: 'task-5', title: '复习已学内容', type: 'review', exp: 15, completed: false },
];
