import { RunResult } from "better-sqlite3";

export function now() {
  return new Date().toISOString();
}

export interface SqlLiteStmt {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bind(...args: any[]): any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  run(...args: any[]): Promise<RunResult>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get<T>(...args: any[]): Promise<T>;
}

export interface SqlLite {
  prepare(sql: string): SqlLiteStmt;
}
