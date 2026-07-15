import { test, expect, _electron as electron } from "@playwright/test";
import electronPath from "electron";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../../..");
const desktopRoot = path.join(repoRoot, "apps", "desktop");
const fixtureDir = path.join(repoRoot, "test-data", "synthetic", "e2e");
const fixturePdf = path.join(fixtureDir, "native-text.pdf");
const projectPath = path.join(fixtureDir, "vertical-slice.pdfiproj");

test.beforeAll(() => {
  mkdirSync(fixtureDir, { recursive: true });
  rmSync(projectPath, { force: true });
  execFileSync(
    path.join(repoRoot, ".venv", "Scripts", "python.exe"),
    [
      "-c",
      [
        "from reportlab.pdfgen import canvas",
        "pdf = canvas.Canvas(r'" + fixturePdf.replace(/\\/g, "\\\\") + "', pagesize=(300, 220))",
        "pdf.drawString(40, 160, 'Invoice Total 123.45')",
        "pdf.drawString(40, 130, 'Customer Example')",
        "pdf.save()"
      ].join("; ")
    ],
    { cwd: repoRoot }
  );
});

test("loads a PDF, extracts words, selects a word, and saves a project", async () => {
  const app = await electron.launch({
    executablePath: String(electronPath),
    args: [path.join(desktopRoot, "dist", "electron", "main.js")],
    cwd: desktopRoot,
    env: {
      ...process.env,
      PDFI_E2E: "1",
      PDFI_E2E_PDF_PATH: fixturePdf,
      PDFI_E2E_PROJECT_PATH: projectPath
    }
  });

  const page = await app.firstWindow();
  await expect(page.getByTestId("status")).toContainText("PDF loaded");

  await page.getByTestId("run-extraction").click();
  await expect(page.getByTestId("status")).toContainText("Extraction complete");
  await expect(page.getByTestId("word-box").first()).toBeVisible();

  await page.getByTestId("word-box").first().click();
  await expect(page.getByTestId("selection-details")).toContainText("Invoice");

  await page.getByTestId("save-project").click();
  await expect(page.getByTestId("status")).toContainText("Project saved");

  const saved = JSON.parse(await readFile(projectPath, "utf8")) as {
    document: { pages: Array<{ words: Array<{ text: string }> }> };
  };
  expect(saved.document.pages[0]?.words.map((word) => word.text)).toContain("Invoice");

  await app.close();
});
