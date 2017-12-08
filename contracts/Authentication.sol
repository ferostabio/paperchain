pragma solidity ^0.4.17;

import "./Model.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title Authentication
 * @notice Contract that handles user auth and stores user data
 */
contract Authentication is Ownable {

  /*
   * Mapping of address -> User struct
   * Next to address array and number of users uint, to be able to iterate and return all
   */
  mapping (address => Model.User) private users;
  address[] private userList;
  uint private numberOfUsers;

  /**
   * @dev event for a user signup
   * @param name of the user
   * @param field of the user
   * @param user address
   */
  event LogSignup(bytes name, uint field, address user);

  /**
   * @dev modifier that checks if a user exists
   * @param _user address
   */
  modifier isExistingUser(address _user) {
    require(userExists(_user));
    _;
  }

  /**
   * @dev modifier that checks if a user name is valid
   * @param _name of the user
   */
  modifier isValidName(bytes _name) {
    require(!(_name.length == 0));
    _;
  }

  /**
   * @dev modifier that checks if a field is valid
   * @param _field of the document
   * @notice duplicated from Authentication.sol, check Model.sol comment
   */
  modifier isFieldValid(uint _field) {
    require(uint(Model.Field.LEPUFOLOGY) >= _field);
    _;
  }

  /**
   * @dev function that checks if a user exists
   * @param _sender address
   * @return a boolean value indicating if the user exists
   */
  function userExists(address _sender) public view returns (bool) {
    return users[_sender].name.length != 0;
  }

  /**
   * @dev function that performs a user login
   * @return name of the user, in bytes
   * @return field of the user
   */
  function login() public view isExistingUser(msg.sender) returns (bytes name, uint field) {
    return (users[msg.sender].name, users[msg.sender].field);
  }

  /**
   * @dev function that performs a user signup
   * @param _name of the user
   * @param _field of the user
   * @return bytes representing the user's name
   */
  function signup(bytes _name, uint _field) public isValidName(_name) isFieldValid(_field) returns (bytes) {
    if (!userExists(msg.sender)) {
      users[msg.sender].name = _name;
      users[msg.sender].field = _field;
      LogSignup(_name, _field, msg.sender);
    }
    return (users[msg.sender].name);
  }

  /**
   * @dev function that adds a document to a user
   * @param _owner address
   * @param _hash of the document
   */
  function addDocument(address _owner, bytes32 _hash) public isExistingUser(_owner) {
    Model.User storage user = users[_owner];
    user.documentList.push(_hash);
    user.numberOfDocuments++;
  }

  /**
   * @dev helper function that returns a user's number of documents
   * @param _owner address
   */
  function getNumberOfDocuments(address _owner) public view isExistingUser(_owner) returns (uint) {
    Model.User storage user = users[_owner];
    return user.numberOfDocuments;
  }
}
