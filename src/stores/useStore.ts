import { create } from 'zustand';
import { User, Course, Achievement, Post, DailyTask } from '../types';
import { courses as initialCourses, dailyTasks as initialTasks } from '../data/courses';
import { achievements as initialAchievements } from '../data/achievements';
import { mockPosts } from '../data/mockPosts';

interface AppStore {
  user: User | null;
  isAuthenticated: boolean;
  currentLanguage: 'en' | 'ja' | 'ko';
  courses: Course[];
  achievements: Achievement[];
  posts: Post[];
  dailyTasks: DailyTask[];
  
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  setCurrentLanguage: (lang: 'en' | 'ja' | 'ko') => void;
  updateCourseProgress: (courseId: string, lessonId: string) => void;
  completeTask: (taskId: string) => void;
  toggleLikePost: (postId: string) => void;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>) => void;
  addComment: (postId: string, comment: Omit<import('../types').Comment, 'id' | 'createdAt'>) => void;
  checkAchievements: () => void;
}

const defaultUser: User = {
  id: 'user-current',
  email: 'learner@linguaworld.com',
  nickname: '语言探索者',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Learner',
  level: 5,
  exp: 1250,
  joinDate: '2024-01-01',
  nativeLanguage: 'zh',
  learningLanguages: ['en', 'ja', 'ko'],
  streak: 15,
  totalWordsLearned: 156,
  totalMinutesLearned: 480
};

export const useStore = create<AppStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  currentLanguage: 'en',
  courses: initialCourses,
  achievements: initialAchievements,
  posts: mockPosts,
  dailyTasks: initialTasks,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: (email, password) => {
    if (email && password.length >= 6) {
      set({ user: { ...defaultUser, email }, isAuthenticated: true });
      return true;
    }
    return false;
  },

  logout: () => set({ user: null, isAuthenticated: false }),

  setCurrentLanguage: (lang) => set({ currentLanguage: lang }),

  updateCourseProgress: (courseId, lessonId) => {
    set((state) => ({
      courses: state.courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              lessons: course.lessons.map((lesson) =>
                lesson.id === lessonId ? { ...lesson, completed: true } : lesson
              ),
              completedLessons: course.lessons.filter((l) => l.completed).length + 1
            }
          : course
      ),
      user: state.user
        ? {
            ...state.user,
            exp: state.user.exp + 20,
            totalWordsLearned: state.user.totalWordsLearned + 3
          }
        : null
    }));
    get().checkAchievements();
  },

  completeTask: (taskId) => {
    set((state) => ({
      dailyTasks: state.dailyTasks.map((task) =>
        task.id === taskId ? { ...task, completed: true } : task
      ),
      user: state.user
        ? {
            ...state.user,
            exp: state.user.exp + state.dailyTasks.find((t) => t.id === taskId)?.exp || 0
          }
        : null
    }));
  },

  toggleLikePost: (postId) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
              liked: !post.liked
            }
          : post
      )
    }));
  },

  addPost: (postData) => {
    const newPost: Post = {
      ...postData,
      id: `post-${Date.now()}`,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString()
    };
    set((state) => ({ posts: [newPost, ...state.posts] }));
    get().checkAchievements();
  },

  addComment: (postId, commentData) => {
    const newComment: import('../types').Comment = {
      ...commentData,
      id: `comment-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      )
    }));
  },

  checkAchievements: () => {
    const state = get();
    if (!state.user) return;

    const newAchievements = state.achievements.map((achievement) => {
      if (achievement.unlocked) return achievement;

      let shouldUnlock = false;

      switch (achievement.id) {
        case 'streak-7':
          shouldUnlock = state.user.streak >= 7;
          break;
        case 'streak-30':
          shouldUnlock = state.user.streak >= 30;
          break;
        case 'vocab-100':
          shouldUnlock = state.user.totalWordsLearned >= 100;
          break;
        case 'vocab-500':
          shouldUnlock = state.user.totalWordsLearned >= 500;
          break;
        case 'level-5':
          shouldUnlock = state.user.level >= 5;
          break;
        case 'level-10':
          shouldUnlock = state.user.level >= 10;
          break;
      }

      if (shouldUnlock) {
        return { ...achievement, unlocked: true, unlockedAt: new Date().toISOString() };
      }
      return achievement;
    });

    set({ achievements: newAchievements });
  }
}));
