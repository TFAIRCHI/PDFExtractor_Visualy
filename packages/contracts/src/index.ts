import { z } from "zod";

export const CONTRACT_VERSION = "0.1.0";

export const BBoxSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().nonnegative(),
  height: z.number().nonnegative()
});

export type BBox = z.infer<typeof BBoxSchema>;

export const WordObjectSchema = z.object({
  objectId: z.string(),
  pageIndex: z.number().int().nonnegative(),
  text: z.string(),
  sourceBBox: BBoxSchema,
  normalizedBBox: BBoxSchema,
  confidence: z.number().min(0).max(1),
  sourceMethod: z.literal("native_pdf"),
  provenance: z.object({
    engine: z.string(),
    engineVersion: z.string(),
    contractVersion: z.literal(CONTRACT_VERSION)
  })
});

export type WordObject = z.infer<typeof WordObjectSchema>;

export const PageModelSchema = z.object({
  pageIndex: z.number().int().nonnegative(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number(),
  words: z.array(WordObjectSchema)
});

export type PageModel = z.infer<typeof PageModelSchema>;

export const DocumentModelSchema = z.object({
  contractVersion: z.literal(CONTRACT_VERSION),
  sourcePath: z.string(),
  pageCount: z.number().int().nonnegative(),
  pages: z.array(PageModelSchema)
});

export type DocumentModel = z.infer<typeof DocumentModelSchema>;

export const ProjectSchema = z.object({
  schemaVersion: z.literal(CONTRACT_VERSION),
  sourcePath: z.string(),
  document: DocumentModelSchema,
  savedAt: z.string()
});

export type ProjectModel = z.infer<typeof ProjectSchema>;

export const RpcRequestSchema = z.object({
  jsonrpc: z.literal("2.0"),
  id: z.union([z.string(), z.number()]),
  method: z.string(),
  params: z.unknown().optional()
});

export const RpcErrorSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.unknown().optional()
});

export const RpcResponseSchema = z.object({
  jsonrpc: z.literal("2.0"),
  id: z.union([z.string(), z.number()]),
  result: z.unknown().optional(),
  error: RpcErrorSchema.nullable().optional()
});

export type RpcRequest = z.infer<typeof RpcRequestSchema>;
export type RpcResponse = z.infer<typeof RpcResponseSchema>;
