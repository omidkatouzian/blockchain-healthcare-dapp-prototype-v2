from __future__ import annotations

import argparse
import base64
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


class CryptoError(ValueError):
    pass


def generate_key_base64() -> str:
    """Generate a base64 encoded 32-byte key suitable for AES-256-GCM."""
    return base64.b64encode(os.urandom(32)).decode("ascii")


def decode_key(key_base64: str) -> bytes:
    try:
        key = base64.b64decode(key_base64)
    except Exception as exc:  # pragma: no cover - defensive
        raise CryptoError("Invalid base64 encryption key") from exc
    if len(key) != 32:
        raise CryptoError("Encryption key must decode to exactly 32 bytes")
    return key


class EHRCrypto:
    """Authenticated encryption for EHR payloads.

    AES-GCM is used instead of AES-CBC because it provides confidentiality and
    integrity/authenticity of the encrypted payload.
    """

    def __init__(self, key_base64: str):
        self.key = decode_key(key_base64)
        self.aesgcm = AESGCM(self.key)

    def encrypt_json_text(self, plaintext: str) -> dict:
        nonce = os.urandom(12)
        ciphertext = self.aesgcm.encrypt(nonce, plaintext.encode("utf-8"), None)
        return {
            "version": "aes-256-gcm:v1",
            "nonce": base64.b64encode(nonce).decode("ascii"),
            "ciphertext": base64.b64encode(ciphertext).decode("ascii"),
        }

    def decrypt_json_text(self, payload: dict) -> str:
        if payload.get("version") != "aes-256-gcm:v1":
            raise CryptoError("Unsupported encrypted payload version")
        nonce = base64.b64decode(payload["nonce"])
        ciphertext = base64.b64decode(payload["ciphertext"])
        plaintext = self.aesgcm.decrypt(nonce, ciphertext, None)
        return plaintext.decode("utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=["generate-key"])
    args = parser.parse_args()
    if args.command == "generate-key":
        print(generate_key_base64())


if __name__ == "__main__":
    main()
