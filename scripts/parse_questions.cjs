const fs = require('fs');
const path = require('path');

const extractedDir = 'C:/Users/Administrator/Desktop/新建文件夹/_extracted';
const outputPath = 'D:/程序/sigma-green/src/data/questions_parsed.json';

// DMAIC category mapping based on chapter/content keywords
const categoryKeywords = {
  'Define': ['界定', '定义', 'DMAIC', '六西格玛管理概论', '倡导者', '黑带', '绿带', '组织结构', '战略', '平衡计分卡', 'SWOT', '精益生产', '精益思想', 'PDCA', '休哈特', '戴明', '朱兰', '田口', '克劳斯比', '卡诺', 'KANO', '顾客声音', 'VOC', 'CTQ', '第一章', '第1章', '项目选择', '项目特许任务书', '团队发展', '形成期', '震荡期', '规范期', '执行期', '亲和图', '关联图', '树图', '矩阵图', 'PDPC', '网络图', '甘特图', '优先矩阵', '力场分析', 'SIPOC', '水平对比', 'benchmarking'],
  'Measure': ['测量', 'MSA', '测量系统', 'GRR', 'Gage', '重复性', '再现性', '偏倚', '线性', '稳定性', '分辨力', '计量型', '计数型', '属性一致性', 'DPMO', 'DPU', 'DPO', 'FTY', 'RTY', '流通合格率', '直通率', '过程能力', 'Cp', 'Cpk', 'Pp', 'Ppk', '正态分布', '正态性', '第二章', '第2章', '第五章', '第5章', '抽样', '样本', '置信区间', '描述性统计', '均值', '中位数', '标准差', '箱线图', '直方图', '排列图', '柏拉图', '因果图', '因果矩阵', 'FMEA', 'QFD', '质量功能展开', '第二章'],
  'Analyze': ['分析', '假设检验', 't检验', 'Z检验', 'F检验', '卡方', 'ANOVA', '方差分析', '回归', '相关系数', '相关分析', '非参数', 'Mann-Whitney', 'Kruskal', '列联表', '第三章', '第3章', '第六章', '第6章', '检验', '置信区间', 'p值', '显著性', '样本量', '中心极限定理', '点估计', '区间估计', '残差', '多重比较', 'Tukey', 'Fisher', '第三章'],
  'Improve': ['改进', 'DOE', '实验设计', '试验设计', '因子', '全因子', '部分因子', '响应曲面', 'CCD', '中心复合', 'Box-Behnken', '筛选实验', 'Plackett', '交互作用', '主效应', '分辨度', '生成元', '代码化', '回归方程', '中心点', '随机化', '区组', '第四章', '第4章', '第七章', '第7章', '响应优化器', '最陡峭', '第四章'],
  'Control': ['控制', 'SPC', '控制图', 'Xbar', 'I-MR', 'P控制图', 'U控制图', 'NP控制图', '控制限', '规格限', '公差限', '受控', '异常原因', '偶然原因', '普通原因', '特殊原因', 'TPM', '全面生产维护', '5S', '防错', '标准化', 'SOP', '标准作业', 'OEE', '第八章', '第8章', '过程控制', '控制阶段', '第八章'],
};

function classifyQuestion(text) {
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    for (const kw of keywords) {
      if (text.includes(kw)) return cat;
    }
  }
  return 'Analyze'; // default
}

