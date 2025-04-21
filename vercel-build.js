// Vercel用のビルドスクリプト
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// ビルドプロセスの実行
console.log('🏗️ ビルドを開始します...');

try {
  // フロントエンドのビルド
  console.log('📦 フロントエンドのビルドを実行中...');
  execSync('vite build', { stdio: 'inherit' });
  
  // バックエンドのビルド
  console.log('🛠️ バックエンドのビルドを実行中...');
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
  
  // APIディレクトリの作成とビルド
  console.log('🔌 APIディレクトリのビルドを実行中...');
  execSync('esbuild api/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist/api', { stdio: 'inherit' });
  
  // ディレクトリ構造の確認
  console.log('📂 ディレクトリ構造を確認中...');
  
  // dist/publicディレクトリが存在することを確認
  const publicDir = path.join(process.cwd(), 'dist', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  console.log('✅ ビルドが完了しました！');
} catch (error) {
  console.error('❌ ビルド中にエラーが発生しました:', error);
  process.exit(1);
}