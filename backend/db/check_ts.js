const { execSync } = require('child_process');
try {
  const out = execSync('npx tsc --noEmit', { cwd: 'd:/Kynd/backend/db', encoding: 'utf-8' });
  console.log('SUCCESS:', out);
} catch (e) {
  console.log('ERROR:', e.stdout);
}
