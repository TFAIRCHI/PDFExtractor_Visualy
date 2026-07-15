import { describe, expect, it } from "vitest";
import { CONTRACT_VERSION, DocumentModelSchema } from "./index.js";

describe("DocumentModelSchema", () => {
  it("validates a minimal extracted document", () => {
    const parsed = DocumentModelSchema.parse({
      contractVersion: CONTRACT_VERSION,
      sourcePath: "C:/sample.pdf",
      pageCount: 1,
      pages: [
        {
          pageIndex: 0,
          width: 612,
          height: 792,
          rotation: 0,
          words: [
            {
              objectId: "p0-w0",
              pageIndex: 0,
              text: "Invoice",
              sourceBBox: { x: 72, y: 72, width: 60, height: 12 },
              normalizedBBox: { x: 0.1176, y: 0.0909, width: 0.098, height: 0.0152 },
              confidence: 0.82,
              sourceMethod: "native_pdf",
              provenance: {
                engine: "pypdf",
                engineVersion: "unknown",
                contractVersion: CONTRACT_VERSION
              }
            }
          ]
        }
      ]
    });

    expect(parsed.pages[0]?.words[0]?.text).toBe("Invoice");
  });
});
