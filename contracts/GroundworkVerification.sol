// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GroundworkVerification {
    struct VerificationRecord {
        string volunteerId;
        string taskId;
        string ipfsCid;
        uint256 timestamp;
        string verdict;
    }
    
    VerificationRecord[] public records;
    event RecordAdded(string volunteerId, string taskId, string ipfsCid, uint256 timestamp);
    
    function recordVerification(
        string memory volunteerId,
        string memory taskId,
        string memory ipfsCid,
        uint256 timestamp,
        string memory verdict
    ) public {
        records.push(VerificationRecord(volunteerId, taskId, ipfsCid, timestamp, verdict));
        emit RecordAdded(volunteerId, taskId, ipfsCid, timestamp);
    }
    
    function getRecord(uint256 index) public view returns (VerificationRecord memory) {
        return records[index];
    }
    
    function getTotalRecords() public view returns (uint256) {
        return records.length;
    }
}
