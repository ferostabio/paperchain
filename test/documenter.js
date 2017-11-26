const Authentication = artifacts.require("./Authentication.sol")
const Documenter = artifacts.require("./Documenter.sol")
const fs = require("../utils/file.js")

const testFileName = "masque.txt"
const testFilePath = "./assets/" + testFileName
const defaultErrorMessage = "Call shouldn't succeed"
const testFileStorageHash = "QmPTHYApwdcyMvHHvwCqvu7sZwjw7kuMGTMEQFzdKKA1my"

function watchDocuments(documenter, account, currentBlock, fileHash, testFileName, defaultTx) {
  return new Promise((resolve, reject) => {
    var event = documenter.LogNewDocument({owner: account}, {fromBlock: currentBlock, toBlock: "latest"})
    event.watch((error, result) => {
      resolve(error)
      event.stopWatching()
    })
    documenter.notarizeDocument(fileHash, testFileName, testFileStorageHash, Date.now(), defaultTx)
  })
}

contract("Documenter", accounts => {
  let authentication, documenter, fileHash = {}

  const defaultAccount = accounts[0]
  const defaultTx = { from: defaultAccount }
  const now = Date.now()
  var notarize = false // Variable set to false each time i need beforeEach not to notarize a document

  beforeEach(async () =>  {
    authentication = await Authentication.new();
    await authentication.signup('user', defaultTx)
    documenter = await Documenter.new(authentication.address)
    if (notarize) {
      await documenter.notarizeDocument(fileHash, testFileName, testFileStorageHash, now, defaultTx)
    }
  })

  it("should properly handle hashes, that's what's poe is all about", async () => {
    fileHash = await fs.hashFile(testFilePath)
    var exists = await documenter.documentExists.call(fileHash)
    assert.isNotOk(exists, "Hash already exists")

    await documenter.notarizeDocument(fileHash, testFileName, testFileStorageHash, now, defaultTx)
    exists = await documenter.documentExists.call(fileHash)
    assert.isOk(exists, "Didn't add hash")
    notarize = true
  })

  it("should properly store document data", async () => {
    var data = await documenter.getDocumentData(fileHash, defaultTx)

    assert.equal(web3.toAscii(data[0]), testFileName, "Wrong file name")
    assert.equal(web3.toAscii(data[1]), fileHash, "File hash different")
    assert.equal(web3.toAscii(data[2]), testFileStorageHash, "Storage hash different")
    assert.equal(data[3], defaultAccount, "File owner not stored correctly")
    assert.equal(data[4].toNumber(), now, "Wrong date")
  })

  it("should add info to the user after notarizing a document", async () => {
    var hashes = await authentication.getDocuments.call(defaultAccount)
    assert.equal(web3.toAscii(hashes[0]), fileHash, "File hash different")
  })

  it("a user shouldn't get another user's document", async () => {
    try {
      await authentication.getDocuments.call(accounts[1])
      assert(false, "User was able to read another user's file")
    } catch (error) {
      assert.match(error.message, /invalid opcode/, defaultErrorMessage)
    }
  })

  it("a user shouldn't be able to add an existing document", async () => {
    try {
      await documenter.notarizeDocument(fileHash, testFileName, testFileStorageHash, Date.now(), defaultTx)
      assert(false, "User added an existing document")
    } catch (error) {
      assert.match(error.message, /invalid opcode/, defaultErrorMessage)
    }
    notarize = false
  })

  it("should fire an event when a new file is added", async () => {
    var error = await watchDocuments(documenter, defaultAccount, web3.eth.blockNumber, fileHash, testFileName, defaultTx)
    assert.equal(error, null, "Watcher returned error")
  })
})
