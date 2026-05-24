export default function KnowledgeCard({ knowledge, onClick }) {
  const categoryColors = {
    Define: 'bg-blue-500/20 text-blue-400',
    Measure: 'bg-emerald-500/20 text-emerald-400',
    Analyze: 'bg-purple-500/20 text-purple-400',
    Improve: 'bg-amber-500/20 text-amber-400',
    Control: 'bg-rose-500/20 text-rose-400',
  };

  return (
    <div
      onClick={() => onClick && onClick(knowledge)}
      className="bg-sigma-card border border-sigma-border rounded-xl p-4 active:scale-[0.98] transition-transform cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-base font-semibold text-sigma-text flex-1 pr-2">
          {knowledge.title}
        </h3>
        <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${categoryColors[knowledge.category] || 'bg-gray-500/20 text-gray-400'}`}>
          {knowledge.category}
        </span>
      </div>
      <p className="text-sm text-sigma-subtle line-clamp-2">{knowledge.definition}</p>
    </div>
  );
}
