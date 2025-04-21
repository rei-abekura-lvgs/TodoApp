// production-server.js
// シンプルな本番環境用サーバー（vite依存なし）
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerRoutes } from './server/routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// JSONボディパーサーなど
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// リクエストロギング
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// APIルートの登録
const server = await registerRoutes(app);

// エラーハンドラー
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  console.error(err);
});

// 静的ファイルの提供
const staticPath = path.join(__dirname, 'client');
app.use(express.static(staticPath));

// SPA用フォールバック
app.use('*', (_req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// 環境変数からポートを取得、デフォルトは5000
const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
server.listen({
  port,
  host: "0.0.0.0",
  reusePort: true,
}, () => {
  console.log(`サーバー起動しました。ポート: ${port}`);
});