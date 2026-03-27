const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'sequence');
const files = fs.readdirSync(dir);

files.forEach(file => {
  const match = file.match(/ezgif-frame-0*(\d+)\.jpg/);
  if (match) {
    const num = match[1];
    const oldPath = path.join(dir, file);
    const newPath = path.join(dir, `${num}.jpg`);
    console.log(`Renaming ${file} to ${num}.jpg`);
    fs.renameSync(oldPath, newPath);
  }
});
