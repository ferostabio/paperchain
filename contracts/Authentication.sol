pragma solidity ^0.4.17;

import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title Authentication
 * @notice Contract that handles user auth and stores user data
 */
contract Authentication is Ownable {

  /*
   * User struct; there's a refactor happening and i'm not entirely sure
   * about some things such as the documentList bytes[]. We'll see.
   */
  struct User {
    bytes name;
    bytes32[] documentList;
    uint numberOfDocuments;
  }

  /*
   * Mapping of address -> User struct
   * Next to address array and number of users uint, to be able to iterate and return all
   */
  mapping (address => User) private users;
  address[] private userList;
  uint private numberOfUsers;

  /**
   * @dev event for a user signup
   * @param name of the user
   * @param user address
   */
  event LogSignup(bytes name, address user);

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
   * @dev function that checks if a user exists
   * @param _sender address
   * @return a boolean value indicating if the user exists
   */
  function userExists(address _sender) public view returns (bool) {
    return users[_sender].name.length != 0;
  }

  /**
   * @dev function that performs a user login
   * @return bytes representing the user's name
   */
  function login() public view isExistingUser(msg.sender) returns (bytes) {
    return (users[msg.sender].name);
  }

  /**
   * @dev function that performs a user signup
   * @param _name of the user
   * @return bytes representing the user's name
   */
  function signup(bytes _name) public isValidName(_name) returns (bytes) {
    if (!userExists(msg.sender)) {
      users[msg.sender].name = _name;
      LogSignup(_name, msg.sender);
    }
    return (users[msg.sender].name);
  }

  /**
   * @dev function that adds a document to a user
   * @param _owner address
   * @param _hash of the document
   */
  function addDocument(address _owner, bytes32 _hash) public isExistingUser(_owner) {
    User storage user = users[_owner];
    user.documentList.push(_hash);
    user.numberOfDocuments++;
  }

  /**
   * @dev helper function that returns a user's number of documents
   * @param _owner address
   */
  function getNumberOfDocuments(address _owner) public view isExistingUser(_owner) returns (uint) {
    User storage user = users[_owner];
    return user.numberOfDocuments;
  }
}
