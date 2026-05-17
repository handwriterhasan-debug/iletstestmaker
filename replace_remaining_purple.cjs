const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if(file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content
    .replace(/purple-900/g, 'emerald-900')
    .replace(/purple-500/g, 'emerald-500')
    .replace(/purple-600/g, 'emerald-600')
    .replace(/rgb\(124,\s*58,\s*237\)/g, 'rgb(5, 150, 105)')
    .replace(/purple slightly faded/g, 'emerald slightly faded')
    .replace(/main purple/g, 'main emerald');
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated', file);
  }
});
