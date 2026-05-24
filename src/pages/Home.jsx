import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import knowledgeData from '../data/knowledge.json';
import questionsData from '../data/questions.json';
import KnowledgeCard from '../components/KnowledgeCard';
import { getStudyStats, getWrongQuestionsByCategory } from '../utils/db';

function seededShuffle(arr, seed) {
  const shuffled = [...arr];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getDateSeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function getTodayQuestions(questions) {
  const seed = getDateSeed();
  const shuffled = seededShuffle(questions, seed);
  return shuffled.slice(0, 10);
}

function getTodayKnowledge(knowledge) {
  const seed = getDateSeed();
  const shuffled = seededShuffle(knowledge, seed);
  return shuffled.slice(0, 3);
}

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [wrongByCategory, setWrongByCategory] = useState({});
  const [dailyKnowledge] = useState(() => getTodayKnowledge(knowledgeData));
  const [dailyQuestions] = useState(() => getTodayQuestions(questionsData));

  useEffect(() => {
    getStudyStats().then(setStats);
    getWrongQuestionsByCategory().then(setWrongByCategory);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return '早上好';
    if (hour >= 12 && hour < 14) return '中午好';
    if (hour >= 14 && hour < 18) return '下午好';
    return '晚上好';
  };

  const viewedKnowledge = stats?.completedKnowledge || 0;
  const totalQuestions = stats?.totalQuestions || 0;

  return (
    <div className="pb-20 px-4 pt-6 max-w-lg mx-auto">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-sigma-text">
          {getGreeting()}，今天继续加油
        </h1>
        <p className="text-sigma-subtle mt-1">
          已连续学习：{stats?.streak || 0} 天 · 正确率 {stats?.accuracy || 0}%
        </p>
      </div>

      {/* Today's Knowledge - rotates daily */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-sigma-text">今日知识</h2>
          <button
            onClick={() => navigate('/knowledge')}
            className="text-sm text-sigma-accent"
          >
            查看全部
          </button>
        </div>
        <div className="space-y-2.5">
          {dailyKnowledge.map(k => (
            <KnowledgeCard
              key={k.id}
              knowledge={k}
              onClick={() => navigate(`/knowledge/${k.id}`)}
            />
          ))}
        </div>
      </section>

      {/* Today's Quiz - rotates daily */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-sigma-text">今日刷题</h2>
          <button
            onClick={() => navigate('/quiz')}
            className="text-sm text-sigma-accent"
          >
            开始刷题
          </button>
        </div>
        <div className="bg-sigma-card border border-sigma-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-sigma-subtle">每日推荐</span>
            <span className="text-sm text-sigma-subtle">{dailyQuestions.length} 题</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-sigma-dark rounded-full h-2 overflow-hidden">
              <div
                className="bg-sigma-accent h-full rounded-full transition-all"
                style={{ width: `${stats?.accuracy || 0}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-sigma-accent">
              正确率 {stats?.accuracy || 0}%
            </span>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="mb-6">
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => navigate('/quiz?mode=wrong')}
            className="bg-sigma-card border border-sigma-border rounded-xl p-3 text-center active:scale-95 transition-transform"
          >
            <div className="text-2xl mb-1">{stats?.wrongCount > 0 ? '📝' : '✅'}</div>
            <div className="text-xs text-sigma-text">错题复习</div>
            {stats?.wrongCount > 0 && (
              <div className="text-xs text-sigma-warning mt-0.5">{stats.wrongCount} 题待复习</div>
            )}
          </button>
          <button
            onClick={() => navigate('/quiz?mode=exam')}
            className="bg-sigma-card border border-sigma-border rounded-xl p-3 text-center active:scale-95 transition-transform"
          >
            <div className="text-2xl mb-1">📋</div>
            <div className="text-xs text-sigma-text">真题模式</div>
            <div className="text-xs text-sigma-subtle mt-0.5">历年真题</div>
          </button>
          <button
            onClick={() => navigate('/cases')}
            className="bg-sigma-card border border-sigma-border rounded-xl p-3 text-center active:scale-95 transition-transform"
          >
            <div className="text-2xl mb-1">🏭</div>
            <div className="text-xs text-sigma-text">案例分析</div>
            <div className="text-xs text-sigma-subtle mt-0.5">实战案例</div>
          </button>
        </div>
      </section>

      {/* Study stats */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-sigma-text mb-3">学习统计</h2>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="bg-sigma-card border border-sigma-border rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-sigma-accent">{viewedKnowledge}</div>
            <div className="text-xs text-sigma-subtle">知识点已读</div>
          </div>
          <div className="bg-sigma-card border border-sigma-border rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-sigma-accent">{totalQuestions}</div>
            <div className="text-xs text-sigma-subtle">题目已做</div>
          </div>
          <div className="bg-sigma-card border border-sigma-border rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-sigma-warning">{stats?.wrongCount || 0}</div>
            <div className="text-xs text-sigma-subtle">待复习错题</div>
          </div>
        </div>

        {/* Weak areas */}
        {Object.keys(wrongByCategory).length > 0 && (
          <div className="bg-sigma-card border border-sigma-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-sigma-text mb-2">薄弱环节</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(wrongByCategory).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                <span key={cat} className="text-xs px-2.5 py-1 bg-sigma-dark rounded-full text-sigma-warning">
                  {cat}：{count} 题
                </span>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
