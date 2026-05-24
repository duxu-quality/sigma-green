/**
 * Comprehensive answer filler for Sigma Green question bank.
 * Handles multiple document formats to extract answers and match to existing questions.
 */
const fs = require('fs');
const path = require('path');

const extractedDir = 'C:/Users/Administrator/Desktop/新建文件夹/_extracted';
const questionsPath = 'D:/程序/sigma-green/src/data/questions.json';

const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
const optMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7 };

// Build fuzzy lookup: normalized first 30 chars → indices
function normKey(text) {
  return text.substring(0, 30).replace(/\s+/g, '').replace(/[，。．、：:？?！!（）()]/g, '');
}

const qLookup = {};
questions.forEach((q, i) => {
  const key = normKey(q.question);
  if (!qLookup[key]) qLookup[key] = [];
  qLookup[key].push(i);
});

// Build a second lookup with first 50 chars for looser matching
const qLookup50 = {};
questions.forEach((q, i) => {
  const key = normKey(q.question.substring(0, 50));
  if (!qLookup50[key]) qLookup50[key] = [];
  qLookup50[key].push(i);
});

// Build a lookup keyed by first-20-chars of option texts concatenated
const qLookupOpts = {};
questions.forEach((q, i) => {
  if (q.options && q.options.length >= 2) {
    const optSig = q.options.slice(0, 4).map(o =>
      normKey(o).substring(0, 20)
    ).join('|');
    if (!qLookupOpts[optSig]) qLookupOpts[optSig] = [];
    qLookupOpts[optSig].push(i);
  }
});

let totalMatched = 0;

/**
 * Match extracted question+options to questions.json entries.
 * Tries multiple strategies: text key, option signature, fuzzy text match.
 */
function matchToBank(qText, options) {
  // Strategy 1: exact 30-char key
  const key = normKey(qText);
  if (qLookup[key]) {
    if (options.length >= 2) {
      for (const idx of qLookup[key]) {
        const q = questions[idx];
        let matchCount = 0;
        for (let i = 0; i < Math.min(options.length, q.options.length); i++) {
          const a = normKey(options[i]).substring(0, 15);
          const b = normKey(q.options[i]).substring(0, 15);
          if (a === b) matchCount++;
        }
        if (matchCount >= 2) return idx;
      }
      return qLookup[key][0]; // fallback
    }
    return qLookup[key][0];
  }

  // Strategy 2: 50-char key
  const key50 = normKey(qText.substring(0, 50));
  if (qLookup50[key50]) {
    return qLookup50[key50][0];
  }

  // Strategy 3: option signature
  if (options.length >= 2) {
    const optSig = options.slice(0, 4).map(o =>
      normKey(o).substring(0, 20)
    ).join('|');
    if (qLookupOpts[optSig]) {
      return qLookupOpts[optSig][0];
    }
  }

  // Strategy 4: fuzzy text match — find any question containing first 20 meaningful chars
  const shortKey = normKey(qText).substring(0, 20);
  if (shortKey.length >= 10) {
    for (let i = 0; i < questions.length; i++) {
      if (normKey(questions[i].question).includes(shortKey)) {
        return i;
      }
    }
  }

  return -1;
}

/**
 * Parse options from lines starting at index `i`
 * Returns { options: string[], endIdx: number (index after last option) }
 */
function parseOptions(lines, startIdx) {
  const options = [];
  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  let optIdx = 0;
  let j = startIdx;

  while (j < lines.length && j < startIdx + 15) {
    const oLine = lines[j].trim();
    let matched = false;

    for (const sep of ['.', '、', '．', ')', '）', ' ', '\t']) {
      const pat = new RegExp(`^${optionLabels[optIdx]}\\${sep}\\s*(.+)$`);
      const m = oLine.match(pat);
      if (m) {
        options.push(m[1].trim());
        optIdx++;
        j++;
        matched = true;
        break;
      }
    }
    if (!matched) break;
  }

  return { options, endIdx: j };
}

/**
 * Try to find an answer in nearby lines (after options).
 */
function findNearbyAnswer(lines, startIdx) {
  for (let k = startIdx; k < Math.min(startIdx + 10, lines.length); k++) {
    const line = lines[k].trim();

    // "正确答案：X" / "标准答案：X" / "参考答案：X"
    let m = line.match(/(?:正确|标准|参考)?答案[：:\s]*([A-D]+)/);
    if (m) return m[1];

    // ".标准答案：X" (2012 format)
    m = line.match(/^\.标准答案[：:\s]*([A-D]+)/);
    if (m) return m[1];
  }
  return null;
}

