from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.config import settings
from backend.web3_client import Web3Client


def main() -> None:
    if not settings.deployer_private_key:
        raise SystemExit("DEPLOYER_PRIVATE_KEY is required in .env")
    client = Web3Client()
    result = client.deploy_contract(settings.deployer_private_key, "HealthcareEHR")
    print("Deployment successful")
    print(f"Contract address: {result['contract_address']}")
    print(f"Tx hash: {result['tx_hash']}")
    print("\nAdd this line to your .env:")
    print(f"HEALTHCARE_EHR_ADDRESS={result['contract_address']}")


if __name__ == "__main__":
    main()
