import type { DocumentModel, WordObject } from "@pdf-intelligence/contracts";

export type PageMatchSummary = {
  pageIndex: number;
  count: number;
};

export function normalizeWordForDiscovery(text: string): string {
  return text
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

export function findSameWordMatches(
  documentModel: DocumentModel | null,
  selectedWord: WordObject | null
): WordObject[] {
  if (!documentModel || !selectedWord) {
    return [];
  }
  const needle = normalizeWordForDiscovery(selectedWord.text);
  if (!needle) {
    return [];
  }
  return documentModel.pages.flatMap((page) =>
    page.words.filter((word) => normalizeWordForDiscovery(word.text) === needle)
  );
}

export function summarizeMatchesByPage(matches: WordObject[]): PageMatchSummary[] {
  const counts = new Map<number, number>();
  for (const match of matches) {
    counts.set(match.pageIndex, (counts.get(match.pageIndex) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([leftPage], [rightPage]) => leftPage - rightPage)
    .map(([pageIndex, count]) => ({ pageIndex, count }));
}
