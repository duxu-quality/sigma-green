import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import questionsData from '../data/questions.json';
import QuizCard from '../components/QuizCard';
import { enrichQuestion } from '../utils/questionProcessing';
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
  const [selectedAnswer, setSelectedAnswer] = useState(null);      // 单选: number; 多选: Set
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

    // 运行时富化：清洗题干 + 图表检测
    const enriched = source.map(q => enrichQuestion(q));

    const shuffled = [...enriched].sort(() => Math.random() - 0.5);
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

  // 是否多选题
  const isMulti = currentQuestion ? currentQuestion._isMulti : false;

  /**
   * 答案判定
   * - 单选：selected === answer
   * - 多选：Set 精确匹配（全对且不多选）
   */
  function checkCorrect(selected) {
    if (!currentQuestion || selected === null || selected === undefined) return false;
    const correct = currentQuestion.answer;
    if (Array.isArray(correct)) {
      if (!(selected instanceof Set)) return false;
      if (selected.size !== correct.length) return false;
      return correct.every(idx => selected.has(idx));
    }
    return selected === correct;
  }

  // --- 单选：点击选项直接提交 ---
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

  // --- 多选：切换选项选中状态 ---
  const handleSelectOption = (index) => {
    if (showResult) return;
    setSelectedAnswer(prev => {
      const next = prev instanceof Set ? new Set(prev) : new Set();
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // --- 多选：确认提交 ---
  const handleConfirm = async () => {
    if (showResult || !(selectedAnswer instanceof Set) || selectedAnswer.size === 0) return;
    setShowResult(true);

    const correct = checkCorrect(selectedAnswer);
    await recordQuizResult(currentQuestion.id, correct);

    if (!correct) {
      await addWrongQuestion(currentQuestion);
      setWrongIds(prev => new Set([...prev, currentQuestion.id]));
    }
  };

  // --- 跳过（图表缺失题） ---
  const handleSkip = () => {
    advanceQuestion();
  };

  // --- 下一题 ---
  const advanceQuestion = useCallback(async () => {
    if (isLast) {
      if (mode === 'wrong') {
        await loadQuestions();
      } else {
        let source = questionsData.filter(q => q.answer !== undefined && q.answer !== null);
        if (categoryFilter && mode !== 'wrong') {
          source = source.filter(q => q.category === categoryFilter);
        }
        const enriched = source.map(q => enrichQuestion(q));
        const shuffled = [...enriched].sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
      }
      setCurrentIndex(0);
    } else {
      setCurrentIndex(i => i + 1);
    }
    setSelectedAnswer(null);
    setShowResult(false);
  }, [isLast, mode, categoryFilter, loadQuestions]);

  const handleNext = () => {
    advanceQuestion();
  };

  const handleToggleWrong = async () => {
    if (!currentQuestion) return;
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
          title={wrongIds.has(currentQuestion.id) ? '移出错题本' : '加入错题本'}
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
        isMulti={isMulti}
        onAnswer={handleAnswer}
        onSelectOption={handleSelectOption}
        onConfirm={handleConfirm}
        onSkip={handleSkip}
        onNext={handleNext}
        showResult={showResult}
        selectedAnswer={selectedAnswer}
        isCorrect={showResult ? checkCorrect(selectedAnswer) : null}
        hasVisualRef={currentQuestion._hasVisualRef}
        isStrongVisualRef={currentQuestion._isStrongVisualRef}
      />
    </div>
  );
}
