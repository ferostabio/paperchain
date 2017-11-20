const fs = require("fs")
const storage = require("../src/storage.js")

const testFileName = "masque.txt"
const testFilePath = "./assets/" + testFileName

describe("Storage", () => {

  var multihash
  var fileContents

  after(() => {
    console.log("Stopping descentralized storage and cleaning disk")
    return storage.stop(true).then(() => {
      process.exit
    })
  })

  // This should be `before`function, but there's an issue with timeouts, so here it is
  it("should initialize descentralized storage", () => {
    console.log("Starting descentralized storage")
    return storage.start('ipfs-' + Math.random()).then(error => {
      assert.equal(error, undefined, "Storage failed initializing")
    })
  }).timeout(100000)

  it("should add file to storage", () => {
    fileContents = fs.readFileSync(testFilePath)
    return storage.add(testFileName, fileContents).then(hash => {
      assert.notEqual(hash, undefined, "IPFS failed adding a file")
      multihash = hash
    })
  })

  it("should fetch a file from storage after it has been notarized", () => {
    return storage.get(multihash).then(content => {
      assert.equal(content.toString(), fileContents.toString(), "Undefined contents of file")
    })
  })
})
