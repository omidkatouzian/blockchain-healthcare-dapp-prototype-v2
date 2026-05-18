from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

import requests

from .config import settings


class IPFSError(RuntimeError):
    pass


class IPFSClient:
    """Pinata IPFS client with an offline local provider for development.

    The local provider is intentionally content-addressed but is not real IPFS.
    It lets the project run without external accounts while preserving the same
    CID-like workflow. Use IPFS_PROVIDER=pinata for Sepolia demos.
    """

    def __init__(self) -> None:
        self.provider = settings.ipfs_provider
        settings.local_ipfs_dir.mkdir(parents=True, exist_ok=True)

    def upload_json(self, data: dict[str, Any]) -> str:
        if self.provider == "local":
            return self._upload_json_local(data)
        if self.provider == "pinata":
            return self._upload_json_pinata(data)
        raise IPFSError(f"Unsupported IPFS_PROVIDER: {self.provider}")

    def get_json(self, cid: str) -> dict[str, Any]:
        if self.provider == "local":
            return self._get_json_local(cid)
        if self.provider == "pinata":
            return self._get_json_pinata(cid)
        raise IPFSError(f"Unsupported IPFS_PROVIDER: {self.provider}")

    def _upload_json_local(self, data: dict[str, Any]) -> str:
        raw = json.dumps(data, sort_keys=True, ensure_ascii=False).encode("utf-8")
        digest = hashlib.sha256(raw).hexdigest()
        cid = f"local-{digest}"
        path = settings.local_ipfs_dir / f"{cid}.json"
        path.write_bytes(raw)
        return cid

    def _get_json_local(self, cid: str) -> dict[str, Any]:
        path = settings.local_ipfs_dir / f"{cid}.json"
        if not path.exists():
            raise IPFSError(f"Local CID not found: {cid}")
        return json.loads(path.read_text(encoding="utf-8"))

    def _upload_json_pinata(self, data: dict[str, Any]) -> str:
        if not settings.pinata_jwt:
            raise IPFSError("PINATA_JWT is required for IPFS_PROVIDER=pinata")
        response = requests.post(
            "https://api.pinata.cloud/pinning/pinJSONToIPFS",
            headers={"Authorization": f"Bearer {settings.pinata_jwt}", "Content-Type": "application/json"},
            json=data,
            timeout=30,
        )
        if response.status_code >= 400:
            raise IPFSError(f"Pinata upload failed: {response.status_code} {response.text[:300]}")
        return response.json()["IpfsHash"]

    def _get_json_pinata(self, cid: str) -> dict[str, Any]:
        response = requests.get(f"{settings.pinata_gateway.rstrip('/')}/{cid}", timeout=30)
        if response.status_code >= 400:
            raise IPFSError(f"Pinata gateway fetch failed: {response.status_code} {response.text[:300]}")
        return response.json()


def sha256_hex_json(data: dict[str, Any]) -> str:
    raw = json.dumps(data, sort_keys=True, ensure_ascii=False).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def bytes32_from_hex(hex_digest: str) -> bytes:
    clean = hex_digest.removeprefix("0x")
    if len(clean) != 64:
        raise ValueError("Expected 32-byte hex digest")
    return bytes.fromhex(clean)
