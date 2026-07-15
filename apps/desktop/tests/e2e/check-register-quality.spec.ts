import { test, expect, _electron as electron, type Locator } from "@playwright/test";
import electronPath from "electron";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../../..");
const desktopRoot = path.join(repoRoot, "apps", "desktop");
const fixtureDir = path.join(repoRoot, "test-data", "synthetic", "check-register");
const fixturePdf = path.join(fixtureDir, "nonstandard-register-12p.pdf");

test.beforeAll(() => {
  mkdirSync(fixtureDir, { recursive: true });
  execFileSync(
    path.join(repoRoot, ".venv", "Scripts", "python.exe"),
    [
      "-c",
      [
        "import sys",
        "from pathlib import Path",
        "sys.path.insert(0, r'" + path.join(repoRoot, "services", "extraction", "tests").replace(/\\/g, "\\\\") + "')",
        "from fixtures.check_register_generator import generate_nonstandard_check_register",
        "generate_nonstandard_check_register(Path(r'" + fixturePdf.replace(/\\/g, "\\\\") + "'), page_count=12)"
      ].join("; ")
    ],
    { cwd: repoRoot }
  );
});

test("check-register overlays do not overlap and selected words reveal document patterns", async () => {
  const app = await electron.launch({
    executablePath: String(electronPath),
    args: [path.join(desktopRoot, "dist", "electron", "main.js")],
    cwd: desktopRoot,
    env: {
      ...process.env,
      PDFI_E2E: "1",
      PDFI_E2E_PDF_PATH: fixturePdf
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

  const register = page.locator('.word-box[title^="REGISTER "]').first();
  await register.click();
  await expect(page.getByTestId("pattern-summary")).toContainText("12 occurrences");
  await expect(page.getByTestId("pattern-match")).toHaveCount(12);
  await expect(page.getByTestId("pattern-matches")).toContainText("Page 12: REGISTER");

  await app.close();
});

async function overlapRatio(
  first: Locator,
  second: Locator
): Promise<number> {
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
