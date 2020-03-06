pragma solidity 0.5.12;
import "./Ownable.sol";
import "./provableAPI.sol";


contract CoinToss is Ownable, usingProvable {
    //function random() private view returns (uint256) {
    //    return block.timestamp % 2;
    //}

    function testRandom() public returns (bytes32) {
        bytes32 queryId = bytes32(keccak256((abi.encodePacked((msg.sender)))));
        __callback(queryId, "1", bytes("test"));
        return queryId;
    }

    struct Game {
      address player;
      uint256 side;
      uint betsize;
      bool won;
    }

    event CoinTossed(string message);
    event CoinDropped(bool won);
    event GeneratedRandomNumber(uint256 randomNumber);

    uint public balance;
    mapping(address => uint) private balances;
    mapping (address => Game) private games;
    mapping (bytes32 => address) private randomCalls;

    modifier costs(uint256 cost) {
        require(msg.value >= cost);
        _;
    }

    function addBalance() public payable onlyOwner {
        balance += msg.value;
    }

    function toss(uint256 side) public payable costs(0.005 ether) {
        require(
            balance >= msg.value,
            "Not enough eth in the contract to play this much"
        );
        
        uint256 QUERY_EXECUTION_DELAY = 0;
        uint256 GAS_FOR_CALLBACK = 200000;
        bytes32 queryId = provable_newRandomDSQuery(QUERY_EXECUTION_DELAY, 1, GAS_FOR_CALLBACK);
        //bytes32 queryId = testRandom();
        randomCalls[queryId] = msg.sender;
        
        Game memory newGame;
        newGame.player = msg.sender;
        newGame.side = side;
        newGame.betsize = msg.value;
        games[msg.sender] = newGame;

        emit CoinTossed("Provable query was sent, standing by for answer");
    }

    function __callback(bytes32 _queryId, string memory _result/*, bytes memory _proof*/) public {
        require(msg.sender == provable_cbAddress(), "");

        uint256 tossed = uint256(keccak256(abi.encodePacked(_result))) % 2;

        address player = randomCalls[_queryId];
        Game memory game = games[player];
        game.won = tossed == game.side;

        if (game.won) {
            balances[player] += (game.betsize * 2);
            balance -= game.betsize;
        } else {
            balance += game.betsize;
        }

        emit CoinDropped(game.won);
    }

    function getFunds() public view returns (uint) {
        address player = msg.sender;
        return balances[player];
    }

    function withdrawFunds() public payable returns (uint) {
        address player = msg.sender;
        uint toTransfer = balances[player];
        balances[player] = 0;
        msg.sender.transfer(toTransfer);
        return toTransfer;
    }

    function withdrawAll() public onlyOwner returns (uint256) {
        uint toTransfer = balance;
        balance = 0;
        msg.sender.transfer(toTransfer);
        return toTransfer;
    }
}
