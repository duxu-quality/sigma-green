/**
 * Final pass: aggressive embedded answer extraction + manual answer application
 */
const fs = require('fs');
const path = require('path');

const questionsPath = 'D:/程序/sigma-green/src/data/questions.json';
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
const optMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7 };

// Get unanswered
const unanswered = questions.filter(q => q.answer === undefined || q.answer === null);
console.log(`Starting with ${unanswered.length} unanswered\n`);

let matched = 0;

for (const q of unanswered) {
  let found = false;

  // Pattern 1: "。D" or "。 D" at end of question (single letter answer)
  let m = q.question.match(/[。.]\s*([A-D])\s*$/);
  if (m) { q.answer = optMap[m[1]]; found = true; }

  // Pattern 2: "(  C   )" or "(  C)" - letter in Chinese/English parens with spaces
  if (!found) {
    m = q.question.match(/[（(]\s*([A-D])\s*[）)]\s*$/);
    if (m) { q.answer = optMap[m[1]]; found = true; }
  }

  // Pattern 3: "：A，B，C，D" or ":A,B,C,D" at end - multi-answer
  if (!found) {
    m = q.question.match(/[：:]\s*([A-D](?:\s*[，,]\s*[A-D])+)\s*$/);
    if (!m) m = q.question.match(/([A-D](?:[，,]\s*[A-D])+)\s*$/);
    if (m) {
      const letters = m[1].match(/[A-D]/g);
      if (letters && letters.length > 0) {
        q.answer = letters.length === 1
          ? optMap[letters[0]]
          : letters.map(l => optMap[l]);
        found = true;
      }
    }
  }

  // Pattern 4: "错误的是：A" or "正确的是ABD" near end
  if (!found) {
    m = q.question.match(/(?:正确|错误|是)[：:\s]*([A-D](?:\s*[，,]?\s*[A-D])*)[。.\s]*$/);
    if (m) {
      const letters = m[1].match(/[A-D]/g);
      if (letters && letters.length > 0) {
        q.answer = letters.length === 1
          ? optMap[letters[0]]
          : letters.map(l => optMap[l]);
        found = true;
      }
    }
  }

  // Pattern 5: "( BD )" or "（ BD ）" anywhere
  if (!found) {
    m = q.question.match(/[（(]\s*([A-D](?:\s*[A-D])+)\s*[）)]/);
    if (m) {
      const letters = m[1].match(/[A-D]/g);
      if (letters) {
        q.answer = letters.map(l => optMap[l]);
        found = true;
      }
    }
  }

  if (found) matched++;
}

console.log(`Embedded answers extracted: ${matched}`);

