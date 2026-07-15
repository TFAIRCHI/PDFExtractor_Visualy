# End-to-End Object Trace

## Incorrect Highlighted Word Trace

Object: `p0-r6-w0` in `artifacts/diagnostics/current-page-extraction.json`.

1. Fixture PDF draws `Alpha  Beta` at PDF user-space point `(40, 160)`.
2. `pypdf` emits a `visitor_text` fragment with raw text `Alpha  Beta\n`.
3. The sidecar strips the fragment to `Alpha  Beta`.
4. `_runs_to_words` splits the fragment into `["Alpha", "Beta"]`.
5. `_runs_to_words` estimates character width as `font_size * 0.5`, or `6.0`.
6. `Alpha` width is estimated as `5 * 6.0 = 30.0`.
7. Source top-left y is calculated as `page_height - tm[5] - font_size`, or `220 - 160 - 12 = 48`.
8. The source box is normalized by dividing by page width and height.
9. Electron validates the returned object with `DocumentModelSchema`.
10. Renderer computes CSS box geometry with `normalizedBBox * pdf.js viewport dimensions`.
11. Renderer displays the result as a `button.word-box`.

The highlighted object is a semantic word produced by Python from a text fragment. It is not a native source-character object or actual glyph quad.

## Whitespace Or Empty Fragment Trace

Object: raw run `runIndex=0` in `artifacts/diagnostics/current-page-extraction.json`.

1. `pypdf` emits an empty text fragment with identity matrices and no font name.
2. Wave 0 diagnostics preserve the fragment as `rawText=""`, `isWhitespaceOnly=true`, `skippedBySemanticExtraction=true`.
3. The normal semantic extraction path strips the text to an empty string.
4. `_runs_to_words` receives the run but creates no semantic word because `parts=[]`.
5. No `word-box` is rendered for this fragment.

This trace proves that empty source fragments exist, but the current synthetic fixture does not prove that empty fragments become visible blue boxes.

## Coordinate Transform Trace

Detailed transform assumptions are captured in `artifacts/diagnostics/current-transform-trace.json`.

Current formula chain:

1. Extractor reads `tm[4]` and `tm[5]`.
2. Extractor converts bottom-left source y to top-left rectangle y with `page_height - tm[5] - font_size`.
3. Extractor normalizes by MediaBox width and height.
4. Renderer gets a `pdf.js` viewport at scale `1.25`.
5. Renderer multiplies normalized rectangle values by viewport width and height.
6. Canvas backing store is scaled by `devicePixelRatio`; overlay is CSS-sized.

The transform is not yet represented as a single typed service.
