import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useStore } from '../stores/useStore';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { ProgressRing } from '../components/common/ProgressRing';
import {
  Flame,
  BookOpen,
  Clock,
  Trophy,
  GraduationCap,
  Mic,
  Headphones,
  Target,
  TrendingUp,
  Zap,
  ChevronRight
} from 'lucide-react';

const languageInfo = {
  en: { flag: '🇬🇧', name: '英语', color: 'from-blue-500 to-cyan-500' },
  ja: { flag: '🇯🇵', name: '日语', color: 'from-pink-500 to-rose-500' },
  ko: { flag: '🇰🇷', name: '韩语', color: 'from-violet-500 to-purple-500' }
};

const quickActions = [
  { icon: GraduationCap, label: '背单词', color: 'bg-emerald-500', path: '/learn/vocabulary' },
  { icon: Mic, label: '口语练习', color: 'bg-pink-500', path: '/learn/speaking' },
  { icon: Headphones, label: '听力训练', color: 'bg-blue-500', path: '/learn/listening' },
  { icon: BookOpen, label: '语法学习', color: 'bg-orange-500', path: '/courses' }
];

export default function Home() {
  const { user, courses, dailyTasks, completeTask, currentLanguage } = useStore();
  const lang = languageInfo[currentLanguage];

  const currentCourse = courses.find(
    (c) => c.language === currentLanguage && c.completedLessons < c.totalLessons
  );

  const progress = currentCourse
    ? (currentCourse.completedLessons / currentCourse.totalLessons) * 100
    : 0;

  const completedTasksCount = dailyTasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 pt-24 lg:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            你好, {user?.nickname || '游客'}! 👋
          </h1>
          <p className="text-slate-400">
            继续保持学习热情，今天也要有新的收获！
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-r ${lang.color} opacity-10`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <Badge variant="info" className="mb-2">
                      {lang.flag} {lang.name}
                    </Badge>
                    <h2 className="text-2xl font-bold text-white">
                      {currentCourse?.title || '开始你的学习之旅'}
                    </h2>
                    <p className="text-slate-400 mt-1">
                      {currentCourse?.titleCn || '选择一个课程开始学习'}
                    </p>
                  </div>
                  {currentCourse && (
                    <ProgressRing progress={progress} size={80} />
                  )}
                </div>

                {currentCourse ? (
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-6 text-sm text-slate-400 mb-4">
                        <span className="flex items-center gap-1">
                          <BookOpen size={16} />
                          {currentCourse.completedLessons}/{currentCourse.totalLessons} 课
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={16} />
                          {currentCourse.duration} 分钟
                        </span>
                      </div>
                      <Link
                        to={`/courses/${currentCourse.id}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/25"
                      >
                        继续学习
                        <ChevronRight size={18} />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/courses"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-500 hover:to-purple-500 transition-all"
                  >
                    浏览课程
                    <ChevronRight size={18} />
                  </Link>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">今日任务</h3>
                <span className="text-sm text-slate-400">
                  {completedTasksCount}/{dailyTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {dailyTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => !task.completed && completeTask(task.id)}
                    disabled={task.completed}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      task.completed
                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                        : 'bg-slate-700/50 border border-slate-600/50 hover:border-violet-500/30 hover:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        task.completed
                          ? 'bg-emerald-500 text-white'
                          : 'border-2 border-slate-500'
                      }`}
                    >
                      {task.completed && '✓'}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-sm ${task.completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                        {task.title}
                      </p>
                    </div>
                    <span className="text-xs text-violet-400">+{task.exp}exp</span>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-4">快捷学习</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Link to={action.path}>
                  <Card hover className="text-center">
                    <div className={`w-14 h-14 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                      <action.icon size={28} className="text-white" />
                    </div>
                    <p className="text-white font-medium">{action.label}</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">学习数据</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Flame size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{user?.streak || 0}</p>
                  <p className="text-sm text-slate-400">连续学习</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <BookOpen size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{user?.totalWordsLearned || 0}</p>
                  <p className="text-sm text-slate-400">已学单词</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Zap size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{user?.exp || 0}</p>
                  <p className="text-sm text-slate-400">总经验值</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Clock size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{Math.floor((user?.totalMinutesLearned || 0) / 60)}</p>
                  <p className="text-sm text-slate-400">学习小时</p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
