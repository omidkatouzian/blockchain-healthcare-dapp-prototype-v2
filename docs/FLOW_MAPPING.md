# Flow Mapping

## Original thesis flows

| Original thesis flow | Legacy file | New implementation |
| --- | --- | --- |
| Patient profile creation | `docs/legacy_source/web/js/patient-create.js` | `POST /api/actors/register` with `role=patient` |
| Patient profile retrieval | `docs/legacy_source/web/js/patient-retrieve.js` | `GET /api/actors/{actor_address}` |
| Doctor profile creation | `docs/legacy_source/web/js/doctor-create.js` | `POST /api/actors/register` with `role=doctor` |
| Doctor profile retrieval | `docs/legacy_source/web/js/doctor-retrieve.js` | `GET /api/actors/{actor_address}` |
| Prescription creation | `docs/legacy_source/web/js/prescription-create.js` | `POST /api/records` with encrypted off-chain payload |
| Pharmacy retrieval | `docs/legacy_source/web/js/pharmacy-retrieve.js` | access request + patient grant + `POST /api/records/read` |
| Insurance/research retrieval | `docs/legacy_source/web/js/insurance-retrieve.js` | research center role + access request + patient grant |

## New patient-controlled EHR flow

1. Actor registers a DID-style identity and off-chain profile CID.
2. Non-patient actor is verified by contract owner.
3. Non-patient actor requests access to patient EHR.
4. Patient approves or rejects the request.
5. Authorized actor adds or reads encrypted medical records.
6. Contract stores only CID/hash and enforces access checks.
