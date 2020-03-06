const CoinToss = artifacts.require("CoinToss");
const truffleAssert = require("truffle-assertions");

contract("CoinToss", async function(accounts) {
    let instance;

    before(async function() {
        instance = await CoinToss.deployed()
    });

    it("should initialize correctly", async function(){
        let balance = Number(await instance.balance());
        assert(balance === Number(web3.utils.toWei("1", "ether")), "Contract balance should be 1 eth, real balance: " + balance);
    });
    
    it("balances should be updated correctly", async function() {
        let won = Boolean(await instance.toss(1, {value: web3.utils.toWei("0.005", "ether"), from: accounts[1]}));
        console.log("WON = " + won);
        if(won === true) {
            let balance = Number(await instance.getFunds());
            assert(balance === Number(web3.utils.toWei("0.005", "ether")), "Won, Player balance should be 0.005 eth, real balance: " + balance);
        } else {
            let balance = Number(await instance.balance());
            assert(balance === Number(web3.utils.toWei("1.005", "ether")), "Lost, Contract balance should be 1.005 eth, real balance: " + balance);
        }
    });
});