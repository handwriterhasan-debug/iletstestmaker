const fs = require('fs');
const path = require('path');

function replaceFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace text-white with dark:text-white text-gray-900 (except if it has opacity like text-white/80)
  // We'll replace it temporarily to a marker
  content = content.replace(/text-white(?!(\/|\w))/g, '@@TEXT_WHITE@@');

  // Re-replace back to text-white if there's a solid background class nearby in the same tag.
  // This is a naive heuristic but works for most Tailwind classes.
  content = content.replace(/(bg-\[\#[A-Fa-f0-9]+\]\s+[^>]*?)@@TEXT_WHITE@@/g, '$1text-white');
  content = content.replace(/@@TEXT_WHITE@@([^>]*?\s+bg-\[\#[A-Fa-f0-9]+\])/g, 'text-white$1');
  
  content = content.replace(/(bg-[a-z]+-(?:500|600|700)\s+[^>]*?)@@TEXT_WHITE@@/g, '$1text-white');
  content = content.replace(/@@TEXT_WHITE@@([^>]*?\s+bg-[a-z]+-(?:500|600|700))/g, 'text-white$1');

  // Change marker to the actual classes we want for "themed white"
  content = content.replace(/@@TEXT_WHITE@@/g, 'text-gray-900 dark:text-white');

  // other replacements
  content = content.replace(/text-gray-200/g, 'text-gray-700 dark:text-gray-200');
  content = content.replace(/text-gray-300/g, 'text-gray-600 dark:text-gray-300');
  content = content.replace(/text-gray-400/g, 'text-gray-500 dark:text-gray-400');
  content = content.replace(/bg-white\/5(?!0)/g, 'bg-black/5 dark:bg-white/5');
  content = content.replace(/bg-white\/10/g, 'bg-black/10 dark:bg-white/10');
  content = content.replace(/bg-white\/20/g, 'bg-black/20 dark:bg-white/20');
  content = content.replace(/border-white\/5(?!0)/g, 'border-black/5 dark:border-white/5');
  content = content.replace(/border-white\/10/g, 'border-black/10 dark:border-white/10');
  content = content.replace(/border-white\/20/g, 'border-black/20 dark:border-white/20');
  
  // Also handle text-white/80 etc
  content = content.replace(/text-white\/80/g, 'text-gray-800/80 dark:text-white/80');
  content = content.replace(/text-white\/90/g, 'text-gray-900/90 dark:text-white/90');
  content = content.replace(/text-white\/70/g, 'text-gray-700/70 dark:text-white/70');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', filePath);
  }
}

function walkArgs(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkArgs(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      replaceFile(fullPath);
    }
  }
}

walkArgs('./src/pages');
walkArgs('./src/components');
