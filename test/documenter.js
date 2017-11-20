const Documenter = artifacts.require("./Documenter.sol")
const fs = require("fs")
const crypto = require("crypto")

const testFileName = "masque.txt"
const testFilePath = "./assets/" + testFileName
const defaultErrorMessage = "Call shouldn't succeed"
const testFileStorageHash = "QmPTHYApwdcyMvHHvwCqvu7sZwjw7kuMGTMEQFzdKKA1my"

function hashTestFile() {
  return new Promise((resolve, reject) => {
    var shasum = crypto.createHash("md5")
    var s = fs.ReadStream(testFilePath)
    s.on("data", function(d) { shasum.update(d) })
    s.on("end", function() {
      resolve(shasum.digest("hex"))
    })
  })
}

function watchDocuments(documenter, account, currentBlock, fileHash, testFileName, defaultTx) {
  return new Promise((resolve, reject) => {
    var event = documenter.LogNewDocument({ddr: account}, {fromBlock: currentBlock, toBlock: "latest"})
    event.watch((error, result) => {
      resolve(error)
      event.stopWatching()
    })
    documenter.notarizeDocument(fileHash, testFileName, testFileStorageHash, Date.now(), defaultTx)
  })
}

contract("Documenter", accounts => {

  var defaultAccount = accounts[0]
  var defaultTx = { from: defaultAccount }
  var fileHash
  var now

  it("should properly handle hashes, that's what's poe is all about", () => {
    var documenter
    return Documenter.deployed().then(instance => {
      documenter = instance
      return hashTestFile()
    }).then(hash => {
      fileHash = hash
      return documenter.documentExists.call(fileHash)
    }).then(exists => {
      assert.isNotOk(exists, "Hash already exists")
      now = Date.now()
      return documenter.notarizeDocument(fileHash, testFileName, testFileStorageHash, now, defaultTx)
    }).then(() => {
      return documenter.documentExists.call(fileHash)
    }).then(exists => {
      assert.isOk(exists, "Didn't add hash")
    })
  })

  it("should properly store document data", () => {
    return Documenter.deployed().then(instance => {
      return instance.getDocumentData(fileHash, defaultTx)
    }).then(args => {
      assert.equal(web3.toAscii(args[0]), testFileName, "Wrong file name")
      assert.equal(web3.toAscii(args[1]), fileHash, "File hash different")
      assert.equal(web3.toAscii(args[2]), testFileStorageHash, "Storage hash different")
      assert.equal(args[3], defaultAccount, "File owner not stored correctly")
      assert.equal(args[4].toNumber(), now, "Wrong date")
    })
  })

  it("should add a user record after notarizing a document", () => {
    var documenter
    return Documenter.new().then(instance => {
      documenter = instance
      return documenter.userExists.call(defaultAccount)
    }).then(exists => {
      assert.isNotOk(exists, "User already exists")
      return documenter.notarizeDocument(fileHash, testFileName, testFileStorageHash, now, defaultTx)
    }).then(() => {
      return documenter.userExists.call(defaultAccount)
    }).then(exists => {
      assert.isOk(exists, "Didn't add user")
    })
  })

  it("should add info to the user after notarizing a document", () => {
    return Documenter.deployed().then(instance => {
      return instance.getUserDocuments(defaultAccount)
    }).then(files => {
      assert.equal(web3.toAscii(files[0]), fileHash, "File hash different")
    })
  })

  it("a user shouldn't get another user's document", () => {
    return Documenter.deployed().then(instance => {
      return instance.getDocumentData(fileHash, { from: accounts[1] })
    }).then(success => {
		      assert(false, "User was able to read another user's file")
       }, error => {
		      assert.match(error.message, /invalid opcode/, defaultErrorMessage)
    })
  })

  it("a user shouldn't be able to add an existing document", () => {
    return Documenter.deployed().then(instance => {
      return instance.notarizeDocument(fileHash, testFileName, testFileStorageHash, Date.now(), defaultTx)
    }).then(success => {
		      assert(false, "User added an existing document")
       }, error => {
		      assert.match(error.message, /invalid opcode/, defaultErrorMessage)
    })
  })

  it("should fire an event when a new file is added", () => {
    return Documenter.new().then(instance => {
      return watchDocuments(instance, defaultAccount, web3.eth.blockNumber, fileHash, testFileName, defaultTx)
    }).then(error => {
      assert.equal(error, null, "Watcher returned error")
    })
  })
})
