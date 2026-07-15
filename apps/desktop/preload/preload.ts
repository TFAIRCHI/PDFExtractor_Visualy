import { contextBridge, ipcRenderer } from "electron";
import type { DocumentModel, ProjectModel } from "@pdf-intelligence/contracts";

export type PdfFile = { path: string; name: string };
export type OpenProjectResult = { path: string; project: ProjectModel };

export type DesktopApi = {
  openPdf(): Promise<PdfFile | null>;
  readPdf(path: string): Promise<ArrayBuffer>;
  extractNative(path: string): Promise<DocumentModel>;
  saveProject(path: string | null, project: ProjectModel): Promise<string | null>;
  openProject(): Promise<OpenProjectResult | null>;
};

const api: DesktopApi = {
  openPdf: () => ipcRenderer.invoke("pdf:open"),
  readPdf: (path) => ipcRenderer.invoke("pdf:read", path),
  extractNative: (path) => ipcRenderer.invoke("extract:native", path),
  saveProject: (path, project) => ipcRenderer.invoke("project:save", path, project),
  openProject: () => ipcRenderer.invoke("project:open")
};

contextBridge.exposeInMainWorld("pdfIntelligence", api);
