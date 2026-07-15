import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { createInterface } from "node:readline";
import { RpcResponseSchema } from "@pdf-intelligence/contracts";
import { randomUUID } from "node:crypto";
import { logEvent } from "./logger.js";

type Pending = {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timer: NodeJS.Timeout;
};

export class ExtractionService {
  private child: ChildProcessWithoutNullStreams | null = null;
  private readonly pending = new Map<string | number, Pending>();

  constructor(
    private readonly pythonCommand: string,
    private readonly commandArgs: string[],
    private readonly pythonPath: string | null
  ) {}

  async request(method: string, params?: Record<string, unknown>, timeoutMs = 30_000): Promise<unknown> {
    const child = this.ensureStarted();
    const id = randomUUID();
    const payload = JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n";
    const result = new Promise<unknown>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Extraction request timed out: ${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
    });
    child.stdin.write(payload);
    return result;
  }

  dispose(): void {
    for (const [id, pending] of this.pending.entries()) {
      clearTimeout(pending.timer);
      pending.reject(new Error(`Extraction service stopped before response: ${id}`));
    }
    this.pending.clear();
    this.child?.kill();
    this.child = null;
  }

  private ensureStarted(): ChildProcessWithoutNullStreams {
    if (this.child && !this.child.killed) {
      return this.child;
    }
    const child = spawn(this.pythonCommand, this.commandArgs, {
      env: {
        ...process.env,
        ...(this.pythonPath ? { PYTHONPATH: this.pythonPath } : {})
      },
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true
    });
    logEvent("info", "extraction_service_started", {
      command: this.pythonCommand,
      argCount: this.commandArgs.length
    });
    if (process.env.PDFI_E2E === "1") {
      console.error(
        `[extraction-service] spawn ${this.pythonCommand} ${this.commandArgs.join(" ")}`
      );
    }

    const output = createInterface({ input: child.stdout });
    output.on("line", (line) => this.handleLine(line));
    child.stderr.on("data", (chunk: Buffer) => {
      const message = chunk.toString("utf8").trim();
      console.error(`[extraction-service] ${message}`);
      logEvent("warn", "extraction_service_stderr", { message });
    });
    child.on("exit", () => {
      logEvent("warn", "extraction_service_exited");
      this.child = null;
      for (const pending of this.pending.values()) {
        clearTimeout(pending.timer);
        pending.reject(new Error("Extraction service exited."));
      }
      this.pending.clear();
    });
    this.child = child;
    return child;
  }

  private handleLine(line: string): void {
    if (process.env.PDFI_E2E === "1") {
      console.error(`[extraction-service] stdout ${line}`);
    }
    const parsed = RpcResponseSchema.parse(JSON.parse(line));
    const pending = this.pending.get(parsed.id);
    if (!pending) {
      return;
    }
    this.pending.delete(parsed.id);
    clearTimeout(pending.timer);
    if (parsed.error) {
      pending.reject(new Error(`${parsed.error.message}: ${String(parsed.error.data ?? "")}`));
    } else {
      pending.resolve(parsed.result);
    }
  }
}
