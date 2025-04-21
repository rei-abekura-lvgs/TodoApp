#!/bin/bash
# 本番環境では、ビルドされたアセットを利用
npm ci
npm run build
# サーバーを起動
node dist/index.js