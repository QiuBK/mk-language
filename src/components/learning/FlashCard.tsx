import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Word } from '../../types';
import { Volume2, Check, X, RotateCcw } from 'lucide-react';

interface FlashCardProps {
  word: Word;
  onComplete: (mastered: boolean) => void;
  index: number;
  total: number;
}

export function FlashCard({ word, onComplete, index, total }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleResponse = (mastered: boolean) => {
    setDirection(mastered ? 'right' : 'left');
    setTimeout(() => {
      onComplete(mastered);
      setIsFlipped(false);
      setDirection(null);
    }, 300);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="text-sm text-slate-400 mb-4">
        {index + 1} / {total}
      </div>

      <div className="relative w-full max-w-md h-72">
        <AnimatePresence mode="wait">
          <motion.div
            key={word.id}
            initial={{ x: direction === 'right' ? 300 : direction === 'left' ? -300 : 0, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction === 'right' ? -300 : direction === 'left' ? 300 : 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full h-full cursor-pointer"
            onClick={handleFlip}
          >
            <motion.div
              initial={false}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.5 }}
              className="relative w-full h-full"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div
                className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-purple-600/30 backdrop-blur-xl border border-violet-500/30 rounded-3xl flex flex-col items-center justify-center p-8"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <span className="text-4xl font-bold text-white mb-4">{word.term}</span>
                {word.pronunciation && (
                  <span className="text-slate-400 text-lg">[{word.pronunciation}]</span>
                )}
                <p className="text-violet-400 text-sm mt-6">点击查看释义</p>
              </div>

              <div
                className="absolute inset-0 bg-gradient-to-br from-emerald-600/30 to-teal-600/30 backdrop-blur-xl border border-emerald-500/30 rounded-3xl flex flex-col items-center justify-center p-8"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <span className="text-3xl font-bold text-white mb-2">{word.translation}</span>
                {word.pronunciation && (
                  <span className="text-slate-300 text-sm mb-4">[{word.pronunciation}]</span>
                )}
                <div className="mt-4 text-center">
                  <p className="text-white text-sm mb-1">例句:</p>
                  <p className="text-slate-300 text-sm italic">{word.example}</p>
                  <p className="text-slate-400 text-sm mt-1">{word.exampleTranslation}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {isFlipped && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4 mt-8"
        >
          <button
            onClick={() => handleResponse(false)}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
          >
            <X size={20} />
            <span>不认识</span>
          </button>
          <button
            onClick={() => handleResponse(true)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl hover:bg-emerald-500/30 transition-colors"
          >
            <Check size={20} />
            <span>记住了</span>
          </button>
        </motion.div>
      )}

      <button
        onClick={() => setIsFlipped(!isFlipped)}
        className="flex items-center gap-2 px-4 py-2 mt-4 text-slate-400 hover:text-white transition-colors"
      >
        <RotateCcw size={16} />
        <span>翻转卡片</span>
      </button>
    </div>
  );
}
