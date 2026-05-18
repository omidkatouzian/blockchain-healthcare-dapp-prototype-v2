/*
Reconstructed from the thesis chapter 4 pharmacy page.

Flow:
1) Read patient contract address and prescription ID.
2) Validate the address.
3) Call GetTrailCount() to ensure there is a record trail.
4) Call GetPrescription(...) and render the stored prescription.
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

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));
}

$('#contract-form').submit(function (event) {
  event.preventDefault();
  console.log("function drugstore ok");

  var patientAddress = $('#patient_address').val();
  var prescriptionID = $('#prescription_id').val();

  if (web3.utils.isAddress(patientAddress) != true) {
    alert('You did not enter a correct ethereum address for the patient address.');
    return;
  } else {
    (async () => {
      var deployedMyContract = new web3.eth.Contract(Patient100ABI, patientAddress);

      deployedMyContract.methods.GetTrailCount().call({ from: account }, function (error, result) {
        if (error) {
          console.log('error: ' + error);
          $('#pharmacy-submit').html('<b>Error: </b>' + error);
          return;
        }

        var trailCount = parseInt(result, 10);
        var trailIndex = parseInt(prescriptionID, 10);

        if (isNaN(trailIndex) || trailIndex <= 0 || trailIndex >= trailCount) {
          $('#pharmacy-submit').html('Prescription ID <b>' + prescriptionID + '</b> was not found.');
          return;
        }

        deployedMyContract.methods.GetPrescription(trailIndex).call({ from: account }, function (error2, result2) {
          if (error2) {
            console.log('error: ' + error2);
            $('#pharmacy-submit').html('<b>Error: </b>' + error2);
          } else {
            $('#pharmacy-submit').html('');
            $('#prescription_id_output').html('<b>Prescription ID: </b>' + result2[0]);
            $('#prescription_doctor_id').html('<b>Doctor address: </b>' + result2[1]);
            $('#prescription_date').html('<b>Date: </b>' + result2[2]);
            $('#prescription_pregnant').html('<b>Pregnant: </b>' + result2[3]);
            $('#prescription_drug1').html('<b>Drug 1: </b>' + result2[4]);
            $('#prescription_drug2').html('<b>Drug 2: </b>' + result2[5]);
            $('#prescription_drug3').html('<b>Drug 3: </b>' + result2[6]);
          }
        });
      });
    })();
  }
});
