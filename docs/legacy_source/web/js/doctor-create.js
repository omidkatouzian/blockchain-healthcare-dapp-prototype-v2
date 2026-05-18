/*
Reconstructed from the thesis chapter 4 doctor-registration page.

Flow:
1) Connect to the local Ethereum provider.
2) Load the Doctor100 ABI.
3) Deploy a new Doctor100 contract using the compiled bytecode.
4) Read doctor fields from the form.
5) Call SetDoctor(...) on the newly deployed doctor contract.
*/

// Expected external files:
// - web3.min.js
// - doctorABI.js (must define Doctor100ABI)
// - jQuery

var accounts;
var account;
var Doctor100ContractAddress;
var Doctor100Code;
var myContract;

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));
}

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

  // Replace this with the compiled bytecode from your Solidity build.
  Doctor100Code = '0xREPLACE_WITH_COMPILED_DOCTOR100_BYTECODE';

  myContract = new web3.eth.Contract(Doctor100ABI, null, {
    from: account,
    data: Doctor100Code,
    gasPrice: '20000000000'
  });

  myContract.deploy({
    data: Doctor100Code
  }).send({
    from: account,
    gasPrice: '30000',
    gas: '3000000'
  }).then((instance) => {
    console.log("Contract mined at " + instance.options.address);
    Doctor100ContractAddress = instance.options.address;
  });
});

$('#contract-form').submit(function (event) {
  event.preventDefault();
  console.log("function doctor test ok");

  (async () => {
    var nameDoctor = $('#nameDoctor').val();
    var gender = document.querySelector('input[name="gender"]:checked').value;
    var medicalBoard = $('#medicalBoardDoctor').val();
    var medicalLicense = $('#medicalLicenseDoctor').val();
    var email = $('#emailAddressDoctor').val();
    var birth = $('#birthDoctor').val();
    var location = $('#addressDoctor').val();

    var deployedMyContract = new web3.eth.Contract(Doctor100ABI, Doctor100ContractAddress);
    deployedMyContract.methods.SetDoctor(nameDoctor, gender, medicalBoard, medicalLicense, email, birth, location).send(
      { from: account, gas: 300000 },
      function (error, result) {
        if (error) {
          console.log('error: ' + error);
          $('#doctor_txn').html('<b>TXN Error: </b>' + error);
          $('#doctor-submit').html('doctor <b>' + nameDoctor + '</b> was not created.');
        } else {
          $('#doctor_txn').html('<b>TXN: </b>' + result);
          $('#doctor-submit').html('doctor <b>' + nameDoctor + '</b> was created successfully.');
          $('#doctor_ether_address').html('<b>Doctor new address: </b>' + Doctor100ContractAddress);
          $('#doctor_ether_gender').html('<b>Doctor Gender: </b>' + gender);
          $('#doctor_ether_board').html('<b>Medical Board: </b>' + medicalBoard);
          $('#doctor_ether_license').html('<b>Medical License: </b>' + medicalLicense);
          $('#doctor_ether_email').html('<b>Doctor email address: </b>' + email);
          $('#doctor_ether_birth').html('<b>Doctor birthday: </b>' + birth);
          $('#doctor_ether_location').html('<b>Doctor location: </b>' + location);
        }
      }
    );
  })();
});
