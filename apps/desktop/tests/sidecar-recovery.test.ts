import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ExtractionService } from "../electron/sidecar.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");
const python = path.join(repoRoot, ".venv", "Scripts", "python.exe");
const pythonPath = path.join(repoRoot, "services", "extraction", "src");

describe("ExtractionService process recovery", () => {
  it("restarts the sidecar after an unexpected process exit", async () => {
    if (!existsSync(python)) {
      console.warn("Skipping sidecar recovery test because .venv is missing.");
      return;
    }

    const service = new ExtractionService(python, ["-m", "extraction_service.rpc"], pythonPath);
    try {
      await expect(service.request("health.check", {}, 10_000)).resolves.toEqual({
        ok: true,
        service: "extraction"
      });

      const child = (service as unknown as { child: { kill(): void } | null }).child;
      expect(child).not.toBeNull();
      child?.kill();
      await new Promise((resolve) => setTimeout(resolve, 500));

      await expect(service.request("health.check", {}, 10_000)).resolves.toEqual({
        ok: true,
        service: "extraction"
      });
    } finally {
      service.dispose();
    }
  }, 30_000);
});
