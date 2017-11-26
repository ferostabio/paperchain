pragma solidity ^0.4.17;

import "./Model.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";

contract Authentication is Ownable {

  mapping (address => Model.User) private users;
  address[] private userList;
  uint private numberOfUsers;

  event LogSignup(bytes name, address user);

  modifier isExistingUser(address _user) {
    require(userExists(_user));
    _;
  }

  modifier isValidName(bytes _name) {
    require(!(_name.length == 0));
    _;
  }

  function userExists(address _sender) public view returns (bool) {
    return users[_sender].name.length != 0;
  }

  function login() public view isExistingUser(msg.sender) returns (bytes) {
    return (users[msg.sender].name);
  }

  function signup(bytes _name) public isValidName(_name) returns (bytes) {
    if (!userExists(msg.sender)) {
      // Shouldn't i create the user first?
      users[msg.sender].name = _name;
      LogSignup(_name, msg.sender);
    }
    return (users[msg.sender].name);
  }

  function addDocument(address _owner, bytes32 _hash) public isExistingUser(_owner) {
    Model.User storage user = users[_owner];
    user.documentList.push(_hash);
    user.numberOfDocuments++;
  }

  function getDocuments(address _source) public view isExistingUser(_source) returns (bytes32[]) {
    return users[_source].documentList;
  }
/*
  struct User {
    bytes name;
    bytes32[] documentList;
    uint numberOfDocuments;
  }

  struct Document {
    address owner;
    bytes name;
    bytes multihash;
    bytes32 hash;
    uint added;
  }*/
}
