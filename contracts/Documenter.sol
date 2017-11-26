pragma solidity ^0.4.17;

import "./Model.sol";
import "./Authentication.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";

contract Documenter is Ownable {

  Authentication private authentication;

  // Hashes should be SHA-256, but they doesn't fit in 32 bytes, you have to use bytes; they're a dynamic array, so if you want to return a list of them to the outside world you end up with https://github.com/willitscale/learning-solidity/blob/master/support/NESTED_ARRAYS_NOT_IMPLEMENTED.MD mayhem. MD5 is good enough to start with.
  mapping (bytes32 => Model.Document) private poe;

  event LogNewDocument(bytes name, bytes32 hash, bytes multihash, address owner, uint timestamp);

  modifier isNewDocument(bytes32 _hash) {
    require(!documentExists(_hash));
    _;
  }

  modifier isDocumentOwner(bytes32 _hash, address _owner) {
    require(documentExists(_hash));
    require(poe[_hash].owner == owner);
    _;
  }

  function Documenter(address _authentication) public {
    authentication = Authentication(_authentication);
  }

  function getAuthentication() public onlyOwner returns (Authentication) {
    return authentication;
  }

  function notarizeDocument(bytes32 _hash, bytes _name, bytes _multihash, uint _timestamp) public isNewDocument(_hash) returns (bool) {
    Model.Document memory document = Model.Document({owner: msg.sender, name: _name, hash: _hash, multihash: _multihash, added: _timestamp});
    storeDocument(document);
  }

  function storeDocument(Model.Document _document) private {
    poe[_document.hash] = _document;

    authentication.addDocument(_document.owner, _document.hash);

    LogNewDocument(_document.name, _document.hash, _document.multihash, _document.owner, _document.added);
  }

  function documentExists(bytes32 _hash) public view returns (bool) {
    return poe[_hash].name.length != 0;
  }

  function getDocumentData(bytes32 _hash) public view isDocumentOwner(_hash, msg.sender) returns (bytes name, bytes32 fileHash, bytes multihash, address owner, uint timestamp) {
    Model.Document memory document = poe[_hash];
    return (document.name, document.hash, document.multihash, document.owner, document.added);
  }
}
