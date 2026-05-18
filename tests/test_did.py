from eth_account import Account

from backend.did import create_ethr_did


def test_create_ethr_did_sepolia():
    account = Account.create()
    did = create_ethr_did(account.address, "sepolia")
    assert did.startswith("did:ethr:sepolia:0x")
    assert account.address in did
