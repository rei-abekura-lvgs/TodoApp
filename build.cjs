const { execSync } = require('child_process');

console.log('Building the project...');

try {
  // サーバーサイドのビルド
  console.log('Building server...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
  
  // クライアントサイドのビルド
  console.log('Building client...');
  console.log('Installing vite globally first...');
  execSync('npm install -g vite', { stdio: 'inherit' });
  execSync('NODE_ENV=production npx vite build', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}