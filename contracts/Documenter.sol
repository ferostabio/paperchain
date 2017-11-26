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

  /*
   * Mapping of hashes -> Document struct
   * Hashes should be SHA-256, but they doesn't fit in 32 bytes, you have to use bytes;
   * they're a dynamic array, so if you want to return a list of them to the outside world you end up with
   * https://github.com/willitscale/learning-solidity/blob/master/support/NESTED_ARRAYS_NOT_IMPLEMENTED.MD mayhem.
   * MD5 is good enough to start with.
   */
  mapping (bytes32 => Model.Document) private poe;

  /**
   * @dev event for the registration of a new document
   * @param name of the new document
   * @param hash of the new document
   * @param multihash of the new document's IPFS storage
   * @param address of the new document's creator
   * @param timestamp of the new document
   */
  event LogNewDocument(bytes name, bytes32 hash, bytes multihash, address owner, uint timestamp);

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
   * @param _owner, address of the user claiming ownership
   */
  modifier isDocumentOwner(bytes32 _hash, address _owner) {
    require(documentExists(_hash));
    require(poe[_hash].owner == owner);
    _;
  }

  /**
   * @dev Documenter constructor
   * @param _authentication The address of the authentication used to track users
   */
  function Documenter(address _authentication) public {
    authentication = Authentication(_authentication);
  }

  /**
   * @dev public function that registers a document
   * @param _hash of the document
   * @param _name of the document
   * @param _multihash of the document's IPFS storage
   * @param _owner, address of the user claiming ownership
   */
  function notarizeDocument(bytes32 _hash, bytes _name, bytes _multihash, uint _timestamp) public isNewDocument(_hash) {
    Model.Document memory document = Model.Document({owner: msg.sender, name: _name, hash: _hash, multihash: _multihash, added: _timestamp});
    storeDocument(document);
  }

  /**
   * @dev private function that registers a document
   * @notice unnecessary really, will definitely move this into `notarizeDocument`
   * @param _document struct representing the document
   */
  function storeDocument(Model.Document _document) private {
    poe[_document.hash] = _document;

    authentication.addDocument(_document.owner, _document.hash);

    LogNewDocument(_document.name, _document.hash, _document.multihash, _document.owner, _document.added);
  }

  /**
   * @dev function that checks if a document already exists
   * @param _hash of the document
   * @return a boolean that indicates if the document exists
   */
  function documentExists(bytes32 _hash) public view returns (bool) {
    return poe[_hash].name.length != 0;
  }

  /**
   * @dev function that returns document data
   * @param _hash of the document
   * @return name of the document
   * @return hash of the document
   * @return multihash of the document
   * @return address of the document's owner
   * @return timestamp of the document
   */
  function getDocumentData(bytes32 _hash) public view isDocumentOwner(_hash, msg.sender) returns (bytes name, bytes32 fileHash, bytes multihash, address owner, uint timestamp) {
    Model.Document memory document = poe[_hash];
    return (document.name, document.hash, document.multihash, document.owner, document.added);
  }
}
