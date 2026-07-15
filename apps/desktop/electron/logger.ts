import { app } from "electron";
import { mkdirSync, appendFileSync } from "node:fs";
import path from "node:path";

export type LogLevel = "info" | "warn" | "error";

export function logEvent(level: LogLevel, event: string, fields: Record<string, unknown> = {}): void {
  try {
    if (!app?.getPath) {
      return;
    }
    const logDir = path.join(app.getPath("userData"), "logs");
    mkdirSync(logDir, { recursive: true });
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      event,
      ...sanitizeFields(fields)
    };
    appendFileSync(path.join(logDir, "app.log"), JSON.stringify(entry) + "\n", "utf8");
  } catch (error) {
    console.error(`[log] failed to write ${event}: ${String(error)}`);
  }
}

function sanitizeFields(fields: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    const lowered = key.toLowerCase();
    if (lowered.includes("text") || lowered.includes("content")) {
      sanitized[key] = "[redacted]";
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
