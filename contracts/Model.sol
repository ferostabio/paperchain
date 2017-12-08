pragma solidity ^0.4.17;

 /**
  * @title Model library
  * @notice Created in order to reuse data across contracts.
  * @notice Probably unnecessary though, will probablyy remove it
  * @notice There's an issue with libraries not being able to have modifiers
  * @notice and that's a huge bummer, don't want this to be a contract
  * @notice https://github.com/ethereum/solidity/issues/2467
  */
library Model {

  /*
   * Each document has a category. Well, eventually will have more than one.
   * Current values are just a stub
   */
  enum Field { QUANTUM_PHYSICS, LEPUFOLOGY}

  /*
   * User struct; there's a refactor happening and i'm not entirely sure
   * about some things such as the documentList bytes[]. We'll see.
   */
  struct User {
    bytes name;
    uint field;
    bytes32[] documentList;
    uint numberOfDocuments;
  }
}
