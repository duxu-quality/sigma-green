import { useState } from 'react';

const caseStudies = [
  {
    id: 1,
    title: '米饭满意度改善',
    subtitle: '6Sigma 经典案例',
    category: 'Improve',
    summary: '运用 DMAIC 方法提升餐厅米饭满意度。Define 阶段定义米饭关键质量特性（口感、香气、外观），Measure 阶段收集顾客评分数据，Analyze 阶段通过鱼骨图和假设检验找到关键因子（米水比例、浸泡时间、保温温度），Improve 阶段通过 DOE 优化参数，Control 阶段建立标准化煮饭 SOP。',
    tools: ['SIPOC', '因果图', 'DOE', 'SPC', 'SOP'],
    results: '米饭满意度从 72% 提升至 95%，缺陷率降低 80%。',
  },
  {
    id: 2,
    title: '降低 BGA 焊接空洞缺陷率',
    subtitle: '电子制造业 SMT 制程改善',
    category: 'Improve',
    summary: '针对 BGA 焊接空洞率高的问题，运用 DMAIC 方法。Define 阶段明确空洞率 > 5% 为改进目标。Measure 阶段通过 MSA 确认 X-ray 检测系统可靠性。Analyze 阶段使用鱼骨图分析人机料法环因素，通过 DOE 筛选关键因子（回流焊温度曲线、锡膏印刷厚度、PCB 焊盘设计）。Improve 阶段优化温度曲线参数，Control 阶段建立 SPC 监控。',
    tools: ['MSA', 'DOE', '鱼骨图', 'Xbar-R 控制图', 'FMEA'],
    results: 'BGA 焊接空洞率从 8.2% 降至 1.5%，年节省返修成本 120 万元。',
  },
  {
    id: 3,
    title: '降低包装重量节约成本',
    subtitle: '六西格玛绿带项目',
    category: 'Improve',
    summary: '某企业包装材料成本过高，通过六西格玛项目降低包装重量。Define 阶段确定目标：在不影响保护性能前提下降低包装重量 15%。Measure 阶段收集各批次包装重量数据。Analyze 阶段通过方差分析发现供应商和材料批次是主要变异源。Improve 阶段优化包装结构设计。Control 阶段建立来料检验标准和 SPC 控制。',
    tools: ['ANOVA', '假设检验', '过程能力分析', '控制计划'],
    results: '包装重量降低 18%，年节省材料成本 85 万元。',
  },
  {
    id: 4,
    title: '提高注塑机日产量',
    subtitle: '生产制造六西格玛案例',
    category: 'Improve',
    summary: '注塑车间产能不足，通过 DMAIC 提升单机日产量。Define 阶段明确提升日产量 20% 的目标。Measure 阶段进行时间研究和 OEE 分析。Analyze 阶段识别换模时间和设备故障为主要瓶颈。Improve 阶段实施 SMED 快速换模和 TPM 预防维护。Control 阶段建立 OEE 监控看板。',
    tools: ['OEE', 'SMED', 'TPM', '控制图', '标准作业'],
    results: '设备综合效率 OEE 从 62% 提升至 81%，日产量提升 26%。',
  },
  {
    id: 5,
    title: '压缩机产能确保',
    subtitle: '六西格玛 DMAIC 案例',
    category: 'Improve',
    summary: '压缩机生产线产能不稳定，通过 DMAIC 方法确保产能达成。Define 阶段定义产能目标和项目范围。Measure 阶段统计产能数据和瓶颈工序节拍。Analyze 阶段通过因果矩阵识别关键输入变量。Improve 阶段优化生产线平衡和关键工艺参数。Control 阶段建立日产能监控和异常响应机制。',
    tools: ['因果矩阵', '生产线平衡', 'SPC', '控制计划', '标准化'],
    results: '产能达成率从 85% 提升至 98%，交付准时率显著提高。',
  },
  {
    id: 6,
    title: '塑料外壳变形改善',
    subtitle: '6Sigma 专案改善',
    category: 'Improve',
    summary: '塑料件外壳成型后变形导致装配不良。Define 阶段确定变形率降低 70% 的目标。Measure 阶段测量变形量和过程能力（Cpk < 1.0）。Analyze 阶段通过 DOE 发现注塑温度、冷却时间、模具温度是关键因子。Improve 阶段优化注塑参数组合。Control 阶段建立参数监控和定期模具维护计划。',
    tools: ['DOE', '过程能力分析', 'FMEA', '控制计划', '防错'],
    results: '外壳变形不良率从 12% 降至 2.5%，Cpk 提升至 1.45。',
  },
  {
    id: 7,
    title: '降低生产线不良',
    subtitle: '六西格玛管理应用研究',
    category: 'Analyze',
    summary: '某电子制造企业生产线综合不良率过高。通过 DMAIC 系统推进：D 阶段成立跨职能团队，明确降低不良率目标。M 阶段建立数据收集系统，确认 MSA 合格。A 阶段通过柏拉图找到关键少数缺陷类型，运用鱼骨图和 FMEA 分析根因。I 阶段针对关键原因实施改善措施。C 阶段建立过程控制和标准化。',
    tools: ['柏拉图', 'FMEA', '因果图', '假设检验', '控制图'],
    results: '产线综合不良率从 6.8% 降至 2.1%，年质量成本降低 200 万。',
  },
  {
    id: 8,
    title: '入厂物流优化',
    subtitle: '六西格玛黑带项目',
    category: 'Define',
    summary: '企业入厂物流效率低、成本高。Define 阶段通过 SIPOC 界定项目范围，识别关键干系人。Measure 阶段收集物流各环节时间和成本数据。Analyze 阶段使用价值流图分析非增值活动。Improve 阶段优化物流路线和供应商交货频次。Control 阶段建立物流 KPI 看板和定期评审机制。',
    tools: ['SIPOC', '价值流图', '能力分析', '控制计划', '看板'],
    results: '物流周期缩短 35%，入厂物流成本降低 22%。',
  },
  {
    id: 9,
    title: '静脉药配置效率提升',
    subtitle: '服务行业六西格玛应用',
    category: 'Improve',
    summary: '医院静脉药物配置中心工作效率低，通过六西格玛方法改进。Define 阶段确定缩短配药时间 30% 的目标。Measure 阶段进行工作抽样和时间研究。Analyze 阶段使用鱼骨图分析等待时间长的原因。Improve 阶段优化工作流程和布局。Control 阶段建立标准化操作流程和绩效指标。',
    tools: ['工作抽样', '鱼骨图', '流程优化', 'SOP', '控制图'],
    results: '平均配药时间从 45 分钟降至 28 分钟，差错率同步降低。',
  },
  {
    id: 10,
    title: '油水分离器故障率降低',
    subtitle: '汽车零部件六西格玛应用',
    category: 'Improve',
    summary: '江铃汽车油水分离器市场故障率高，通过 DMAIC 改进。Define 阶段明确降低故障率 50% 的目标。Measure 阶段统计售后数据和过程能力。Analyze 阶段使用 FMEA 和假设检验找到关键材料和工艺因子。Improve 阶段优化密封结构设计和装配工艺。Control 阶段加强来料检验和过程 SPC。',
    tools: ['FMEA', '假设检验', 'DOE', 'SPC', '控制计划'],
    results: '售后故障率从 3.2% 降至 0.8%，年节省质保成本 150 万元。',
  },
];

