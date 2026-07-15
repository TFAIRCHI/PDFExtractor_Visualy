import { describe, expect, it } from "vitest";
import type { DocumentModel, WordObject } from "@pdf-intelligence/contracts";
import {
  findSameWordMatches,
  normalizeWordForDiscovery,
  summarizeMatchesByPage
} from "../renderer/src/patternDiscovery.js";

const baseWord = {
  sourceBBox: { x: 0, y: 0, width: 10, height: 10 },
  normalizedBBox: { x: 0, y: 0, width: 0.1, height: 0.1 },
  confidence: 0.8,
  sourceMethod: "native_pdf",
  provenance: {
    engine: "pypdf",
    engineVersion: "test",
    contractVersion: "0.1.0"
  }
} satisfies Omit<WordObject, "objectId" | "pageIndex" | "text">;

function word(objectId: string, pageIndex: number, text: string): WordObject {
  return { ...baseWord, objectId, pageIndex, text };
}

function document(words: WordObject[]): DocumentModel {
  const pages = new Map<number, WordObject[]>();
  for (const item of words) {
    pages.set(item.pageIndex, [...(pages.get(item.pageIndex) ?? []), item]);
  }
  return {
    contractVersion: "0.1.0",
    sourcePath: "test.pdf",
    pageCount: pages.size,
    pages: [...pages.entries()].map(([pageIndex, pageWords]) => ({
      pageIndex,
      width: 200,
      height: 200,
      rotation: 0,
      words: pageWords
    }))
  };
}

describe("pattern discovery", () => {
  it("normalizes case and surrounding punctuation without destroying internal punctuation", () => {
    expect(normalizeWordForDiscovery(" Invoice: ")).toBe("invoice");
    expect(normalizeWordForDiscovery("INV-001")).toBe("inv-001");
    expect(normalizeWordForDiscovery("$123.45")).toBe("123.45");
  });

  it("finds same-word matches across pages", () => {
    const selected = word("p0-w0", 0, "Invoice");
    const doc = document([
      selected,
      word("p0-w1", 0, "Total"),
      word("p1-w0", 1, "invoice:"),
      word("p2-w0", 2, "INVOICE")
    ]);

    const matches = findSameWordMatches(doc, selected);

    expect(matches.map((match) => match.objectId)).toEqual(["p0-w0", "p1-w0", "p2-w0"]);
    expect(summarizeMatchesByPage(matches)).toEqual([
      { pageIndex: 0, count: 1 },
      { pageIndex: 1, count: 1 },
      { pageIndex: 2, count: 1 }
    ]);
  });

  it("returns no matches when no selected word is available", () => {
    expect(findSameWordMatches(document([word("p0-w0", 0, "Invoice")]), null)).toEqual([]);
  });
});
