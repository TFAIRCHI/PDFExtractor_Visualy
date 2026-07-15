from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

CONTRACT_VERSION: Literal["0.1.0"] = "0.1.0"


class BBox(BaseModel):
    x: float
    y: float
    width: float = Field(ge=0)
    height: float = Field(ge=0)


class Provenance(BaseModel):
    engine: str
    engineVersion: str
    contractVersion: Literal["0.1.0"] = CONTRACT_VERSION


class WordObject(BaseModel):
    objectId: str
    pageIndex: int = Field(ge=0)
    text: str
    sourceBBox: BBox
    normalizedBBox: BBox
    confidence: float = Field(ge=0, le=1)
    sourceMethod: Literal["native_pdf"] = "native_pdf"
    provenance: Provenance


class PageModel(BaseModel):
    pageIndex: int = Field(ge=0)
    width: float = Field(gt=0)
    height: float = Field(gt=0)
    rotation: float
    words: list[WordObject]


class DocumentModel(BaseModel):
    contractVersion: Literal["0.1.0"] = CONTRACT_VERSION
    sourcePath: str
    pageCount: int = Field(ge=0)
    pages: list[PageModel]


class RpcRequest(BaseModel):
    jsonrpc: Literal["2.0"]
    id: str | int
    method: str
    params: dict[str, object] | None = None


class RpcError(BaseModel):
    code: int
    message: str
    data: object | None = None


class RpcResponse(BaseModel):
    jsonrpc: Literal["2.0"] = "2.0"
    id: str | int
    result: object | None = None
    error: RpcError | None = None
