from __future__ import annotations

import json
import sys
from typing import TextIO

from pydantic import ValidationError

from .models import RpcError, RpcRequest, RpcResponse
from .native_pdf import extract_diagnostics, extract_document, inspect_document


def handle_request(request: RpcRequest) -> RpcResponse:
    try:
        if request.method == "health.check":
            return RpcResponse(id=request.id, result={"ok": True, "service": "extraction"})
        if request.method == "document.inspect":
            params = request.params or {}
            return RpcResponse(id=request.id, result=inspect_document(str(params.get("pdfPath", ""))))
        if request.method == "document.extractNative":
            params = request.params or {}
            max_pages_raw = params.get("maxPages")
            max_pages = _parse_optional_int(max_pages_raw)
            document = extract_document(str(params.get("pdfPath", "")), max_pages=max_pages)
            return RpcResponse(id=request.id, result=document.model_dump())
        if request.method == "document.extractDiagnostics":
            params = request.params or {}
            max_pages_raw = params.get("maxPages")
            max_pages = _parse_optional_int(max_pages_raw)
            return RpcResponse(
                id=request.id,
                result=extract_diagnostics(str(params.get("pdfPath", "")), max_pages=max_pages),
            )
        return RpcResponse(id=request.id, error=RpcError(code=-32601, message="Method not found."))
    except Exception as exc:
        return RpcResponse(id=request.id, error=RpcError(code=-32000, message=type(exc).__name__, data=str(exc)))


def serve(input_stream: TextIO, output_stream: TextIO) -> None:
    for line in input_stream:
        if not line.strip():
            continue
        try:
            payload = json.loads(line)
            request = RpcRequest.model_validate(payload)
            response = handle_request(request)
        except (json.JSONDecodeError, ValidationError) as exc:
            response = RpcResponse(
                id="invalid",
                error=RpcError(code=-32700, message="Invalid request.", data=str(exc)),
            )
        output_stream.write(response.model_dump_json() + "\n")
        output_stream.flush()


def _parse_optional_int(value: object | None) -> int | None:
    if value is None:
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, str):
        return int(value)
    raise TypeError("Expected integer value.")


def main() -> None:
    serve(sys.stdin, sys.stdout)


if __name__ == "__main__":
    main()
