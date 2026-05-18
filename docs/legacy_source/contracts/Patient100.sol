// Reconstructed from the thesis chapter 4 code excerpts.
// Thesis focus: decentralized healthcare records, patient profiles, and medical trail storage.
// NOTE: The original thesis text mixes descriptive text and code snippets; this version is normalized
// for readability and keeps the thesis logic intact.

pragma solidity ^0.4.20;

contract Patient100 {
    struct medical_records {
        uint8 prescriptionID;
        address doctorID;
        string timestamp;
        bool pregnant;
        string drug1;
        string drug2;
        string drug3;
    }

    mapping(uint8 => medical_records) Trail;
    uint8 TrailCount = 1;

    function AddPrescription(
        uint8 prescriptionID,
        address doctorID,
        string timestamp,
        bool pregnant,
        string drug1,
        string drug2,
        string drug3
    ) public {
        medical_records memory newEHR;
        newEHR.prescriptionID = prescriptionID;
        newEHR.doctorID = doctorID;
        newEHR.timestamp = timestamp;
        newEHR.pregnant = pregnant;
        newEHR.drug1 = drug1;
        newEHR.drug2 = drug2;
        newEHR.drug3 = drug3;

        Trail[TrailCount] = newEHR;
        TrailCount++;
    }

    function GetTrailCount() public constant returns (uint8) {
        return TrailCount;
    }

    function GetPrescription(uint8 TrailNo)
        public
        constant
        returns (uint8, address, string, bool, string, string, string)
    {
        return (
            Trail[TrailNo].prescriptionID,
            Trail[TrailNo].doctorID,
            Trail[TrailNo].timestamp,
            Trail[TrailNo].pregnant,
            Trail[TrailNo].drug1,
            Trail[TrailNo].drug2,
            Trail[TrailNo].drug3
        );
    }

    mapping(address => profile) patientID;

    struct profile {
        string name;
        string gender;
        string email;
        string birth;
        string location;
        string bloodType;
        string EMR;
    }

    function SetPatient(
        string name,
        string gender,
        string email,
        string birth,
        string location,
        string bloodType,
        string EMR
    ) public {
        profile memory newProfile;
        newProfile.name = name;
        newProfile.gender = gender;
        newProfile.email = email;
        newProfile.birth = birth;
        newProfile.location = location;
        newProfile.bloodType = bloodType;
        newProfile.EMR = EMR;

        // Preserves the thesis' contract-per-entity storage pattern.
        patientID[address(this)] = newProfile;
    }

    function GetPatient(address ID)
        public
        constant
        returns (string, string, string, string, string, string, string)
    {
        return (
            patientID[ID].name,
            patientID[ID].gender,
            patientID[ID].email,
            patientID[ID].birth,
            patientID[ID].location,
            patientID[ID].bloodType,
            patientID[ID].EMR
        );
    }
}
