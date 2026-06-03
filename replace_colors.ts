import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function replaceColorsInDir(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceColorsInDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.css') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            // #84cc16 -> #6366f1 (indigo-500)
            // #65a30d -> #4f46e5 (indigo-600)
            // #a3e635 -> #818cf8 (indigo-400)
            // rgba(132,204,22, X) -> rgba(99,102,241, X)
            
            content = content.replace(/#84cc16/g, '#6366f1');
            content = content.replace(/#65a30d/g, '#4f46e5');
            content = content.replace(/#a3e635/g, '#818cf8');
            content = content.replace(/99,\s*102,\s*241/g, '99,102,241');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated colors in ${fullPath}`);
            }
        }
    }
}

replaceColorsInDir(path.join(__dirname, 'src'));
console.log('Color replacement complete.');
