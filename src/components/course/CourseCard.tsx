import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Course } from '../../types';
import { ProgressRing } from '../common/ProgressRing';
import { Badge } from '../common/Badge';
import { Clock, BookOpen } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  index?: number;
}

const levelLabels = {
  beginner: { label: '初级', variant: 'success' as const },
  intermediate: { label: '中级', variant: 'warning' as const },
  advanced: { label: '高级', variant: 'info' as const }
};

const languageLabels = {
  en: { label: '英语', flag: '🇬🇧' },
  ja: { label: '日语', flag: '🇯🇵' },
  ko: { label: '韩语', flag: '🇰🇷' }
};

export function CourseCard({ course, index = 0 }: CourseCardProps) {
  const progress = (course.completedLessons / course.totalLessons) * 100;
  const level = levelLabels[course.level];
  const language = languageLabels[course.language];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to={`/courses/${course.id}`}>
        <div className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-violet-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10">
          <div className="relative h-40 overflow-hidden">
            <img
              src={course.coverImage}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge variant="info">{language.flag} {language.label}</Badge>
              <Badge variant={level.variant}>{level.label}</Badge>
            </div>
          </div>

          <div className="p-5">
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-violet-400 transition-colors">
              {course.title}
            </h3>
            <p className="text-sm text-slate-400 mb-4">{course.titleCn}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <BookOpen size={14} />
                  {course.totalLessons}课
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {course.duration}分钟
                </span>
              </div>

              {course.completedLessons > 0 ? (
                <ProgressRing progress={progress} size={48} strokeWidth={4} />
              ) : (
                <div className="px-3 py-1.5 bg-violet-600 text-white text-sm rounded-lg font-medium group-hover:bg-violet-500 transition-colors">
                  开始学习
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
