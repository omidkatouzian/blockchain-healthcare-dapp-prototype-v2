from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = (ROOT / "contracts" / "HealthcareEHR.sol").read_text(encoding="utf-8")


def test_contract_uses_modern_solidity():
    assert "pragma solidity ^0.8.24" in SOURCE


def test_contract_has_patient_approved_access_flow():
    assert "requestAccess" in SOURCE
    assert "grantAccess" in SOURCE
    assert "rejectAccess" in SOURCE
    assert "revokeAccess" in SOURCE


def test_contract_does_not_store_plain_medical_fields_from_legacy_code():
    forbidden = ["drug1", "drug2", "drug3", "pregnant"]
    for token in forbidden:
        assert token not in SOURCE


def test_contract_has_on_chain_permission_check_for_records():
    assert "hasActiveAccess" in SOURCE
    assert "getMedicalRecord" in SOURCE
    assert "no active permission" in SOURCE
