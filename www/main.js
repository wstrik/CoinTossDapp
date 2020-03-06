var web3 = new Web3(Web3.givenProvider);
var contractInstance;

$(document).ready(function () {
    window.ethereum.enable().then(function (accounts) {
        contractInstance = new web3.eth.Contract(abi, "0xa091D78b485b8c2b9f20f32D2c79D866068a7B0D", { from: accounts[0] });
        console.log(contractInstance);
        updatePlayerBalance();        

        var eventCoinDropped = contractInstance.events
            .CoinDropped(function (err, result) {
                if (err) 
                    console.error(err);
                console.log("received event coinDropped");

                let won = result.returnValues.won;
                console.log("received event coinDropped: " + won);
                if (won) {
                    $("#divWon").show();
                    $("#divLost").hide();
                } else {
                    $("#divWon").hide();
                    $("#divLost").show();
                }
                updatePlayerBalance();
            });
            
        var eventCoinTossed = contractInstance.events
            .CoinTossed(function (err, result) {
                if (err) 
                    console.error(err);

                console.log("received event coinTossed: " + result.returnValues.message);
            });
    });

    $("#btnHeads, #btnTails").on("click", btnTossClick);
    $("#btnWithdraw").on('click', btnWithdrawClick);
});

function btnTossClick(event) {
    var $el = $(event.target);
    var amount = $("#inpAmount").val();
    var side = $el.data("side");

    var config = {
        value: web3.utils.toWei(amount, "ether")
    };

    contractInstance.methods
        .toss(side)
        .send(config)
        .on('transactionHash', function (hash) {
            console.log(hash)
        })
        .on('confirmation', function (confirmationNr) {
            console.log(confirmationNr);
        })
        .on('receipt', function (receipt) {
            console.log(receipt);
            //let won = receipt.events.coinTossed.returnValues.won;
        });
}

function updatePlayerBalance() {
    contractInstance.methods
        .getFunds().call()
        .then(function (result) {
            console.log(result);
            $("#txtBalance").text(result);
        });
}

function btnWithdrawClick(event) {
    contractInstance.methods
        .withdrawFunds().call()
        .then(function (result) {
            console.log(result);
            updatePlayerBalance();
        });
}