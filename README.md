# Healthcare EHR dApp — Python, Web3.py, FastAPI, Solidity

A GitHub-ready educational decentralized application for a **patient-controlled Electronic Health Record (EHR)** workflow on Ethereum-compatible networks.

This project converts and modernizes an older thesis-style Web3.js/Solidity implementation into a cleaner Python-based dApp using:

- Python 3.11+
- FastAPI
- `web3.py`
- Solidity `0.8.24`
- Local Anvil or Ethereum Sepolia
- AES-256-GCM encryption for off-chain EHR payloads
- Local IPFS-like storage for development or Pinata/IPFS for public demos
- DID-style Ethereum identifiers
- Patient-controlled access requests
- A simple browser frontend for demo workflows

> **Academic/demo warning:** this project is for learning, thesis demonstration, and GitHub portfolio purposes. Do **not** use it with real patient data, real private keys, or production healthcare records.

---

## Repository status

Current version: **GitHub-ready demo release**

Implemented:

- Smart contract for actors, permissions, access requests, and EHR record references
- Patient, doctor, nurse, pharmacy, and research center roles
- Professional actor verification by contract owner
- Patient-controlled grant/reject/revoke access model
- Encrypted off-chain medical record payloads
- Local content-addressed storage and optional Pinata integration
- FastAPI backend with Swagger/OpenAPI docs
- Browser frontend pages for registration, patient dashboard, staff dashboard, and admin verification
- Tests for crypto, DID helpers, contract source expectations, and frontend source expectations
- GitHub documentation and project structure page

Not implemented as production features:

- MetaMask/browser wallet signing
- Full DID resolver integration
- Verifiable Credential signing/verification
- Per-user encryption key management
- Production authentication, sessions, RBAC, audit persistence, or database layer
- Healthcare compliance controls such as HIPAA/GDPR production requirements

---

## Core idea

The dApp separates medical data from blockchain metadata:

1. The medical record is encrypted in the backend with AES-256-GCM.
2. The encrypted payload is stored off-chain.
3. Only the content reference/CID and metadata hash are stored on Ethereum.
4. Access to record references is controlled by the smart contract.
5. The patient decides whether professional actors may access their EHR records.

This keeps the blockchain flow close to the thesis concept while avoiding plaintext medical data on-chain.

---

## Actors and permissions

Supported roles:

| Role | Registration | Verification | Main permissions |
| --- | --- | --- | --- |
| Patient | Self-registration | Self-verified | Approve/reject access, add/read own records |
| Doctor | Self-registration | Owner verification required | Request access, add/read records after permission |
| Nurse | Self-registration | Owner verification required | Request access, add/read records after permission |
| Pharmacy | Self-registration | Owner verification required | Request access, read records after permission |
| Research Center | Self-registration | Owner verification required | Request access, read records after permission |

---

## Project structure

