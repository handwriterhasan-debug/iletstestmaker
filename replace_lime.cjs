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
    .replace(/#059669/gi, '#84cc16') // lime-500
    .replace(/#047857/gi, '#65a30d') // lime-600
    .replace(/#10B981/gi, '#a3e635') // lime-400
    .replace(/#34D399/gi, '#bef264') // lime-300
    
    .replace(/emerald-400/gi, 'lime-400')
    .replace(/emerald-500/gi, 'lime-500')
    .replace(/emerald-600/gi, 'lime-600')
    .replace(/emerald-700/gi, 'lime-700')
    .replace(/emerald-900/gi, 'lime-900')
    
    .replace(/emerald slightly faded/gi, 'lime slightly faded')
    .replace(/main emerald/gi, 'main lime')
    
    .replace(/rgba\(5,\s*150,\s*105/gi, 'rgba(132, 204, 22')  // RGB for #84CC16
    .replace(/rgba\(52,\s*211,\s*153/gi, 'rgba(163, 230, 53') // RGB for #A3E635
    
    // Explicit background and text fixes for white/black requirements
    .replace(/bg-gray-50 dark:bg-\[\#050510\]/gi, '')
    .replace(/bg-\[\#050510\]/gi, '')
    .replace(/bg-\[\#0A0A0F\]/gi, '')
    .replace(/text-gray-900 dark:text-\[\#E0E0E0\]/gi, '')
    .replace(/text-\[\#E0E0E0\]/gi, 'text-black dark:text-white')
    .replace(/text-gray-700 dark:text-gray-200/gi, 'text-black dark:text-white')
    .replace(/text-gray-600 dark:text-gray-300/gi, 'text-gray-800 dark:text-gray-200')
    
    // index.css specific theme variables replacement
    .replace(/--bg-page: #F8F9FA;/g, '--bg-page: #FFFFFF;')
    .replace(/--text-main: #0A0A0F;/g, '--text-main: #000000;')
    .replace(/--bg-page: #0A0A0F;/g, '--bg-page: #000000;')
    .replace(/--text-main: #FFFFFF;/g, '--text-main: #FFFFFF;');
    
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated', file);
  }
});
