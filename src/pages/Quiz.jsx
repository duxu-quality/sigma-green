import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import questionsData from '../data/questions.json';
import QuizCard from '../components/QuizCard';
import {
  getWrongQuestions,
  addWrongQuestion,
  removeWrongQuestion,
  recordQuizResult,
  recordStudySession,
  getWrongQuestionIds,
} from '../utils/db';

const categoryLabels = {
  Define: '定义', Measure: '测量', Analyze: '分析', Improve: '改进', Control: '控制',
};

export default function Quiz() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'normal';
  const categoryFilter = searchParams.get('category') || null;

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [wrongIds, setWrongIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [sessionStart] = useState(Date.now());

  const loadQuestions = useCallback(async () => {
    const answerable = questionsData.filter(q => q.answer !== undefined && q.answer !== null);

    let source;

    if (mode === 'wrong') {
      const wrongItems = await getWrongQuestions();
      source = wrongItems.map(w => w.question);
    } else if (mode === 'exam') {
      source = answerable.filter(q =>
        q.source && (q.source.includes('真题') || q.source.includes('历年') || q.source.includes('考试'))
      );
    } else {
      source = answerable;
    }

    // Apply category filter for chapter practice
    if (categoryFilter && mode !== 'wrong') {
      source = source.filter(q => q.category === categoryFilter);
    }

    const shuffled = [...source].sort(() => Math.random() - 0.5);
    setQuestions(mode === 'exam' ? shuffled.slice(0, 60) : shuffled);

    const ids = await getWrongQuestionIds();
    setWrongIds(ids);
    setLoading(false);
  }, [mode, categoryFilter]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    return () => {
      const duration = Math.round((Date.now() - sessionStart) / 60000);
      if (duration > 0) {
        recordStudySession(duration);
      }
    };
  }, [sessionStart]);

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex >= questions.length - 1;

  function checkCorrect(ansIdx) {
    if (!currentQuestion) return false;
    const a = currentQuestion.answer;
    if (Array.isArray(a)) return a.includes(ansIdx);
    return ansIdx === a;
  }

  const handleAnswer = async (index) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);

    const correct = checkCorrect(index);
    await recordQuizResult(currentQuestion.id, correct);

    if (!correct) {
      await addWrongQuestion(currentQuestion);
      setWrongIds(prev => new Set([...prev, currentQuestion.id]));
    }
  };

  const handleNext = async () => {
    if (isLast) {
      if (mode === 'wrong') {
        await loadQuestions();
      } else {
        let source = questionsData.filter(q => q.answer !== undefined && q.answer !== null);
        if (categoryFilter && mode !== 'wrong') {
          source = source.filter(q => q.category === categoryFilter);
        }
        const shuffled = [...source].sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
      }
      setCurrentIndex(0);
    } else {
      setCurrentIndex(i => i + 1);
    }
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleToggleWrong = async () => {
    if (wrongIds.has(currentQuestion.id)) {
      await removeWrongQuestion(currentQuestion.id);
      setWrongIds(prev => {
        const next = new Set(prev);
        next.delete(currentQuestion.id);
        return next;
      });
    } else {
      await addWrongQuestion(currentQuestion);
      setWrongIds(prev => new Set([...prev, currentQuestion.id]));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-sigma-subtle">
        加载中...
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center">
        <div className="text-4xl mb-4">
          {mode === 'exam' ? '📋' : categoryFilter ? '📖' : '🎉'}
        </div>
        <h2 className="text-xl font-bold text-sigma-text mb-2">
          {mode === 'exam' ? '暂无真题' :
           categoryFilter ? `暂无${categoryLabels[categoryFilter] || categoryFilter}阶段题目` :
           '没有待复习的错题'}
        </h2>
        <p className="text-sigma-subtle">
          {mode === 'exam' ? '题库暂未收录真题，请去正常刷题' :
           categoryFilter ? '该阶段暂无可练习题' :
           '去正常刷题吧，答错的题会自动收集到这里'}
        </p>
      </div>
    );
  }

  // Build mode label
  let modeLabel = '刷题';
  if (mode === 'wrong') modeLabel = '错题复习';
  else if (mode === 'exam') modeLabel = '真题模式';
  else if (categoryFilter) modeLabel = `${categoryLabels[categoryFilter] || categoryFilter} · 章节练习`;

  return (
    <div className="pb-20 px-4 pt-6 max-w-lg mx-auto">
      {/* 顶部信息栏 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-sm font-semibold text-sigma-text">{modeLabel}</span>
          <span className="text-sm text-sigma-subtle ml-2">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <button
          onClick={handleToggleWrong}
          className={`p-1.5 rounded-lg transition-colors ${
            wrongIds.has(currentQuestion.id)
              ? 'text-sigma-warning'
              : 'text-sigma-subtle'
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={wrongIds.has(currentQuestion.id) ? '#f59e0b' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
          </svg>
        </button>
      </div>

      {/* 进度条 */}
      <div className="w-full bg-sigma-border rounded-full h-1 mb-4 overflow-hidden">
        <div
          className="bg-sigma-accent h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* 题目卡片 */}
      <QuizCard
        question={currentQuestion}
        onAnswer={handleAnswer}
        onNext={handleNext}
        showResult={showResult}
        selectedAnswer={selectedAnswer}
        isCorrect={checkCorrect(selectedAnswer)}
      />
    </div>
  );
}
