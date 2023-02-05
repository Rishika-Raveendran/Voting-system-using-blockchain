const election = artifacts.require("./Election.sol");

contract("election", function (accounts) {
  var electionInstance;

  it("initializes with three candidates", function () {
    return election
      .deployed()
      .then(function (instance) {
        return instance.candidateCount();
      })
      .then(function (count) {
        assert.equal(count, 3);
      });
  });
  it("it initializes the candidates with the correct values", function () {
    return election
      .deployed()
      .then(function (instance) {
        electionInstance = instance;
        return electionInstance.candidates(1);
      })
      .then(function (candidate) {
        assert.equal(candidate[0], 1, "contains the correct id");
        assert.equal(
          candidate[1],
          "Mariya Thomas",
          "contains the correct name"
        );
        assert.equal(candidate[2], 0, "contains the correct votes count");
        return electionInstance.candidates(2);
      })
      .then(function (candidate) {
        assert.equal(candidate[0], 2, "contains the correct id");
        assert.equal(
          candidate[1],
          "Aishwarya S Prabhu",
          "contains the correct name"
        );
        assert.equal(candidate[2], 0, "contains the correct votes count");
        return electionInstance.candidates(3);
      })
      .then(function (candidate) {
        assert.equal(candidate[0], 3, "contains the correct id");
        assert.equal(candidate[1], "Rishikesh R", "contains the correct name");
        assert.equal(candidate[2], 0, "contains the correct votes count");
      });
  });

  //Test voting function
  it("allows a voter to cast a vote", function () {
    return election
      .deployed()
      .then(function (instance) {
        electionInstance = instance;
        cid = 1;
        return electionInstance.voteCandidate(cid, { from: accounts[0] });
      })
      .then(function (receipt) {
        assert.equal(receipt.logs.length, 1, "an event was triggered");
        assert.equal(
          receipt.logs[0].event,
          "votedEvent",
          "the event type is correct"
        );
        assert.equal(
          receipt.logs[0].args._candidateId.toNumber(),
          cid,
          "the candidate id is correct"
        );
        return electionInstance.voters(accounts[0]);
      })
      .then(function (voted) {
        assert(voted, "the voter was marked as voted");
        return electionInstance.candidates(cid);
      })
      .then(function (candidate) {
        var voteCount = candidate[2];
        assert.equal(voteCount, 1, "increments the candidate's vote count");
      });
  });
});
