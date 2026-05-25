import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudyStats, getWrongQuestionsByCategory } from '../utils/db';
import questionsData from '../data/questions.json';
import knowledgeData from '../data/knowledge.json';

export default function Profile() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [wrongByCategory, setWrongByCategory] = useState({});

  useEffect(() => {
    getStudyStats().then(setStats);
    getWrongQuestionsByCategory().then(setWrongByCategory);
  }, []);

  const totalHours = stats ? Math.floor((stats.totalMinutes || 0) / 60) : 0;
  const remainMinutes = stats ? (stats.totalMinutes || 0) % 60 : 0;

  const statsItems = [
    { label: '连续学习天数', value: `${stats?.streak || 0} 天`, icon: '🔥' },
    { label: '学习总时长', value: `${totalHours} 小时 ${remainMinutes} 分钟`, icon: '⏱️' },
    { label: '完成知识点', value: `${stats?.completedKnowledge || 0} 个`, icon: '📚' },
    { label: '刷题正确率', value: `${stats?.accuracy || 0}%`, icon: '✅' },
    { label: '收藏数量', value: `${stats?.favoriteCount || 0} 个`, icon: '⭐' },
  ];

  return (
    <div className="pb-20 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-sigma-text mb-6">我的</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {statsItems.map((item, index) => (
          <div key={index} className="bg-sigma-card border border-sigma-border rounded-xl p-4">
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="text-lg font-bold text-sigma-text">{item.value}</div>
            <div className="text-xs text-sigma-subtle mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>

      {/* 错题分布 */}
      {Object.keys(wrongByCategory).length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-sigma-text mb-3">错题分布</h2>
          <div className="bg-sigma-card border border-sigma-border rounded-xl p-4">
            {Object.entries(wrongByCategory).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between py-2 border-b border-sigma-border last:border-0">
                <span className="text-sm text-sigma-text">{category}</span>
                <span className="text-sm text-sigma-subtle">{count} 题</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 快捷入口 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-sigma-text mb-3">快捷入口</h2>
        <div className="space-y-2">
          <button
            onClick={() => navigate('/quiz?mode=wrong')}
            className="w-full bg-sigma-card border border-sigma-border rounded-xl p-4 text-left active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">📝</span>
                <span className="text-sm text-sigma-text">错题复习</span>
              </div>
              <span className="text-sigma-subtle">
                {stats?.wrongCount || 0} 题
              </span>
            </div>
          </button>

          <button
            onClick={() => navigate('/knowledge')}
            className="w-full bg-sigma-card border border-sigma-border rounded-xl p-4 text-left active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">📖</span>
                <span className="text-sm text-sigma-text">知识库</span>
              </div>
              <span className="text-sigma-subtle">
                {knowledgeData.length} 个知识点
              </span>
            </div>
          </button>

          <button
            onClick={() => navigate('/quiz')}
            className="w-full bg-sigma-card border border-sigma-border rounded-xl p-4 text-left active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">🎯</span>
                <span className="text-sm text-sigma-text">开始刷题</span>
              </div>
              <span className="text-sigma-subtle">
                {questionsData.length} 道题目
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 版本信息 */}
      <p className="text-center text-xs text-sigma-subtle mt-8">
        杜旭 Sigma Green V1.2 · 六西格玛绿带学习工具
      </p>
    </div>
  );
}
