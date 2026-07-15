# ADR 0004: Electron To Python IPC

## Status

Accepted.

## Decision

Use line-delimited JSON-RPC over stdio for the Python extraction sidecar.

## Rationale

Stdio avoids exposing a local network service, supports request ids, and is easy to package with a sidecar process.
