pragma solidity ^0.4.17;

 /**
  * @title Model library
  * @notice Created in order to reuse structs across contracts.
  * @notice Completely unnecessary though, will probablyy remove it and
  * @notice move each to it's own contract (User to Auth... and Document to Docu...)
  */
library Model {

  struct User {
    bytes name;
    bytes[] documentList;
    uint numberOfDocuments;
  }

  struct Document {
    bool visibility;
    address owner;
    bytes name;
    bytes multihash;
    bytes32 hash;
    uint added;
  }
}
