from __future__ import annotations

import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")


class Settings:
    base_dir: Path = BASE_DIR
    artifacts_dir: Path = BASE_DIR / "artifacts"
    local_ipfs_dir: Path = BASE_DIR / "storage" / "local_ipfs"

    eth_rpc_url: str = os.getenv("ETH_RPC_URL", "http://127.0.0.1:8545")
    chain_id: int = int(os.getenv("CHAIN_ID", "31337"))
    chain_name: str = os.getenv("CHAIN_NAME", "anvil")
    deployer_private_key: str | None = os.getenv("DEPLOYER_PRIVATE_KEY") or None
    healthcare_ehr_address: str | None = os.getenv("HEALTHCARE_EHR_ADDRESS") or None

    ipfs_provider: str = os.getenv("IPFS_PROVIDER", "local").lower()
    pinata_jwt: str | None = os.getenv("PINATA_JWT") or None
    pinata_gateway: str = os.getenv("PINATA_GATEWAY", "https://gateway.pinata.cloud/ipfs")

    ehr_encryption_key_base64: str | None = os.getenv("EHR_ENCRYPTION_KEY_BASE64") or None

    app_host: str = os.getenv("APP_HOST", "127.0.0.1")
    app_port: int = int(os.getenv("APP_PORT", "8000"))


settings = Settings()
