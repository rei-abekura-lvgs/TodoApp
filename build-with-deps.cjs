const { execSync } = require('child_process');

console.log('Building the project with all dependencies...');

try {
  // viteを含むすべての依存関係をインストール
  console.log('Installing all dependencies including vite...');
  execSync('npm install', { stdio: 'inherit' });
  
  // サーバーサイドのビルド
  console.log('Building server...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
  
  // ビルド完了後に必要な公開ディレクトリを作成
  console.log('Creating public directory...');
  execSync('mkdir -p dist/public', { stdio: 'inherit' });
  
  // 空のindex.htmlファイルを作成（必要な場合）
  console.log('Creating placeholder index.html...');
  execSync('echo "<html><body><h1>API Server</h1></body></html>" > dist/public/index.html', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}