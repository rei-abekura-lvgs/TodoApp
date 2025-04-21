# TODOアプリケーション

タスク管理のためのシンプルで使いやすいTODOアプリケーションです。

## 機能

- タスクの作成、表示、編集、削除
- カテゴリによるタスクの整理
- 優先度の設定（高、中、低）
- 期限の設定
- タスクのステータスによるフィルタリング（完了/未完了）
- カテゴリによるフィルタリング
- 優先度によるフィルタリング

## 技術スタック

- フロントエンド: React, Tailwind CSS
- バックエンド: Express.js
- データベース: PostgreSQL (Neon)
- ORM: Drizzle
- 認証: Passport.js (将来的な実装)

## ローカル開発環境のセットアップ

```bash
# リポジトリをクローン
git clone <リポジトリURL>
cd todo-app

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 環境変数

以下の環境変数を設定してください：

- `NEON_DATABASE_URL`: NeonデータベースのURL（必須）
- `PORT`: サーバーのポート番号（オプション、デフォルト: 5000）

## Renderにデプロイする

1. [Render](https://render.com/)にアカウントを作成する
2. 「Web Service」を新規作成する
3. GitHubリポジトリを連携する
4. 環境変数を設定する：
   - `NEON_DATABASE_URL`: NeonデータベースのURL
   - `NODE_ENV`: `production`
5. デプロイを開始する

## ライセンス

MITライセンス