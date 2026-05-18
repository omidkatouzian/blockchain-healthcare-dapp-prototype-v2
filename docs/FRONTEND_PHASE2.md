# Phase 2 Frontend Guide

Phase 2 adds a browser-based demo interface on top of the FastAPI backend created in Phase 1.

## Pages

| Page | URL | Purpose |
| --- | --- | --- |
| Home | `/` | Project overview and navigation |
| Register | `/register` | Register patient, doctor, nurse, pharmacy, or research center |
| Patient Dashboard | `/patient` | Patient access-request review, grant/reject flow, EHR record creation, record listing, record reading |
| Care Provider Dashboard | `/staff` | Doctor/nurse/pharmacy/research access request, approved record listing, approved record reading |
| Admin Dashboard | `/admin` | Contract-owner verification and actor lookup |
| API Docs | `/docs` | FastAPI Swagger UI |

## Demo flow through the UI

1. Start Anvil or configure Sepolia.
2. Compile and deploy the contract.
3. Run FastAPI with `uvicorn backend.app:app --reload`.
4. Open `http://127.0.0.1:8000/register`.
5. Register a patient with a demo private key.
6. Register a doctor, nurse, pharmacy, or research center with another demo private key.
7. Open `/admin` and verify the professional actor using the deployer private key.
8. Open `/staff`; the verified professional requests access to the patient address.
9. Open `/patient`; the patient loads requests and grants or rejects access.
10. The patient can add encrypted medical records.
11. The approved professional can list and read the approved records from `/staff`.

## Important security note

The Phase 2 frontend still follows the Phase 1 academic/demo backend signing model: private keys are entered into the page and sent to the local FastAPI backend so `web3.py` can sign transactions.

This is acceptable only for local demo wallets or disposable Sepolia wallets. A real dApp should replace this with browser-side wallet signing through MetaMask, WalletConnect, or another wallet connector. That change is the recommended Phase 3.

## Files added or updated

- `frontend/templates/base.html`
- `frontend/templates/index.html`
- `frontend/templates/register.html`
- `frontend/templates/patient_dashboard.html`
- `frontend/templates/staff_dashboard.html`
- `frontend/templates/admin_dashboard.html`
- `frontend/static/css/style.css`
- `frontend/static/js/main.js`
- `backend/app.py`

## What this frontend does not yet implement

- It does not use MetaMask or WalletConnect.
- It does not keep a persistent browser session.
- It does not manage per-patient encryption keys.
- It does not provide production-level DID credential verification.
- It does not include Solidity event indexing or a database-backed notification center.
