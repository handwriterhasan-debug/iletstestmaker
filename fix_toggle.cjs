const fs = require('fs');
const appPath = './src/App.tsx';
let app = fs.readFileSync(appPath, 'utf8');
app = app.replace(/<ThemeToggle[^>]*\/>/g, '');
fs.writeFileSync(appPath, app);

const dashPath = './src/pages/Dashboard.tsx';
let dash = fs.readFileSync(dashPath, 'utf8');
if (!dash.includes('import ThemeToggle')) {
  dash = dash.replace("import BottomNav from '../components/BottomNav';", "import BottomNav from '../components/BottomNav';\nimport ThemeToggle from '../components/ThemeToggle';");
}
dash = dash.replace(
  /<div className="flex items-center space-x-3">\s*<button\s*onClick=\{\(\) => navigate\('\/results'\)\}/,
  `<div className="flex items-center space-x-3">\n          <ThemeToggle className="w-10 h-10 border-2" />\n          <button \n            onClick={() => navigate('/results')}`
);
fs.writeFileSync(dashPath, dash);
