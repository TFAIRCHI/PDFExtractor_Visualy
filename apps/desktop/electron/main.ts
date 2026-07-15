import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DocumentModelSchema, ProjectSchema, type DocumentModel } from "@pdf-intelligence/contracts";
import { ExtractionService } from "./sidecar.js";
import { logEvent } from "./logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow: BrowserWindow | null = null;
let extractionService: ExtractionService | null = null;

type SidecarCommand = {
  command: string;
  args: string[];
  pythonPath: string | null;
};

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 980,
    minHeight: 680,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self'; script-src 'self'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' http://127.0.0.1:5173"
        ]
      }
    });
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    void mainWindow.loadURL(devUrl);
  } else {
    void mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  logEvent("info", "app_ready", { version: app.getVersion(), packaged: app.isPackaged });
  const sidecar = resolveSidecarCommand();
  extractionService = new ExtractionService(sidecar.command, sidecar.args, sidecar.pythonPath);
  registerIpc();
  createWindow();
});

app.on("window-all-closed", () => {
  extractionService?.dispose();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function registerIpc(): void {
  ipcMain.handle("pdf:open", async () => {
    logEvent("info", "pdf_open_dialog_started");
    const result = await dialog.showOpenDialog(mainWindow!, {
      title: "Open PDF",
      filters: [{ name: "PDF", extensions: ["pdf"] }],
      properties: ["openFile"]
    });
    if (result.canceled || result.filePaths.length === 0) {
      logEvent("info", "pdf_open_dialog_cancelled");
      return null;
    }
    const pdfPath = path.resolve(result.filePaths[0]!);
    return { path: pdfPath, name: path.basename(pdfPath) };
  });

  ipcMain.handle("pdf:read", async (_event, pdfPath: string) => {
    assertPdfPath(pdfPath);
    const data = await readFile(pdfPath);
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  });

  ipcMain.handle("extract:native", async (_event, pdfPath: string) => {
    assertPdfPath(pdfPath);
    logEvent("info", "native_extraction_started", { extension: path.extname(pdfPath).toLowerCase() });
    const response = await getExtractionService().request("document.extractNative", {
      pdfPath
    });
    const parsed = DocumentModelSchema.parse(response) satisfies DocumentModel;
    logEvent("info", "native_extraction_completed", {
      pageCount: parsed.pageCount,
      extractedPages: parsed.pages.length
    });
    return parsed;
  });

  ipcMain.handle("project:save", async (_event, projectPath: string | null, payload: unknown) => {
    const project = ProjectSchema.parse(payload);
    const target =
      projectPath ??
      (
        await dialog.showSaveDialog(mainWindow!, {
          title: "Save Project",
          filters: [{ name: "PDF Intelligence Project", extensions: ["pdfiproj"] }]
        })
      ).filePath;
    if (!target) {
      return null;
    }
    await writeFile(target, JSON.stringify(project, null, 2), "utf8");
    logEvent("info", "project_saved", { schemaVersion: project.schemaVersion });
    return target;
  });

  ipcMain.handle("project:open", async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      title: "Open Project",
      filters: [{ name: "PDF Intelligence Project", extensions: ["pdfiproj"] }],
      properties: ["openFile"]
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    const projectPath = path.resolve(result.filePaths[0]!);
    const contents = await readFile(projectPath, "utf8");
    return { path: projectPath, project: ProjectSchema.parse(JSON.parse(contents)) };
  });

  ipcMain.handle("e2e:config", async () => {
    if (process.env.PDFI_E2E !== "1") {
      return null;
    }
    return {
      pdfPath: process.env.PDFI_E2E_PDF_PATH ?? null,
      projectPath: process.env.PDFI_E2E_PROJECT_PATH ?? null
    };
  });
}

function getExtractionService(): ExtractionService {
  if (!extractionService) {
    throw new Error("Extraction service is not available.");
  }
  return extractionService;
}

function assertPdfPath(pdfPath: string): void {
  const resolved = path.resolve(pdfPath);
  if (path.extname(resolved).toLowerCase() !== ".pdf") {
    throw new Error("Only PDF files are supported.");
  }
}

function resolveSidecarCommand(): SidecarCommand {
  if (app.isPackaged) {
    const sidecarExe = path.join(process.resourcesPath, "sidecar", "extraction-service.exe");
    if (existsSync(sidecarExe)) {
      return { command: sidecarExe, args: [], pythonPath: null };
    }
  }

  if (!app.isPackaged) {
    const repoRoot = resolveRepoRoot();
    const localPython = path.join(repoRoot, ".venv", "Scripts", "python.exe");
    if (existsSync(localPython)) {
      return {
        command: localPython,
        args: ["-m", "extraction_service.rpc"],
        pythonPath: resolveServiceModulePath()
      };
    }
  }

  return {
    command: process.platform === "win32" ? "python" : "python3",
    args: ["-m", "extraction_service.rpc"],
    pythonPath: resolveServiceModulePath()
  };
}

function resolveServiceModulePath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "services/extraction/src");
  }
  return path.join(resolveRepoRoot(), "services", "extraction", "src");
}

function resolveRepoRoot(): string {
  const candidates = [process.cwd(), app.getAppPath(), __dirname];
  for (const candidate of candidates) {
    let current = path.resolve(candidate);
    for (let depth = 0; depth < 6; depth += 1) {
      if (existsSync(path.join(current, "services", "extraction", "src"))) {
        return current;
      }
      const parent = path.dirname(current);
      if (parent === current) {
        break;
      }
      current = parent;
    }
  }
  return path.resolve(app.getAppPath(), "../../");
}
