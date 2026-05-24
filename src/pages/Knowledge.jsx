import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import knowledgeData from '../data/knowledge.json';
import KnowledgeCard from '../components/KnowledgeCard';
import { isFavorite, addFavorite, removeFavorite, markKnowledgeCompleted } from '../utils/db';

const dmaicCategories = ['Define', 'Measure', 'Analyze', 'Improve', 'Control'];

const categoryIcons = {
  Define: '🎯',
  Measure: '📏',
  Analyze: '🔍',
  Improve: '🔧',
  Control: '📊',
};

export default function Knowledge() {
  const { id: urlId } = useParams();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('Define');
  const [searchText, setSearchText] = useState('');
  const [favorited, setFavorited] = useState({});

  const findById = useCallback((id) => {
    const numId = parseInt(id);
    return knowledgeData.find(k => k.id === numId) || null;
  }, []);

  const selectedKnowledge = urlId ? findById(urlId) : null;

  useEffect(() => {
    knowledgeData.forEach(async (k) => {
      const fav = await isFavorite(k.id);
      if (fav) {
        setFavorited(prev => ({ ...prev, [k.id]: true }));
      }
    });
  }, []);

  useEffect(() => {
    if (selectedKnowledge) {
      markKnowledgeCompleted(selectedKnowledge.id);
    }
  }, [selectedKnowledge]);

  const filtered = knowledgeData.filter(k => {
    if (searchText) {
      const q = searchText.toLowerCase();
      return (k.title + k.definition + k.example + k.examPoint).toLowerCase().includes(q);
    }
    return k.category === activeCategory;
  });

  const handleToggleFavorite = async (knowledge) => {
    if (favorited[knowledge.id]) {
      await removeFavorite(knowledge.id);
      setFavorited(prev => ({ ...prev, [knowledge.id]: false }));
    } else {
      await addFavorite(knowledge);
      setFavorited(prev => ({ ...prev, [knowledge.id]: true }));
    }
  };

  if (selectedKnowledge) {
    return (
      <div className="pb-20 px-4 pt-6 max-w-lg mx-auto">
        <button
          onClick={() => navigate('/knowledge')}
          className="flex items-center gap-2 text-sigma-subtle mb-4 active:opacity-60"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className="text-sm">返回</span>
        </button>

        <div className="bg-sigma-card border border-sigma-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs px-2 py-0.5 rounded-full bg-sigma-accent/20 text-sigma-accent">
              {selectedKnowledge.category}
            </span>
            <button
              onClick={() => handleToggleFavorite(selectedKnowledge)}
              className="p-1 active:scale-90 transition-transform"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill={favorited[selectedKnowledge.id] ? '#f59e0b' : 'none'} stroke={favorited[selectedKnowledge.id] ? '#f59e0b' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          </div>

          <h1 className="text-xl font-bold text-sigma-text mb-4">{selectedKnowledge.title}</h1>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-sigma-accent mb-1">定义</h3>
              <p className="text-sm text-sigma-text leading-relaxed">{selectedKnowledge.definition}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-sigma-accent mb-1">工厂案例</h3>
              <p className="text-sm text-sigma-text leading-relaxed">{selectedKnowledge.example}</p>
            </div>

            <div className="bg-sigma-dark rounded-xl p-3">
              <h3 className="text-sm font-semibold text-sigma-warning mb-1">考试重点</h3>
              <p className="text-sm text-sigma-text leading-relaxed">{selectedKnowledge.examPoint}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-sigma-text mb-4">知识库</h1>

      {/* 搜索栏 */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-sigma-subtle" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="搜索知识点..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="w-full bg-sigma-card border border-sigma-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-sigma-text placeholder-sigma-subtle outline-none focus:border-sigma-accent transition-colors"
        />
        {searchText && (
          <button
            onClick={() => setSearchText('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sigma-subtle text-sm"
          >
            清除
          </button>
        )}
      </div>

      {/* 分类标签（搜索时隐藏） */}
      {!searchText && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {dmaicCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-sigma-accent text-sigma-dark font-semibold'
                  : 'bg-sigma-card text-sigma-subtle border border-sigma-border'
              }`}
            >
              <span>{categoryIcons[cat]}</span>
              <span>{cat}</span>
            </button>
          ))}
        </div>
      )}

      {/* 章节练习入口 */}
      {!searchText && (
        <button
          onClick={() => navigate(`/quiz?category=${activeCategory}`)}
          className="w-full mb-4 bg-sigma-accent/10 border border-sigma-accent/30 rounded-xl p-3 flex items-center justify-between active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{categoryIcons[activeCategory]}</span>
            <div className="text-left">
              <div className="text-sm font-semibold text-sigma-accent">{activeCategory} 章节练习</div>
              <div className="text-xs text-sigma-subtle">只做该阶段题目，练习更有针对性</div>
            </div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-sigma-accent" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {/* 知识卡片列表 */}
      {filtered.length > 0 ? (
        <div className="space-y-2.5">
          {filtered.map(k => (
            <KnowledgeCard
              key={k.id}
              knowledge={k}
              onClick={() => navigate(`/knowledge/${k.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-sigma-subtle">
          <div className="text-3xl mb-2">🔍</div>
          <p>未找到匹配的知识点</p>
        </div>
      )}
    </div>
  );
}
