//SPDX-License-Identifier:UNLICENSED

pragma solidity 0.5.16;

contract Election {
    //State variable
    string public candidate;

    //Constructor
    constructor() public {
        addCandidate("Mariya Thomas");
        addCandidate("Aishwarya S Prabhu");
        addCandidate("Rishikesh R");
    }

    //Model a candidate
    struct Candidate {
        uint256 id;
        string cname;
        uint256 cvotes;
    }

    //Store candidates in candidates state variable
    mapping(uint256 => Candidate) public candidates;
    //Store accounts that have already voted
    mapping(address => bool) public voters;

    //Store candidate counts as state variable
    uint256 public candidateCount;

    //Adding candidates
    function addCandidate(string memory _name) private {
        candidateCount++;
        candidates[candidateCount] = Candidate(candidateCount, _name, 0);
    }

    //vote function
    function voteCandidate(uint256 cid) public {
        //Checking necessary conditions
        require(!voters[msg.sender]);
        require(cid > 0 && cid <= candidateCount);

        //record voter
        voters[msg.sender] = true;

        //increment candidate vote
        candidates[cid].cvotes++;

        //trigger event
        emit votedEvent(cid);
    }

    //Watching events. an event is triggered every time a vote is cast
    event votedEvent(uint256 indexed _candidateId);
}
