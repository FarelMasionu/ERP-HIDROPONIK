const fs = require('fs');
const p = 'C:/Game/al-baroqah-hidroponik---erp-&-scm-terpadu/app/layout.tsx';
let s = fs.readFileSync(p, 'utf8');
s = "import './globals.css';\n" + s.replace("import './globals.css';\n", '');
fs.writeFileSync(p, s);
console.log('done');
