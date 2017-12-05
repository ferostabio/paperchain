pragma solidity ^0.4.17;

import "./Model.sol";
import "./Authentication.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title Documenter
 * @notice App's main contract, where POE happens and document data is stored
 */
contract Documenter is Ownable {

  /*
   * Each document has a category. Well, eventually will have more than one.
   * Current values are just a stub
   */
  enum Category { QUANTUM_PHYSICS, LEPUFOLOGY}

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
   * @dev event for the registration of a new document
   * @notice name param should be indexed, but dynamic properties cannot be decoded by web3 if marked this way
   * @notice https://ethereum.stackexchange.com/questions/6840/indexed-event-with-string-not-getting-logged/7170#7170
   * @param name of the new document
   * @param category of the new document (indexed)
   * @param quotes of the new document
   * @param hash of the new document
   * @param multihash of the new document
   * @param timestamp of the new document
   * @param owner address (indexed)
   */
  event LogNewDocument(string name, uint indexed category, bytes32[] quotes, bytes32 hash, bytes multihash, uint timestamp, address indexed owner);

  /**
   * @dev event for a quote made by a new document
   * @param _from hash of the document making the quote (indexed)
   * @param _to hash of the document being quoted (indexed)
   */
  event LogQuote(bytes32 indexed _from, bytes32 indexed _to);

  /**
   * @dev modifier that checks if a document is new
   * @param _hash of the document
   */
  modifier isNewDocument(bytes32 _hash) {
    require(!documentExists(_hash));
    _;
  }

  /**
   * @dev modifier that checks if a category is valid
   * @param _category of the document
   */
  modifier isCategoryValid(uint _category) {
    require(uint(Category.LEPUFOLOGY) >= _category);
    _;
  }

  /**
   * @dev modifier that checks if a user is the owner of a document
   * @param _hash of the document
   * @param _owner address of the user claiming ownership
   */
  modifier isDocumentOwner(bytes32 _hash, address _owner) {
    require(documentExists(_hash));
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
   * @dev public function that registers a document
   * @param _name of the document
   * @param _category of the document
   * @param _quotes of the document
   * @param _hash of the document
   * @param _multihash of the document's IPFS storage
   * @param _timestamp of the document
   */
  function notarizeDocument(string _name, uint _category, bytes32[] _quotes, bytes32 _hash, bytes _multihash, uint _timestamp) public isNewDocument(_hash) isCategoryValid(_category) {
    // Not really sure this is needed or a waste of gas
    for (uint i = 0; i < _quotes.length; i++) {
      require(documentExists(_quotes[i]));
    }

    poe[_hash] = msg.sender;
    authentication.addDocument(msg.sender, _hash);
    LogNewDocument(_name, _category, _quotes, _hash, _multihash, _timestamp, msg.sender);

    for (uint j = 0; j < _quotes.length; j++) {
      LogQuote(_hash, _quotes[j]);
    }
  }

  /**
   * @dev function that checks if a document already exists
   * @param _hash of the document
   * @return a boolean that indicates if the document exists
   */
  function documentExists(bytes32 _hash) public view returns (bool) {
    return poe[_hash] != address(0);
  }
}
