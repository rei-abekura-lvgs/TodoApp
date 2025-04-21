import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// 使用するデータベース接続文字列を決定
// NEON_DATABASE_URLが設定されていればそれを使用し、なければDATABASE_URLを使用
const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Database connection string must be set. Did you forget to provision a database?",
  );
}

console.log(`Using database: ${process.env.NEON_DATABASE_URL ? 'Neon (External)' : 'Replit (Internal)'}`);

export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });
