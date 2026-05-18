from __future__ import annotations

from datetime import datetime, timezone
from eth_account import Account
from eth_account.messages import encode_defunct
from web3 import Web3


def normalize_address(address: str) -> str:
    if not Web3.is_address(address):
        raise ValueError("Invalid Ethereum address")
    return Web3.to_checksum_address(address)


def create_ethr_did(address: str, network: str = "sepolia") -> str:
    """Create a did:ethr identifier.

    This project keeps DID handling lightweight and transparent. A production
    implementation should integrate a resolver and a governance model for
    professional credentials.
    """
    return f"did:ethr:{network}:{normalize_address(address)}"


def create_unsigned_vc(subject_did: str, role: str, issuer_did: str = "did:web:example-health-authority") -> dict:
    return {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        "type": ["VerifiableCredential", "HealthcareRoleCredential"],
        "issuer": issuer_did,
        "issuanceDate": datetime.now(timezone.utc).isoformat(),
        "credentialSubject": {"id": subject_did, "role": role},
        "note": "Educational unsigned VC placeholder. Do not treat as production credential.",
    }


def sign_login_challenge(private_key: str, challenge: str) -> dict:
    """Sign a simple challenge for demo authentication."""
    account = Account.from_key(private_key)
    message = encode_defunct(text=challenge)
    signed = Account.sign_message(message, private_key=private_key)
    return {"address": account.address, "signature": signed.signature.hex(), "challenge": challenge}
