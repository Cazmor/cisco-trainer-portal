const fs = require('fs');
const v = Date.now();
const files = fs.readdirSync('public').filter(f => f.endsWith('.html'));
for (const f of files) {
  const p = 'public/' + f;
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/src=\"js\/(.*?)\.js(\?v=\d+(\.\d+)?)?\"/g, 'src="js/$1.js?v=' + v + '"');
  fs.writeFileSync(p, c);
}
console.log('Cache busted on ' + files.length + ' files with version ' + v);
