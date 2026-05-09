import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Volume2, Star, RefreshCw } from 'lucide-react';

interface SpeakingPracticeProps {
  phrase: string;
  translation: string;
  onComplete: (score: number) => void;
}

export function SpeakingPractice({ phrase, translation, onComplete }: SpeakingPracticeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (isRecording && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!analyserRef.current || !ctx) return;
        
        requestAnimationFrame(draw);
        analyserRef.current.getByteFrequencyData(dataArray);

        ctx.fillStyle = 'rgb(30, 30, 50)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
          gradient.addColorStop(0, '#7c3aed');
          gradient.addColorStop(1, '#f97316');
          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      };

      draw();
    }
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setHasRecorded(false);
    setScore(null);
    setShowResult(false);

    setTimeout(() => {
      stopRecording();
    }, 5000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setHasRecorded(true);

    const mockScore = Math.floor(Math.random() * 20) + 80;
    setScore(mockScore);
    setShowResult(true);

    setTimeout(() => {
      onComplete(mockScore);
    }, 2000);
  };

  const getScoreColor = (s: number) => {
    if (s >= 90) return 'text-emerald-400';
    if (s >= 80) return 'text-violet-400';
    if (s >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreStars = (s: number) => {
    if (s >= 90) return 5;
    if (s >= 80) return 4;
    if (s >= 70) return 3;
    if (s >= 60) return 2;
    return 1;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] p-6">
      <div className="w-full max-w-2xl">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-10 text-center">
          <div className="mb-8">
            <p className="text-3xl font-bold text-white mb-3">{phrase}</p>
            <p className="text-slate-400">{translation}</p>
          </div>

          <canvas
            ref={canvasRef}
            width={400}
            height={100}
            className={`w-full h-24 rounded-xl mb-8 ${isRecording ? '' : 'hidden'}`}
          />

          {!isRecording && !showResult && (
            <motion.button
              onClick={startRecording}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-violet-500/30 mx-auto"
            >
              <Mic size={40} className="text-white" />
            </motion.button>
          )}

          {isRecording && (
            <motion.button
              onClick={stopRecording}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-red-500/30 mx-auto animate-pulse"
            >
              <Square size={32} className="text-white" />
            </motion.button>
          )}

          {showResult && score !== null && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <p className="text-6xl font-bold mb-4">
                <span className={getScoreColor(score)}>{score}</span>
                <span className="text-2xl text-slate-400">分</span>
              </p>
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={24}
                    className={i < getScoreStars(score) ? 'text-orange-400 fill-orange-400' : 'text-slate-600'}
                  />
                ))}
              </div>
              <p className="text-slate-400 mb-6">
                {score >= 90 ? '太棒了！发音非常标准！' :
                 score >= 80 ? '不错！继续练习会更好！' :
                 score >= 70 ? '还可以，多练习几遍吧！' :
                 '需要更多练习，加油！'}
              </p>
              <button
                onClick={() => {
                  setShowResult(false);
                  setHasRecorded(false);
                  setScore(null);
                }}
                className="flex items-center gap-2 mx-auto px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
              >
                <RefreshCw size={18} />
                再练一次
              </button>
            </motion.div>
          )}

          {!isRecording && !showResult && (
            <p className="text-slate-400 mt-6">
              点击麦克风开始录音
            </p>
          )}

          {isRecording && (
            <p className="text-red-400 mt-6 animate-pulse">
              录音中... 5秒后自动停止
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
