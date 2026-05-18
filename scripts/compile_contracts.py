from __future__ import annotations

import json
from pathlib import Path

from solcx import compile_standard, install_solc

ROOT = Path(__file__).resolve().parents[1]
CONTRACTS_DIR = ROOT / "contracts"
ARTIFACTS_DIR = ROOT / "artifacts"
SOLC_VERSION = "0.8.24"


def main() -> None:
    install_solc(SOLC_VERSION)
    sources = {
        path.name: {"content": path.read_text(encoding="utf-8")}
        for path in CONTRACTS_DIR.glob("*.sol")
    }
    compiled = compile_standard(
        {
            "language": "Solidity",
            "sources": sources,
            "settings": {
                "optimizer": {"enabled": True, "runs": 200},
                "outputSelection": {"*": {"*": ["abi", "evm.bytecode.object"]}},
            },
        },
        solc_version=SOLC_VERSION,
    )

    ARTIFACTS_DIR.mkdir(exist_ok=True)
    for source_name, contracts in compiled["contracts"].items():
        for contract_name, contract_data in contracts.items():
            artifact = {
                "contractName": contract_name,
                "sourceName": source_name,
                "abi": contract_data["abi"],
                "bytecode": "0x" + contract_data["evm"]["bytecode"]["object"],
            }
            output = ARTIFACTS_DIR / f"{contract_name}.json"
            output.write_text(json.dumps(artifact, indent=2), encoding="utf-8")
            print(f"Wrote {output.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
