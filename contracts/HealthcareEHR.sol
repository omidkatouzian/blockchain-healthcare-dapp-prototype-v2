// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title HealthcareEHR
/// @notice Educational EHR dApp contract for Ethereum/Sepolia.
/// @dev No plaintext medical data is stored on-chain. Only encrypted IPFS CIDs and hashes are stored.
contract HealthcareEHR {
    enum Role {
        None,
        Patient,
        Doctor,
        Nurse,
        Pharmacy,
        ResearchCenter
    }

    enum RequestStatus {
        None,
        Pending,
        Granted,
        Rejected,
        Revoked
    }

    struct ActorProfile {
        Role role;
        string did;
        string profileCid;
        bytes32 metadataHash;
        bool active;
        bool verified;
        uint256 createdAt;
    }

    struct AccessRequest {
        uint256 id;
        address patient;
        address requester;
        Role requesterRole;
        string purpose;
        RequestStatus status;
        uint256 createdAt;
        uint256 decidedAt;
    }

    struct Permission {
        bool active;
        uint256 requestId;
        uint256 grantedAt;
        uint256 expiresAt;
        bytes32 scopesHash;
    }

    struct MedicalRecord {
        uint256 id;
        address patient;
        address createdBy;
        Role creatorRole;
        string recordType;
        string encryptedCid;
        bytes32 metadataHash;
        uint256 createdAt;
        bool exists;
    }

    address public owner;
    uint256 public nextRequestId = 1;
    uint256 public nextRecordId = 1;

    mapping(address => ActorProfile) private actors;
    mapping(address => uint256[]) private patientRequestIds;
    mapping(uint256 => AccessRequest) private accessRequests;
    mapping(address => mapping(address => Permission)) private permissions;
    mapping(uint256 => MedicalRecord) private medicalRecords;
    mapping(address => uint256[]) private patientRecordIds;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event ActorRegistered(address indexed actor, Role indexed role, string did, string profileCid);
    event ActorVerified(address indexed actor, Role indexed role, bool verified);
    event AccessRequested(uint256 indexed requestId, address indexed patient, address indexed requester, Role requesterRole, string purpose);
    event AccessGranted(uint256 indexed requestId, address indexed patient, address indexed requester, uint256 expiresAt, bytes32 scopesHash);
    event AccessRejected(uint256 indexed requestId, address indexed patient, address indexed requester);
    event AccessRevoked(address indexed patient, address indexed requester);
    event MedicalRecordAdded(uint256 indexed recordId, address indexed patient, address indexed createdBy, string recordType, string encryptedCid);

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    modifier registered(address actor) {
        require(actors[actor].active, "actor not registered");
        _;
    }

    modifier onlyPatient(address patient) {
        require(msg.sender == patient, "only patient wallet");
        require(actors[patient].active && actors[patient].role == Role.Patient, "patient not registered");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero owner");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function registerActor(Role role, string calldata did, string calldata profileCid, bytes32 metadataHash) external {
        require(role != Role.None, "invalid role");
        require(!actors[msg.sender].active, "already registered");
        require(bytes(did).length > 0, "did required");

        bool verified = role == Role.Patient;
        actors[msg.sender] = ActorProfile({
            role: role,
            did: did,
            profileCid: profileCid,
            metadataHash: metadataHash,
            active: true,
            verified: verified,
            createdAt: block.timestamp
        });

        emit ActorRegistered(msg.sender, role, did, profileCid);
        if (verified) {
            emit ActorVerified(msg.sender, role, true);
        }
    }

    function setActorVerified(address actor, bool verified) external onlyOwner registered(actor) {
        require(actors[actor].role != Role.Patient, "patients are self-verified");
        actors[actor].verified = verified;
        emit ActorVerified(actor, actors[actor].role, verified);
    }

    function getActor(address actor) external view registered(actor) returns (ActorProfile memory) {
        return actors[actor];
    }

    function requestAccess(address patient, string calldata purpose) external registered(msg.sender) registered(patient) returns (uint256) {
        require(actors[patient].role == Role.Patient, "target is not patient");
        require(msg.sender != patient, "patient cannot request self");
        require(actors[msg.sender].role != Role.None && actors[msg.sender].role != Role.Patient, "requester must be staff/research");
        require(actors[msg.sender].verified, "requester not verified");
        require(bytes(purpose).length > 0, "purpose required");

        uint256 requestId = nextRequestId++;
        accessRequests[requestId] = AccessRequest({
            id: requestId,
            patient: patient,
            requester: msg.sender,
            requesterRole: actors[msg.sender].role,
            purpose: purpose,
            status: RequestStatus.Pending,
            createdAt: block.timestamp,
            decidedAt: 0
        });
        patientRequestIds[patient].push(requestId);
        emit AccessRequested(requestId, patient, msg.sender, actors[msg.sender].role, purpose);
        return requestId;
    }

    function grantAccess(uint256 requestId, uint256 durationSeconds, bytes32 scopesHash) external {
        AccessRequest storage accessRequest = accessRequests[requestId];
        require(accessRequest.status == RequestStatus.Pending, "request not pending");
        require(msg.sender == accessRequest.patient, "only patient can grant");
        require(durationSeconds > 0, "duration required");

        uint256 expiresAt = block.timestamp + durationSeconds;
        accessRequest.status = RequestStatus.Granted;
        accessRequest.decidedAt = block.timestamp;
        permissions[accessRequest.patient][accessRequest.requester] = Permission({
            active: true,
            requestId: requestId,
            grantedAt: block.timestamp,
            expiresAt: expiresAt,
            scopesHash: scopesHash
        });

        emit AccessGranted(requestId, accessRequest.patient, accessRequest.requester, expiresAt, scopesHash);
    }

    function rejectAccess(uint256 requestId) external {
        AccessRequest storage accessRequest = accessRequests[requestId];
        require(accessRequest.status == RequestStatus.Pending, "request not pending");
        require(msg.sender == accessRequest.patient, "only patient can reject");
        accessRequest.status = RequestStatus.Rejected;
        accessRequest.decidedAt = block.timestamp;
        emit AccessRejected(requestId, accessRequest.patient, accessRequest.requester);
    }

    function revokeAccess(address requester) external onlyPatient(msg.sender) {
        require(permissions[msg.sender][requester].active, "permission not active");
        permissions[msg.sender][requester].active = false;
        emit AccessRevoked(msg.sender, requester);
    }

    function hasActiveAccess(address patient, address requester) public view returns (bool) {
        Permission memory permission = permissions[patient][requester];
        return permission.active && permission.expiresAt >= block.timestamp;
    }

    function getPermission(address patient, address requester) external view returns (Permission memory) {
        return permissions[patient][requester];
    }

    function getPatientRequestIds(address patient) external view returns (uint256[] memory) {
        require(msg.sender == patient || msg.sender == owner, "not allowed");
        return patientRequestIds[patient];
    }

    function getAccessRequest(uint256 requestId) external view returns (AccessRequest memory) {
        AccessRequest memory accessRequest = accessRequests[requestId];
        require(
            msg.sender == accessRequest.patient ||
            msg.sender == accessRequest.requester ||
            msg.sender == owner,
            "not allowed"
        );
        return accessRequest;
    }

    function addMedicalRecord(
        address patient,
        string calldata recordType,
        string calldata encryptedCid,
        bytes32 metadataHash
    ) external registered(msg.sender) registered(patient) returns (uint256) {
        require(actors[patient].role == Role.Patient, "target is not patient");
        require(bytes(recordType).length > 0, "record type required");
        require(bytes(encryptedCid).length > 0, "cid required");
        require(
            msg.sender == patient || hasActiveAccess(patient, msg.sender),
            "no active permission"
        );

        uint256 recordId = nextRecordId++;
        medicalRecords[recordId] = MedicalRecord({
            id: recordId,
            patient: patient,
            createdBy: msg.sender,
            creatorRole: actors[msg.sender].role,
            recordType: recordType,
            encryptedCid: encryptedCid,
            metadataHash: metadataHash,
            createdAt: block.timestamp,
            exists: true
        });
        patientRecordIds[patient].push(recordId);
        emit MedicalRecordAdded(recordId, patient, msg.sender, recordType, encryptedCid);
        return recordId;
    }

    function getPatientRecordIds(address patient) external view returns (uint256[] memory) {
        require(msg.sender == patient || hasActiveAccess(patient, msg.sender) || msg.sender == owner, "no active permission");
        return patientRecordIds[patient];
    }

    function getMedicalRecord(uint256 recordId) external view returns (MedicalRecord memory) {
        MedicalRecord memory record = medicalRecords[recordId];
        require(record.exists, "record not found");
        require(msg.sender == record.patient || hasActiveAccess(record.patient, msg.sender) || msg.sender == owner, "no active permission");
        return record;
    }
}
