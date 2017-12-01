const Authentication = artifacts.require("./Authentication.sol")
const Documenter = artifacts.require("./Documenter.sol")
const fs = require("../utils/file.js")

const testFileName = "masque.txt"
const testFilePath = "./assets/" + testFileName
const defaultErrorMessage = "Call shouldn't succeed"
const testFileStorageHash = "QmPTHYApwdcyMvHHvwCqvu7sZwjw7kuMGTMEQFzdKKA1my"

function documentEvent(documenter, account, currentBlock, testFileName, fileHash) {
  return documenter.LogNewDocument({owner: account}, {fromBlock: currentBlock, toBlock: "latest"})
}

function watchDocuments(documenter, account, currentBlock, testFileName, fileHash) {
  return new Promise((resolve, reject) => {
    var event = documentEvent(documenter, account, currentBlock, testFileName, fileHash)
    event.watch((error, result) => {
      resolve(error)
      event.stopWatching()
    })
    documenter.notarizeDocument(testFileName, fileHash, testFileStorageHash, Date.now(), { from: account})
  })
}

function getDocuments(documenter, account, currentBlock, fileHash, testFileName) {
  return new Promise((resolve, reject) => {
    var event = documentEvent(documenter, account, currentBlock, testFileName, fileHash)
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
  const defaultVisibility = false
  const now = Date.now()
  var notarize = false // Variable set to false each time i need beforeEach not to notarize a document

  beforeEach(async () =>  {
    authentication = await Authentication.new();
    await authentication.signup('user', defaultTx)
    documenter = await Documenter.new(authentication.address)
    if (notarize) {
      await documenter.notarizeDocument(testFileName, fileHash, testFileStorageHash, now, defaultTx)
    }
  })

  it("should properly handle hashes, that's what's poe is all about", async () => {
    fileHash = await fs.hashFile(testFilePath)
    var exists = await documenter.documentExists.call(fileHash)
    assert.isNotOk(exists, "Hash already exists")

    await documenter.notarizeDocument(testFileName, fileHash, testFileStorageHash, now, defaultTx)
    exists = await documenter.documentExists.call(fileHash)
    assert.isOk(exists, "Didn't add hash")
    notarize = true
  })

  it("should properly store document data", async () => {
    var block = await documenter.getDeploymentBlockNumber.call()
    var result = await getDocuments(documenter, defaultAccount, block.toNumber(), testFileName, fileHash)
    var data = result[0].args

    assert.equal(data.name, testFileName, "Wrong file name")
    assert.equal(web3.toAscii(data.hash), fileHash, "Document hash different")
    assert.equal(web3.toAscii(data.multihash), testFileStorageHash, "Storage hash different")
    assert.equal(data.timestamp.toNumber(), now, "Document with wrong date")
    assert.equal(data.owner, defaultAccount, "Document owner not stored correctly")
  })

  it("a user should get another user's document", async () => {
    var block = await documenter.getDeploymentBlockNumber.call()
    var result = await getDocuments(documenter, accounts[1], block.toNumber(), testFileName, fileHash)
    var data = result[0].args

    assert.equal(data.name, testFileName, "Wrong file name")
    assert.equal(web3.toAscii(data.hash), fileHash, "Document hash different")
    assert.equal(web3.toAscii(data.multihash), testFileStorageHash, "Storage hash different")
    assert.equal(data.timestamp.toNumber(), now, "Document with wrong date")
    assert.equal(data.owner, defaultAccount, "Document owner not stored correctly")
  })

  it("a user shouldn't be able to add an existing document", async () => {
    try {
      await documenter.notarizeDocument(testFileName, fileHash, testFileStorageHash, Date.now(), defaultTx)
      assert(false, "User added an existing document")
    } catch (error) {
      assert.match(error.message, /invalid opcode/, defaultErrorMessage)
    }
    notarize = false
  })

  it("should fire an event when a new file is added", async () => {
    var error = await watchDocuments(documenter, defaultAccount, web3.eth.blockNumber, testFileName, fileHash)
    assert.equal(error, null, "Watcher returned error")
  })
})
