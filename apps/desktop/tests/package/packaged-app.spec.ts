import { test, expect, _electron as electron } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../../..");
const fixtureDir = path.join(repoRoot, "test-data", "synthetic", "package-smoke");
const fixturePdf = path.join(fixtureDir, "native-text.pdf");
const packagedExe = path.join(
  repoRoot,
  "installers",
  "dev",
  "win-unpacked",
  "PDF Intelligence.exe"
);

test.beforeAll(() => {
  if (!existsSync(packagedExe)) {
    throw new Error(`Packaged app is missing: ${packagedExe}`);
  }
  mkdirSync(fixtureDir, { recursive: true });
  rmSync(path.join(fixtureDir, "package-smoke.pdfiproj"), { force: true });
  execFileSync(
    path.join(repoRoot, ".venv", "Scripts", "python.exe"),
    [
      "-c",
      [
        "from reportlab.pdfgen import canvas",
        "pdf = canvas.Canvas(r'" + fixturePdf.replace(/\\/g, "\\\\") + "', pagesize=(300, 220))",
        "pdf.drawString(40, 160, 'Packaged Sidecar Works')",
        "pdf.save()"
      ].join("; ")
    ],
    { cwd: repoRoot }
  );
});

test("packaged app extracts with bundled sidecar and no development Python on PATH", async () => {
  const app = await electron.launch({
    executablePath: packagedExe,
    env: {
      SystemRoot: process.env.SystemRoot ?? "C:\\Windows",
      TEMP: process.env.TEMP ?? "",
      TMP: process.env.TMP ?? "",
      PATH: `${process.env.SystemRoot ?? "C:\\Windows"}\\System32`,
      PDFI_E2E: "1",
      PDFI_E2E_PDF_PATH: fixturePdf
    }
  });

  const page = await app.firstWindow();
  await expect(page.getByTestId("status")).toContainText("PDF loaded");
  await page.getByTestId("run-extraction").click();
  await expect(page.getByTestId("status")).toContainText("Extraction complete");
  await expect(page.getByTestId("selection-details")).not.toBeVisible();
  await expect(page.getByTestId("word-box").first()).toBeVisible();

  await app.close();
});
