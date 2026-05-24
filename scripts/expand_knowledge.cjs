const fs = require('fs');
const knowledgePath = 'D:/程序/sigma-green/src/data/knowledge.json';
const existing = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));

const newTopics = [
  // ===== Define 阶段补充 =====
  {
    category: 'Define',
    title: '六西格玛的起源与发展',
    definition: '六西格玛于1986年由摩托罗拉工程师比尔·史密斯提出，后被通用电气（GE）杰克·韦尔奇推广为企业战略。名称来源于统计学：6σ质量水平表示每百万次机会中只有3.4个缺陷。',
    example: '摩托罗拉通过实施六西格玛在1988年获得美国波多里奇国家质量奖，GE在1995-2000年间通过六西格玛节省超过120亿美元。',
    examPoint: '常考六西格玛的创始人（比尔·史密斯）、推广者（杰克·韦尔奇）以及6σ=3.4ppm的含义（考虑1.5σ漂移）。'
  },
  {
    category: 'Define',
    title: 'PDCA 循环',
    definition: 'PDCA（Plan-Do-Check-Act）由休哈特提出、戴明推广。Plan制定计划，Do执行计划，Check检查效果，Act标准化或调整。是持续改进的基本方法论。',
    example: '涂布车间面密度波动大：Plan分析原因制定方案；Do调整涂布参数；Check测量面密度改善情况；Act将有效参数写入SOP。',
    examPoint: 'PDCA顺序不可颠倒，戴明将其发展为PDSA（Study替代Check）。与DMAIC的区别：PDCA更通用，DMAIC是六西格玛专用方法论。'
  },
  {
    category: 'Define',
    title: '六西格玛项目选择',
    definition: '六西格玛项目应与公司战略目标挂钩，通常从财务收益、顾客满意度、战略重要性、可行性四个维度评估。使用优先矩阵或加权评分法进行项目排序。',
    example: '某锂电池工厂年度目标为"降低制造成本10%"，筛选出降低涂布废料率、提升化成效率、减少包装损耗三个六西格玛项目。',
    examPoint: '项目选择原则：与战略一致、有明确财务收益、范围可控（3-6个月完成）、有数据支持。'
  },
  {
    category: 'Define',
    title: 'SMART 原则',
    definition: '项目目标制定需遵循SMART：Specific（具体）、Measurable（可测量）、Attainable（可实现）、Relevant（相关）、Time-bound（有时限）。',
    example: '好的SMART目标："2025年12月前，将EM01T电芯装配不良率从6.8%降至2.0%以下"。差的目标："提高产品质量"。',
    examPoint: '常考"以下哪个目标符合SMART原则"，辨别标准：有具体数字、截止日期、可衡量。'
  },
  {
    category: 'Define',
    title: '水平对比（Benchmarking）',
    definition: '将本企业的过程、产品、服务与行业最佳实践进行对比，识别差距，确定改进方向。可分为内部对比、竞争对比、功能对比和通用对比。',
    example: '某电池厂将其化成效率与宁德时代对比，发现对方单台设备日产能高出30%，以此为目标制定改进计划。',
    examPoint: 'Benchmarking用于Define阶段确立项目目标，也可用于Improve阶段寻找改进方案。'
  },
  {
    category: 'Define',
    title: '团队发展阶段模型',
    definition: '布鲁斯·塔克曼提出团队发展的四个阶段：形成期（Forming）、震荡期（Storming）、规范期（Norming）、执行期（Performing）。六西格玛项目团队需要快速走过前三个阶段进入执行期。',
    example: '新建叠片机改进团队初期成员互相不熟悉（形成期），对改进方向有分歧（震荡期），约定沟通机制后（规范期），高效完成DMAIC各阶段任务（执行期）。',
    examPoint: '常考四个阶段的名称和特点，尤其是震荡期是否正常（是团队发展必经阶段）。'
  },
  {
    category: 'Define',
    title: '新QC七种工具',
    definition: '亲和图（Affinity Diagram）、关联图（Interrelationship Diagram）、树图（Tree Diagram）、矩阵图（Matrix Diagram）、优先矩阵（Prioritization Matrix）、PDPC法（过程决策程序图）、网络图（Network Diagram）。主要用于定性分析和计划阶段。',
    example: '亲和图用于整理大量VOC信息；树图将CTQ层层展开为可测量的子特性；网络图（箭头图）确定项目关键路径。',
    examPoint: '区分新QC七工具与老QC七工具。新七工具偏向语言数据和计划，老七工具偏向数值数据和分析。'
  },
  {
    category: 'Define',
    title: '老QC七种工具',
    definition: '检查表（Check Sheet）、分层法（Stratification）、排列图（Pareto Chart）、因果图（Fishbone Diagram）、散点图（Scatter Plot）、直方图（Histogram）、控制图（Control Chart）。是日常质量管理和问题解决的基础工具。',
    example: '用检查表记录一周内化成工序的缺陷类型和频次，用排列图找到最频繁的缺陷类型，用因果图分析根本原因。',
    examPoint: '常考七种工具的名称及适用场景。排列图体现"关键的少数"原则（80/20法则）。'
  },
  {
    category: 'Define',
    title: '利益相关方分析',
    definition: '识别项目影响或被影响的所有人员/组织，包括发起人（Sponsor）、过程负责人（Process Owner）、团队成员、顾客、供应商等，分析其影响力和支持度，制定沟通计划。',
    example: '叠片对齐度改进项目：发起人是生产总监，过程负责人是叠片车间主任，关键利益方还包括设备供应商（需配合改造）。',
    examPoint: '倡导者（Champion）负责提供资源、消除障碍；过程负责人负责项目完成后维持改进成果。'
  },
  {
    category: 'Define',
    title: '精益生产核心思想',
    definition: '精益生产源于丰田生产方式（TPS），核心是消除一切浪费（Muda），以最少的资源创造最大的价值。两大支柱：准时化（JIT）和自働化（Jidoka）。',
    example: '锂电池生产线通过单件流减少在制品库存，通过安灯系统实现异常快速响应。',
    examPoint: '精益关注效率和速度（消除浪费），六西格玛关注质量和变异（减少缺陷），二者互补（精益六西格玛）。'
  },
  {
    category: 'Define',
    title: '七大浪费',
    definition: 'Taiichi Ohno提出七种浪费：搬运、库存、动作、等待、过量生产、过度加工、缺陷。后来加入"未利用的人才创造力"成为第八种浪费。记忆口诀：TIMWOOD。',
    example: '化成车间老化架堆积过多=库存浪费；操作员往返取料=动作浪费；上道工序产量超过下道需求=过量生产浪费。',
    examPoint: '区分七种浪费类型，能根据场景判断属于哪种浪费。'
  },

  // ===== Measure 阶段补充 =====
  {
    category: 'Measure',
    title: '描述性统计量',
    definition: '中心趋势度量：均值（Mean）、中位数（Median）、众数（Mode）。离散程度度量：极差（Range）、方差（Variance）、标准差（Standard Deviation）、变异系数（CV）。',
    example: '激光切极片宽度数据：均值为50.2mm、标准差为0.05mm，说明中心位置靠近目标50mm且波动小。',
    examPoint: '区分均值/中位数/众数的适用场景：存在异常值时中位数比均值更稳健。变异系数CV=σ/μ用于比较不同量纲的波动。'
  },
  {
    category: 'Measure',
    title: '正态分布',
    definition: '正态分布（Normal Distribution）是最重要的连续概率分布，由均值μ和标准差σ决定。特性：对称钟形、均值=中位数=众数、68%数据落在μ±σ内、95%在μ±2σ内、99.73%在μ±3σ内。',
    example: '涂布面密度服从正态分布，均值195g/m²，标准差3g/m²，则大约95%的面密度值在189-201g/m²之间。',
    examPoint: '许多统计方法（t检验、ANOVA、回归）的假设条件要求数据正态或残差正态。正态性检验常用Anderson-Darling检验或正态概率图。'
  },
  {
    category: 'Measure',
    title: '箱线图（Box Plot）',
    definition: '箱线图直观展示数据的五数概括：最小值、第一四分位数（Q1）、中位数（Q2）、第三四分位数（Q3）、最大值。箱子代表IQR（Q1到Q3），箱子中间线为中位数，须线延伸到非异常值范围。',
    example: '对比两条涂布线的面密度箱线图，可同时看出各自的中心、波动范围以及是否存在异常点。',
    examPoint: '箱线图适合比较多组数据的分布特征，识别异常值（距Q1/Q3超过1.5×IQR的点）。'
  },
  {
    category: 'Measure',
    title: '抽样方法',
    definition: '随机抽样（简单随机抽样、分层抽样、系统抽样、整群抽样）和非随机抽样（便利抽样、判断抽样、配额抽样）。六西格玛强调随机抽样以确保样本代表性。',
    example: '从100卷极片中随机抽取5卷，每卷测3个点（分层抽样），评估整批极片面密度的一致性。',
    examPoint: '样本量越大，估计越精确。抽样误差与√n成反比（n为样本量）。代表性比样本量更重要。'
  },
  {
    category: 'Measure',
    title: '概率分布',
    definition: '常见分布：正态分布（连续数据）、二项分布（合格/不合格计数）、泊松分布（单位缺陷数）、超几何分布（不放回抽样）、指数分布（寿命/间隔时间）、威布尔分布（可靠性）。',
    example: '每平方电极上针孔数~泊松分布；电池容量~正态分布；化成后不合格品比率~二项分布。',
    examPoint: '区分各分布的适用场景。二项分布条件：每次试验独立、只有两种结果、概率恒定。泊松分布条件：事件独立、发生率恒定。'
  },
  {
    category: 'Measure',
    title: '测量系统分析（MSA）详解',
    definition: 'MSA评估测量系统的五个统计特性：偏倚（准确度）、线性（量程范围内的偏倚一致性）、稳定性（时间维度的偏倚一致性）、重复性（同一人多次测量的变异）和再现性（不同人之间的变异）。',
    example: '三坐标测量机对电芯尺寸做MSA：选3名检验员、10个样品、每人测2次（3×10×2交叉设计），计算GR&R%。',
    examPoint: 'GR&R<10%优秀，10-30%可接受，>30%不合格。%P/T（公差比）<10%好。区分重复性（量具变异）和再现性（操作员变异）。'
  },
  {
    category: 'Measure',
    title: '数据类型',
    definition: '计量型（连续型）：可测量，如长度、重量、温度、时间。计数型（离散型）：可计数，分为计件型（合格/不合格，服从二项分布）和计点型（每单位缺陷数，服从泊松分布）。',
    example: '电芯电压（2.8-4.2V连续）=计量型；外观检查合格/不合格=计数型计件；每块极片上划痕数=计数型计点。',
    examPoint: '数据类型决定分析工具选择：计量型用均值-极差分析、t检验；计数型用比率检验、卡方检验、P控制图。'
  },
  {
    category: 'Measure',
    title: '过程能力指数 Cp 与 Cpk',
    definition: 'Cp=公差宽度/(6σ)衡量潜在能力（不考虑中心偏移）；Cpk=min[(USL-μ)/(3σ),(μ-LSL)/(3σ)]衡量实际能力（考虑中心偏移）。Cpk≤Cp，两者差值越大说明中心偏移越严重。',
    example: '注液量规格50±5ml，标准差1ml，均值51ml：Cp=10/6=1.67，Cpk=min(4/3,6/3)=1.33。Cp>Cpk说明均值偏向上限。',
    examPoint: 'Cp>1.33且Cpk>1.33为良好。Cpk<1需改进。Pp/Ppk是长期能力指数（包含过程漂移）。Cpk和Ppk差值大表示过程随时间不稳定。'
  },
  {
    category: 'Measure',
    title: '价值流图（VSM）',
    definition: '价值流图用图标和符号绘制从原材料到成品的全流程，标注信息流和物流，计算增值时间与非增值时间，识别流程瓶颈和浪费。',
    example: '绘制电芯从涂布到分容的全流程VSM，发现等待时间占生产周期的65%，其中老化等待占比最大。',
    examPoint: 'VSM在Measure阶段使用，帮助识别关键测量点和改进机会。增值时间（VA）占总周期时间（TPCT）的比例通常小于5%。'
  },

  // ===== Analyze 阶段补充 =====
  {
    category: 'Analyze',
    title: 't 检验',
    definition: 't检验比较均值差异：1-Sample t（比较样本均值与目标值）、2-Sample t（比较两组均值）、Paired t（比较配对数据均值差）。适用条件：数据独立、近似正态。',
    example: '1-Sample t：新化成工艺的容量是否达到目标值4.2Ah。2-Sample t：A线B线容量均值是否有差异。Paired t：同一批电芯改进前后容量对比。',
    examPoint: '先验证正态性和等方差（2-Sample t需等方差），若不满足用非参数替代（Mann-Whitney或Wilcoxon）。'
  },
  {
    category: 'Analyze',
    title: '卡方检验（Chi-Square Test）',
    definition: '卡方检验用于分析分类变量间的关联性或比例差异。包括拟合优度检验（比较观测频数与期望频数）和独立性检验（判断两个分类变量是否关联）。',
    example: '检验不同班次（白班/夜班）的不良品率是否有显著差异；或检验某设备的产品等级与理论比例是否一致。',
    examPoint: '卡方检验要求期望频数≥5。用于计数型数据，不能用于连续型数据。'
  },
  {
    category: 'Analyze',
    title: '相关分析与回归分析',
    definition: '相关分析（Correlation）用相关系数r衡量两变量线性关联强度，r∈[-1,1]，|r|越接近1表示线性关系越强。回归分析（Regression）建立Y=f(X)的方程，用于预测和解释。',
    example: '分析涂布温度与面密度之间的相关性：r=-0.85说明温度升高面密度显著降低。回归方程：面密度=210-0.5×温度。',
    examPoint: '相关不代表因果。R²（决定系数）表示模型解释的变异百分比，R²(adj)用于比较不同变量数的模型。多重共线性会使回归系数估计不稳定。'
  },
  {
    category: 'Analyze',
    title: '方差分析（ANOVA）详解',
    definition: 'ANOVA比较三组或多组均值差异，通过比较组间方差与组内方差的F比值进行。单因子ANOVA（One-Way）比较一个因子的多个水平；双因子ANOVA（Two-Way）可同时考察两因子及其交互作用。',
    example: '比较三种电解液配方对电池循环寿命的影响：用单因子ANOVA。比较不同温度和不同注液量的联合影响：用双因子ANOVA。',
    examPoint: 'ANOVA假设：独立、正态、等方差。残差分析验证假设。显著后需做多重比较（Tukey法），控制整体误判率。'
  },
  {
    category: 'Analyze',
    title: '非参数检验',
    definition: '非参数检验不依赖总体分布假设，适用于数据不正态或为等级/顺序数据的情形。常用方法：Mann-Whitney检验（替代2-Sample t）、Kruskal-Wallis检验（替代One-Way ANOVA）、Wilcoxon符号秩检验（替代Paired t）。',
    example: '客户满意度评分（1-5分等级数据），用Mann-Whitney比较两个分公司满意度是否有差异。',
    examPoint: '非参数检验的Power比参数检验低（需要更大样本量才能检测出相同差异）。当数据严重不正态时优先使用。'
  },
  {
    category: 'Analyze',
    title: '样本量计算',
    definition: '样本量取决于：显著性水平α（通常0.05）、检验功效Power（通常0.8或0.9）、最小可检测差异δ、总体标准差σ。δ越小、σ越大、Power要求越高，所需样本量越大。',
    example: '想要检测涂布面密度0.5g/m²的差值（σ=1.0，α=0.05，Power=0.9），每组需要约85个样本。',
    examPoint: '样本量不足会导致真实的差异无法被检验出来（Power不足）。过大的样本量增加成本却不一定增加价值。'
  },
  {
    category: 'Analyze',
    title: '多变异分析（Multi-Vari Analysis）',
    definition: '多变异图将过程变异分解为位置变异（within-unit/positional）、时间变异（temporal/cyclical）和单元间变异（unit-to-unit），帮助识别最大变异来源。',
    example: '极片厚度变异分析：同一极片内不同位置变异（位置变异）、不同时间段取样变异（时间变异）、不同卷号间变异（单元间变异）。',
    examPoint: '多变异图是图形化工具，用于在统计分析之前先目测判断主要变异来源，缩小分析范围。'
  },

  // ===== Improve 阶段补充 =====
  {
    category: 'Improve',
    title: 'DOE 基本概念',
    definition: '实验设计（Design of Experiments）是系统改变因子水平、观察响应变化、找出因子与响应之间关系的统计方法。关键术语：因子（Factor）、水平（Level）、响应（Response）、主效应（Main Effect）、交互作用（Interaction）。',
    example: '研究焊接温度和压力对焊接强度的影响：2因子2水平全因子实验（2²=4次试验），每个条件重复2次，共8次。',
    examPoint: '因子代码化（Coded Units）将高低水平表示为+1和-1，简化计算并消除量纲影响。随机化（Randomization）防止未知系统因素的干扰。'
  },
  {
    category: 'Improve',
    title: '部分因子实验设计',
    definition: '当因子数较多（≥5）时，全因子实验次数呈指数增长。部分因子实验（2^(k-p)）只运行全因子的一部分，牺牲一些高阶交互作用的估计能力（混杂），换取实验经济性。',
    example: '8因子筛选实验采用2^(8-4)=16次试验（分辨度IV），假设三阶及以上交互作用可忽略。',
    examPoint: '分辨度（Resolution）III：主效应不混杂，但可能与二阶交互混杂。IV：主效应不混杂，二阶交互间可能混杂。V：主效应和二阶交互都不混杂。分辨度越高越好。'
  },
  {
    category: 'Improve',
    title: '中心点与区组化',
    definition: '在因子实验中增加中心点（所有因子取中间水平）可检测模型弯曲效应并估计纯误差。区组化（Blocking）将噪音因子的影响分区隔离，提高实验精度。',
    example: '在2²实验基础上增加3个中心点（共7次），若中心点响应明显偏离线性预测，说明存在弯曲，需增加轴向点进行RSM分析。',
    examPoint: '中心点重复可估计纯误差（Pure Error）。区组化控制已知的噪音源（如材料批次、操作员差异），减少实验误差。'
  },
  {
    category: 'Improve',
    title: '响应曲面设计（RSM）详解',
    definition: 'RSM在因子筛选后，在最优区域附近拟合二次回归模型，找到因子最佳设置组合。常用设计：中心复合设计（CCD，有旋转性、可序贯）、Box-Behnken设计（因子数3-7，试验次数少但不可序贯）。',
    example: 'DOE筛选出温度和压力是影响焊接拉力的关键因子，RSM进一步确定最优参数组合：温度285°C、压力4.2MPa，拉力最大。',
    examPoint: 'CCF（中心复合表面设计）α=1，不具有旋转性。CCD的α>1时具有旋转性（Rotatability）。Box-Behnken所有因子都不会同时取极端水平，更安全。'
  },
  {
    category: 'Improve',
    title: 'SMED 快速换模',
    definition: 'SMED（Single Minute Exchange of Die）将换模时间压缩到个位数分钟（<10分钟）。核心方法：区分内部换模（必须停机）和外部换模（可不停机），将内部转化到外部，再优化剩下的内部操作。',
    example: '涂布机换卷时间从45分钟降至8分钟：提前准备新卷（外部化）、使用气胀轴快速夹紧（内部优化）、双人并行操作。',
    examPoint: 'SMED是精益工具，也是六西格玛Improve阶段常用的改进方法。区分内/外部换模是核心步骤。'
  },
  {
    category: 'Improve',
    title: '看板与拉动系统',
    definition: '看板（Kanban）是实现拉动生产的工具，下游工序通过看板信号向上游请求物料，避免过量生产。核心原则：只有被消耗的部分才会被补充。',
    example: '叠片工序设置最多存放2托盘的看板，当被化成消耗到只剩1托盘时，看板信号触发叠片生产补充。',
    examPoint: '看板数量=日需求×提前期×(1+安全系数)/容器容量。拉动vs推动：推动按计划生产（可能过量），拉动按实际消耗生产。'
  },
  {
    category: 'Improve',
    title: 'Pugh 矩阵',
    definition: 'Pugh矩阵（决策矩阵）用于在多个改进方案中进行系统比较和选择。设定评价标准和基准方案（Datum），各方案与基准比较（+更好、-更差、S相同），选择总分最高的方案。',
    example: '降低焊接不良的三种方案：A换新设备、B优化参数、C加强培训。以成本、效果、实施难度为评价标准，B方案总分最高。',
    examPoint: 'Pugh矩阵帮助团队客观选择方案，减少主观偏见。结合力场分析和成本效益分析形成完整的方案评估。'
  },

  // ===== Control 阶段补充 =====
  {
    category: 'Control',
    title: '控制图原理',
    definition: '控制图由休哈特于1924年创立，是SPC的核心工具。原理：将过程数据按时间顺序绘制，添加中心线（CL）和上下控制限（UCL/LCL=CL±3σ），区分偶然原因（Common Cause）和特殊原因（Special Cause）。',
    example: '化成容量Xbar-R控制图：每2小时取5个电芯测容量，Xbar监控均值变化，R监控极差变化。一点超出UCL表明设备异常需排查。',
    examPoint: '控制限≠规格限。控制限来自过程实际数据（过程声音），规格限来自顾客要求（顾客声音）。先评估过程受控，再评估过程能力。'
  },
  {
    category: 'Control',
    title: '计量型控制图',
    definition: 'I-MR（单值-移动极差图）：n=1。Xbar-R（均值-极差图）：n=2-9，最常用。Xbar-S（均值-标准差图）：n≥10，S比R更精确。控制限公式：UCL=CL+A2×R¯（Xbar图），UCL=D4×R¯（R图）。',
    example: '注液量监控（n=5/2h）：用Xbar-R图。单件小批量（n=1）：用I-MR图。大批量自动化检测（n=20）：用Xbar-S图。',
    examPoint: '实际中应先分析R图/S图（变异是否受控），再分析Xbar图（中心是否受控）。'
  },
  {
    category: 'Control',
    title: '计数型控制图',
    definition: 'P图（不合格品率，样本量可不等）、NP图（不合格品数，样本量固定）、C图（缺陷数，单位面积/时间固定）、U图（单位缺陷数，单位面积/时间可变）。',
    example: '每天抽100个电芯外观检查，用NP图；每个电芯表面针孔数用C图；不同批次样本量不同时用P图。',
    examPoint: 'P图和NP图基于二项分布，C图和U图基于泊松分布。计数型控制图灵敏度低于计量型（需要更大样本量）。'
  },
  {
    category: 'Control',
    title: '控制图判异准则',
    definition: '8条判异准则（Western Electric Rules）：1点超出3σ限、连续9点在中心线同侧、连续6点上升或下降、连续14点交替上下等。违反任一条表明存在特殊原因。',
    example: '化成容量连续7点上升趋势→可能老化时间漂移。连续8点在中心线上方→可能来料异常或设备参数偏移。',
    examPoint: '常考判异准则的具体条件。连续K点在中心线同侧：K=7(C区外)/9(C区内)。准则1-4关注均值偏移，准则5-8关注非随机模式。'
  },
  {
    category: 'Control',
    title: '过程能力与过程性能',
    definition: 'Cp/Cpk基于短期（组内）变异σ_within，反映过程潜在能力。Pp/Ppk基于长期（总体）变异σ_overall，反映过程实际性能。Ppk≤Cpk，差值大说明过程随时间不稳定或存在显著的组间变异。',
    example: '分析30天数据：Cp=1.52，Pp=1.10，Cpk=1.38，Ppk=0.92。Cp和Pp差距大说明批次间变异大。Ppk<1需立即改善。',
    examPoint: '应使过程先受控（SPC），再评估Cp/Cpk。Cp>1.33和Cpk>1.33是一般要求，关键特性要求Cp>1.67。'
  },
  {
    category: 'Control',
    title: 'OEE 设备综合效率',
    definition: 'OEE = 时间利用率(Availability) × 性能效率(Performance) × 合格品率(Quality)。时间利用率=(运行时间/计划运行时间)；性能效率=(实际产出/理论产出)；合格品率=(合格品数/总产出数)。',
    example: '涂布机OEE：时间利用率90%（故障停机损失10%）、性能效率85%（速度损失15%）、合格率98%（不良损失2%），OEE=90%×85%×98%=75%。',
    examPoint: '世界级OEE标准为85%以上。OEE帮助识别六大损失：设备故障、换型调整、空转暂停、速度降低、不良品、启动损失。'
  },
  {
    category: 'Control',
    title: '标准化作业',
    definition: '标准化作业是将最佳操作方法文件化、确保所有人按同样方式执行。由三个要素组成：节拍时间（Takt Time）、标准作业顺序、标准在制品量。是持续改进的基线。',
    example: '将优化后的化成参数（电压曲线、温度曲线、时间）写入标准化作业指导书SOP，并培训所有操作员统一执行。',
    examPoint: '标准化是控制阶段的核心工作。没有标准化，改进成果无法维持。SDCA（标准化-执行-检查-调整）循环维护标准，PDCA改进标准。'
  },
  {
    category: 'Control',
    title: '防错（Poka-Yoke）详解',
    definition: '防错由新乡重夫（Shigeo Shingo）提出，是在过程中设置装置或方法，使错误不可能发生或一发生就能被发现。三种层级：预防型（防止发生）、检测型（发生后发现）、纠正型（发生后纠正）。',
    example: 'USB Type-C接口不分正反=预防型；车门未关警报=信号型检测；汽车安全带锁止=物理型预防。',
    examPoint: '区分控制型（强制停止）和信号型（警告提示）防错。防错是控制阶段的重要工具，比培训和处罚更可靠。'
  },
  {
    category: 'Control',
    title: 'DFSS 六西格玛设计',
    definition: 'DFSS（Design for Six Sigma）用于新产品/新流程设计，目标是从一开始就达到6σ质量水平。常用路线图：DMADV（Define, Measure, Analyze, Design, Verify）或IDOV（Identify, Design, Optimize, Verify）。',
    example: '新电池型号开发采用DMADV：Define定义需求→Measure测量关键特性→Analyze分析概念方案→Design详细设计→Verify验证可靠性。',
    examPoint: 'DMAIC用于已有过程改进，DFSS/DMADV用于新设计。DFSS强调在早期设计阶段预防缺陷，而非事后改进。'
  }
];

// Merge, avoiding duplicates
const existingTitles = new Set(existing.map(k => k.title));
let maxId = Math.max(...existing.map(k => k.id || 0));

const added = [];
for (const topic of newTopics) {
  if (!existingTitles.has(topic.title)) {
    maxId++;
    added.push({ id: maxId, ...topic });
    existingTitles.add(topic.title);
  }
}

const merged = [...existing, ...added];
console.log(`Existing: ${existing.length}`);
console.log(`Added: ${added.length}`);
console.log(`Total: ${merged.length}`);
console.log('');
const byCat = {};
merged.forEach(x => { byCat[x.category] = (byCat[x.category]||0)+1; });
Object.entries(byCat).sort((a,b)=>b[1]-a[1]).forEach(([cat,count]) => console.log(cat + ':', count));

fs.writeFileSync(knowledgePath, JSON.stringify(merged, null, 2), 'utf8');
console.log('\nWritten to:', knowledgePath);
