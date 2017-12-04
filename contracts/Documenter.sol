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

  // Mapping of hashes -> address struct
  mapping (bytes => address) private poe;

  /**
   * @dev event for the registration of a new document
   * @notice name param should be indexed, but dynamic properties cannot be decoded by web3 if marked this way
   * @notice https://ethereum.stackexchange.com/questions/6840/indexed-event-with-string-not-getting-logged/7170#7170
   * @param name of the new document
   * @param category of the new document (indexed)
   * @param hash of the new document
   * @param multihash of the new document
   * @param timestamp of the new document
   * @param owner address (indexed)
   */
  event LogNewDocument(string name, uint indexed category, bytes hash, bytes multihash, uint timestamp, address indexed owner);

  /**
   * @dev modifier that checks if a document is new
   * @param _hash of the document
   */
  modifier isNewDocument(bytes _hash) {
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
  modifier isDocumentOwner(bytes _hash, address _owner) {
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
   * @param _hash of the document
   * @param _multihash of the document's IPFS storage
   * @param _timestamp of the document
   */
  function notarizeDocument(string _name, uint _category, bytes _hash, bytes _multihash, uint _timestamp) public isNewDocument(_hash) isCategoryValid(_category) {
    poe[_hash] = msg.sender;

    authentication.addDocument(msg.sender, _hash);

    LogNewDocument(_name, _category, _hash, _multihash, _timestamp, msg.sender);
  }

  /**
   * @dev function that checks if a document already exists
   * @param _hash of the document
   * @return a boolean that indicates if the document exists
   */
  function documentExists(bytes _hash) public view returns (bool) {
    return poe[_hash] != address(0);
  }
}
