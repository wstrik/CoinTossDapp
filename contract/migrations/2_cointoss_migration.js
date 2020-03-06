const CoinToss = artifacts.require("CoinToss");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(CoinToss).then(function (instance) {
    instance.addBalance({value: web3.utils.toWei("0.05", "ether"), from: accounts[0]});
  });
};
