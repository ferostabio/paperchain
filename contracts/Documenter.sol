pragma solidity ^0.4.17;

contract Documenter {

  // Structs

  struct User {
    bool exists;
    address owner;
    bytes32[] documentList;
    uint numberOfDocuments;
  }

  struct Document {
    bool exists;
    address owner;
    bytes name;
    bytes multihash;
    bytes32 hash;
    uint added;
  }

  // Variables

  // Hashes should be SHA-256, but they doesn't fit in 32 bytes, you have to use bytes; they're a dynamic array, so if you want to return a list of them to the outside world you end up with https://github.com/willitscale/learning-solidity/blob/master/support/NESTED_ARRAYS_NOT_IMPLEMENTED.MD mayhem. MD5 is good enough to start with.
  mapping (bytes32 => Document) poe;
  bytes32[] hashList;
  uint numberOfHashes;

  mapping (address => User) users;
  address[] userList;
  uint numberOfUsers;

  // Events

  event LogNewDocument(bytes name, bytes32 hash, bytes multihash, address owner, uint timestamp);

  // Modifiers

  modifier isNewDocument(bytes32 hash) {
    require(!documentExists(hash));
    _;
  }

  modifier isDocumentOwner(bytes32 hash, address owner) {
    require(documentExists(hash));
    require(poe[hash].owner == owner);
    _;
  }

  // Document

  function notarizeDocument(bytes32 hash, bytes name, bytes multihash, uint timestamp) public isNewDocument(hash) returns (bool) {
    Document memory document = Document({owner: msg.sender, name: name, hash: hash, multihash: multihash, added: timestamp, exists: true});
    storeDocument(document);
  }

  function storeDocument(Document document) private {
    poe[document.hash] = document;
    hashList.push(document.hash);
    numberOfHashes++;

    if (!userExists(document.owner)) {
      addUser(document.owner);
    }

    User storage user = users[document.owner];
    user.documentList.push(document.hash);
    user.numberOfDocuments++;

    LogNewDocument(document.name, document.hash, document.multihash, document.owner, document.added);
  }

  function documentExists(bytes32 hash) public view returns (bool) {
    return poe[hash].exists;
  }

  function getDocumentData(bytes32 hash) public view isDocumentOwner(hash, msg.sender) returns (bytes name, bytes32 fileHash, bytes multihash, address owner, uint timestamp) {
    Document memory document = poe[hash];
    return (document.name, document.hash, document.multihash, document.owner, document.added);
  }

  // User

  function addUser(address source) private {
    users[source] = User({owner: source, exists: true, numberOfDocuments: 0, documentList: new bytes32[](0)});
    userList.push(source);
    numberOfUsers++;
  }

  function userExists(address source) public view returns (bool) {
    return users[source].exists;
  }

  function getUserDocuments(address source) public view returns (bytes32[]) {
    return users[source].documentList;
  }
}
