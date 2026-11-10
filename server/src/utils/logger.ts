type Level = "debug" | "info" | "warn" | "error";

const order: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const threshold = (): number => {
  const raw = process.env["LOG_LEVEL"];
  if (raw === "debug" || raw === "info" || raw === "warn" || raw === "error") return order[raw];
  return process.env["NODE_ENV"] === "test" ? order.error + 1 : order.info;
};

const write = (level: Level, message: string, meta?: Record<string, unknown>): void => {
  if (order[level] < threshold()) return;
  const line = `${new Date().toISOString()} ${level.toUpperCase()} ${message}`;
  const out = meta ? `${line} ${JSON.stringify(meta)}` : line;
  if (level === "error") process.stderr.write(`${out}\n`);
  else process.stdout.write(`${out}\n`);
};

// Never pass secrets, passwords or full request bodies as meta.
export const logger = {
  debug: (message: string, meta?: Record<string, unknown>): void => write("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>): void => write("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>): void => write("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>): void => write("error", message, meta),
};
