import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../stores/useStore';
import { FlashCard } from '../components/learning/FlashCard';
import { GrammarExercise } from '../components/learning/GrammarExercise';
import { SpeakingPractice } from '../components/learning/SpeakingPractice';
import { ListeningExercise } from '../components/learning/ListeningExercise';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Volume2
} from 'lucide-react';

const vocabularyWords = [
  { id: '1', term: 'Serendipity', translation: '意外发现美好事物的运气', pronunciation: '/ˌser.ənˈdɪp.ə.ti/', example: 'Finding that book was pure serendipity.', exampleTranslation: '找到那本书纯属意外之喜。' },
  { id: '2', term: 'Ephemeral', translation: '短暂的，瞬息的', pronunciation: '/ɪˈfem.ər.əl/', example: 'Fame can be ephemeral in the digital age.', exampleTranslation: '在数字时代，名声可能是短暂的。' },
  { id: '3', term: 'Mellifluous', translation: '悦耳的，甜蜜的', pronunciation: '/meˈlɪf.lu.əs/', example: 'She has a mellifluous voice.', exampleTranslation: '她有悦耳的嗓音。' },
  { id: '4', term: 'Eloquent', translation: '雄辩的，有说服力的', pronunciation: '/ˈel.ə.kwənt/', example: 'He gave an eloquent speech.', exampleTranslation: '他发表了一篇雄辩的演讲。' },
  { id: '5', term: 'Resilient', translation: '有弹性的，能恢复的', pronunciation: '/rɪˈzɪl.i.ənt/', example: 'Children are often very resilient.', exampleTranslation: '孩子们通常很有韧性。' }
];

const grammarExercises = [
  { id: '1', type: 'choice' as const, question: 'She ___ to the market yesterday.', options: ['go', 'goes', 'went', 'going'], answer: 'went', explanation: '昨天是过去时，动词用过去式 "went"。' },
  { id: '2', type: 'choice' as const, question: 'If I ___ rich, I would travel the world.', options: ['am', 'was', 'were', 'be'], answer: 'were', explanation: '虚拟语气中，与现在事实相反的条件句用 "were"。' },
  { id: '3', type: 'choice' as const, question: 'The book ___ on the table since this morning.', options: ['has lain', 'has laid', 'has been lying', 'is lying'], answer: 'has been lying', explanation: '表示从过去持续到现在的动作，用现在完成进行时。' },
  { id: '4', type: 'choice' as const, question: 'Neither the teacher nor the students ___ happy.', options: ['is', 'are', 'was', 'be'], answer: 'are', explanation: '就近一致原则，"neither...nor" 后面跟复数动词。' },
  { id: '5', type: 'choice' as const, question: 'I wish I ___ harder when I was young.', options: ['study', 'studied', 'had studied', 'would study'], answer: 'had studied', explanation: '与过去事实相反的虚拟语气，用过去完成时。' }
];

const speakingPhrases = [
  { phrase: 'How do you pronounce this word?', translation: '这个词怎么发音？' },
  { phrase: 'Could you speak more slowly?', translation: '你能说得更慢一点吗？' },
  { phrase: 'I would like to practice my conversation skills.', translation: '我想练习会话技巧。' },
  { phrase: 'Could you give me some feedback on my pronunciation?', translation: '你能给我的发音一些反馈吗？' },
  { phrase: 'Let me try that again.', translation: '让我再试一次。' }
];

export default function Learning() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { user, updateCourseProgress } = useStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [masteredWords, setMasteredWords] = useState<string[]>([]);

  const handleVocabularyComplete = (mastered: boolean) => {
    if (mastered) {
      setMasteredWords((prev) => [...prev, vocabularyWords[currentIndex].id]);
    }
    setCompletedCount((prev) => prev + 1);

    if (currentIndex < vocabularyWords.length - 1) {
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 300);
    }
  };

  const handleGrammarComplete = (correct: boolean) => {
    if (correct) {
      setCompletedCount((prev) => prev + 1);
    }
    if (currentIndex < grammarExercises.length - 1) {
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 300);
    }
  };

  const handleSpeakingComplete = (score: number) => {
    setCompletedCount((prev) => prev + 1);
    if (currentIndex < speakingPhrases.length - 1) {
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 1000);
    }
  };

  const handleListeningComplete = () => {
    setCompletedCount((prev) => prev + 1);
    navigate('/courses');
  };

  const handleFinish = () => {
    updateCourseProgress('en-beginner', `en-beginner-${currentIndex + 1}`);
    navigate('/courses');
  };

  const renderContent = () => {
    switch (type) {
      case 'vocabulary':
        return (
          <FlashCard
            word={vocabularyWords[currentIndex]}
            onComplete={handleVocabularyComplete}
            index={currentIndex}
            total={vocabularyWords.length}
          />
        );

      case 'grammar':
        return (
          <GrammarExercise
            exercise={grammarExercises[currentIndex]}
            onComplete={handleGrammarComplete}
            index={currentIndex}
            total={grammarExercises.length}
          />
        );

      case 'speaking':
        return (
          <SpeakingPractice
            phrase={speakingPhrases[currentIndex].phrase}
            translation={speakingPhrases[currentIndex].translation}
            onComplete={handleSpeakingComplete}
          />
        );

      case 'listening':
        return (
          <ListeningExercise
            transcript="The early bird catches the worm."
            translation="早起的鸟儿有虫吃。"
            onComplete={handleListeningComplete}
          />
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <p className="text-slate-400 mb-4">请选择学习模式</p>
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => navigate('/learn/vocabulary')}>背单词</Button>
              <Button onClick={() => navigate('/learn/grammar')}>语法练习</Button>
              <Button onClick={() => navigate('/learn/speaking')}>口语练习</Button>
              <Button onClick={() => navigate('/learn/listening')}>听力训练</Button>
            </div>
          </div>
        );
    }
  };

  const isComplete = completedCount > 0 && currentIndex >= (vocabularyWords.length || grammarExercises.length || speakingPhrases.length || 0) - 1;

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <div className="max-w-4xl mx-auto px-4 pt-24 lg:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            返回
          </button>

          <div className="flex items-center gap-4">
            <span className="text-slate-400">
              {completedCount > 0 && (
                <span className="text-emerald-400">{completedCount} 已完成</span>
              )}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {type && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white capitalize mb-2">
                {type === 'vocabulary' ? '单词记忆' :
                 type === 'grammar' ? '语法练习' :
                 type === 'speaking' ? '口语跟读' :
                 type === 'listening' ? '听力训练' : ''}
              </h1>
              <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(completedCount /
                      (type === 'vocabulary' ? vocabularyWords.length :
                       type === 'grammar' ? grammarExercises.length :
                       type === 'speaking' ? speakingPhrases.length : 5)) * 100}%`
                  }}
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                />
              </div>
            </div>
          )}
        </motion.div>

        {isComplete ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30">
              <CheckCircle size={48} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">学习完成！</h2>
            <p className="text-slate-400 mb-8">
              {type === 'vocabulary' && `你已学习了 ${vocabularyWords.length} 个单词，其中 ${masteredWords.length} 个已掌握`}
              {type === 'grammar' && `你完成了 ${grammarExercises.length} 道语法练习`}
              {type === 'speaking' && `你完成了 ${speakingPhrases.length} 个口语练习`}
              {type === 'listening' && `你完成了听力训练`}
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button onClick={() => window.location.reload()}>再练一次</Button>
              <Button variant="secondary" onClick={handleFinish}>完成学习</Button>
            </div>
          </motion.div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
}
