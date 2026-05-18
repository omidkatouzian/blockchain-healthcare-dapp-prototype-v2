# ABI / Bytecode Placeholders

The thesis excerpt includes the logic and the web3.js calls, but not the complete compiled ABI artifacts.

When you build the project locally:

1. Compile `contracts/Patient100.sol` and `contracts/Doctor100.sol`
2. Export the ABI into `patientABI.js` and `doctorABI.js`
3. Replace the placeholder bytecode strings in:
  - `web/js/patient-create.js`
  - `web/js/doctor-create.js`

Example ABI export shape:

```js
const Patient100ABI = [ /* compiled ABI JSON */ ];
```
