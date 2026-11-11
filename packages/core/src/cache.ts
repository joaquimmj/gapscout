import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";

/**
 * Local cache so re-running a scan downloads nothing twice (and tests stay free).
 * Uses Node's built-in SQLite (node:sqlite, Node >= 22.13); falls back to memory if unavailable.
 */
export interface Cache {
  get<T>(key: string): T | undefined;
  set(key: string, value: unknown, ttlSeconds: number): void;
  readonly kind: "sqlite" | "memory";
  readonly path?: string;
}

class MemoryCache implements Cache {
  readonly kind = "memory" as const;
  private m = new Map<string, { v: unknown; exp: number }>();
  get<T>(key: string): T | undefined {
    const e = this.m.get(key);
    if (!e) return undefined;
    if (e.exp < Date.now()) {
      this.m.delete(key);
      return undefined;
    }
    return e.v as T;
  }
  set(key: string, value: unknown, ttlSeconds: number) {
    this.m.set(key, { v: value, exp: Date.now() + ttlSeconds * 1000 });
  }
}

interface SqliteStatement {
  get(...args: unknown[]): unknown;
  run(...args: unknown[]): unknown;
}
interface SqliteDb {
  exec(sql: string): void;
  prepare(sql: string): SqliteStatement;
}

class SqliteCache implements Cache {
  readonly kind = "sqlite" as const;
  private getStmt: SqliteStatement;
  private setStmt: SqliteStatement;
  // Keep `db` referenced: on Node 22 a collected DatabaseSync finalizes its statements.
  constructor(private readonly db: SqliteDb, readonly path: string) {
    db.exec(
      "CREATE TABLE IF NOT EXISTS cache (k TEXT PRIMARY KEY, v TEXT NOT NULL, exp INTEGER NOT NULL)",
    );
    db.exec(`DELETE FROM cache WHERE exp < ${Date.now()}`);
    this.getStmt = db.prepare("SELECT v, exp FROM cache WHERE k = ?");
    this.setStmt = db.prepare("INSERT OR REPLACE INTO cache (k, v, exp) VALUES (?, ?, ?)");
  }
  get<T>(key: string): T | undefined {
    const row = this.getStmt.get(key) as { v: string; exp: number } | undefined;
    if (!row || row.exp < Date.now()) return undefined;
    return JSON.parse(row.v) as T;
  }
  set(key: string, value: unknown, ttlSeconds: number) {
    this.setStmt.run(key, JSON.stringify(value), Date.now() + ttlSeconds * 1000);
  }
}

let instance: Cache | undefined;

export function getCache(): Cache {
  if (instance) return instance;
  if (process.env.GAPSCOUT_NO_CACHE === "1") return (instance = new MemoryCache());
  const dir = process.env.GAPSCOUT_CACHE_DIR ?? join(homedir(), ".cache", "gapscout");
  try {
    mkdirSync(dir, { recursive: true });
    // node:sqlite prints an ExperimentalWarning on some Node versions; silence just that one.
    const origEmit = process.emitWarning;
    process.emitWarning = ((w: string | Error, ...rest: unknown[]) => {
      const msg = typeof w === "string" ? w : w.message;
      if (msg.includes("SQLite")) return;
      return (origEmit as (...a: unknown[]) => void).call(process, w, ...rest);
    }) as typeof process.emitWarning;
    const require = createRequire(import.meta.url);
    const { DatabaseSync } = require("node:sqlite") as { DatabaseSync: new (p: string) => SqliteDb };
    process.emitWarning = origEmit;
    const path = join(dir, "cache.db");
    instance = new SqliteCache(new DatabaseSync(path), path);
  } catch {
    instance = new MemoryCache();
  }
  return instance;
}
