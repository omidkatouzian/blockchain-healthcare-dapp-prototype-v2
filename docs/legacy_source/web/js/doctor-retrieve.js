/*
Reconstructed from the thesis chapter 4 doctor-retrieval page.

Flow:
1) Read a doctor contract address from the form.
2) Validate the address with web3.utils.isAddress.
3) Instantiate the contract using Doctor100 ABI.
4) Call GetDoctor(address) and render the returned data.
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

$('#contract-form').submit(function (event) {
  event.preventDefault();
  console.log("function doctor get ok");

  var doctorAddress = $('#doctorIDAddress').val();
  if (web3.utils.isAddress(doctorAddress) != true) {
    alert('You did not enter a correct ethereum address for the doctor address.');
    return;
  } else {
    (async () => {
      var deployedMyContract = new web3.eth.Contract(Doctor100ABI, doctorAddress);
      deployedMyContract.methods.GetDoctor(doctorAddress).call({ from: account }, function (error, result) {
        if (error) {
          console.log('error: ' + error);
          $('#doctor-submit').html('<b>Error: </b>' + error);
        } else {
          console.log('result: ' + result);
          $('#doctor-submit').html('');
          $('#doctor_name').html('<b>Doctor Name: </b>' + result[0]);
          $('#doctor_ether_gender').html('<b>Doctor Gender: </b>' + result[1]);
          $('#doctor_ether_board').html('<b>Medical Board: </b>' + result[2]);
          $('#doctor_ether_license').html('<b>Medical License: </b>' + result[3]);
          $('#doctor_ether_email').html('<b>Doctor Email: </b>' + result[4]);
          $('#doctor_ether_birth').html('<b>Doctor Birthday: </b>' + result[5]);
          $('#doctor_ether_location').html('<b>Doctor Location: </b>' + result[6]);
        }
      });
    })();
  }
});
