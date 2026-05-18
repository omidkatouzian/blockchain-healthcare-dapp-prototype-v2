/*
Reconstructed from the thesis chapter 4 patient-registration page.

Flow:
1) Connect to the local Ethereum provider.
2) Load the Patient100 ABI.
3) Deploy a new Patient100 contract using the compiled bytecode.
4) Read patient fields from the form.
5) Call SetPatient(...) on the newly deployed patient contract.
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

var version = web3.version;
console.log("Using web3 version: " + version);

web3.eth.getAccounts(function (err, accs) {
  if (err != null) {
    alert("There was an error fetching your accounts.");
    return;
  }
  if (accs.length == 0) {
    alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
    return;
  }

  accounts = accs;
  account = accounts[0];
  web3.eth.defaultAccount = account;
  console.log("default account is: " + account);

  // Replace this with the compiled bytecode from your Solidity build.
  Patient100Code = '0xREPLACE_WITH_COMPILED_PATIENT100_BYTECODE';

  myContract = new web3.eth.Contract(Patient100ABI, null, {
    from: account,
    data: Patient100Code,
    gasPrice: '20000000000'
  });

  myContract.deploy({
    data: Patient100Code
  }).send({
    from: account,
    gasPrice: '30000',
    gas: '3000000'
  }).then((instance) => {
    console.log("Contract mined at " + instance.options.address);
    console.log("Contract Instance " + instance);
    Patient100ContractAddress = instance.options.address;
  });
});

// Submit patient information to contract address
$('#contract-form').submit(function (event) {
  event.preventDefault();
  console.log("function test ok");

  (async () => {
    var namePateint = $('#namePateint').val();
    var gender = document.querySelector('input[name="gender"]:checked').value;
    var email = $('#emailAddressPatient').val();
    var birth = $('#birthPatient').val();
    var location = $('#addressPatient').val();
    var blood = document.querySelector('input[name="blood"]:checked').value;
    var emrPatient = $('#emrPatient').val();

    var deployedMyContract = new web3.eth.Contract(Patient100ABI, Patient100ContractAddress);
    deployedMyContract.methods.SetPatient(namePateint, gender, email, birth, location, blood, emrPatient).send(
      { from: account, gas: 300000 },
      function (error, result) {
        if (error) {
          console.log('error: ' + error);
          $('#patient_txn').html('<b>TXN Error: </b>' + error);
          $('#patient-submit').html('user <b>' + namePateint + '</b> was not created.');
        } else {
          $('#patient_txn').html('<b>TXN: </b>' + result);
          $('#patient-submit').html('user <b>' + namePateint + '</b> was created successfully.');
          $('#patient_ether_address').html('<b>Patient new address: </b>' + Patient100ContractAddress);
          $('#patient_ether_gender').html('<b>Patient Gender: </b>' + gender);
          $('#patient_ether_blood').html('<b>Patient Blood Type: </b>' + blood);
          $('#patient_ether_emr').html('<b>Emergency Status: </b>' + emrPatient);
          $('#patient_ether_email').html('<b>Patient email address: </b>' + email);
          $('#patient_ether_birth').html('<b>Patient birthday: </b>' + birth);
          $('#patient_ether_location').html('<b>Patient location: </b>' + location);
        }
      }
    );
  })();
});
