/*
Reconstructed from the thesis chapter 4 prescription-entry page.

Flow:
1) Read doctor address, patient address, prescription ID, timestamp, pregnancy flag, and 3 drugs.
2) Validate addresses.
3) Reject pregnancy-conflicting drugs when pregnancy is true.
4) Call AddPrescription(...) on the patient contract.
*/

// Expected external files:
// - web3.min.js
// - patientABI.js (must define Patient100ABI)
// - jQuery

var accounts;
var account;
var Patient100ContractAddress;
var Patient100Code;
var myContract;

// Defined drugs avoided in pregnancy
var drugNotAllowForPregnant = [
  'aspirin',
  'ibuprofen',
  'motrin',
  'advil',
  'accutane',
  'absorica',
  'amnesteem',
  'alaravis',
  'myorisan',
  'zenatane',
  'thalidomide'
];

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));
}

$('#contract-form').submit(function (event) {
  event.preventDefault();
  console.log("function drug ok");

  var doctorAddress = $('#idAddressDoctor').val();
  var patientAddress = $('#idAddressPatient').val();
  var prescriptionID = $('#prescriptionID').val();
  var timestamp = $('#prescriptionDate').val();
  var isPregnant = document.querySelector('input[name="isPregnantRadio"]:checked').value;
  var drug1 = $('#drug1').val();
  var drug2 = $('#drug2').val();
  var drug3 = $('#drug3').val();

  if (web3.utils.isAddress(doctorAddress) != true) {
    alert('You did not enter a correct ethereum address for the doctor address.');
    return;
  }
  if (web3.utils.isAddress(patientAddress) != true) {
    alert('You did not enter a correct ethereum address for the patient address.');
    return;
  }

  if (isPregnant === 'true') {
    for (var y = 0; y < drugNotAllowForPregnant.length; y++) {
      if (drug1 === drugNotAllowForPregnant[y]) {
        alert('ALERT! [Drug 1] This kind of drug has confliction with pregnancy.');
        return;
      }
    }
    for (var y = 0; y < drugNotAllowForPregnant.length; y++) {
      if (drug2 === drugNotAllowForPregnant[y]) {
        alert('ALERT! [Drug 2] This kind of drug has confliction with pregnancy.');
        return;
      }
    }
    for (var y = 0; y < drugNotAllowForPregnant.length; y++) {
      if (drug3 === drugNotAllowForPregnant[y]) {
        alert('ALERT! [Drug 3] This kind of drug has confliction with pregnancy.');
        return;
      }
    }
  }

  (async () => {
    var deployedMyContract = new web3.eth.Contract(Patient100ABI, patientAddress);
    console.log('pregnancy status: ' + isPregnant);

    deployedMyContract.methods.AddPrescription(
      prescriptionID,
      doctorAddress,
      timestamp,
      isPregnant === 'true',
      drug1,
      drug2,
      drug3
    ).send({ from: account, gas: 300000 }, function (error, result) {
      if (error) {
        console.log('error: ' + error);
        $('#prescription_txn').html('<b>TXN Error: </b>' + error);
        $('#prescription-submit').html('Registration of prescription ID <b>' + prescriptionID + '</b> is failed.');
      } else {
        $('#prescription_txn').html('<b>TXN: </b>' + result);
        $('#prescription-submit').html('prescription ID <b>' + prescriptionID + '</b> was registered successfully.');
        $('#prescription_doctor_id').html('<b>Doctor address: </b>' + doctorAddress);
        $('#prescription_date').html('<b>Date: </b>' + timestamp);
        $('#prescription_pregnant').html('<b>Pregnant: </b>' + isPregnant);
        $('#prescription_drug1').html('<b>Drug 1: </b>' + drug1);
        $('#prescription_drug2').html('<b>Drug 2: </b>' + drug2);
        $('#prescription_drug3').html('<b>Drug 3: </b>' + drug3);
      }
    });
  })();
});
