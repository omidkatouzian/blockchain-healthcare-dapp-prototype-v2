from __future__ import annotations

from typing import Any, Literal
from pydantic import BaseModel, Field

RoleName = Literal["patient", "doctor", "nurse", "pharmacy", "research_center"]


class TxSigner(BaseModel):
    private_key: str = Field(..., description="Demo signer private key. Do not expose in production.")


class RegisterActorRequest(TxSigner):
    role: RoleName
    name: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class VerifyActorRequest(TxSigner):
    actor_address: str
    verified: bool = True


class AccessRequestCreate(TxSigner):
    patient_address: str
    purpose: str


class AccessDecisionRequest(TxSigner):
    request_id: int
    grant: bool
    duration_seconds: int = 7 * 24 * 60 * 60
    scopes: list[str] = Field(default_factory=lambda: ["read:ehr"])


class AddRecordRequest(TxSigner):
    patient_address: str
    record_type: str = "medical-note"
    record_data: dict[str, Any]
    metadata: dict[str, Any] = Field(default_factory=dict)


class ReadRecordRequest(TxSigner):
    record_id: int


class PatientRecordsRequest(TxSigner):
    patient_address: str
