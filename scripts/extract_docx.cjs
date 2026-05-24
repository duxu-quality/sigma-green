const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const baseDir = 'C:/Users/Administrator/Desktop/新建文件夹';
const outputDir = path.join(baseDir, '_extracted');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

function findDocx(dir) {
  const results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const full = path.join(dir, item.name);
    if (item.isDirectory() && !item.name.startsWith('_')) {
      results.push(...findDocx(full));
    } else if (item.isFile() && item.name.endsWith('.docx')) {
      results.push(full);
    } else if (item.isFile() && item.name.endsWith('.doc')) {
      results.push({ path: full, legacy: true });
    }
  }
  return results;
}

function extractDocx(filePath) {
  const name = path.basename(filePath, '.docx');
  try {
    const zip = new AdmZip(filePath);
    const docEntry = zip.getEntry('word/document.xml');
    if (!docEntry) {
      console.error(`FAIL (no document.xml): ${name}`);
      return 0;
    }
    let xml = docEntry.getData().toString('utf8');
    const paragraphs = xml.split(/<\/w:p>/);
    const resultLines = [];

    for (const para of paragraphs) {
      const texts = [];
      const re = /<w:t[^>]*>([^<]*)<\/w:t>/g;
      let match;
      while ((match = re.exec(para)) !== null) {
        if (match[1]) texts.push(match[1]);
      }
      const line = texts.join('').trim();
      if (line) resultLines.push(line);
    }

    const outFile = path.join(outputDir, name + '.txt');
    fs.writeFileSync(outFile, resultLines.join('\n'), 'utf8');
    console.log(`OK: ${name}.txt (${resultLines.length} lines)`);
    return resultLines.length;
  } catch (e) {
    console.error(`FAIL: ${name} - ${e.message}`);
    return 0;
  }
}

const files = findDocx(baseDir);
const docxFiles = files.filter(f => typeof f === 'string');
const legacyFiles = files.filter(f => typeof f === 'object' && f.legacy);

console.log(`Found ${docxFiles.length} DOCX, ${legacyFiles.length} legacy DOC\n`);

let totalLines = 0;
for (const f of docxFiles) {
  totalLines += extractDocx(f);
}

if (legacyFiles.length > 0) {
  console.log(`\n=== Legacy DOC files (need manual handling) ===`);
  legacyFiles.forEach(f => console.log(`  ${path.basename(f.path)}`));
}

console.log(`\nTotal: ${totalLines} lines extracted to ${outputDir}`);
