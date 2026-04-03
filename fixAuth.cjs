const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'src/server/routes');

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.ts')) {
    const pt = path.join(dir, file);
    let code = fs.readFileSync(pt, 'utf8');
    
    // Original static user 
    const currentLine = "req.user = { id: '00000000-0000-0000-0000-000000000000' };";
    // Overriding payload
    const targetLine = "req.user = { id: req.headers['x-impersonate-id'] || '00000000-0000-0000-0000-000000000000' };";
    
    if (code.includes(currentLine)) {
      code = code.replace(currentLine, targetLine);
      fs.writeFileSync(pt, code);
      console.log('Successfully updated: ' + file);
    }
  }
});
