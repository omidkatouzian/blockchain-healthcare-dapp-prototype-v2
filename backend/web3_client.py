from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from eth_account import Account
from web3 import Web3
from web3.contract.contract import Contract

from .config import settings


class Web3ClientError(RuntimeError):
    pass


class Web3Client:
    def __init__(self, rpc_url: str | None = None) -> None:
        self.w3 = Web3(Web3.HTTPProvider(rpc_url or settings.eth_rpc_url))
        if not self.w3.is_connected():
            raise Web3ClientError(f"Cannot connect to Ethereum RPC: {rpc_url or settings.eth_rpc_url}")

    def account_from_private_key(self, private_key: str):
        if not private_key:
            raise Web3ClientError("Private key is required for this transaction")
        return Account.from_key(private_key)

    def load_artifact(self, contract_name: str = "HealthcareEHR") -> dict[str, Any]:
        artifact_path = settings.artifacts_dir / f"{contract_name}.json"
        if not artifact_path.exists():
            raise Web3ClientError(f"Contract artifact not found: {artifact_path}. Run scripts/compile_contracts.py first.")
        return json.loads(artifact_path.read_text(encoding="utf-8"))

    def contract(self, address: str | None = None, contract_name: str = "HealthcareEHR") -> Contract:
        contract_address = address or settings.healthcare_ehr_address
        if not contract_address:
            raise Web3ClientError("HEALTHCARE_EHR_ADDRESS is not configured")
        artifact = self.load_artifact(contract_name)
        return self.w3.eth.contract(
            address=self.w3.to_checksum_address(contract_address),
            abi=artifact["abi"],
        )

    def deploy_contract(self, private_key: str, contract_name: str = "HealthcareEHR") -> dict[str, Any]:
        account = self.account_from_private_key(private_key)
        artifact = self.load_artifact(contract_name)
        contract = self.w3.eth.contract(abi=artifact["abi"], bytecode=artifact["bytecode"])
        tx = contract.constructor().build_transaction(self._tx_params(account.address))
        return self._sign_send_wait(tx, private_key)

    def transact(self, function_call, private_key: str) -> dict[str, Any]:
        account = self.account_from_private_key(private_key)
        tx = function_call.build_transaction(self._tx_params(account.address))
        return self._sign_send_wait(tx, private_key)

    def call_as(self, function_call, private_key: str):
        account = self.account_from_private_key(private_key)
        return function_call.call({"from": account.address})

    def _tx_params(self, from_address: str) -> dict[str, Any]:
        params = {
            "from": self.w3.to_checksum_address(from_address),
            "nonce": self.w3.eth.get_transaction_count(from_address),
            "chainId": settings.chain_id,
        }
        # gasPrice keeps local Anvil and Sepolia demos simple and broadly compatible.
        params["gasPrice"] = self.w3.eth.gas_price
        return params

    def _sign_send_wait(self, tx: dict[str, Any], private_key: str) -> dict[str, Any]:
        if "gas" not in tx:
            try:
                tx["gas"] = int(self.w3.eth.estimate_gas(tx) * 1.25)
            except Exception:
                tx["gas"] = 3_000_000
        signed = Account.sign_transaction(tx, private_key=private_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=180)
        result = {
            "tx_hash": self.w3.to_hex(tx_hash),
            "status": int(receipt.status),
            "block_number": int(receipt.blockNumber),
            "gas_used": int(receipt.gasUsed),
        }
        if getattr(receipt, "contractAddress", None):
            result["contract_address"] = receipt.contractAddress
        if receipt.status != 1:
            raise Web3ClientError(f"Transaction reverted: {result}")
        return result