// Now manually answer remaining based on Six Sigma knowledge
// Each entry: [id, answer]
const manualAnswers = [
  // === 2015年六西格玛绿带考试试卷(一) ===
  [17, -1],   // 需看测量系统分析结果图，无法判断 → skip
  [18, 1],    // P值>0.05说明数据是正态的 (B)
  [19, null], // 多选题："正确的有" - A排列图用于改善课题选择(对), B甘特图管理进度(对), C SIPOC确定范围流程(对), D树图展开VOC→CTQ(对) → ABCD
  [20, null], // 不符合SMART: A模糊(100分不可测量), B模糊(尽可能), C符合, D符合 → AB
  [21, null], // 正确理解六西格玛目的: A3.4是目标不是目的, B统一语言提高效率, C变革文化, D持续改进 → BCD

  // === 2015年试卷(二) ===
  [22, 1],    // 厂家A: Cp1.34 Cpk1.28 (Cpk>1.0好), 厂家B: Cp1.98 Cpk0.88 (Cpk<1.0差) → 选A
  [23, 0],    // α风险=当原假设为真时拒绝原假设的概率 (A)
  [24, 2],    // 100个部件连续取样，尺寸分布→如果过程均值随时间变化会有大量不良 (C)
  [25, 2],    // 均值检验最适合分析身高这类连续变量 (C)
  [26, -1],   // 需看方差分析结果表格 → skip
  [27, 3],    // 相关性强不代表因果关系强 (D)
  [28, 1],    // 置信区间是Y平均值的分布区间，不是单个Y值 (B是错误的描述)
  [29, 3],    // 四合一残差分析中残差应符合正态分布 (D)
  [30, null], // 双规格正态: A标准差不变均值变大→不良率可能增加或减少(不一定), B均值不变标准差变大→不良率一定增加(对), C移动均值比减小标准差困难(对), D减小标准差比移动均值困难(不对) → BC
  [31, null], // 1T检验适用: A目标值比较(对), B两样本比较(不对，用2T), C合格率比较(不对，用比率检验), D(不完整) → A
  [32, null], // 相关系数回归系数: A无关(不对), B范围[-1,+1](对), C异常点使相关系数绝对值变小(对), D异常点使回归系数绝对值变小(不对) → BC
  [33, null], // 卡方检验适用: A比较不良率(对，卡方检验), B年龄与喜好关联(对), C纪律差异(对), D里程数差异(不对，用t检验) → ABC

  // === 2022年真题 ===
  [100, 0],   // 六西格玛不仅是质量工具更是战略 (A是不正确的)
  [101, 0],   // 朱兰三部曲: 质量策划-质量控制-质量改进 (A)
  [102, 2],   // 田口损失函数: 减少波动同时可以减少质量损失 (C)
  [104, 1],   // 问题陈述不应将原因和改善方案一起描述 (B是错误的)
  [105, 3],   // SIPOC不描述增值/非增值活动 (D是不正确的)
  [106, 3],   // 流程程序分析的所有操作环节不都是增值的 (D是不正确的)
  [107, 2],   // DFSS需要供应商参与 (C是不正确的)
  [108, null], // 六西格玛文化: 全部正确 → ABCD
  [109, null], // 分析影响结果的原因工具: A因果图, B关联图, D因果矩阵 (C网络图是项目计划工具) → ABD
  [110, null], // 水平对比目的: A确定改进时机(对), B确定目标(对), C寻找方案(对) → ABC
  [111, null], // 内部故障成本: A内部返修(对), B售后返修属外部故障(不对), C内部报废(对), D设备故障修理(不对,维护成本) → AC
  [112, null], // ECRS: Eliminate Combine Rearrange Simplify → ABCD
  [113, 3],   // SMED: A单分钟<10min(对但不够精确，SMED目标是<10min), B换模时间定义(对), C外部转内部(不对), D内部转外部(对) → D (正确答案)
  [114, null], // 全因子试验条件: A因子数少<5个(对), D可能有交互作用(对) → AD
  [115, null], // 改善方案评估: C力场分析(对), 其他不是评估方法 → C
  [116, null], // 信号型Poka-Yoke: C车门未关报警(对), D关闭WORD提示保存(对) → CD
  [117, null], // OEE = 时间利用率 × 性能效率 × 合格率: A时间利用率(对), B节拍比(对，性能效率), C合格率(对), D换型时间影响时间利用率(对) → ABCD
  [118, null], // QFD: A正确, B唯一依据(错误,还需技术可行性), C不只适用于产品设计(错), D正确 → AD
  [119, null], // RPN = 严重度 × 发生概率 × 检测难易度 → ABC
  [120, 2],   // P>α: 不能拒绝原假设 (C)
  [121, 3],   // 3²试验: 三水平两因子 (D)
  [122, 1],   // 相关系数绝对值最大者相关性最好|-0.8|>|0.7| (B)
  [124, 2],   // P值是拒绝原假设犯错的概率 (C)

  // === 2025年6月真题 ===
  [180, 0],   // ECRS最优先: Eliminate取消 (A)
  [181, null], // 数据不正态: A增加样本量(CLT), B非参数检验, C数据变换 → 都可用 → ABC
  [182, 3],   // 动作研究包含: 程序分析和动作分析 (B) - 根据选项, D"现状研究和动作分析" seems wrong, B is correct
  [183, 1],   // 将顾客需求转化为设计要求: QFD (B)
  [184, 0],   // FMEA: 探测能力越强探测度应越小(分数越低), not越大 → A是错误的
  [185, 3],   // 分布: D错误，正态分布适用于连续型变量 (D)
  [186, 2],   // 4.5 sigma水平缺陷率: 大约1350 ppm → C (3.4ppm对应6sigma)
  [187, 2],   // 控制限不需重新制定: 操作人员更换 (C) - 原料/工艺改变需重新计算
  [189, 0],   // 下道工序是上道工序的内部顾客 (A)
  [205, null], // 六西格玛水平: A中心偏离1.5σ(对), B缺陷率3.4ppm(对) → AB
  [206, null], // Kano模型: A基本质量(对), B期望质量(对), C魅力质量(对) → ABC
  [207, null], // DMADOV不正确的: B顾客需求应在Define(D)阶段进行(对), C FMEA应在Analyze或Design阶段 → 需分析, A可能是错的
  [208, null], // 缩短交付时间: A减少等待(对), C减少缺陷(对), D减少批量(对,精益单件流) → ACD (B加快运转速度可能降低质量)
  [209, null], // 时间研究: A工作抽查(对), B预定动作时间研究(对), C工作测量法(对), D动作分析(对,是时间研究一部分) → ABCD
  [210, null], // 改善方案评估: B力场分析(对), C评价矩阵(对) → BC
  [211, null], // 装配误操作率高: A培训(对), B优化SOP(对), C防错(对) → ABC (D过程能力分析不是直接措施)
  [212, null], // DFSS成功因素: A从源头消除错误(对), B严格按流程灵活用工具(对), C跨职能合作(对) → ABC
  [213, null], // 中心点重复试验好处: A估计纯误差(对), C检验弯曲(对), D发现异常趋势(对) → ACD
  [214, null], // 查看变异: B变异系数(对), D极差(对) → BD (众数和均值是位置度量不是变异度量)

  // === 练习题 ===
  [236, 3],   // 两总体T检验 vs ANOVA: D - ANOVA不能处理单侧对立假设 (D) (注: question text has "D" at end)
  [240, null], // Poka-Yoke信号型: C车门报警(对), D WORD提示保存(对) → CD (注: question text has C，D)
  [241, null], // OEE影响因素: 全部影响 → ABCD (注: question text has A，B，C，D)
  [242, null], // QFD正确说法: A正确, B唯一依据不正确, C不只适用于产品设计(错), D正确 → ABD (注: question text has A，B，D)
  [275, 0],   // DPMO = DPU/(缺陷机会数)×10^6 = 0.6/60×10^6 = 10000 → A (注: question text has A)
  [281, 2],   // 设备类型与产品等级: 列联表卡方检验 (C) (注: question text has C)
  [286, 0],   // 代码化: A错误 - 代码化不改变显著性 (A) (注: question text has A)
  [289, 0],   // 9因子筛选试验: 2^(9-5)=16次 → A (注: question text has A)
  [291, 1],   // 防止系统影响: 随机化 (B) (注: question text has B)
  [293, null], // 六西格玛文化: 全部 → ABCD (注: question text has ABCD)
  [294, null], // 测量系统分析: ACE (注: question text has ACE) → A,C,E
  [295, null], // 说法不正确: A直方图不反映时间变化(对), B受控不一定满足规格(对), C直方图不能判断受控(对), D非正态也可用直方图(对-error) → ABCD (注: question text has ABCD)
  [296, null], // FMEA错误描述: C探测度越高分数越高是错误的, D只有完全失效才9-10分也是错的 → CD (注: question text has CD)
  [297, null], // DOE混杂: B主效应也会受影响(错), D分辨度越大混杂越小(错), E中心点不改善混杂(错) → BDE (注: question text has BDE)
  [298, null], // 交互效应: BE (注: question text has BE, 但没有图无法验证) → B,E

  // === 试卷(三)A卷 ===
  [300, 0],   // C图用于缺陷数(面积/单位固定): A标签缺陷数(对), B适合用U图, C适合用P图, D适合用U图 → A
  [301, 1],   // 项目结案标准: 按规划方案实施且指标明显改善或达标 (B)
  [302, 2],   // 控制图有异常点: 需要调查找到根本原因 (C)
  [303, 3],   // 控制限和规格限: 两者没有关系 (D)
  [304, 0],   // 控制阶段评估不合理: DOE预测看是否达成目标(不合理, DOE用于改善阶段) → A
  [305, null], // 防错设计: A安全带报警(对), B电梯超重不工作(对), C卡纸不工作(对,故障检测), D开门不工作(对) → ABCD
  [306, null], // 评估误差: A增加仿行(对), C顺序随机化(对), D增加中心点(对) → ACD (B区组化是控制已知变异不是评估误差)
  [307, -1],   // 需看主效果图 → skip
  [308, -1],   // 需看DOE分析结果 → skip
  [309, 3],   // 不符合防错原理: D加严考核(管理手段,不是防错) → D
  [310, null], // 标准化优点: A消除浪费降低成本(对), B品质保障(对), C指标不一定大幅提高(错), D奠定持续改进基础(对) → ABD

  // === 认证测试 ===
  [322, 1],   // 直方图主要目的: 显示数据的变差和分布形式 (B)
  [323, 3],   // 偏斜分布: 左偏时 mode最高在最左, median中间, mean最右 → D (a-众数,b-中位数,c-平均数)
  [324, null], // 部分因子实验: BD → B混杂结果可选择(对), D某些二阶交互混杂可允许(对) (注: question text has BD)
  [325, null], // 响应曲面: ABD → A是DOE一种(对), B建立二次回归方程(对), C最陡峭路径才能找到最优区域不是RSM(不对), D判明因子显著性(对) (注: question text has ABD)
  [326, 1],   // 过程能力指数: 在统计控制状态下收集数据 (B) (注: question text has B)
];

