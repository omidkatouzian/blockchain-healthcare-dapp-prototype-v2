import json

from backend.crypto import EHRCrypto, generate_key_base64


def test_encrypt_decrypt_roundtrip():
    crypto = EHRCrypto(generate_key_base64())
    payload = {"diagnosis": "demo", "drug": "A"}
    encrypted = crypto.encrypt_json_text(json.dumps(payload))
    assert encrypted["version"] == "aes-256-gcm:v1"
    assert "nonce" in encrypted
    assert "ciphertext" in encrypted
    decrypted = crypto.decrypt_json_text(encrypted)
    assert json.loads(decrypted) == payload
