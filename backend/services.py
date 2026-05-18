from __future__ import annotations

import json
from typing import Any

from eth_account import Account

from .config import settings
from .crypto import EHRCrypto
from .did import create_ethr_did
from .ipfs_client import IPFSClient, sha256_hex_json
from .web3_client import Web3Client

ROLE_TO_CONTRACT = {
    "patient": 1,
    "doctor": 2,
    "nurse": 3,
    "pharmacy": 4,
    "research_center": 5,
}

CONTRACT_TO_ROLE = {v: k for k, v in ROLE_TO_CONTRACT.items()}


class HealthcareService:
    def __init__(self) -> None:
        self.web3 = Web3Client()
        self.ipfs = IPFSClient()
        self.contract = self.web3.contract()
        self.crypto = EHRCrypto(settings.ehr_encryption_key_base64) if settings.ehr_encryption_key_base64 else None

    @staticmethod
    def address_from_key(private_key: str) -> str:
        return Account.from_key(private_key).address

    def register_actor(self, *, private_key: str, role: str, name: str, metadata: dict[str, Any]) -> dict[str, Any]:
        actor_address = self.address_from_key(private_key)
        did = create_ethr_did(actor_address, settings.chain_name)
        profile = {"name": name, "role": role, "did": did, "metadata": metadata}
        profile_cid = self.ipfs.upload_json(profile)
        metadata_hash = "0x" + sha256_hex_json(profile)
        receipt = self.web3.transact(
            self.contract.functions.registerActor(ROLE_TO_CONTRACT[role], did, profile_cid, metadata_hash),
            private_key,
        )
        return {"address": actor_address, "did": did, "profile_cid": profile_cid, "tx": receipt}

    def verify_actor(self, *, private_key: str, actor_address: str, verified: bool) -> dict[str, Any]:
        receipt = self.web3.transact(
            self.contract.functions.setActorVerified(actor_address, verified),
            private_key,
        )
        return {"actor_address": actor_address, "verified": verified, "tx": receipt}

    def get_actor(self, actor_address: str) -> dict[str, Any]:
        raw = self.contract.functions.getActor(actor_address).call()
        return {
            "role": CONTRACT_TO_ROLE.get(raw[0], "unknown"),
            "did": raw[1],
            "profile_cid": raw[2],
            "metadata_hash": raw[3].hex(),
            "active": raw[4],
            "verified": raw[5],
            "created_at": raw[6],
        }

    def request_access(self, *, private_key: str, patient_address: str, purpose: str) -> dict[str, Any]:
        requester = self.address_from_key(private_key)
        receipt = self.web3.transact(
            self.contract.functions.requestAccess(patient_address, purpose),
            private_key,
        )
        return {"requester": requester, "patient_address": patient_address, "tx": receipt}

    def decide_access(
        self,
        *,
        private_key: str,
        request_id: int,
        grant: bool,
        duration_seconds: int,
        scopes: list[str],
    ) -> dict[str, Any]:
        if grant:
            scopes_hash = "0x" + sha256_hex_json({"scopes": scopes})
            fn = self.contract.functions.grantAccess(request_id, duration_seconds, scopes_hash)
        else:
            fn = self.contract.functions.rejectAccess(request_id)
        receipt = self.web3.transact(fn, private_key)
        return {"request_id": request_id, "grant": grant, "tx": receipt}

    def list_patient_requests(self, *, private_key: str, patient_address: str) -> list[dict[str, Any]]:
        ids = self.web3.call_as(self.contract.functions.getPatientRequestIds(patient_address), private_key)
        return [self._format_access_request(self.web3.call_as(self.contract.functions.getAccessRequest(i), private_key)) for i in ids]

    def add_record(
        self,
        *,
        private_key: str,
        patient_address: str,
        record_type: str,
        record_data: dict[str, Any],
        metadata: dict[str, Any],
    ) -> dict[str, Any]:
        if self.crypto is None:
            raise RuntimeError("EHR_ENCRYPTION_KEY_BASE64 is required for record encryption")
        creator = self.address_from_key(private_key)
        encrypted_payload = self.crypto.encrypt_json_text(json.dumps(record_data, ensure_ascii=False))
        payload = {"encrypted": encrypted_payload, "metadata": metadata}
        cid = self.ipfs.upload_json(payload)
        metadata_hash = "0x" + sha256_hex_json({"record_type": record_type, "metadata": metadata, "cid": cid})
        receipt = self.web3.transact(
            self.contract.functions.addMedicalRecord(patient_address, record_type, cid, metadata_hash),
            private_key,
        )
        return {"patient_address": patient_address, "created_by": creator, "encrypted_cid": cid, "tx": receipt}

    def list_patient_record_ids(self, *, private_key: str, patient_address: str) -> list[int]:
        return self.web3.call_as(self.contract.functions.getPatientRecordIds(patient_address), private_key)

    def read_record(self, *, private_key: str, record_id: int) -> dict[str, Any]:
        if self.crypto is None:
            raise RuntimeError("EHR_ENCRYPTION_KEY_BASE64 is required for record decryption")
        raw = self.web3.call_as(self.contract.functions.getMedicalRecord(record_id), private_key)
        record = self._format_record(raw)
        payload = self.ipfs.get_json(record["encrypted_cid"])
        decrypted = self.crypto.decrypt_json_text(payload["encrypted"])
        record["record_data"] = json.loads(decrypted)
        record["offchain_metadata"] = payload.get("metadata", {})
        return record

    @staticmethod
    def _format_access_request(raw) -> dict[str, Any]:
        return {
            "id": raw[0],
            "patient": raw[1],
            "requester": raw[2],
            "requester_role": CONTRACT_TO_ROLE.get(raw[3], "unknown"),
            "purpose": raw[4],
            "status": ["none", "pending", "granted", "rejected", "revoked"][raw[5]],
            "created_at": raw[6],
            "decided_at": raw[7],
        }

    @staticmethod
    def _format_record(raw) -> dict[str, Any]:
        return {
            "id": raw[0],
            "patient": raw[1],
            "created_by": raw[2],
            "creator_role": CONTRACT_TO_ROLE.get(raw[3], "unknown"),
            "record_type": raw[4],
            "encrypted_cid": raw[5],
            "metadata_hash": raw[6].hex(),
            "created_at": raw[7],
            "exists": raw[8],
        }
