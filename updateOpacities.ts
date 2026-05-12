import fs from 'fs';

function walk(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css') || file.endsWith('.html')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  content = content.replace(/text-white\/20/g, 'text-gray-500'); // Note: previously everything grey changed to lighter so gray-500 was lost. Let's use text-white/50.
  content = content.replace(/text-white\/30/g, 'text-gray-400'); // wait no, we changed text-gray so just use text-white/70
  content = content.replace(/text-white\/40/g, 'text-white/70');
  content = content.replace(/text-white\/50/g, 'text-white/80');
  content = content.replace(/text-white\/60/g, 'text-white/80');
  
  // also, in `src/pages/Results.tsx` there's a `<div className="absolute top-0 right-0 p-4 bg-white/5 ... text-white/20">IELTSMAKER OFFICIAL</div>` -> changed to text-gray-500 above.
  
  // Let's replace the replacements above to use actual text-white/opacities.
  // Actually, wait, text-gray-500 doesn't exist anymore because I replaced them all with text-gray-300 in the previous step... oh wait, Tailwind's `text-gray-500` class is still available in CSS, my previous script just replaced the string literal in the codebase! So `text-gray-500` is perfectly valid.
  
  // Let's use text-gray-400 for these watermarks/subtle texts.
  content = content.replace(/text-white\/20/g, 'text-gray-400');
  content = content.replace(/text-white\/30/g, 'text-gray-400');
  content = content.replace(/text-white\/40/g, 'text-gray-300');
  content = content.replace(/text-white\/50/g, 'text-gray-300');
  content = content.replace(/text-white\/60/g, 'text-gray-300');

  // Any left over `#7C3AED` as text color that was missed maybe?
  content = content.replace(/text-\[#7C3AED\]/g, 'text-[#A78BFA]');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated opacities in ${file}`);
  }
});
