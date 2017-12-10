const Authentication = artifacts.require("./Authentication.sol")
const Documenter = artifacts.require("./Documenter.sol")
const fs = require("../utils/file.js")

const testFileName = "masque.txt"
const testFilePath = "./assets/" + testFileName
const defaultErrorMessage = "Call shouldn't succeed"
const testFileStorageHash = "QmPTHYApwdcyMvHHvwCqvu7sZwjw7kuMGTMEQFzdKKA1my"

function documentEvent(documenter, account, currentBlock) {
  return documenter.LogNewDocument({owner: account}, {fromBlock: currentBlock, toBlock: "latest"})
}

function watchDocuments(documenter, account, currentBlock, name, field, refereed, hash) {
  return new Promise((resolve, reject) => {
    var event = documentEvent(documenter, account, currentBlock)
    event.watch((error, result) => {
      resolve(error)
      event.stopWatching()
    })
    documenter.notarizeDocument(name, field, refereed, [], hash, testFileStorageHash, Date.now(), { from: account})
  })
}

function getDocuments(documenter, account, currentBlock) {
  return new Promise((resolve, reject) => {
    var event = documentEvent(documenter, account, currentBlock)
    event.get((error, result) => {
      resolve(result)
      event.stopWatching()
    })
  })
}

contract("Documenter", accounts => {
  let authentication, documenter, fileHash = {}

  const defaultAccount = accounts[0]
  const defaultTx = { from: defaultAccount }
  const defaultField = 1
  const defaultRefereedStatus = true
  const now = Date.now()
  var notarize = false // Variable set to false each time i need beforeEach not to notarize a document

  beforeEach(async () =>  {
    authentication = await Authentication.new();
    await authentication.signup('user', 0, defaultTx)
    documenter = await Documenter.new(authentication.address)
    if (notarize) {
      await documenter.notarizeDocument(testFileName, defaultField, defaultRefereedStatus, [], fileHash, testFileStorageHash, now, defaultTx)
    }
  })

  it("should properly handle hashes, that's what's poe is all about", async () => {
    fileHash = await fs.hashFile(testFilePath)
    var exists = await documenter.documentExists.call(fileHash)
    assert.isNotOk(exists, "Hash already exists")

    await documenter.notarizeDocument(testFileName, defaultField, defaultRefereedStatus, [], fileHash, testFileStorageHash, now, defaultTx)
    exists = await documenter.documentExists.call(fileHash)
    assert.isOk(exists, "Didn't add hash")
    notarize = true
  })

  it("should properly store document data", async () => {
    var block = await documenter.getDeploymentBlockNumber.call()
    var result = await getDocuments(documenter, defaultAccount, block.toNumber())
    var data = result[0].args

    assert.equal(data.name, testFileName, "Wrong file name")
    assert.equal(data.field.toNumber(), 1, "Wrong file field")
    assert.equal(web3.toAscii(data.hash), fileHash, "Document hash different")
    assert.equal(web3.toAscii(data.multihash), testFileStorageHash, "Storage hash different")
    assert.equal(data.timestamp.toNumber(), now, "Document with wrong date")
    assert.equal(data.owner, defaultAccount, "Document owner not stored correctly")
  })

  it("a user shouldn't be able to add an existing document", async () => {
    try {
      await documenter.notarizeDocument(testFileName, defaultField, defaultRefereedStatus, [], fileHash, testFileStorageHash, Date.now(), defaultTx)
      assert(false, "User added an existing document")
    } catch (error) {
      assert.match(error.message, /invalid opcode/, defaultErrorMessage)
    }
    notarize = false
  })

  it("a user shouldn't be able to notarize a document with an invalid field", async () => {
    try {
      await documenter.notarizeDocument(testFileName, 2, defaultRefereedStatus, [], fileHash, testFileStorageHash, Date.now(), defaultTx)
      assert(false, "User added a document with invalid field")
    } catch (error) {
      assert.match(error.message, /invalid opcode/, defaultErrorMessage)
    }
    notarize = false
  })

  it("shouldn't notarize a document with a not existing quote", async () => {
    try {
      await documenter.notarizeDocument(testFileName, defaultField, defaultRefereedStatus, ["meesa_not_exists"], fileHash, testFileStorageHash, Date.now(), defaultTx)
      assert(false, "User added a document with not existing quote")
    } catch (error) {
      assert.match(error.message, /invalid opcode/, defaultErrorMessage)
    }
    notarize = false
  })

  it("should fire an event when a new file is added", async () => {
    var error = await watchDocuments(documenter, defaultAccount, web3.eth.blockNumber, testFileName, defaultField, defaultRefereedStatus, fileHash)
    assert.equal(error, null, "Watcher returned error")
  })
})
