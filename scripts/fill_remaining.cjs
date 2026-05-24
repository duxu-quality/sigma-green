/**
 * Targeted answer filler for remaining unanswered questions.
 * Uses relaxed matching and handles embedded answers in question text.
 */
const fs = require('fs');
const path = require('path');

const extractedDir = 'C:/Users/Administrator/Desktop/新建文件夹/_extracted';
const questionsPath = 'D:/程序/sigma-green/src/data/questions.json';

const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
const optMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7 };

function norm(text) {
  return text.replace(/\s+/g, '').replace(/[，。．、：:？?！!（）()【】\[\]"'\.\,\;\-\—\/\\]/g, '');
}

// Get unanswered indices
const unanswered = [];
questions.forEach((q, i) => {
  if (q.answer === undefined || q.answer === null) unanswered.push(i);
});
console.log(`Unanswered: ${unanswered.length}`);

// Strategy A: Extract answer embedded in question text itself
let matchedA = 0;
for (const idx of unanswered) {
  const q = questions[idx];
  // Pattern: "...：A" or "...：A" or "...应 B" or "...为 C" at end of question
  const m = q.question.match(/[：:是为应选择]\s*([A-D])[\s。，\.]*$/);
  if (m) {
    const ans = m[1];
    q.answer = optMap[ans];
    matchedA++;
  }
  // Pattern: "答案 C" or "答案C" embedded
  const m2 = q.question.match(/答案[：:\s]*([A-D])/);
  if (!m && m2) {
    q.answer = optMap[m2[1]];
    matchedA++;
  }
  // Pattern: trailing "XX D" where XX is a number
  const m3 = q.question.match(/(\d{1,3})\s*([A-D])$/);
  if (!m && !m2 && m3) {
    q.answer = optMap[m3[2]];
    matchedA++;
  }
}
console.log(`Strategy A (embedded in question): ${matchedA}`);

// Strategy B: Look through source files for question text matches with answers nearby
const files = fs.readdirSync(extractedDir).filter(f => f.endsWith('.txt'));
let matchedB = 0;

for (const idx of unanswered) {
  if (questions[idx].answer !== undefined && questions[idx].answer !== null) continue;

  const q = questions[idx];
  const qNorm = norm(q.question);

  // Try to find this question in source files
  for (const file of files) {
    const content = fs.readFileSync(path.join(extractedDir, file), 'utf8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const lineNorm = norm(lines[i]);
      if (lineNorm.length < 10) continue;

      // Check if this line contains our question text (50+ char match)
      const searchLen = Math.min(qNorm.length - 2, 60);
      if (searchLen < 8) continue;

      if (lineNorm.includes(qNorm.substring(0, searchLen))) {
        // Found the line. Look for answers in nearby context.

        // Check embedded answer in same line
        const sameLineM = lines[i].match(/[：:是为应]\s*([A-D])\s*$/);
        if (sameLineM) {
          questions[idx].answer = optMap[sameLineM[1]];
          matchedB++;
          break;
        }

        // Check if the line itself ends with answer pattern
        const em = lines[i].match(/(\d+)\s*([A-D])\s*$/);
        if (em) {
          questions[idx].answer = optMap[em[2]];
          matchedB++;
          break;
        }

        // Look forward for "正确答案：X" or "标准答案：X"
        for (let k = i + 1; k < Math.min(i + 20, lines.length); k++) {
          const am = lines[k].match(/(?:正确|标准|参考)?答案[：:\s]*([A-D]+)/);
          if (am) {
            questions[idx].answer = optMap[am[1]];
            matchedB++;
            break;
          }
        }

        if (questions[idx].answer !== undefined) break;

        // Look for A. B. C. D. options and then answer
        let optLines = [];
        for (let k = i + 1; k < Math.min(i + 20, lines.length); k++) {
          const ol = lines[k].trim();
          for (const sep of ['.', '、', ')', '）']) {
            const om = ol.match(new RegExp(`^([A-D])\\${sep}\\s*(.+)`));
            if (om) { optLines.push({letter: om[1], text: om[2]}); break; }
          }
          if (optLines.length >= 4) break;
        }

        if (optLines.length >= 2) {
          // Check for answer after options
          const lastOptIdx = i + optLines.length;
          for (let k = lastOptIdx; k < Math.min(lastOptIdx + 10, lines.length); k++) {
            const am = lines[k].match(/(?:正确|标准|参考|\.标准)?答案[：:\s]*([A-D]+)/);
            if (am) {
              questions[idx].answer = optMap[am[1]];
              matchedB++;
              break;
            }
          }
        }

        if (questions[idx].answer !== undefined) break;
      }
    }
    if (questions[idx].answer !== undefined) break;
  }
}
console.log(`Strategy B (source file lookup): ${matchedB}`);

// Strategy C: For 模拟测试 files, use the compact answer key with fuzzy matching
let matchedC = 0;
for (const idx of unanswered) {
  if (questions[idx].answer !== undefined && questions[idx].answer !== null) continue;

  const q = questions[idx];
  const qNorm = norm(q.question);

  // Try to match against compact answer keys in 模拟测试 and exam files
  const keyFiles = [
    '绿带模拟测试第1套.txt', '绿带模拟测试第2套.txt',
    '2025年11月中质协六西格玛绿带真题及解析.txt', '2025年6月中质协六西格玛绿带真题.txt'
  ];

  for (const file of keyFiles) {
    if (!files.includes(file)) continue;
    const content = fs.readFileSync(path.join(extractedDir, file), 'utf8');
    const lines = content.split('\n');

    // Try to find the question by text and determine its position/number
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length < 5) continue;

      const ln = norm(line);
      if (ln.length > 20 && qNorm.length > 20 && ln.includes(qNorm.substring(0, 25))) {
        // Found the question text. Try to get answer from compact key nearby.
        // Or check if answer appears in text near this line
        for (let k = i; k < Math.min(i + 15, lines.length); k++) {
          const am = lines[k].match(/(?:正确|标准)?答案[：:\s]*([A-D]+)/);
          if (am) {
            questions[idx].answer = optMap[am[1]];
            matchedC++;
            break;
          }
        }
        if (questions[idx].answer !== undefined) break;
      }
    }
    if (questions[idx].answer !== undefined) break;
  }
}
console.log(`Strategy C (compact answer key): ${matchedC}`);

// Final count
const stillUnanswered = questions.filter(q => q.answer === undefined || q.answer === null);
console.log(`\nRemaining unanswered: ${stillUnanswered.length}`);

// Show what's left
if (stillUnanswered.length > 0) {
  console.log('\n=== Still Unanswered ===');
  const bySource = {};
  stillUnanswered.forEach(q => { bySource[q.source] = (bySource[q.source]||0)+1; });
  Object.entries(bySource).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => console.log(`  ${v} - ${k}`));

  // Show first 5
  console.log('\nFirst 5:');
  stillUnanswered.slice(0, 5).forEach(q => {
    console.log('ID:', q.id, '|', q.question.substring(0, 80));
    console.log('  O:', q.options.slice(0,2).map(o=>o.substring(0,40)).join(' | '));
  });
}

// Write
fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2), 'utf8');
console.log(`\nWritten. Total: ${questions.length}, Answered: ${questions.length - stillUnanswered.length}`);
