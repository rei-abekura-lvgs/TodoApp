const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('ビルドと本番パッケージング処理を開始します...');

try {
  // 依存関係のインストール
  console.log('すべての依存関係をインストール中...');
  execSync('npm install', { stdio: 'inherit' });
  
  // フロントエンドのビルド
  console.log('フロントエンドをビルド中...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // サーバーコードのビルド (viteに依存しない方法で)
  console.log('バックエンドをビルド中...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --external:vite --external:@vitejs/plugin-react --external:@replit/vite-plugin-shadcn-theme-json --external:@replit/vite-plugin-runtime-error-modal --external:@replit/vite-plugin-cartographer', { stdio: 'inherit' });
  
  // サーバー側vite.tsの修正版を作成
  console.log('プロダクション用のvite.tsファイルを作成中...');
  const prodViteFile = `
import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";

// viteの関数はダミー実装に置き換え
export function log(message, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(\`\${formattedTime} [\${source}] \${message}\`);
}

// 開発環境用の関数はダミー実装
export async function setupVite(app, server) {
  // 何もしない - 本番環境では使用されない
  console.log("Development mode not available in production");
}

// 静的ファイル配信のみ実装
export function serveStatic(app) {
  const distPath = path.resolve(import.meta.dirname, "client");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      \`Could not find the build directory: \${distPath}, make sure to build the client first\`,
    );
  }

  app.use(express.static(distPath));

  // ファイルが存在しない場合はindex.htmlにフォールバック
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
`;

  // 本番用のvite.tsを保存
  fs.writeFileSync('dist/vite.js', prodViteFile);
  
  // clientディレクトリ構造を確認して作成
  console.log('クライアントビルドをパッケージに含める...');
  execSync('mkdir -p dist/client', { stdio: 'inherit' });
  // Viteのビルド出力はdist/publicにあるので、それをdist/clientにコピー
  execSync('cp -r dist/public/* dist/client/ || true', { stdio: 'inherit' });
  
  // package.jsonを作成
  console.log('本番用package.jsonを生成...');
  const packageJson = {
    "name": "todo-app-production",
    "version": "1.0.0",
    "type": "module",
    "dependencies": {
      "@neondatabase/serverless": "*",
      "drizzle-orm": "*",
      "express": "*",
      "ws": "*"
    },
    "scripts": {
      "start": "NODE_ENV=production node index.js"
    }
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));
  
  // index.jsを修正して直接vite.tsを参照しない
  console.log('サーバーエントリーポイントを修正中...');
  const indexContent = fs.readFileSync('dist/index.js', 'utf8');
  const modifiedIndex = indexContent.replace(
    /from ["']\.\/vite["']/g,
    'from "./vite.js"'
  );
  fs.writeFileSync('dist/index.js', modifiedIndex);
  
  console.log('ビルド完了！');
} catch (error) {
  console.error('ビルド失敗:', error);
  process.exit(1);
}