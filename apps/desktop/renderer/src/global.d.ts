import type { DesktopApi } from "../../preload/preload";

declare global {
  interface Window {
    pdfIntelligence: DesktopApi;
  }
}
