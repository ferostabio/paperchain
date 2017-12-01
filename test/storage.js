/*
const fs = require("../utils/file.js")
const storage = require("../utils/storage.js")

const testFileName = "masque.txt"
const testFilePath = "./assets/" + testFileName

describe("Storage", () => {

  var multihash

  after(async () => {
    await storage.stop(true)
  })

  // This should be `before`function, but there's an issue with timeouts, so here it is
  it("should initialize descentralized storage", async () => {
    var error = await storage.start('ipfs-' + Math.random())
    assert.equal(error, undefined, "Storage failed initializing")
  }).timeout(10000)

  it("should add file to storage", async () => {
    fileContents = fs.readSync(testFilePath)
    multihash = await storage.add(testFileName, fileContents)
    assert.notEqual(multihash, undefined, "IPFS failed adding a file")
  })

  it("should fetch a file from storage after it has been notarized", async () => {
    var content = await storage.get(multihash)
    assert.equal(content[0].toString(), fileContents.toString(), "Undefined contents of file")
  })
})
*/
