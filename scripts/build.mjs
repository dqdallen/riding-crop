import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});await mkdir('miniprogram/utils',{recursive:true});
const source=await readFile('shared/core.cjs','utf8');await writeFile('dist/core.js',source);await writeFile('miniprogram/utils/core.js',source);
await writeFile('dist/calc.mjs',`import './core.js';\nconst api=globalThis.SalaryCore;\nexport const {dateKey,calculate,DEFAULTS,DEFAULT_GOAL,normalizeSettings,normalizeGoal,paydayInfo,calendarMonth,toggleDate,makeBackup,parseBackup}=api;\n`);
await copyFile('src-tauri/icons/icon.png','dist/icon.png');
console.log('Shared engine synchronized for web, desktop and WeChat.');
