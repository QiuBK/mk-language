import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../stores/useStore';
import { AchievementCard } from '../components/achievement/AchievementCard';
import { Card } from '../components/common/Card';
import {
  Flame,
  BookOpen,
  Headphones,
  Mic,
  Users,
  Star,
  Trophy,
  Filter
} from 'lucide-react';

const categories = [
  { value: 'all', label: '全部', icon: Star },
  { value: 'streak', label: '连续学习', icon: Flame },
  { value: 'vocabulary', label: '词汇', icon: BookOpen },
  { value: 'listening', label: '听力', icon: Headphones },
  { value: 'speaking', label: '口语', icon: Mic },
  { value: 'social', label: '社交', icon: Users }
];

export default function Achievements() {
  const { achievements } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredAchievements = achievements.filter(
    (a) => selectedCategory === 'all' || a.category === selectedCategory
  );

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const totalReward = achievements
    .filter((a) => a.unlocked)
    .reduce((acc, a) => acc + a.reward, 0);

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <div className="max-w-5xl mx-auto px-4 pt-24 lg:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">成就中心</h1>
          <p className="text-slate-400">
            收集徽章，解锁成就，成为学习达人！
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Trophy size={28} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{unlockedCount}</p>
                <p className="text-sm text-slate-400">已解锁成就</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Star size={28} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalCount}</p>
                <p className="text-sm text-slate-400">总成就数</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Star size={28} className="text-white fill-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalReward}</p>
                <p className="text-sm text-slate-400">累计奖励经验</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                      : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50'
                  }`}
                >
                  <Icon size={16} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAchievements.map((achievement, index) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                index={index}
              />
            ))}
          </div>

          {filteredAchievements.length === 0 && (
            <Card className="text-center py-12">
              <p className="text-slate-400">该分类暂无成就</p>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
