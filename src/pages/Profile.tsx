import { motion } from 'framer-motion';
import { useStore } from '../stores/useStore';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import {
  Flame,
  BookOpen,
  Clock,
  Trophy,
  Edit3,
  Settings,
  ChevronRight,
  Zap,
  Star,
  Bell,
  Globe,
  HelpCircle
} from 'lucide-react';

export default function Profile() {
  const { user, achievements, courses } = useStore();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">请先登录</p>
      </div>
    );
  }

  const unlockedAchievements = achievements.filter((a) => a.unlocked).length;
  const totalAchievements = achievements.length;

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <div className="max-w-4xl mx-auto px-4 pt-24 lg:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-600/20 to-purple-600/20 rounded-full blur-3xl" />

            <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.nickname}
                  className="w-28 h-28 rounded-full border-4 border-violet-500 shadow-2xl shadow-violet-500/20"
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center border-2 border-slate-900">
                  <Star size={20} className="text-white fill-white" />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{user.nickname}</h1>
                  <Badge variant="info" size="md">Lv.{user.level}</Badge>
                </div>
                <p className="text-slate-400 mb-4">{user.email}</p>

                <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 border border-violet-500/30 rounded-full">
                  <Zap size={16} className="text-violet-400" />
                  <span className="text-violet-300">{user.exp} 经验值</span>
                </div>
              </div>

              <button className="p-3 bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-colors">
                <Edit3 size={20} />
              </button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{user.streak}</p>
                <p className="text-sm text-slate-400">连续学习天数</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{user.totalWordsLearned}</p>
                <p className="text-sm text-slate-400">已学单词</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{Math.floor(user.totalMinutesLearned / 60)}h</p>
                <p className="text-sm text-slate-400">学习时长</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">学习进度</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {user.learningLanguages.map((lang) => {
              const langCourses = courses.filter((c) => c.language === lang);
              const totalProgress = langCourses.reduce((acc, c) => {
                return acc + (c.completedLessons / c.totalLessons) * 100;
              }, 0) / (langCourses.length || 1);

              return (
                <Card key={lang} className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center ${
                    lang === 'en' ? 'bg-blue-500/20' :
                    lang === 'ja' ? 'bg-pink-500/20' : 'bg-violet-500/20'
                  }`}>
                    <span className="text-3xl">
                      {lang === 'en' ? '🇬🇧' : lang === 'ja' ? '🇯🇵' : '🇰🇷'}
                    </span>
                  </div>
                  <p className="font-bold text-white mb-1">
                    {lang === 'en' ? '英语' : lang === 'ja' ? '日语' : '韩语'}
                  </p>
                  <p className="text-sm text-slate-400">{Math.round(totalProgress)}% 完成</p>
                </Card>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">成就概览</h2>
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Trophy size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {unlockedAchievements} / {totalAchievements}
                  </p>
                  <p className="text-sm text-slate-400">已解锁成就</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-violet-400">
                <span>查看全部</span>
                <ChevronRight size={18} />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">设置</h2>
          <Card>
            <div className="space-y-4">
              {[
                { icon: Settings, label: '账号设置' },
                { icon: Bell, label: '通知设置' },
                { icon: Globe, label: '语言偏好' },
                { icon: HelpCircle, label: '帮助与反馈' }
              ].map((item, index) => (
                <button
                  key={index}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className="text-slate-400" />
                    <span className="text-white">{item.label}</span>
                  </div>
                  <ChevronRight size={18} className="text-slate-500" />
                </button>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
