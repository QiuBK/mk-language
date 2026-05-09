export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar: string;
  level: number;
  exp: number;
  joinDate: string;
  nativeLanguage: string;
  learningLanguages: ('en' | 'ja' | 'ko')[];
  streak: number;
  totalWordsLearned: number;
  totalMinutesLearned: number;
}

export interface LessonContent {
  words?: Word[];
  exercises?: Exercise[];
  audioUrl?: string;
  transcript?: string;
}

export interface Word {
  id: string;
  term: string;
  translation: string;
  pronunciation?: string;
  example: string;
  exampleTranslation: string;
}

export interface Exercise {
  id: string;
  type: 'choice' | 'fill' | 'match';
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'vocabulary' | 'grammar' | 'speaking' | 'listening';
  content: LessonContent;
  completed: boolean;
}

export interface Course {
  id: string;
  language: 'en' | 'ja' | 'ko';
  title: string;
  titleCn: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  coverImage: string;
  totalLessons: number;
  completedLessons: number;
  duration: number;
  lessons: Lesson[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'vocabulary' | 'listening' | 'speaking' | 'social';
  requirement: number;
  reward: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  images?: string[];
  likes: number;
  comments: Comment[];
  language: string;
  tags: string[];
  createdAt: string;
  liked?: boolean;
}

export interface DailyTask {
  id: string;
  title: string;
  type: 'vocabulary' | 'grammar' | 'speaking' | 'listening' | 'review';
  exp: number;
  completed: boolean;
}
