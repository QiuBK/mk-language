import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Exercise } from '../../types';
import { Check, X, Lightbulb } from 'lucide-react';

interface GrammarExerciseProps {
  exercise: Exercise;
  onComplete: (correct: boolean) => void;
  index: number;
  total: number;
}

export function GrammarExercise({ exercise, onComplete, index, total }: GrammarExerciseProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    setShowResult(true);
    const isCorrect = selectedAnswer === exercise.answer;
    setTimeout(() => {
      onComplete(isCorrect);
      setSelectedAnswer(null);
      setShowResult(false);
    }, 1500);
  };

  const getOptionClass = (option: string) => {
    if (!showResult) {
      return selectedAnswer === option
        ? 'border-violet-500 bg-violet-500/20'
        : 'border-slate-700 hover:border-slate-500';
    }

    if (option === exercise.answer) {
      return 'border-emerald-500 bg-emerald-500/20 text-emerald-400';
    }

    if (option === selectedAnswer && option !== exercise.answer) {
      return 'border-red-500 bg-red-500/20 text-red-400';
    }

    return 'border-slate-700 opacity-50';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <div className="text-sm text-slate-400 mb-6">
        {index + 1} / {total}
      </div>

      <motion.div
        key={exercise.id}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
          <h3 className="text-xl text-white mb-8 text-center font-medium">
            {exercise.question}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {exercise.options?.map((option, i) => (
              <button
                key={i}
                onClick={() => !showResult && setSelectedAnswer(option)}
                disabled={showResult}
                className={`p-4 rounded-xl border-2 text-left transition-all ${getOptionClass(option)}`}
              >
                <span className="text-sm text-slate-400 mr-2">{String.fromCharCode(65 + i)}.</span>
                <span className="text-white">{option}</span>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-4 rounded-xl ${
                  selectedAnswer === exercise.answer
                    ? 'bg-emerald-500/20 border border-emerald-500/30'
                    : 'bg-red-500/20 border border-red-500/30'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {selectedAnswer === exercise.answer ? (
                    <>
                      <Check className="text-emerald-400" size={20} />
                      <span className="text-emerald-400 font-medium">回答正确！</span>
                    </>
                  ) : (
                    <>
                      <X className="text-red-400" size={20} />
                      <span className="text-red-400 font-medium">回答错误</span>
                    </>
                  )}
                </div>
                {exercise.explanation && (
                  <div className="flex items-start gap-2">
                    <Lightbulb className="text-violet-400 mt-0.5" size={16} />
                    <p className="text-slate-300 text-sm">{exercise.explanation}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!showResult && (
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className={`w-full mt-6 py-3 rounded-xl font-medium transition-colors ${
                selectedAnswer
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              确认答案
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
