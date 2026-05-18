# Security Notes

This repository is designed for academic demonstration and GitHub presentation, not production healthcare deployment.

## What is improved

- No plaintext medical records are stored on Ethereum.
- EHR payloads are encrypted using AES-256-GCM.
- Smart contract access checks are enforced before CIDs can be read.
- Non-patient actors require owner verification before requesting access.
- Access is patient-approved, time-limited, and revocable.
- DID-style identifiers use the `did:ethr:<network>:<address>` format.

## Important limitations

### Private keys in API requests

The demo API accepts private keys in request bodies so the Python backend can sign transactions. This is only acceptable for local testing or controlled academic demonstrations.

Production alternatives:

- browser wallet signing
- WalletConnect
- hardware wallets
- custodial key management with strict controls
- transaction relayers with delegated authorization

### Single encryption key

The demo uses one backend encryption key. A real EHR system should use per-patient or per-record envelope encryption, key rotation, and patient-controlled key sharing.

### IPFS privacy

Even encrypted payloads can leak metadata through filenames, CIDs, timing, and access patterns. Real systems should use private IPFS, access-controlled storage, or encrypted object storage with strict audit controls.

### DID and credential verification

The current DID utilities create DID-compatible identifiers and unsigned credential examples. A real deployment needs a resolver, credential issuer governance, revocation, and professional license validation.

### Public testnet warning

Sepolia is public. Do not publish real medical metadata or real personal data to it.
