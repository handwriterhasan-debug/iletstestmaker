const fs = require('fs');

const replaces = [
  { search: /text-\[\#a3e635\]/g, replace: 'text-[#65a30d] dark:text-[#a3e635]' },
  { search: /border-\[\#a3e635\]/g, replace: 'border-[#65a30d] dark:border-[#a3e635]' }
];

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  replaces.forEach(r => {
    content = content.replace(r.search, r.replace);
  });
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated font colors in', file);
  }
}

function walk(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    if (fs.statSync(file).isDirectory()) {
      walk(file);
    } else if (file.endsWith('.tsx') || file.endsWith('.css')) {
      processFile(file);
    }
  });
}

walk('./src');
