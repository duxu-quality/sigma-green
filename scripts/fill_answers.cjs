/**
 * Re-parse extracted text files specifically to harvest answer keys
 * that were missed in the original parse, then merge into questions.json.
 */
const fs = require('fs');
const path = require('path');

const extractedDir = 'C:/Users/Administrator/Desktop/新建文件夹/_extracted';
const questionsPath = 'D:/程序/sigma-green/src/data/questions.json';

const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
const files = fs.readdirSync(extractedDir).filter(f => f.endsWith('.txt'));

// Build a lookup: first-30-chars-of-question-text → question index
const qLookup = {};
questions.forEach((q, i) => {
  const key = q.question.substring(0, 30).replace(/\s+/g, '');
  if (!qLookup[key]) qLookup[key] = [];
  qLookup[key].push(i);
});

// Normalize option letters
const optMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7 };

let totalMatched = 0;
let totalFromInline = 0;
let totalFromAnswerKey = 0;
let totalFromNearby = 0;
let totalFromTextInline = 0;

/**
 * Try all answer patterns in a line of text
 */
function findAnswerInLine(line) {
  // Pattern 1: "答案 X" or "答案：X" or "答案: X"
  let m = line.match(/答案[：:\s]*([A-D]+)/);
  if (m) return { answer: m[1], type: 'inline' };

  // Pattern 2: "正确答案：X" or "正确答案: X"
  m = line.match(/正确答案[：:\s]*([A-D]+)/);
  if (m) return { answer: m[1], type: 'nearby' };

  // Pattern 3: "标准答案：X"
  m = line.match(/标准答案[：:\s]*([A-D]+)/);
  if (m) return { answer: m[1], type: 'nearby' };

  // Pattern 4: "参考答案：X"
  m = line.match(/参考答案[：:\s]*([A-D]+)/);
  if (m) return { answer: m[1], type: 'nearby' };

  // Pattern 5: ".标准答案：X" (2012 exam format)
  m = line.match(/\.标准答案[：:\s]*([A-D]+)/);
  if (m) return { answer: m[1], type: 'nearby' };

  // Pattern 6: Trailing "XX D" where question text ends with a number and letter
  m = line.match(/[：:]\s*(\d+)\s*([A-D])$/);
  if (m) return { answer: m[2], type: 'text-inline' };

  return null;
}

/**
 * Parse answer key lines like "1A 2B 3C 4D" or "1.A 2.B 3.C 4.D"
 */
function parseAnswerKeyLine(line) {
  // Match various formats: 1A, 1.A, 1-A, 1、A
  const matches = [...line.matchAll(/(\d+)\s*[\.\、\-\s]?\s*([A-D]+)\b/g)];
  const result = {};
  for (const m of matches) {
    const num = parseInt(m[1]);
    const ans = m[2];
    if (num > 0 && num < 200 && /^[A-D]+$/.test(ans)) {
      result[num] = ans;
    }
  }
  return result;
}

/**
 * Parse format: "1A 2C 3D ... 59C 60BD" (from 2025 exam / 模拟测试)
 * This handles both single and multi-answer formats
 */
function parseCompactAnswerKey(text) {
  const result = {};
  // Match number followed by one or more letters
  const matches = [...text.matchAll(/\b(\d+)\s*([A-D]{1,4})\b/g)];
  for (const m of matches) {
    const num = parseInt(m[1]);
    if (num > 0 && num < 200) {
      result[num] = m[2];
    }
  }
  return result;
}

/**
 * Find a question in our JSON that matches this text
 */
function matchQuestion(qText, options) {
  const key = qText.substring(0, 30).replace(/\s+/g, '');
  if (qLookup[key]) {
    // Find the best match among candidates
    for (const idx of qLookup[key]) {
      const q = questions[idx];
      // Check if at least 2 options match
      if (options.length >= 2 && q.options) {
        let matchCount = 0;
        for (let i = 0; i < Math.min(options.length, q.options.length); i++) {
          const optText = options[i].replace(/^[A-H][\.\、\)\s]+/, '').trim();
          const qOptText = q.options[i].replace(/^[A-H][\.\、\)\s]+/, '').trim();
          if (optText.substring(0, 10) === qOptText.substring(0, 10)) matchCount++;
        }
        if (matchCount >= 2) return idx;
      }
    }
    // If no option match, return first candidate
    return qLookup[key][0];
  }
  return -1;
}

/**
 * Convert answer letter(s) to answer index
 */
function letterToIndex(letterStr) {
  if (letterStr.length === 1) {
    return optMap[letterStr[0]] !== undefined ? optMap[letterStr[0]] : -1;
  }
  // Multi-answer
  return letterStr.split('').map(l => optMap[l]).filter(i => i !== undefined && i >= 0);
}

