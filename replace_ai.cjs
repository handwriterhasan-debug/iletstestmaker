const fs = require('fs');
const path = require('path');
const p = path.resolve('src/services/aiScoringService.ts');
let content = fs.readFileSync(p, 'utf8');
content = content.replace(/await ai\.models\./g, 'await getAiClient().models.');
fs.writeFileSync(p, content, 'utf8');
console.log('Done');
