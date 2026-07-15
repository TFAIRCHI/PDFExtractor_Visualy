import { test, expect, _electron as electron, type Locator } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../../..");
const fixtureDir = path.join(repoRoot, "test-data", "synthetic", "package-smoke");
const fixturePdf = path.join(fixtureDir, "native-text.pdf");
const checkRegisterPdf = path.join(fixtureDir, "nonstandard-register-12p.pdf");
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
  execFileSync(
    path.join(repoRoot, ".venv", "Scripts", "python.exe"),
    [
      "-c",
      [
        "import sys",
        "from pathlib import Path",
        "sys.path.insert(0, r'" + path.join(repoRoot, "services", "extraction", "tests").replace(/\\/g, "\\\\") + "')",
        "from fixtures.check_register_generator import generate_nonstandard_check_register",
        "generate_nonstandard_check_register(Path(r'" + checkRegisterPdf.replace(/\\/g, "\\\\") + "'), page_count=12)"
      ].join("; ")
    ],
    { cwd: repoRoot }
  );
});

test("packaged app extracts with bundled sidecar and no development Python on PATH", async () => {
  const filteredPath = (process.env.PATH ?? "")
    .split(";")
    .filter((entry) => {
      const normalized = entry.toLowerCase();
      return !normalized.includes("python") && !normalized.includes("anaconda");
    })
    .join(";");

  const app = await electron.launch({
    executablePath: packagedExe,
    env: {
      ...process.env,
      PATH: filteredPath,
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

test("packaged app validates check-register overlap and same-word pattern discovery", async () => {
  const filteredPath = (process.env.PATH ?? "")
    .split(";")
    .filter((entry) => {
      const normalized = entry.toLowerCase();
      return !normalized.includes("python") && !normalized.includes("anaconda");
    })
    .join(";");

  const app = await electron.launch({
    executablePath: packagedExe,
    env: {
      ...process.env,
      PATH: filteredPath,
      PDFI_E2E: "1",
      PDFI_E2E_PDF_PATH: checkRegisterPdf
    }
  });

  const page = await app.firstWindow();
  await expect(page.getByTestId("status")).toContainText("PDF loaded");
  await page.getByTestId("run-extraction").click();
  await expect(page.getByTestId("status")).toContainText("Extraction complete");

  const wide = page.locator('.word-box[title^="WIDEWIDE "]').first();
  const next = page.locator('.word-box[title^="NEXT "]').first();
  await expect(wide).toBeVisible();
  await expect(next).toBeVisible();
  expect(await overlapRatio(wide, next)).toBeLessThanOrEqual(0.1);

  await page.locator('.word-box[title^="REGISTER "]').first().click();
  await expect(page.getByTestId("pattern-summary")).toContainText("12 occurrences");
  await expect(page.getByTestId("pattern-match")).toHaveCount(12);

  await app.close();
});

async function overlapRatio(first: Locator, second: Locator): Promise<number> {
  const a = await first.boundingBox();
  const b = await second.boundingBox();
  if (!a || !b) {
    throw new Error("Cannot calculate overlap for non-visible elements.");
  }
  const xOverlap = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const yOverlap = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  const intersection = xOverlap * yOverlap;
  return intersection / Math.min(a.width * a.height, b.width * b.height);
}
