#!/bin/bash

# 必要なパッケージをインストール
echo "Installing dependencies..."
npm install --production
npm install vite --no-save

# 環境変数を設定
export NODE_ENV=production

# アプリケーションを起動
echo "Starting application..."
node dist/index.js