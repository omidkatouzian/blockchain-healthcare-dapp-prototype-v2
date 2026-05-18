/*
Reconstructed from the thesis chapter 4 insurance / research review flow.

Flow:
1) Read patient contract address.
2) Validate the address.
3) Call GetTrailCount().
4) Iterate over the stored trail and render every prescription record.
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
  console.log("function insurance ok");

  var patientAddress = $('#patient_address').val();

  if (web3.utils.isAddress(patientAddress) != true) {
    alert('You did not enter a correct ethereum address for the patient address.');
    return;
  }

  (async () => {
    var deployedMyContract = new web3.eth.Contract(Patient100ABI, patientAddress);

    deployedMyContract.methods.GetTrailCount().call({ from: account }, function (error, result) {
      if (error) {
        console.log('error: ' + error);
        $('#insurance-submit').html('<b>Error: </b>' + error);
        return;
      }

      var trailCount = parseInt(result, 10);
      var lastRecordIndex = trailCount - 1;

      if (lastRecordIndex < 1) {
        $('#insurance-submit').html('No medical records were found for this patient.');
        return;
      }

      $('#insurance-submit').html('');

      // Render all records stored in Trail[1..TrailCount-1]
      $('#insurance-results').html('');
      for (var i = 1; i <= lastRecordIndex; i++) {
        deployedMyContract.methods.GetPrescription(i).call({ from: account }, function (err, record) {
          if (err) {
            console.log('error: ' + err);
            return;
          }

          var item = [
            '<div class="record-card">',
            '<p><strong>Prescription ID:</strong> ' + record[0] + '</p>',
            '<p><strong>Doctor address:</strong> ' + record[1] + '</p>',
            '<p><strong>Date:</strong> ' + record[2] + '</p>',
            '<p><strong>Pregnant:</strong> ' + record[3] + '</p>',
            '<p><strong>Drug 1:</strong> ' + record[4] + '</p>',
            '<p><strong>Drug 2:</strong> ' + record[5] + '</p>',
            '<p><strong>Drug 3:</strong> ' + record[6] + '</p>',
            '</div>'
          ].join('');

          $('#insurance-results').append(item);
        });
      }
    });
  })();
});
