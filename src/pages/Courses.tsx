import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../stores/useStore';
import { CourseList } from '../components/course/CourseList';

const languages = [
  { code: 'en' as const, name: '英语', flag: '🇬🇧' },
  { code: 'ja' as const, name: '日语', flag: '🇯🇵' },
  { code: 'ko' as const, name: '韩语', flag: '🇰🇷' }
];

const levels = [
  { value: 'all', label: '全部' },
  { value: 'beginner', label: '初级' },
  { value: 'intermediate', label: '中级' },
  { value: 'advanced', label: '高级' }
];

export default function Courses() {
  const { courses, currentLanguage } = useStore();
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ja' | 'ko'>(currentLanguage);
  const [selectedLevel, setSelectedLevel] = useState('all');

  const filteredCourses = courses.filter((course) => {
    const languageMatch = course.language === selectedLanguage;
    const levelMatch = selectedLevel === 'all' || course.level === selectedLevel;
    return languageMatch && levelMatch;
  });

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 pt-24 lg:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">课程中心</h1>
          <p className="text-slate-400">
            选择适合你的课程，开启语言学习之旅
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-3 mb-6">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                  selectedLanguage === lang.code
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 border border-slate-700/50'
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {levels.map((level) => (
              <button
                key={level.value}
                onClick={() => setSelectedLevel(level.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedLevel === level.value
                    ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {filteredCourses.length > 0 ? (
            <CourseList courses={filteredCourses} />
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📚</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">暂无课程</h3>
              <p className="text-slate-400">
                该分类下暂无课程，敬请期待！
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
