App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    console.log("Web3");
    if (typeof web3 !== "undefined") {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function () {
    console.log("Contract");
    $.getJSON("/build/contracts/Election.json", function (election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);
      // App.listenForEvent();
      return App.render();
    });
  },

  castVote: function () {
    //Get id of the candidate for whom they voted
    var cid = $("#candidatesSelect").val();

    //Record vote
    App.contracts.Election.deployed()
      .then(function (instance) {
        return instance.voteCandidate(cid, { from: App.account });
      })
      .then(function (result) {
        //wait for updation of vote
        $("#content").hide();
        $("#loader").show();
      })
      .catch(function (err) {
        console.error(err);
      });
  },

  listenForEvent: function () {
    App.contracts.Election.deployed().then(function (instance) {
      instance
        .votedEvent(
          {},
          {
            fromBlock: 0,
            toBlock: "latest",
          }
        )
        .watch(function (error, event) {
          console.log("votedEvent Triggered", event);
          //reload content when new vote is recorded
          App.render();
        });
    });
  },

  render: function () {
    console.log("Rendering");
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Election.deployed()
      .then(function (instance) {
        electionInstance = instance;
        return electionInstance.candidateCount();
      })
      .then(function (candidatesCount) {
        var candidatesResults = $("#candidatesResults");
        candidatesSelect = $("#candidatesSelect");
        candidatesResults.empty();
        // console.log(candidatesCount);

        for (var k = 1; k <= candidatesCount; k++) {
          (function (k) {
            electionInstance.candidates(k).then(function (candidate) {
              var id = candidate[0];
              var name = candidate[1];
              var voteCount = candidate[2];

              // Render candidate Result
              var candidateTemplate =
                "<tr><th>" +
                id +
                "</th><td>" +
                name +
                "</td><td>" +
                voteCount +
                "</td></tr>";
              candidatesResults.append(candidateTemplate);
              
              // Render candidate ballot option
              var candidateOption =
                "<option value='" + id + "' >" + name + "</ option>";
              candidatesSelect.append(candidateOption);
            });
          })(k);
        }
        loader.hide();
        content.show();
        return electionInstance.voters(App.account);
      })
      .then(function (hasVoted) {
        // Do not allow a user to vote
        if (hasVoted) {
          $("form").hide();
        console.log("Hi")
      }
        loader.hide();
        content.show();
      })
      .catch(function (error) {
        console.warn(error);
      });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
