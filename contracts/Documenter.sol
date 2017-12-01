pragma solidity ^0.4.17;

import "./Model.sol";
import "./Authentication.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title Documenter
 * @notice App's main contract, where POE happens and document data is stored
 */
contract Documenter is Ownable {

  // Authentication contract
  Authentication private authentication;

  // Deployment block number
  uint private blockNumber;

  /*
   * Mapping of hashes -> address struct
   * Hashes should be SHA-256, but they doesn't fit in 32 bytes, you have to use bytes;
   * they're a dynamic array, so if you want to return a list of them to the outside world you end up with
   * https://github.com/willitscale/learning-solidity/blob/master/support/NESTED_ARRAYS_NOT_IMPLEMENTED.MD mayhem.
   * MD5 is good enough to start with.
   */
  mapping (bytes32 => address) private poe;

  /**
   * @dev event for the registration of a new document
   * @param name of the new document
   * @param hash of the new document
   * @param multihash of the new document
   * @param timestamp of the new document
   * @param owner address
   */
  event LogNewDocument(string name, bytes32 hash, bytes multihash, uint timestamp, address owner);

  /**
   * @dev modifier that checks if a document is new
   * @param _hash of the document
   */
  modifier isNewDocument(bytes32 _hash) {
    require(!documentExists(_hash));
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
  function getDeploymentBlockNumber() public view returns (uint block) {
    return blockNumber;
  }

  /**
   * @dev public function that registers a document
   * @param _name of the document
   * @param _hash of the document
   * @param _multihash of the document's IPFS storage
   * @param _timestamp of the document
   */
  function notarizeDocument(string _name, bytes32 _hash, bytes _multihash, uint _timestamp) public isNewDocument(_hash) {
    poe[_hash] = msg.sender;

    authentication.addDocument(msg.sender, _hash);

    LogNewDocument(_name, _hash, _multihash, _timestamp, msg.sender);
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
