const { execSync } = require('child_process');

console.log('Building the server-only project...');

try {
  // サーバーサイドのビルド
  console.log('Building server...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
  
  console.log('Server build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}