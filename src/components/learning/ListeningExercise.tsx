import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, SkipBack, SkipForward, CheckCircle2 } from 'lucide-react';

interface ListeningExerciseProps {
  audioUrl?: string;
  transcript: string;
  translation: string;
  onComplete: () => void;
}

const mockSentences = [
  { en: 'The early bird catches the worm.', cn: '早起的鸟儿有虫吃。' },
  { en: 'Practice makes perfect.', cn: '熟能生巧。' },
  { en: 'Where there is a will, there is a way.', cn: '有志者事竟成。' }
];

export function ListeningExercise({ transcript, translation, onComplete }: ListeningExerciseProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [comprehension, setComprehension] = useState<'good' | 'ok' | 'poor' | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSentence = mockSentences[currentIndex];

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setTimeout(() => setIsPlaying(false), 3000);
    }
  };

  const handleNext = () => {
    if (currentIndex < mockSentences.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setComprehension(null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
      setComprehension(null);
    }
  };

  const handleComprehension = (level: 'good' | 'ok' | 'poor') => {
    setComprehension(level);
    setTimeout(() => {
      if (currentIndex === mockSentences.length - 1) {
        onComplete();
      } else {
        handleNext();
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] p-6">
      <div className="w-full max-w-2xl">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-lg text-slate-400 mb-4">听力练习 {currentIndex + 1} / {mockSentences.length}</h3>
            
            <div className="w-full h-1 bg-slate-700 rounded-full mb-6">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / mockSentences.length) * 100}%` }}
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
              />
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-2xl p-6 mb-6">
            <p className="text-2xl text-center text-white mb-4 font-medium">
              {showAnswer ? currentSentence.en : '🔊 播放中...'}
            </p>
            {showAnswer && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-slate-400"
              >
                {currentSentence.cn}
              </motion.p>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 mb-8">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-3 rounded-full bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-30"
            >
              <SkipBack size={24} />
            </button>

            <motion.button
              onClick={handlePlayPause}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-violet-500/30"
            >
              {isPlaying ? (
                <Pause size={32} className="text-white" />
              ) : (
                <Play size={32} className="text-white ml-1" />
              )}
            </motion.button>

            <button
              onClick={handleNext}
              disabled={currentIndex === mockSentences.length - 1}
              className="p-3 rounded-full bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-30"
            >
              <SkipForward size={24} />
            </button>
          </div>

          <div className="flex justify-center mb-6">
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <Volume2 size={18} />
              {showAnswer ? '隐藏答案' : '查看原文'}
            </button>
          </div>

          {showAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-slate-700 pt-6"
            >
              <p className="text-center text-sm text-slate-400 mb-4">听懂了吗？</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleComprehension('good')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    comprehension === 'good'
                      ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400'
                      : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  完全听懂 ✓
                </button>
                <button
                  onClick={() => handleComprehension('ok')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    comprehension === 'ok'
                      ? 'bg-orange-500/20 border-2 border-orange-500 text-orange-400'
                      : 'bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
                  }`}
                >
                  部分听懂
                </button>
                <button
                  onClick={() => handleComprehension('poor')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    comprehension === 'poor'
                      ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                      : 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20'
                  }`}
                >
                  听不懂
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
