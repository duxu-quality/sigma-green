import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import caseStudies from '../data/caseStudies';

const categoryLabels = {
  Define: '定义',
  Measure: '测量',
  Analyze: '分析',
  Improve: '改进',
  Control: '控制',
};

const phaseColors = {
  Define: 'border-l-sky-400',
  Measure: 'border-l-amber-400',
  Analyze: 'border-l-purple-400',
  Improve: 'border-l-emerald-400',
  Control: 'border-l-rose-400',
};

const phaseBgColors = {
  Define: 'bg-sky-500/20 text-sky-400',
  Measure: 'bg-amber-500/20 text-amber-400',
  Analyze: 'bg-purple-500/20 text-purple-400',
  Improve: 'bg-emerald-500/20 text-emerald-400',
  Control: 'bg-rose-500/20 text-rose-400',
};

export default function CaseStudy() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  // ========== 详情页 ==========
  if (selected) {
    const cs = selected;
    const phases = [
      { key: 'Define', title: 'D 定义阶段', label: 'Define', data: cs.define },
      { key: 'Measure', title: 'M 测量阶段', label: 'Measure', data: cs.measure },
      { key: 'Analyze', title: 'A 分析阶段', label: 'Analyze', data: cs.analyze },
      { key: 'Improve', title: 'I 改进阶段', label: 'Improve', data: cs.improve },
      { key: 'Control', title: 'C 控制阶段', label: 'Control', data: cs.control },
    ];

    return (
      <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
        {/* 返回按钮 */}
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-2 mb-4 px-3 py-2 bg-sigma-card border border-sigma-border rounded-xl text-sigma-text active:bg-sigma-border transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className="text-sm">返回列表</span>
        </button>

        {/* 头部卡片 */}
        <div className="bg-sigma-card border border-sigma-border rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full ${phaseBgColors[cs.category] || 'bg-sigma-accent/20 text-sigma-accent'}`}>
              {categoryLabels[cs.category]}
            </span>
            <span className="text-xs text-sigma-subtle">{cs.subtitle}</span>
          </div>

          <h1 className="text-xl font-bold text-sigma-text mb-3">{cs.title}</h1>
          <p className="text-sm text-sigma-subtle leading-relaxed">{cs.background}</p>
        </div>

        {/* 五阶段详解 */}
        {phases.map(phase => {
          const data = phase.data;
          if (!data) return null;

          return (
            <div key={phase.key} className={`bg-sigma-card border border-sigma-border border-l-4 ${phaseColors[phase.key]} rounded-2xl p-5 mb-4`}>
              <h3 className={`text-sm font-semibold mb-3 ${phaseBgColors[phase.key]} inline-block px-2.5 py-0.5 rounded-full`}>
                {phase.title}
              </h3>

              <div className="space-y-2.5 text-sm">
                {data.problem && (
                  <div>
                    <span className="text-sigma-subtle text-xs">问题描述</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.problem}</p>
                  </div>
                )}
                {data.goal && (
                  <div>
                    <span className="text-sigma-subtle text-xs">改善目标</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.goal}</p>
                  </div>
                )}
                {data.scope && (
                  <div>
                    <span className="text-sigma-subtle text-xs">项目范围</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.scope}</p>
                  </div>
                )}
                {data.y && (
                  <div>
                    <span className="text-sigma-subtle text-xs">关键指标 Y</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5 font-mono text-xs bg-sigma-dark rounded px-2 py-1">{data.y}</p>
                  </div>
                )}
                {data.team && (
                  <div>
                    <span className="text-sigma-subtle text-xs">团队</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.team}</p>
                  </div>
                )}
                {data.sipoc && (
                  <div>
                    <span className="text-sigma-subtle text-xs">SIPOC 流程</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.sipoc}</p>
                  </div>
                )}
                {data.voc && (
                  <div>
                    <span className="text-sigma-subtle text-xs">VOC / CTQ</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.voc}</p>
                  </div>
                )}
                {data.msa && (
                  <div>
                    <span className="text-sigma-subtle text-xs">测量系统分析</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.msa}</p>
                  </div>
                )}
                {data.baseline && (
                  <div>
                    <span className="text-sigma-subtle text-xs">基线数据</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.baseline}</p>
                  </div>
                )}
                {data.dataCollection && (
                  <div>
                    <span className="text-sigma-subtle text-xs">数据收集</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.dataCollection}</p>
                  </div>
                )}
                {data.processCapability && (
                  <div>
                    <span className="text-sigma-subtle text-xs">过程能力</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.processCapability}</p>
                  </div>
                )}
                {data.methods && (
                  <div>
                    <span className="text-sigma-subtle text-xs">分析方法</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.methods}</p>
                  </div>
                )}
                {data.weightTest && (
                  <div>
                    <span className="text-sigma-subtle text-xs">重量因子实验</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.weightTest}</p>
                  </div>
                )}
                {data.doe && (
                  <div>
                    <span className="text-sigma-subtle text-xs">DOE 实验设计</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.doe}</p>
                  </div>
                )}
                {data.fishbone && (
                  <div>
                    <span className="text-sigma-subtle text-xs">鱼骨图分析</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.fishbone}</p>
                  </div>
                )}
                {data.fmea && (
                  <div>
                    <span className="text-sigma-subtle text-xs">FMEA 分析</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.fmea}</p>
                  </div>
                )}
                {data.causalMatrix && (
                  <div>
                    <span className="text-sigma-subtle text-xs">因果矩阵</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.causalMatrix}</p>
                  </div>
                )}
                {data.pareto && (
                  <div>
                    <span className="text-sigma-subtle text-xs">柏拉图分析</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.pareto}</p>
                  </div>
                )}
                {data.smed && (
                  <div>
                    <span className="text-sigma-subtle text-xs">SMED 分析</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.smed}</p>
                  </div>
                )}
                {data.vsm && (
                  <div>
                    <span className="text-sigma-subtle text-xs">价值流图</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.vsm}</p>
                  </div>
                )}
                {data.vocMatrix && (
                  <div>
                    <span className="text-sigma-subtle text-xs">VOC-CTQ 矩阵</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.vocMatrix}</p>
                  </div>
                )}
                {data.hypothesisTest && (
                  <div>
                    <span className="text-sigma-subtle text-xs">假设检验</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.hypothesisTest}</p>
                  </div>
                )}
                {data.rootCause && (
                  <div>
                    <span className="text-sigma-subtle text-xs">根因分析</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.rootCause}</p>
                  </div>
                )}
                {data.finding && (
                  <div className="bg-sigma-dark rounded-xl p-3">
                    <span className="text-xs text-sigma-warning">关键发现</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.finding}</p>
                  </div>
                )}
                {data.solutions && (
                  <div>
                    <span className="text-sigma-subtle text-xs">改善措施</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5 whitespace-pre-line">{data.solutions}</p>
                  </div>
                )}
                {data.doeResult && (
                  <div>
                    <span className="text-sigma-subtle text-xs">DOE 结果</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.doeResult}</p>
                  </div>
                )}
                {data.verification && (
                  <div>
                    <span className="text-sigma-subtle text-xs">效果验证</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.verification}</p>
                  </div>
                )}
                {data.controlPlan && (
                  <div>
                    <span className="text-sigma-subtle text-xs">控制计划</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.controlPlan}</p>
                  </div>
                )}
                {data.standardization && (
                  <div>
                    <span className="text-sigma-subtle text-xs">标准化</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.standardization}</p>
                  </div>
                )}
                {data.monitoring && (
                  <div>
                    <span className="text-sigma-subtle text-xs">持续监控</span>
                    <p className="text-sigma-text leading-relaxed mt-0.5">{data.monitoring}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* 工具和成果汇总 */}
        <div className="bg-sigma-card border border-sigma-border rounded-2xl p-5 mb-4">
          <h3 className="text-sm font-semibold text-sigma-accent mb-3">🔧 使用工具</h3>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {cs.tools.map(t => (
              <span key={t} className="text-xs px-2 py-0.5 bg-sigma-dark rounded-full text-sigma-subtle">{t}</span>
            ))}
          </div>

          <h3 className="text-sm font-semibold text-sigma-warning mb-3">💰 财务收益</h3>
          <p className="text-sm text-sigma-text leading-relaxed mb-2">{cs.financialBenefits}</p>
          {cs.intangibleBenefits && (
            <>
              <h3 className="text-sm font-semibold text-sigma-subtle mb-2">📈 无形收益</h3>
              <p className="text-sm text-sigma-subtle leading-relaxed mb-2">{cs.intangibleBenefits}</p>
            </>
          )}

          <h3 className="text-sm font-semibold text-sigma-accent mb-2">💡 经验教训</h3>
          <p className="text-sm text-sigma-text leading-relaxed bg-sigma-dark rounded-xl p-3">{cs.lessonsLearned}</p>
        </div>
      </div>
    );
  }

  // ========== 列表页 ==========
  return (
    <div className="pb-20 px-4 pt-6 max-w-lg mx-auto">
      {/* 返回首页 */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 mb-4 px-3 py-2 bg-sigma-card border border-sigma-border rounded-xl text-sigma-text active:bg-sigma-border transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span className="text-sm">返回首页</span>
      </button>

      <h1 className="text-2xl font-bold text-sigma-text mb-2">案例分析</h1>
      <p className="text-sm text-sigma-subtle mb-4">
        {caseStudies.length} 个 DMAIC 实战案例，理解六西格玛在真实场景中的应用
      </p>

      <div className="space-y-3">
        {caseStudies.map(cs => (
          <div
            key={cs.id}
            onClick={() => setSelected(cs)}
            className="bg-sigma-card border border-sigma-border rounded-xl p-4 active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-sigma-text truncate">{cs.title}</h3>
                <p className="text-xs text-sigma-subtle mt-0.5 truncate">{cs.subtitle}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ml-2 ${phaseBgColors[cs.category] || 'bg-sigma-accent/20 text-sigma-accent'}`}>
                {categoryLabels[cs.category]}
              </span>
            </div>

            {/* 简短描述 */}
            <p className="text-sm text-sigma-subtle leading-relaxed line-clamp-2 mt-1">
              {cs.define.problem || cs.background}
            </p>

            {/* 工具标签 */}
            <div className="flex flex-wrap gap-1 mt-3">
              {cs.tools.slice(0, 5).map(t => (
                <span key={t} className="text-xs px-1.5 py-0.5 bg-sigma-dark rounded text-sigma-subtle">{t}</span>
              ))}
              {cs.tools.length > 5 && (
                <span className="text-xs px-1.5 py-0.5 text-sigma-subtle">+{cs.tools.length - 5}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
