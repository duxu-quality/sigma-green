/**
 * 题干处理工具 — 运行时清洗嵌入答案、检测图表引用、动态生成选项标签
 */

// 匹配题干中嵌入的答案模式
const EMBEDDED_ANSWER_PATTERNS = [
  /\s*答案[：:]\s*[A-Ea-e]+\s*$/g,           // "答案 C"、"答案  B"
  /\s*正确.{0,6}[：:]\s*[A-Ea-e]+\s*$/g,      // "正确的是：B"、"正确的是 B"
  /\s*错误.{0,6}[：:]\s*[A-Ea-e]+\s*$/g,      // "错误的是：BDE"、"错误的是 B"
  /\s*[（(]\s*[A-Ea-e]+\s*[）)]\s*$/g,        // "（ C ）"、"(B)"
  /\s*正确.{0,6}[：:]\s*[A-Ea-e,\s]+$/g,      // "正确的是：A，B，D"
  /\s*错误.{0,6}[：:]\s*[A-Ea-e,\s]+$/g,      // "错误的是：BDE"
  /\s+\d+\s+[A-E]\s*$/g,                      // "72 B" 数字+字母结尾
];

// 轻度图表引用（题干提及但可能仍可作答）
const MILD_VISUAL_REF = /(下图|如图|见图|图中|上图|箱线图|box\s*plot|直方图|histogram|帕累托|pareto|概率图|网络图|残差图|散点图|正态概率|分布如图)/i;

// 重度图表引用（题干强依赖图表数据，缺失则无法作答）
const STRONG_VISUAL_REF = /(下表为|下表列出|下表是|下表表示|下图是|下图显示|如图是|根据下表|根据下图|根据图中|数据如下表|如下表所示|下表为|方差分量表|设计表格|如下图形|绘制如下|如下表|根据.*表|根据.*图)/i;

/**
 * 清洗题干中嵌入的答案文字
 * @param {string} text - 原始题干
 * @returns {string} 清洗后的题干
 */
export function cleanQuestionStem(text) {
  if (!text || typeof text !== 'string') return text;
  let cleaned = text;
  for (const pattern of EMBEDDED_ANSWER_PATTERNS) {
    cleaned = cleaned.replace(pattern, '').trim();
  }
  // 清理末尾多余的标点
  cleaned = cleaned.replace(/[：:]\s*$/g, '').trim();
  // 末尾如果是空括号，补充问号
  cleaned = cleaned.replace(/[（(]\s*[）)]\s*$/g, '（ ）').trim();
  return cleaned;
}

/**
 * 检测题干是否引用了图表
 * @param {string} text - 题干文本
 * @returns {boolean}
 */
export function hasVisualRef(text) {
  if (!text) return false;
  return MILD_VISUAL_REF.test(text);
}

/**
 * 检测是否强依赖图表（缺失数据无法作答）
 * @param {string} text - 题干文本
 * @returns {boolean}
 */
export function isStrongVisualRef(text) {
  if (!text) return false;
  return STRONG_VISUAL_REF.test(text);
}

/**
 * 动态生成选项标签 A-Z
 * @param {number} count - 选项数量
 * @returns {string[]} 如 ['A','B','C','D','E']
 */
export function generateOptionLabels(count) {
  return Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i));
}

/**
 * 判断是否为多选题
 * @param {*} answer - 题目的 answer 字段
 * @returns {boolean}
 */
export function isMultiSelect(answer) {
  return Array.isArray(answer);
}

/**
 * 富化题目数据（运行时处理）
 * @param {object} question - 原始题目对象
 * @returns {object} 富化后的题目
 */
export function enrichQuestion(question) {
  return {
    ...question,
    question: cleanQuestionStem(question.question),
    _hasVisualRef: hasVisualRef(question.question),
    _isStrongVisualRef: isStrongVisualRef(question.question),
    _isMulti: isMultiSelect(question.answer),
  };
}