```text
healthcare-ehr-dapp-python/
├── contracts/
│   └── HealthcareEHR.sol
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── crypto.py
│   ├── did.py
│   ├── ipfs_client.py
│   ├── schemas.py
│   ├── services.py
│   └── web3_client.py
├── frontend/
│   ├── templates/
│   │   ├── base.html
│   │   ├── index.html
│   │   ├── register.html
│   │   ├── patient_dashboard.html
│   │   ├── staff_dashboard.html
│   │   └── admin_dashboard.html
│   └── static/
│       ├── css/style.css
│       └── js/main.js
├── scripts/
│   ├── compile_contracts.py
│   ├── deploy.py
│   ├── make_demo_keys.py
│   └── demo_requests.http
├── tests/
│   ├── test_contract_source.py
│   ├── test_crypto.py
│   ├── test_did.py
│   └── test_frontend_source.py
├── docs/
│   ├── FLOW_MAPPING.md
│   ├── FRONTEND_PHASE2.md
│   ├── SECURITY_NOTES.md
│   └── legacy_source/
├── artifacts/
├── storage/local_ipfs/
├── PROJECT_STRUCTURE.md
├── requirements.txt
├── pytest.ini
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

For a Persian explanation of this structure, see [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md).

---

## Quick start with local Anvil

### 1. Create a Python environment

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

On Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

### 2. Start a local Ethereum chain

Install Foundry/Anvil, then run:

```bash
anvil
```

Anvil prints funded demo private keys. Put one of them in `.env` as:

```env
DEPLOYER_PRIVATE_KEY=your_anvil_private_key
```

### 3. Generate the EHR encryption key

```bash
python -m backend.crypto generate-key
```

Copy the generated key into `.env`:

```env
EHR_ENCRYPTION_KEY_BASE64=your_generated_key
```

### 4. Compile the smart contract

```bash
python scripts/compile_contracts.py
```

This creates:

```text
artifacts/HealthcareEHR.json
```

### 5. Deploy the contract

```bash
python scripts/deploy.py
```

Copy the printed contract address into `.env`:

```env
HEALTHCARE_EHR_ADDRESS=0x...
```

### 6. Run the app

```bash
uvicorn backend.app:app --reload
```

Open:

```text
http://127.0.0.1:8000
```

Main pages:

```text
/register
/patient
/staff
/admin
/docs
```

---

## Sepolia configuration

For Sepolia, update `.env`:

```env
ETH_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
CHAIN_ID=11155111
CHAIN_NAME=sepolia
DEPLOYER_PRIVATE_KEY=your_sepolia_test_wallet_private_key
IPFS_PROVIDER=pinata
PINATA_JWT=your_pinata_jwt
PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs
```

Then run:

```bash
python scripts/compile_contracts.py
python scripts/deploy.py
uvicorn backend.app:app --reload
```

You need Sepolia test ETH for deployment and transactions.

---

## Demo UI flow

1. Open `/register`.
2. Register a patient using a demo private key.
3. Register a doctor, nurse, pharmacy, or research center using another demo private key.
4. Open `/admin` and verify the professional actor using the deployer/owner private key.
5. Open `/staff` and request access to the patient address.
6. Open `/patient` and approve or reject the request.
7. Add an encrypted medical record from the patient dashboard.
8. Read approved records from the patient or staff dashboard.

---

## API endpoints

FastAPI automatically exposes API documentation at:

```text
http://127.0.0.1:8000/docs
```

Main API groups:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/utils/address-from-key` | Derive wallet address from a demo private key |
| `POST /api/actors/register` | Register patient/staff/research actor |
| `POST /api/actors/verify` | Verify/unverify professional actor by owner |
| `GET /api/actors/{actor_address}` | Read actor profile metadata |
| `POST /api/access/request` | Request patient EHR access |
| `POST /api/access/decide` | Patient grants or rejects access |
| `POST /api/access/requests` | List patient access requests |
| `POST /api/records` | Add encrypted medical record reference |
| `POST /api/records/list` | List visible patient record IDs |
| `POST /api/records/read` | Read/decrypt an authorized record |

---

## Tests

Install dependencies first:

```bash
pip install -r requirements.txt
pytest
```

In the build environment used to prepare this release, the following local tests were run successfully:

```bash
pytest -q tests/test_crypto.py tests/test_contract_source.py tests/test_frontend_source.py
```

Result:

```text
8 passed
```

`tests/test_did.py` requires `eth-account`, which is installed when `requirements.txt` is installed in a normal project environment.

---

## Security notes

This repository intentionally keeps the demo simple. Important limitations:

- The browser demo sends private keys to the backend for Python/web3.py signing.
- That is acceptable only for local demos and thesis presentation, not production.
- Real dApps should use MetaMask, WalletConnect, or another browser-side wallet signer.
- The AES key is global in this demo.
- Real EHR systems need per-user/per-record key management and proper key exchange.
- IPFS and public testnets are public by design. Never upload real health records.

See [`docs/SECURITY_NOTES.md`](docs/SECURITY_NOTES.md) for more details.

---

## Suggested next improvements

Good next GitHub issues or roadmap items:

- Add MetaMask signing and remove private-key submission from frontend forms.
- Add a database for local user/session state.
- Add real DID resolver support.
- Add Verifiable Credential issuance and verification.
- Add record-level scopes and separate read/write permissions.
- Add event indexing and audit dashboard.
- Add Docker Compose for local Anvil + backend.

---

## License

MIT License. See [`LICENSE`](LICENSE).
