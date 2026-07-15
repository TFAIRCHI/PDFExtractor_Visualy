from extraction_service.models import RpcRequest
from extraction_service.rpc import handle_request


def test_health_check() -> None:
    response = handle_request(RpcRequest(jsonrpc="2.0", id=1, method="health.check"))

    assert response.error is None
    assert response.result == {"ok": True, "service": "extraction"}


def test_diagnostics_method_requires_pdf_path() -> None:
    response = handle_request(
        RpcRequest(jsonrpc="2.0", id=1, method="document.extractDiagnostics", params={"pdfPath": ""})
    )

    assert response.error is not None
    assert response.error.message in {"ValueError", "FileNotFoundError"}
