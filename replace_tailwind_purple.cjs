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
    .replace(/text-purple-400/g, 'text-emerald-400')
    .replace(/bg-purple-500/g, 'bg-emerald-500')
    .replace(/border-purple-400/g, 'border-emerald-400')
    .replace(/rgba\(168,\s*85,\s*247/g, 'rgba(52, 211, 153') // shadow-[0_0_20px_rgba(168,85,247,0.4)]
    .replace(/glass-card-purple/g, 'glass-card-theme');
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated', file);
  }
});
