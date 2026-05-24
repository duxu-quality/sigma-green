const fs = require('fs');
const questionsPath = 'D:/程序/sigma-green/src/data/questions.json';
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

const fixes = {
  161: {
    options: [
      'A. 降低成本',
      'B. 延长折旧设备的使用年限',
      'C. 设备综合效率最大化',
      'D. 员工人数增加'
    ],
    answer: 2  // C - 设备综合效率最大化
  },
  204: {
    options: [
      'A. 过程长期标准差小于过程短期标准差',
      'B. 过程长期标准差等于过程短期标准差',
      'C. 过程长期标准差大于过程短期标准差',
      'D. 没有固定的关系'
    ],
    answer: 2  // C - 过程长期标准差大于过程短期标准差
  },
  412: {
    options: [
      'A. 筛选出关键的输入因素',
      'B. 筛选出关键的输出响应',
      'C. 预测和优化输出响应的结果',
      'D. 消除试验误差'
    ],
    answer: [0, 2]  // A + C
  },
  671: {
    options: [
      'A. 正确',
      'B. 错误'
    ],
    answer: 1  // B - 错误（五大特性应包含偏倚而非分辨率）
  }
};

for (const [idStr, fix] of Object.entries(fixes)) {
  const id = parseInt(idStr);
  const q = questions.find(q => q.id === id);
  if (q) {
    q.options = fix.options;
    q.answer = fix.answer;
    console.log(`Fixed ID:${id} - ${q.options.length} options, answer: ${JSON.stringify(q.answer)}`);
  }
}

fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2), 'utf8');
console.log('Done.');
