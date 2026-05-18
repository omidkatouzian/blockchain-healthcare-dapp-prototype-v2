// Reconstructed from the thesis chapter 4 code excerpts.
// Thesis focus: separate on-chain doctor profiles with address-based lookup.

pragma solidity ^0.4.20;

contract Doctor100 {
    mapping(address => profile) doctorID;

    struct profile {
        string name;
        string gender;
        string medicalBoard;
        uint medicalLicense;
        string email;
        string birth;
        string location;
    }

    function SetDoctor(
        string name,
        string gender,
        string medicalBoard,
        uint medicalLicense,
        string email,
        string birth,
        string location
    ) public {
        profile memory newProfile;
        newProfile.name = name;
        newProfile.gender = gender;
        newProfile.medicalBoard = medicalBoard;
        newProfile.medicalLicense = medicalLicense;
        newProfile.email = email;
        newProfile.birth = birth;
        newProfile.location = location;

        // Preserves the thesis' contract-per-entity storage pattern.
        doctorID[address(this)] = newProfile;
    }

    function GetDoctor(address ID)
        public
        constant
        returns (string, string, string, uint, string, string, string)
    {
        return (
            doctorID[ID].name,
            doctorID[ID].gender,
            doctorID[ID].medicalBoard,
            doctorID[ID].medicalLicense,
            doctorID[ID].email,
            doctorID[ID].birth,
            doctorID[ID].location
        );
    }
}
