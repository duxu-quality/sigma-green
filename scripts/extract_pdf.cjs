const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const baseDir = 'C:/Users/Administrator/Desktop/新建文件夹';
const outputDir = path.join(baseDir, '_extracted');

function findPdfs(dir) {
  const results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const full = path.join(dir, item.name);
    if (item.isDirectory() && !item.name.startsWith('_')) {
      results.push(...findPdfs(full));
    } else if (item.isFile() && item.name.endsWith('.pdf')) {
      results.push(full);
    }
  }
  return results;
}

async function extractPdf(filePath) {
  const name = path.basename(filePath, '.pdf');
  try {
    const buf = fs.readFileSync(filePath);
    const arr = new Uint8Array(buf);
    const pdf = new PDFParse(arr);
    await pdf.load();
    const result = await pdf.getText();
    const text = result.text;

    if (!text || text.trim().length < 20) {
      console.log(`SKIP: ${name} (no extractable text, likely scanned image)`);
      return 0;
    }

    const lines = text.split('\n').filter(l => l.trim());
    const outFile = path.join(outputDir, name + '.txt');
    fs.writeFileSync(outFile, lines.join('\n'), 'utf8');
    console.log(`OK: ${name}.txt (${lines.length} lines)`);
    return lines.length;
  } catch (e) {
    console.error(`FAIL: ${name} - ${e.message}`);
    return 0;
  }
}

async function main() {
  const pdfs = findPdfs(baseDir);
  console.log(`Found ${pdfs.length} PDF files\n`);

  let total = 0;
  for (const f of pdfs) {
    total += await extractPdf(f);
    await new Promise(r => setTimeout(r, 200));
  }
  console.log(`\nDone. Extracted ${total} total lines`);
}

main().catch(console.error);
