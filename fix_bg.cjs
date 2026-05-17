const fs = require('fs');

const replaces = [
  { search: /bg-\[\#1A1A23\]/g, replace: 'bg-[#F9FAFB] dark:bg-[#1A1A23]' },
  { search: /bg-\[\#1A1A2E\]/g, replace: 'bg-white dark:bg-[#1A1A2E]' },
  { search: /bg-\[\#12121A\]/g, replace: 'bg-white dark:bg-[#12121A]' },
  { search: /bg-\[\#0F0F1B\]/g, replace: 'bg-white dark:bg-[#0F0F1B]' },
  { search: /backgroundColor:\s*'#1A1A2E'/g, replace: "backgroundColor: 'var(--glass-bg)'" }
];

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  replaces.forEach(r => {
    content = content.replace(r.search, r.replace);
  });
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated backgrounds in', file);
  }
}

function walk(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    if (fs.statSync(file).isDirectory()) {
      walk(file);
    } else if (file.endsWith('.tsx')) {
      processFile(file);
    }
  });
}

walk('./src');