// Process each file
for (const file of files) {
  const content = fs.readFileSync(path.join(extractedDir, file), 'utf8');
  const lines = content.split('\n').map(l => l.trim());

  console.log(`\n=== ${file} ===`);

  // Strategy 1: Search the entire file for compact answer keys
  // (like "1A 2C 3C 4D..." format)
  const compactKeys = {};
  for (const line of lines) {
    if (line.length > 30 && /^\d+[A-D]/.test(line.replace(/\s+/g, ''))) {
      const parsed = parseCompactAnswerKey(line);
      Object.assign(compactKeys, parsed);
    }
  }
  if (Object.keys(compactKeys).length > 0) {
    console.log(`  Found compact answer key with ${Object.keys(compactKeys).length} entries`);
  }

  // Strategy 2: Walk through each line looking for questions and nearby answers
  let fileMatched = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if this line starts a question (numbered)
    const qMatch = line.match(/^(\d+)[\.\、]\s*(.+)$/);
    if (!qMatch || parseInt(qMatch[1]) < 1 || parseInt(qMatch[1]) > 200) continue;

    const qNum = parseInt(qMatch[1]);
    let qText = qMatch[2].trim();

    // Skip if too long or looks like an option
    if (qText.length > 500 || /^[A-H][\.\、\)]/.test(qText)) continue;

    // Check inline answer in question text
    const inlineAns = findAnswerInLine(qText);
    if (inlineAns) {
      // Clean the answer marker from question text
      qText = qText.replace(/[：:]\s*\d*\s*答案[：:\s]*[A-D]+/, '')
                   .replace(/答案[：:\s]*[A-D]+/, '')
                   .replace(/\d+\s*[A-D]$/, '')
                   .trim();
    }

    // Collect options from following lines
    const options = [];
    let j = i + 1;
    const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    let optIdx = 0;

    while (j < lines.length && j < i + 15) {
      const oLine = lines[j];

      // Try to match option pattern
      let optMatch = null;
      for (const sep of ['.', '、', '．', ')', ' ', '\t']) {
        const pat = new RegExp(`^${optionLabels[optIdx]}\\${sep}\\s*(.+)$`);
        optMatch = oLine.match(pat);
        if (optMatch) break;
      }

      if (optMatch) {
        options.push(optMatch[1].trim());
        optIdx++;
        j++;
      } else if (optIdx === 0) {
        // No options found yet, might be multi-line question
        break;
      } else {
        break;
      }
    }

    if (options.length < 2) continue;

    // Determine answer
    let answerLetter = null;

    // Priority 1: inline answer in question text
    if (inlineAns) {
      answerLetter = inlineAns.answer;
    }

    // Priority 2: Compact answer key
    if (!answerLetter && compactKeys[qNum]) {
      answerLetter = compactKeys[qNum];
    }

    // Priority 3: Look for "正确答案：X" in the next few lines after options
    if (!answerLetter) {
      for (let k = j; k < Math.min(j + 10, lines.length); k++) {
        const nearbyMatch = findAnswerInLine(lines[k]);
        if (nearbyMatch) {
          answerLetter = nearbyMatch.answer;
          break;
        }
      }
    }

    // Priority 4: Check if answer key number matches question number
    // (2012 exam format: ".标准答案：D" follows each question's options)
    if (!answerLetter) {
      for (let k = i + 1; k < Math.min(i + 20, lines.length); k++) {
        const ansLine = lines[k];
        const am = ansLine.match(/\.?\s*(?:标准|参考|正确)?答案[：:\s]*([A-D]+)/);
        if (am) {
          // This answer is for the most recent question
          answerLetter = am[1];
          break;
        }
      }
    }

    if (answerLetter) {
      const idx = matchQuestion(qText, options);
      if (idx >= 0 && (questions[idx].answer === undefined || questions[idx].answer === null)) {
        const ansIdx = letterToIndex(answerLetter);
        if (Array.isArray(ansIdx) ? ansIdx.length > 0 : ansIdx >= 0) {
          questions[idx].answer = ansIdx;
          fileMatched++;
          totalMatched++;
        }
      }
      if (idx >= 0 && questions[idx].answer !== undefined && questions[idx].answer !== null) {
        // Already had answer, count as found but don't overwrite
      }
    }
  }

  console.log(`  Matched ${fileMatched} answers in this file`);
}

// Strategy 3: Process 2012 exam file specially (it has .标准答案：D after each set of options)
const file2012 = '2012年六西格玛绿带考试真题.txt';
if (files.includes(file2012)) {
  console.log(`\n=== Special handling for ${file2012} ===`);
  const content = fs.readFileSync(path.join(extractedDir, file2012), 'utf8');
  const lines = content.split('\n').map(l => l.trim());

  // In this file, questions may not be numbered conventionally
  // Look for patterns: question text followed by options followed by .标准答案：X
  let specialMatched = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const ansMatch = line.match(/^\.标准答案[：:\s]*([A-D]+)/);
    if (!ansMatch) continue;

    const answerLetter = ansMatch[1];
    // Look backwards for options
    const backOptions = [];
    for (let k = i - 1; k >= Math.max(0, i - 10); k--) {
      const ol = lines[k];
      for (const sep of ['.', '、', ')', ' ']) {
        const om = ol.match(new RegExp(`^([A-D])\\${sep}\\s*(.+)`));
        if (om) {
          backOptions.unshift(om[2].trim());
          break;
        }
      }
      if (backOptions.length >= 4) break;
    }

    if (backOptions.length >= 2) {
      // Find the question text (line before first option)
      // Actually the answers are already matched above, this is another pass
    }
  }
}

console.log(`\n========================================`);
console.log(`Total newly matched: ${totalMatched}`);
console.log(`Total from inline answers: ${totalFromInline}`);
console.log(`Total from answer keys: ${totalFromAnswerKey}`);
console.log(`Total from nearby "正确答案": ${totalFromNearby}`);

// Count final state
const withAnswer = questions.filter(q => q.answer !== undefined && q.answer !== null);
const withoutAnswer = questions.filter(q => q.answer === undefined || q.answer === null);
console.log(`\nFinal state:`);
console.log(`  Total questions: ${questions.length}`);
console.log(`  With answers: ${withAnswer.length}`);
console.log(`  Without answers: ${withoutAnswer.length}`);

// Write updated questions
fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2), 'utf8');
console.log(`\nWritten updated questions to: ${questionsPath}`);
