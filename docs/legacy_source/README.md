# Omid Katouzian — Thesis Code Archive

This repository collects the core code artifacts reconstructed from the M.Sc. thesis:

**Securing Internet of Things Communications by Blockchain Technology**

The thesis proposed a blockchain-based healthcare/IoT security architecture and implemented a **patient-centric EHR workflow** with:

- Ethereum smart contracts
- Web3.js-based web pages
- contract-per-entity deployment for patients and doctors
- prescription submission and retrieval flows for pharmacy and insurance use cases

> Note: The thesis text uses contract-per-entity deployment and address-based lookups. It does **not** implement a full role-based access-control layer with `require(...)` modifiers, `onlyDoctor`, or `onlyPatient` guards in the shown snippets. The code in this archive preserves the thesis logic and is organized for GitHub readability.

---

## Repository Structure

```text
contracts/
  Patient100.sol
  Doctor100.sol

web/js/
  patient-create.js
  patient-retrieve.js
  doctor-create.js
  doctor-retrieve.js
  prescription-create.js
  pharmacy-retrieve.js
  insurance-retrieve.js
```

---

## Thesis-to-Code Mapping

### 1) Patient profile contract

**Patient100.sol**

- Stores patient profile data
- Stores a patient medical record trail
- Supports:
  - `SetPatient(...)`
  - `GetPatient(address)`
  - `AddPrescription(...)`
  - `GetTrailCount()`
  - `GetPrescription(uint8)`

### 2) Doctor profile contract

**Doctor100.sol**

- Stores doctor profile data
- Supports:
  - `SetDoctor(...)`
  - `GetDoctor(address)`

### 3) Web3.js front-end flows

The thesis shows separate web pages for:

- patient registration
- patient retrieval
- doctor registration
- doctor retrieval
- prescription submission
- pharmacy retrieval
- insurance retrieval

The JavaScript files in `web/js/` mirror those flows and keep the original form-field naming style shown in the thesis excerpts.

---

## Unified Transaction Flow Model

A central idea in the thesis is a **patient record flow** that can be summarized as:

1. **Transaction creation and signing**
2. **Propagation**
3. **Pre-consensus validation**
4. **Consensus and ordering**
5. **Execution and state transition**
6. **Finalization**

This archive applies that idea to the healthcare workflow as follows:

### Patient onboarding

- An admin/deployer account compiles and deploys a dedicated `Patient100` contract.
- The patient profile is stored with `SetPatient(...)`.
- The resulting contract address becomes the patient's unique on-chain identifier.

### Patient profile retrieval

- A caller provides the patient contract address.
- The DApp validates the address format.
- The DApp calls `GetPatient(address)` and renders the returned profile data.

### Doctor onboarding

- A dedicated `Doctor100` contract is deployed for each doctor.
- The doctor profile is stored with `SetDoctor(...)`.

### Doctor profile retrieval

- The DApp validates the doctor address.
- The DApp calls `GetDoctor(address)` and renders the returned doctor profile.

### Prescription submission

- A doctor submits a prescription to the patient contract.
- The thesis flow checks pregnancy-related medication constraints before sending the transaction.
- The prescription is stored in the patient contract's medical trail.

### Pharmacy retrieval

- The pharmacy reads the patient's trail count.
- The pharmacy retrieves the selected prescription and displays the drug details.

### Insurance retrieval

- Insurance/research users can iterate through the stored medical trail.
- This supports auditing, claims validation, and research analysis.

---

## Important Design Notes

### Contract-per-entity model

The thesis uses a **separate contract for each patient and each doctor**. That model simplifies ownership boundaries and makes the on-chain address act as the lookup key.

### EHR / medical record storage

The patient contract stores:

- patient profile metadata
- medical record / prescription trail entries

### Access control note

The thesis emphasizes decentralized access control at the architecture level, but the extracted Solidity snippets do not enforce a full RBAC system with explicit role modifiers. The web pages and contract-per-entity design provide isolation, while the actual access-policy logic remains light in the shown code.

---

## How to Use These Files

### Solidity

The contracts use the older `pragma solidity ^0.4.20;` syntax from the thesis era.

To test them:

1. Install a compatible local blockchain environment such as Ganache.
2. Compile the contracts using a compatible Truffle/Remix setup.
3. Replace the placeholder bytecode in the web scripts with the compiled bytecode.
4. Load the ABI objects in `patientABI.js` and `doctorABI.js`.

### Web scripts

The JavaScript files assume:

- `web3.min.js`
- jQuery
- `patientABI.js`
- `doctorABI.js`

The scripts use the same form-field IDs referenced in the thesis text. If your HTML differs, update the selectors accordingly.

---

## File-by-File Explanation

### `contracts/Patient100.sol`

Contains:

- `medical_records` structure
- `Trail` mapping
- `AddPrescription(...)`
- `GetTrailCount()`
- `GetPrescription(...)`
- `profile` structure for patient metadata
- `SetPatient(...)`
- `GetPatient(address)`

### `contracts/Doctor100.sol`

Contains:

- `profile` structure for doctor metadata
- `doctorID` mapping
- `SetDoctor(...)`
- `GetDoctor(address)`

### `web/js/patient-create.js`

Deploys a patient contract and stores the patient profile.

### `web/js/patient-retrieve.js`

Retrieves patient profile data using the patient contract address.

### `web/js/doctor-create.js`

Deploys a doctor contract and stores the doctor profile.

### `web/js/doctor-retrieve.js`

Retrieves doctor profile data using the doctor contract address.

### `web/js/prescription-create.js`

Submits a prescription to a patient contract and checks pregnancy-related drug restrictions before sending the transaction.

### `web/js/pharmacy-retrieve.js`

Reads the patient's prescription trail and displays a selected prescription.

### `web/js/insurance-retrieve.js`

Iterates over the full prescription trail for auditing or insurance review.

---

## Suggested GitHub Caption

If this archive is published on GitHub, a concise description could be:

> Thesis-derived blockchain healthcare prototype demonstrating decentralized patient/doctor records, smart-contract-based prescription logging, and Web3.js-powered front-end flows for patient, pharmacy, and insurance interactions.

---

## Disclaimer

This archive is a reconstruction of the thesis code excerpts for GitHub presentation and research documentation. It is intended for educational and portfolio use and may need minor adjustments before deployment in a modern toolchain.
