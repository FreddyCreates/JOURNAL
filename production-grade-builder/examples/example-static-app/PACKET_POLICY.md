# Packet Policy — example-static-app

**Kind:** static-app  
**Law:** production-grade-builder v1.0.0

## Requirements

1. README.md exists and describes purpose
2. manifest.json is valid with name, version, kind, created_at
3. release_manifest.json tracks release state
4. tools/quality_gate.py passes (exit 0)
5. reports/ directory contains at least one report

## Enforcement

Run `python3 tools/quality_gate.py` before any export or release.
