const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svg = fs.readFileSync('public/icon.svg', 'utf8');

async function generateIcons() {
  // Generate 192x192 PNG
  await sharp(Buffer.from(svg))
    .resize(192, 192)
    .png()
    .toFile('public/icon-192.png');
  console.log('icon-192.png created');

  // Generate 512x512 PNG
  await sharp(Buffer.from(svg))
    .resize(512, 512)
    .png()
    .toFile('public/icon-512.png');
  console.log('icon-512.png created');
}

generateIcons().catch(console.error);