function parseAllFiles() {
  const files = fs.readdirSync(extractedDir).filter(f => f.endsWith('.txt'));
  let allQuestions = [];
  let globalId = 1;

  for (const file of files) {
    const content = fs.readFileSync(path.join(extractedDir, file), 'utf8');
    const lines = content.split('\n').map(l => l.trim()).filter(l => l);

    console.log(`\n=== Processing: ${file} (${lines.length} lines) ===`);

    // Try to find answer key at end of file (模拟测试 pattern)
    const answerKey = {};
    let inAnswerSection = false;
    let answerLines = [];

    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (line.includes('答案') || line.includes('单选题') || line.includes('多选题')) {
        answerLines.unshift(line);
        inAnswerSection = true;
      } else if (inAnswerSection && /^\d+[A-D]+$/.test(line.replace(/\s+/g, ''))) {
        answerLines.unshift(line);
      } else if (inAnswerSection && answerLines.length > 2) {
        break;
      } else if (inAnswerSection && answerLines.length <= 2) {
        inAnswerSection = false;
        answerLines = [];
      }
    }

    // Parse answer key
    if (answerLines.length > 0) {
      const answerText = answerLines.join(' ');
      // Pattern: 1A 2B 3C ...
      const matches = answerText.match(/(\d+)\s*([A-D]+)/g);
      if (matches) {
        for (const m of matches) {
          const parts = m.match(/(\d+)\s*([A-D]+)/);
          if (parts) {
            const num = parseInt(parts[1]);
            const ans = parts[2];
            answerKey[num] = ans.length === 1 ? ans : ans.split('').join(',');
          }
        }
        console.log(`  Found answer key with ${Object.keys(answerKey).length} answers`);
      }
    }

    // Parse questions
    const questionPatterns = [
      // Pattern: "N. question? 答案 X" or "N. question? 答案：X"
      /^(\d+)\.\s+(.+?)\s*[答案][：]?\s*([A-D]+)\s*$/,
      // Pattern: "N. question?"
      /^(\d+)[\.、]\s*(.+)$/,
    ];

    let i = 0;
    let questionsInFile = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Skip non-question lines
      if (line === '一、单选题' || line === '一、 单选题' || line === '二、多选题' || line === '二、 多选题' ||
          line.includes('绿带第') || line.includes('六西格玛绿带') || line.includes('正确答案') ||
          line.includes('解析') || line.includes('绿带模拟测试') || line.includes('章节测试') ||
          line.includes('中国质量协会') || line === '' || line.startsWith('你的答案') ||
          line.startsWith('参考绿带') || line.startsWith('参考知识点') || line.startsWith('个人解答') ||
          line.startsWith('考察知识点') || line.startsWith('红宝书') || line.startsWith('课程') ||
          line.startsWith('见绿带') || line.startsWith('解析：') || line.startsWith('答案是') ||
          line.startsWith('【') || line.startsWith('说明') || line.startsWith('注:')) {
        i++;
        continue;
      }

      // Check if this is a question line
      let qMatch = null;
      let qNum = null;
      let qText = '';
      let inlineAnswer = null;

      // Try "N. text 答案 X" pattern first
      const inlineMatch = line.match(/^(\d+)\.\s+(.+?)\s*答案[：]?\s*([A-D]+)\s*$/);
      if (inlineMatch) {
        qNum = parseInt(inlineMatch[1]);
        qText = inlineMatch[2].trim();
        inlineAnswer = inlineMatch[3].trim();
      } else {
        // Try "N. text" or "N、text" pattern
        const qm = line.match(/^(\d+)[\.、]\s*(.+)$/);
        if (qm && parseInt(qm[1]) > 0 && parseInt(qm[1]) < 300) {
          qNum = parseInt(qm[1]);
          qText = qm[2].trim();
        }
      }

      // Skip lines that aren't questions
      if (!qNum || qText.length > 500 || /^(A|B|C|D)[\.\s、]/.test(qText)) {
        i++;
        continue;
      }

      // Collect options from following lines
      const options = [];
      let j = i + 1;
      const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      let optIdx = 0;

      while (j < lines.length && j < i + 15) {
        const oLine = lines[j];

        // Check for option patterns
        let optMatch = null;
        for (const prefix of ['.', '、', '．', ')', ' ', '\t']) {
          const pattern = new RegExp(`^${optionLabels[optIdx]}\\${prefix}\\s*(.+)$`);
          optMatch = oLine.match(pattern);
          if (optMatch) break;
        }

        if (optMatch) {
          options.push(optMatch[1].trim());
          optIdx++;
          j++;
        } else if (optIdx > 0 && optIdx < 3 && j === i + optIdx + 1) {
          // Might be multi-line option, try next line
          j++;
          continue;
        } else {
          break;
        }
      }

      // Determine answer
      let answer = null;
      let answerLetter = null;

      if (inlineAnswer) {
        answerLetter = inlineAnswer;
      } else if (answerKey[qNum]) {
        answerLetter = answerKey[qNum];
      } else {
        // Look for "正确答案：X" or "正确答案: X" in nearby lines
        for (let k = j; k < Math.min(j + 10, lines.length); k++) {
          const aMatch = lines[k].match(/(?:正确答案|答案)[：:]\s*([A-D]+)/);
          if (aMatch) {
            answerLetter = aMatch[1].trim();
            break;
          }
        }
      }

      // Parse answer from letter
      if (answerLetter) {
        const ansLetters = answerLetter.split('').filter(l => /[A-H]/.test(l));
        if (ansLetters.length === 1) {
          answer = optionLabels.indexOf(ansLetters[0]);
        } else {
          // Multi-select - store as array
          answer = ansLetters.map(l => optionLabels.indexOf(l));
        }
      }

      // Only include if we have at least 2 options and a question
      if (options.length >= 2 && qText.length > 5) {
        const question = {
          id: globalId++,
          category: classifyQuestion(qText + ' ' + options.join(' ')),
          source: file.replace('.txt', ''),
          question: qText,
          options: options.map((o, idx) => {
            // Add A. B. C. D. prefix if not present
            if (/^[A-H][\.\、]/.test(o)) return o;
            return `${optionLabels[idx]}. ${o}`;
          }),
        };

        if (answer !== null && answer !== -1) {
          question.answer = answer;
        }

        allQuestions.push(question);
        questionsInFile++;

        i = j;
      } else {
        i++;
      }
    }

    console.log(`  Extracted ${questionsInFile} questions`);
  }

  return allQuestions;
}

// Main
console.log('Parsing all extracted files...\n');
const questions = parseAllFiles();

// Deduplicate by question text similarity
const uniqueQuestions = [];
const seenTexts = new Set();
for (const q of questions) {
  const key = q.question.substring(0, 30);
  if (!seenTexts.has(key)) {
    seenTexts.add(key);
    uniqueQuestions.push(q);
  }
}

console.log(`\n========================================`);
console.log(`Total: ${questions.length} questions parsed`);
console.log(`After dedup: ${uniqueQuestions.length} unique questions`);

// Count by category
const byCat = {};
for (const q of uniqueQuestions) {
  byCat[q.category] = (byCat[q.category] || 0) + 1;
}
console.log('By category:', JSON.stringify(byCat));

// Count with/without answers
const withAnswer = uniqueQuestions.filter(q => q.answer !== undefined).length;
console.log(`With answer: ${withAnswer}, Without answer: ${uniqueQuestions.length - withAnswer}`);

// Write output
fs.writeFileSync(outputPath, JSON.stringify(uniqueQuestions, null, 2), 'utf8');
console.log(`\nWritten to: ${outputPath}`);
