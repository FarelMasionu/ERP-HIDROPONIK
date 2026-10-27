const fs = require('fs');
const p = 'C:/Game/al-baroqah-hidroponik---erp-&-scm-terpadu/app/layout.tsx';
let s = fs.readFileSync(p, 'utf8');
s = s.replace("import './globals.css';\n", '');
fs.writeFileSync(p, "'use client';\nimport './globals.css';\n" + s);
console.log('done');
