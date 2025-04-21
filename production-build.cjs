const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('本番環境用ビルドの実行を開始します...');

try {
  // 依存関係のインストール
  console.log('必要な依存関係をインストール中...');
  execSync('npm install', { stdio: 'inherit' });
  
  // フロントエンドのビルド
  console.log('フロントエンドをビルド中...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // 本番用ディレクトリ作成
  console.log('本番環境用ディレクトリを準備中...');
  execSync('mkdir -p production/client', { stdio: 'inherit' });
  
  // フロントエンドのビルド結果をコピー
  console.log('フロントエンドのビルド結果をコピー中...');
  execSync('cp -r dist/public/* production/client/', { stdio: 'inherit' });
  
  // 本番用サーバーファイルをコピー
  console.log('本番用サーバーファイルを準備中...');
  execSync('cp production-server.js production/server.js', { stdio: 'inherit' });
  
  // サーバーサイドのソースコードをコピー (ただしvite.tsを除く)
  console.log('必要なサーバーコードをコピー中...');
  execSync('mkdir -p production/server', { stdio: 'inherit' });
  execSync('cp -r server/* production/server/', { stdio: 'inherit' });
  execSync('rm -f production/server/vite.ts', { stdio: 'inherit' }); // vite.tsを削除
  
  // 共有コードもコピー
  console.log('共有コードをコピー中...');
  execSync('mkdir -p production/shared', { stdio: 'inherit' });
  execSync('cp -r shared/* production/shared/', { stdio: 'inherit' });
  
  // サーバー側コードをTypeScriptからJavaScriptに変換
  console.log('サーバー側コードをJavaScriptにコンパイル中...');
  execSync('npx esbuild server/routes.ts server/db.ts shared/schema.ts server/storage.ts --platform=node --format=esm --outdir=production/server --external:vite', { stdio: 'inherit' });
  
  // 本番用package.jsonを作成
  console.log('本番用package.jsonを作成中...');
  const packageJson = {
    "name": "todo-app-production",
    "version": "1.0.0",
    "type": "module",
    "dependencies": {
      "@neondatabase/serverless": "^0.9.0",
      "drizzle-orm": "^0.29.7",
      "express": "^4.18.3",
      "ws": "^8.16.0",
      "zod": "^3.22.4"
    },
    "scripts": {
      "start": "NODE_ENV=production node server.js"
    }
  };
  
  fs.writeFileSync('production/package.json', JSON.stringify(packageJson, null, 2));
  
  // 本番環境用のdist作成
  console.log('最終的な本番環境用ファイルを準備中...');
  execSync('mkdir -p dist-production', { stdio: 'inherit' });
  execSync('cp -r production/* dist-production/', { stdio: 'inherit' });
  
  // デプロイに必要なファイルだけ残す
  console.log('不要なファイルを削除中...');
  execSync('find dist-production -name "*.ts" -delete', { stdio: 'inherit' });
  
  console.log('本番環境用ビルドが完了しました！');
} catch (error) {
  console.error('ビルドに失敗しました:', error);
  process.exit(1);
}