/**
 * Format 1: "N. question text：A" — inline answer
 * Used in: 六西格玛绿带练习题1.txt
 */
function parseInlineAnswerFormat(lines) {
  let matched = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Match "N. question text：X" where X is a single letter A-D at end
    const m = line.match(/^(\d+)[\.\、]\s+(.+?)[：:]\s*([A-D])\s*$/);
    if (!m) continue;

    const qText = m[2].trim();
    const answerLetter = m[3];
    if (qText.length < 5 || qText.length > 500) continue;

    const { options, endIdx } = parseOptions(lines, i + 1);
    if (options.length < 2) continue;

    const idx = matchToBank(qText, options);
    if (idx >= 0 && (questions[idx].answer === undefined || questions[idx].answer === null)) {
      questions[idx].answer = optMap[answerLetter];
      matched++;
      totalMatched++;
    }
    i = endIdx - 1; // skip past options
  }
  return matched;
}

/**
 * Format 2: "N、question" + options + "正确答案：X" + "解析："
 * Used in: 绿带第1-7章章节测试.txt
 */
function parseChapterTestFormat(lines) {
  let matched = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Match "N、question text" or "N. question text"
    const m = line.match(/^(\d+)[\.\、]\s*(.+)$/);
    if (!m) continue;

    const qNum = parseInt(m[1]);
    if (qNum < 1 || qNum > 200) continue;

    let qText = m[2].trim();
    if (qText.length < 5 || qText.length > 500) continue;
    // Skip if looks like an option
    if (/^[A-H][\.\、\)]/.test(qText)) continue;

    const { options, endIdx } = parseOptions(lines, i + 1);
    if (options.length < 2) continue;

    // Look for answer in nearby lines
    const answerLetter = findNearbyAnswer(lines, endIdx);
    if (!answerLetter) { i = endIdx - 1; continue; }

    const idx = matchToBank(qText, options);
    if (idx >= 0 && (questions[idx].answer === undefined || questions[idx].answer === null)) {
      questions[idx].answer = optMap[answerLetter];
      matched++;
      totalMatched++;
    }
    i = endIdx - 1;
  }
  return matched;
}

/**
 * Format 3: "N. question" + options + ".标准答案：X"
 * Used in: 2012年六西格玛绿带考试真题.txt
 */
function parse2012ExamFormat(lines) {
  let matched = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const m = line.match(/^(\d+)[\.\、]\s*(.+)$/);
    if (!m) continue;

    const qNum = parseInt(m[1]);
    if (qNum < 1 || qNum > 200) continue;

    let qText = m[2].trim();
    if (qText.length < 5 || qText.length > 500) continue;
    if (/^[A-H][\.\、\)]/.test(qText)) continue;

    const { options, endIdx } = parseOptions(lines, i + 1);
    if (options.length < 2) { i = endIdx > i + 1 ? endIdx - 1 : i; continue; }

    const answerLetter = findNearbyAnswer(lines, endIdx);
    if (!answerLetter) { i = endIdx - 1; continue; }

    const idx = matchToBank(qText, options);
    if (idx >= 0 && (questions[idx].answer === undefined || questions[idx].answer === null)) {
      questions[idx].answer = optMap[answerLetter];
      matched++;
      totalMatched++;
    }
    i = endIdx - 1;
  }
  return matched;
}

/**
 * Format 4: Options embedded in text (unnumbered or special numbering)
 * Used in: 2021 exam, 练习题3-11
 * This one is harder — questions are unnumbered paragraphs with options inline or semi-inline.
 * We look for groups of option lines (A. ... B. ... C. ... D. ...) and work backwards to find the question.
 */
