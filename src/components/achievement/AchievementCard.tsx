import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Achievement as AchievementType } from '../../types';
import {
  Flame,
  BookOpen,
  Headphones,
  Mic,
  Users,
  Star,
  Trophy,
  Zap,
  Award,
  GraduationCap,
  Heart,
  Lock
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Flame,
  BookOpen,
  Headphones,
  Mic,
  Users,
  Star,
  Trophy,
  Zap,
  Award,
  GraduationCap,
  Heart
};

interface AchievementCardProps {
  achievement: AchievementType;
  index?: number;
}

export function AchievementCard({ achievement, index = 0 }: AchievementCardProps) {
  const Icon = iconMap[achievement.icon] || Award;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`relative p-5 rounded-2xl border transition-all duration-300 ${
        achievement.unlocked
          ? 'bg-gradient-to-br from-violet-600/20 to-purple-600/20 border-violet-500/30 hover:border-violet-400/50'
          : 'bg-slate-800/30 border-slate-700/30 opacity-60'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center ${
            achievement.unlocked
              ? 'bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/30'
              : 'bg-slate-700/50'
          }`}
        >
          {achievement.unlocked ? (
            <Icon size={28} className="text-white" />
          ) : (
            <Lock size={24} className="text-slate-500" />
          )}
        </div>

        <div className="flex-1">
          <h3 className={`font-bold mb-1 ${achievement.unlocked ? 'text-white' : 'text-slate-400'}`}>
            {achievement.title}
          </h3>
          <p className="text-sm text-slate-400 mb-2">{achievement.description}</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-violet-400 bg-violet-500/20 px-2 py-1 rounded-full">
              +{achievement.reward} 经验
            </span>
            {achievement.unlocked && achievement.unlockedAt && (
              <span className="text-xs text-slate-500">
                {new Date(achievement.unlockedAt).toLocaleDateString('zh-CN')}
              </span>
            )}
          </div>
        </div>
      </div>

      {achievement.unlocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
        >
          <Star size={14} className="text-white fill-white" />
        </motion.div>
      )}
    </motion.div>
  );
}
