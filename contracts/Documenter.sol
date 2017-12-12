pragma solidity ^0.4.17;

import "./Model.sol";
import "./Authentication.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title Documenter
 * @notice App's main contract, where POE happens and paper data is stored
 */
contract Documenter is Ownable {

  // Authentication contract
  Authentication private authentication;

  // Deployment block number
  uint private blockNumber;

  /*
   * @dev Mapping of hashes -> address struct
   * @notice https://bitbucket.org/ferostar/paperchain/issues/1/md5-to-sha256
   */
  mapping (bytes32 => address) private poe;

  /**
   * @dev event for the registration of a new paper
   * @notice name param should be indexed, but dynamic properties cannot be decoded by web3 if marked this way
   * @notice https://ethereum.stackexchange.com/questions/6840/indexed-event-with-string-not-getting-logged/7170#7170
   * @param name of the new paper
   * @param field of the new paper (indexed)
   * @param refereed status of the new paper
   * @param quotes of the new paper
   * @param hash of the new paper (indexed)
   * @param multihash of the new paper
   * @param timestamp of the new paper
   * @param owner address (indexed)
   */
  event LogPaper(string name, uint indexed field, bool refereed, bytes32[] quotes, bytes32 indexed hash, bytes multihash, uint timestamp, address indexed owner);

  /**
   * @dev event for a quote made by a new paper
   * @param from hash of the paper making the quote (indexed)
   * @param to hash of the paper being quoted (indexed)
   */
  event LogQuote(bytes32 indexed from, bytes32 indexed to);

  /**
   * @dev event for a peer review
   * @param user address performing the revieww (indexed)
   * @param hash of the paper being reviewed (indexed)
   */
  event LogReview(address indexed user, bytes32 indexed hash);

  /**
   * @dev modifier that checks if a paper is new
   * @param _hash of the paper
   */
  modifier isNewPaper(bytes32 _hash) {
    require(!paperExists(_hash));
    _;
  }

  /**
   * @dev modifier that checks if a field is valid
   * @param _field of the paper
   */
  modifier isFieldValid(uint _field) {
    require(uint(Model.Field.LEPUFOLOGY) >= _field);
    _;
  }

  /**
   * @dev modifier that checks if a user is the owner of a paper
   * @param _hash of the paper
   * @param _owner address of the user claiming ownership
   */
  modifier isPaperOwner(bytes32 _hash, address _owner) {
    require(paperExists(_hash));
    require(poe[_hash] == owner);
    _;
  }

  /**
   * @dev Documenter constructor
   * @param _authentication The address of the authentication used to track users
   */
  function Documenter(address _authentication) public {
    authentication = Authentication(_authentication);
    blockNumber = block.number;
  }

  /**
   * @dev helper function that returns the contract deployment's block number
   * @return block number
   */
  function getDeploymentBlockNumber() public view returns (uint) {
    return blockNumber;
  }

  /**
   * @dev public function that registers a paper
   * @param _name of the paper
   * @param _field of the paper
   * @param _refereed status of the paper
   * @param _quotes of the paper
   * @param _hash of the paper
   * @param _multihash of the paper's IPFS storage
   * @param _timestamp of the paper
   */
  function publishPaper(string _name, uint _field, bool _refereed, bytes32[] _quotes, bytes32 _hash, bytes _multihash, uint _timestamp) public isNewPaper(_hash) isFieldValid(_field) {
    // Not really sure this is needed or a waste of gas, should probably be done via web3
    for (uint i = 0; i < _quotes.length; i++) {
      require(paperExists(_quotes[i]));
    }

    poe[_hash] = msg.sender;
    LogPaper(_name, _field, _refereed, _quotes, _hash, _multihash, _timestamp, msg.sender);

    for (uint j = 0; j < _quotes.length; j++) {
      LogQuote(_hash, _quotes[j]);
    }
  }

  /**
   * @dev function that checks if a paper already exists
   * @param _hash of the paper
   * @return a boolean that indicates if the paper exists
   */
  function paperExists(bytes32 _hash) public view returns (bool) {
    return poe[_hash] != address(0);
  }

  /**
   * @dev function that performs a peer review
   * @param _hash of the paper
   */
  function reviewPaper(bytes32 _hash) public {
    require(paperExists(_hash) && poe[_hash] != msg.sender);
    authentication.addReviewToUser(msg.sender, _hash);
    LogReview(msg.sender, _hash);
  }
}
