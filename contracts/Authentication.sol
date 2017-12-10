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
   * @param _field of the paper
   * @notice duplicated from Authentication.sol, check Model.sol comment
   */
  modifier isFieldValid(uint _field) {
    require(uint(Model.Field.LEPUFOLOGY) >= _field);
    _;
  }

  /**
   * @dev modifier that checks if a user can validate a paper
   * @param _hash of the paper
   * @notice only checks that the user hasn't reviewed the paper
   * @notice checking that the paper can be reviewed should be done from web3
   */
  modifier canReviewPaper(bytes32 _hash) {
    require(userExists(msg.sender));
    require(users[msg.sender].reviews[_hash] == false)
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
   * @dev function that performs a peer review
   * @param _hash of the paper
   */
  function reviewPaper(bytes32 _hash) public canReviewPaper(_hash) {
    users[msg.sender].reviews[_hash] = true;
  }
}