const categoryLabels = {
  Define: '定义',
  Measure: '测量',
  Analyze: '分析',
  Improve: '改进',
  Control: '控制',
};

export default function CaseStudy() {
  const [selected, setSelected] = useState(null);

  if (selected) {
    return (
      <div className="pb-20 px-4 pt-6 max-w-lg mx-auto">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-sigma-subtle mb-4 active:opacity-60"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className="text-sm">返回列表</span>
        </button>

        <div className="bg-sigma-card border border-sigma-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2 py-0.5 rounded-full bg-sigma-accent/20 text-sigma-accent">
              {categoryLabels[selected.category]}
            </span>
            <span className="text-xs text-sigma-subtle">{selected.subtitle}</span>
          </div>

          <h1 className="text-xl font-bold text-sigma-text mb-4">{selected.title}</h1>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-sigma-accent mb-1">项目概述</h3>
              <p className="text-sm text-sigma-text leading-relaxed">{selected.summary}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-sigma-accent mb-1">使用工具</h3>
              <div className="flex flex-wrap gap-1.5">
                {selected.tools.map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 bg-sigma-dark rounded-full text-sigma-subtle">{t}</span>
                ))}
              </div>
            </div>

            <div className="bg-sigma-dark rounded-xl p-3">
              <h3 className="text-sm font-semibold text-sigma-warning mb-1">改善成果</h3>
              <p className="text-sm text-sigma-text leading-relaxed">{selected.results}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-sigma-text mb-2">案例分析</h1>
      <p className="text-sm text-sigma-subtle mb-4">
        DMAIC 实战案例，理解六西格玛在真实场景中的应用
      </p>

      <div className="space-y-3">
        {caseStudies.map(cs => (
          <div
            key={cs.id}
            onClick={() => setSelected(cs)}
            className="bg-sigma-card border border-sigma-border rounded-xl p-4 active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-sigma-text">{cs.title}</h3>
                <p className="text-xs text-sigma-subtle mt-0.5">{cs.subtitle}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sigma-accent/20 text-sigma-accent shrink-0">
                {categoryLabels[cs.category]}
              </span>
            </div>
            <p className="text-sm text-sigma-subtle leading-relaxed line-clamp-2">
              {cs.summary.substring(0, 100)}...
            </p>
            <div className="flex flex-wrap gap-1 mt-3">
              {cs.tools.slice(0, 4).map(t => (
                <span key={t} className="text-xs px-1.5 py-0.5 bg-sigma-dark rounded text-sigma-subtle">{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
