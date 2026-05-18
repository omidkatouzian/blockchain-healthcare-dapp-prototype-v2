/*
Reconstructed from the thesis chapter 4 patient-retrieval page.

Flow:
1) Read a patient contract address from the form.
2) Validate the address with web3.utils.isAddress.
3) Instantiate the contract using Patient100 ABI.
4) Call GetPatient(address) and render the returned data.
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
  console.log("function get ok");

  var patientAddress = $('#patientIDAddress').val();
  if (web3.utils.isAddress(patientAddress) != true) {
    alert('You did not enter a correct ethereum address for the patient address.');
    return;
  } else {
    (async () => {
      var deployedMyContract = new web3.eth.Contract(Patient100ABI, patientAddress);
      deployedMyContract.methods.GetPatient(patientAddress).call({ from: account }, function (error, result) {
        if (error) {
          console.log('error: ' + error);
          $('#patient-submit').html('<b>Error: </b>' + error);
        } else {
          console.log('result: ' + result);
          $('#patient-submit').html('');
          $('#patient_name').html('<b>Patient Name: </b>' + result[0]);
          $('#patient_ether_gender').html('<b>Patient Gender: </b>' + result[1]);
          $('#patient_ether_email').html('<b>Patient Email: </b>' + result[2]);
          $('#patient_ether_birth').html('<b>Patient Birthday: </b>' + result[3]);
          $('#patient_ether_location').html('<b>Patient Location: </b>' + result[4]);
          $('#patient_ether_blood').html('<b>Blood Type: </b>' + result[5]);
          $('#patient_ether_emr').html('<b>Patient EMR Status: </b>' + result[6]);
        }
      });
    })();
  }
});