function parseOptionGroupFormat(lines) {
  let matched = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Look for option A
    let aMatch = null;
    for (const sep of ['.', '、', '．', ')', '）']) {
      aMatch = line.match(new RegExp(`^A\\${sep}\\s*(.+)$`));
      if (aMatch) break;
    }
    if (!aMatch) continue;

    // Check if B, C, D follow in the next few lines
    const optLines = [aMatch[1].trim()];
    let foundAll = true;
    for (let oi = 1; oi < 4; oi++) {
      let found = false;
      const label = ['B', 'C', 'D'][oi - 1];
      for (let k = i + oi; k < Math.min(i + 10, lines.length); k++) {
        for (const sep of ['.', '、', '．', ')', '）']) {
          const om = lines[k].trim().match(new RegExp(`^${label}\\${sep}\\s*(.+)$`));
          if (om) { optLines.push(om[1].trim()); found = true; break; }
        }
        if (found) break;
      }
      if (!found) { foundAll = false; break; }
    }
    if (!foundAll) continue;

    // Now find the question text above option A
    let qText = '';
    for (let k = i - 1; k >= Math.max(0, i - 5); k--) {
      const prevLine = lines[k].trim();
      if (prevLine && !/^[A-H][\.\、\)]/.test(prevLine) && prevLine.length > 10) {
        qText = prevLine;
        break;
      }
    }
    if (!qText) continue;

    // Try to find answer nearby
    const answerLetter = findNearbyAnswer(lines, i + 4);
    if (!answerLetter) { i += 3; continue; }

    const idx = matchToBank(qText, optLines);
    if (idx >= 0 && (questions[idx].answer === undefined || questions[idx].answer === null)) {
      questions[idx].answer = optMap[answerLetter];
      matched++;
      totalMatched++;
    }
    i += 3;
  }
  return matched;
}

/**
 * Format 5: Questions with "参考答案：X" after options
 * Used in: 2024 exam (回忆版)
 */
function parseRefAnswerFormat(lines) {
  let matched = 0;

  // First pass: find all "参考答案：X" lines
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const m = line.match(/^参考答案[：:\s]*([A-D]+)$/);
    if (!m) continue;

    const answerLetter = m[1];

    // Look backwards for options
    const backOptions = [];
    for (let k = i - 1; k >= Math.max(0, i - 10); k--) {
      const ol = lines[k].trim();
      let optFound = false;
      for (const label of ['D', 'C', 'B', 'A']) {
        if (backOptions.length >= 4) break;
        for (const sep of ['.', '、', ')', '）']) {
          const om = ol.match(new RegExp(`^${label}\\${sep}\\s*(.+)$`));
          if (om) { backOptions.unshift(om[1].trim()); optFound = true; break; }
        }
        if (optFound) break;
      }
    }

    if (backOptions.length < 2) continue;

    // Find question text before first option
    for (let k = i - backOptions.length - 1; k >= Math.max(0, i - 15); k--) {
      const qLine = lines[k].trim();
      if (qLine && qLine.length > 10 && !/^[A-H][\.\、\)]/.test(qLine) && !/^参考/.test(qLine)) {
        const idx = matchToBank(qLine, backOptions);
        if (idx >= 0 && (questions[idx].answer === undefined || questions[idx].answer === null)) {
          questions[idx].answer = optMap[answerLetter];
          matched++;
          totalMatched++;
        }
        break;
      }
    }
  }
  return matched;
}

// ===================== MAIN =====================
console.log('=== Comprehensive Answer Filler ===\n');
console.log(`Initial: ${questions.filter(q => q.answer !== undefined && q.answer !== null).length}/${questions.length} with answers\n`);

const files = fs.readdirSync(extractedDir).filter(f => f.endsWith('.txt'));

// Process each file with appropriate format handlers
for (const file of files) {
  const content = fs.readFileSync(path.join(extractedDir, file), 'utf8');
  const lines = content.split('\n');

  let fileMatched = 0;

  // Apply all format parsers
  fileMatched += parseInlineAnswerFormat(lines);
  fileMatched += parseChapterTestFormat(lines);
  fileMatched += parse2012ExamFormat(lines);
  fileMatched += parseOptionGroupFormat(lines);
  fileMatched += parseRefAnswerFormat(lines);

  if (fileMatched > 0) {
    console.log(`  ${file}: +${fileMatched}`);
  }
}

// Final count
const withAns = questions.filter(q => q.answer !== undefined && q.answer !== null);
const withoutAns = questions.filter(q => q.answer === undefined || q.answer === null);

console.log(`\n========================================`);
console.log(`Total matched this run: ${totalMatched}`);
console.log(`Final: ${withAns.length} answered, ${withoutAns.length} unanswered`);

// Write
fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2), 'utf8');
console.log(`Written to: ${questionsPath}`);
