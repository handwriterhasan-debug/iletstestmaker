import * as fs from 'fs';
import * as path from 'path';

function replaceColorsInDir(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceColorsInDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.css') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            content = content.replace(/#6366f1/ig, '#0ea5e9'); // sky-500
            content = content.replace(/#4f46e5/ig, '#0284c7'); // sky-600
            content = content.replace(/#818cf8/ig, '#38bdf8'); // sky-400
            content = content.replace(/99\s*,\s*102\s*,\s*241/g, '14, 165, 233');
            content = content.replace(/indigo-500/g, 'sky-500');
            content = content.replace(/indigo-600/g, 'sky-600');
            content = content.replace(/indigo-400/g, 'sky-400');
            content = content.replace(/indigo-50/g, 'sky-50');
            content = content.replace(/indigo-100/g, 'sky-100');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated colors in ${fullPath}`);
            }
        }
    }
}

replaceColorsInDir('./src');
console.log('Done');