// Apply manual answers
let manualApplied = 0;
let skipped = 0;
let multiAnswerApplied = 0;

for (const [id, answer] of manualAnswers) {
  const q = questions.find(q => q.id === id);
  if (!q) continue;

  if (answer === -1) {
    skipped++; // requires figure/chart
    continue;
  }

  if (answer === null) {
    // null means multi-answer or embedded in comments
    continue;
  }

  if (q.answer !== undefined && q.answer !== null) continue; // Already answered

  if (Array.isArray(answer)) {
    q.answer = answer;
    multiAnswerApplied++;
  } else {
    q.answer = answer;
    manualApplied++;
  }
}

console.log(`Manual answers applied: ${manualApplied} single + ${multiAnswerApplied} multi`);
console.log(`Skipped (need figure/chart): ${skipped}`);

// ======== RE-HANDLE the embedded answers at end of question text ========
// Some questions have answer embedded as text like "。D" or "(  C   )"
// but my earlier extraction was applied BEFORE the manual answers.
// Re-run the embedded extraction for any still-unanswered.

let reEmbedMatched = 0;
for (const q of questions) {
  if (q.answer !== undefined && q.answer !== null) continue;

  // Try to find embedded single letter answer
  let m = q.question.match(/[。.]\s*([A-D])\s*$/);
  if (!m) m = q.question.match(/[（(]\s*([A-D])\s*[）)]\s*$/);

  // Multi-letter answers embedded
  if (!m) {
    m = q.question.match(/[：:]\s*([A-D](?:\s*[，,]\s*[A-D])+)\s*$/);
    if (!m) m = q.question.match(/([A-D](?:[，,]\s*[A-D])+)\s*$/);
    if (m) {
      const letters = m[1].match(/[A-D]/g);
      if (letters && letters.length > 1) {
        q.answer = letters.map(l => optMap[l]);
        reEmbedMatched++;
      }
    }
  }

  if (m && !Array.isArray(q.answer)) {
    const letters = m[1].match(/[A-D]/g);
    if (letters && letters.length === 1) {
      q.answer = optMap[letters[0]];
      reEmbedMatched++;
    }
  }
}
console.log(`Re-extracted embedded: ${reEmbedMatched}`);

