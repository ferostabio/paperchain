pragma solidity ^0.4.17;

/*
 * Added Model library in order to reuse structs across contracts.
 * This isn't needed. At all. Currently, Authentication.sol uses User
 * and Documenter.sol uses Document. But i wanted to use a library :D
 */

library Model {

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
  }
}
