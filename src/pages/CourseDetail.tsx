import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../stores/useStore';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { ProgressRing } from '../components/common/ProgressRing';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  CheckCircle2,
  Circle,
  Play
} from 'lucide-react';

const languageInfo = {
  en: { flag: '🇬🇧', name: '英语' },
  ja: { flag: '🇯🇵', name: '日语' },
  ko: { flag: '🇰🇷', name: '韩语' }
};

const levelLabels = {
  beginner: { label: '初级', variant: 'success' as const },
  intermediate: { label: '中级', variant: 'warning' as const },
  advanced: { label: '高级', variant: 'info' as const }
};

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { courses } = useStore();

  const course = courses.find((c) => c.id === id);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">课程未找到</h2>
          <Link to="/courses" className="text-violet-400 hover:text-violet-300">
            返回课程列表
          </Link>
        </div>
      </div>
    );
  }

  const lang = languageInfo[course.language];
  const level = levelLabels[course.level];
  const progress = (course.completedLessons / course.totalLessons) * 100;

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <div className="max-w-5xl mx-auto px-4 pt-24 lg:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            返回课程列表
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-3xl overflow-hidden mb-8"
        >
          <div className="absolute inset-0">
            <img
              src={course.coverImage}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/70" />
          </div>

          <div className="relative p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="info">{lang.flag} {lang.name}</Badge>
                  <Badge variant={level.variant}>{level.label}</Badge>
                </div>

                <h1 className="text-4xl font-bold text-white mb-2">{course.title}</h1>
                <p className="text-xl text-slate-300 mb-4">{course.titleCn}</p>
                <p className="text-slate-400 mb-6 max-w-2xl">{course.description}</p>

                <div className="flex items-center gap-6 text-sm text-slate-400">
                  <span className="flex items-center gap-2">
                    <BookOpen size={18} />
                    {course.totalLessons} 课时
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock size={18} />
                    {course.duration} 分钟
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <ProgressRing progress={progress} size={120} strokeWidth={8} />
                <p className="text-slate-400 mt-3">
                  已完成 {course.completedLessons}/{course.totalLessons}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">课程内容</h2>

          <div className="space-y-3">
            {course.lessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <Card hover={!lesson.completed} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700/50 text-slate-400 font-medium">
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <h3 className={`font-medium ${lesson.completed ? 'text-slate-400' : 'text-white'}`}>
                      {lesson.title}
                    </h3>
                    <p className="text-sm text-slate-500 capitalize">{lesson.type}</p>
                  </div>

                  {lesson.completed ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 size={20} />
                      <span className="text-sm">已完成</span>
                    </div>
                  ) : (
                    <Link
                      to={`/learn/${lesson.type}`}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-500 transition-colors"
                    >
                      <Play size={16} />
                      开始学习
                    </Link>
                  )}
                </Card>
              </motion.div>
            ))}

            {course.lessons.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400">该课程暂无课时内容</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