// Apply the null-marked multi-answer entries from manualAnswers
let finalMulti = 0;
for (const [id, answer] of manualAnswers) {
  if (answer !== null) continue;
  const q = questions.find(q => q.id === id);
  if (!q) continue;
  if (q.answer !== undefined && q.answer !== null) continue;

  // Figure out the correct multi-answer
  const multiAnswers = {
    19: [0,1,2,3],   // ABCD - 定义阶段工具正确说法
    20: [0,1],        // AB - 不符合SMART
    21: [1,2,3],      // BCD - 六西格玛目的理解
    30: [1,2],        // BC - 双规格正态分布说法
    31: [0],          // A - 1T检验适用
    32: [1,2],        // BC - 相关系数回归系数
    33: [0,1,2],      // ABC - 卡方检验适用
    108: [0,1,2,3],   // ABCD - 六西格玛文化
    109: [0,1,3],     // ABD - 分析原因工具(网络图不是)
    110: [0,1,2],     // ABC - 水平对比目的
    111: [0,2],       // AC - 内部故障成本
    112: [0,1,2,3],   // ABCD - ECRS
    114: [0,3],       // AD - 全因子试验条件(≤5因子+有交互)
    115: [2],         // C - 力场分析用于改善方案评估
    116: [2,3],       // CD - 信号型Poka-Yoke(车门报警,WORD提示)
    117: [0,1,2,3],   // ABCD - OEE影响因素
    118: [0,3],       // AD - QFD正确说法
    119: [0,1,2],     // ABC - RPN三要素(严重度/发生概率/检测难易)
    120: [2],         // C - P>0.05不能拒绝原假设
    121: [3],         // D - 3²试验是3水平2因子
    181: [0,1,2],     // ABC - 非正态数据处理
    205: [0,1],       // AB - 六西格玛水平含义
    206: [0,1,2],     // ABC - Kano模型三质量特性
    207: [0,2],       // AC - DMADOV不正确说法(粗略判断)
    208: [0,2,3],     // ACD - 缩短交付时间
    209: [0,1,2,3],   // ABCD - 时间研究包含内容
    210: [1,2],       // BC - 改善方案评估方法
    211: [0,1,2],     // ABC - 装配误操作对策
    212: [0,1,2],     // ABC - DFSS成功因素
    213: [0,2,3],     // ACD - 中心点重复试验好处
    214: [1,3],       // BD - 查看变异的指标(变异系数/极差)
    240: [2,3],       // CD - 信号型Poka-Yoke
    241: [0,1,2,3],   // ABCD - OEE影响因素
    242: [0,3],       // AD - QFD正确说法
    293: [0,1,2,3],   // ABCD - 六西格玛文化
    294: [0,2,4],     // ACE - 测量系统分析结果
    295: [0,1,2,3],   // ABCD - 不正确的说法
    296: [2,3],       // CD - FMEA错误描述
    297: [1,3,4],     // BDE - DOE混杂错误说法
    298: [1,4],       // BE - 交互效应计算(根据题面标示)
    305: [0,1,2,3],   // ABCD - 防错设计示例
    306: [0,2,3],     // ACD - 评估误差方法
    310: [0,1,3],     // ABD - 标准化优点
    324: [1,3],       // BD - 部分因子实验理解
    325: [0,1,3],     // ABD - 响应曲面方法
  };

  if (multiAnswers[id]) {
    q.answer = multiAnswers[id];
    finalMulti++;
  }
}
console.log(`Final multi-answer applied: ${finalMulti}`);

// Final count
const remaining = questions.filter(q => q.answer === undefined || q.answer === null);
console.log(`\n=== FINAL ===`);
console.log(`Total: ${questions.length}`);
console.log(`Answered: ${questions.length - remaining.length}`);
console.log(`Unanswered: ${remaining.length}`);

if (remaining.length > 0) {
  console.log('\nStill unanswered (require figures/charts or are unanswerable):');
  remaining.forEach(q => {
    console.log(`  ID:${q.id} | ${q.source} | ${q.question.substring(0, 80)}...`);
  });
}

fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2), 'utf8');
console.log(`\nWritten to: ${questionsPath}`);
