# Threat Model

## Assets

- User PDFs and extracted text.
- Saved projects and templates.
- Local filesystem access.

## Risks

- Malformed PDF parser crashes.
- Path traversal or unsupported file access.
- Renderer-to-main privilege escalation.
- Accidental logging of private document content.
- Unauthenticated local service exposure.

## Current Controls

- No renderer Node access.
- Narrow preload bridge.
- Main-process path validation.
- Sidecar stdio instead of HTTP.
- Structured errors without document text in logs by default.
- Main-process structured logging redacts fields that are likely to contain document text or content.

## Open Controls

- PDF parser process sandboxing.
- Dependency vulnerability scanning.
- Fuzzing for geometry and parser inputs.
- Secure temporary file lifecycle.
