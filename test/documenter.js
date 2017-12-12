const Authentication = artifacts.require("./Authentication.sol")
const Documenter = artifacts.require("./Documenter.sol")
const fs = require("../utils/file.js")

const testFileName = "masque.txt"
const testFilePath = "./assets/" + testFileName
const defaultErrorMessage = "Call shouldn't succeed"
const testFileStorageHash = "QmPTHYApwdcyMvHHvwCqvu7sZwjw7kuMGTMEQFzdKKA1my"

function paperEvent(documenter, account, currentBlock) {
  return documenter.LogPaper({owner: account}, {fromBlock: currentBlock, toBlock: "latest"})
}

function watchPapers(documenter, account, currentBlock, name, field, refereed, hash) {
  return new Promise((resolve, reject) => {
    const event = paperEvent(documenter, account, currentBlock)
    event.watch((error, result) => {
      resolve(error)
      event.stopWatching()
    })
    documenter.publishPaper(name, field, refereed, [], hash, testFileStorageHash, Date.now(), { from: account})
  })
}

function getPapers(documenter, account, currentBlock) {
  return new Promise((resolve, reject) => {
    const event = paperEvent(documenter, account, currentBlock)
    event.get((error, result) => {
      resolve(result)
      event.stopWatching()
    })
  })
}

function getReviews(documenter, filter, currentBlock) {
  return new Promise((resolve, reject) => {
    const event = documenter.LogReview(filter, {fromBlock: currentBlock, toBlock: "latest"})
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
  let notarize = false // Variable set to false each time i need beforeEach not to notarize a paper

  beforeEach(async () =>  {
    authentication = await Authentication.new();
    await authentication.signup('user', 0, defaultTx)
    documenter = await Documenter.new(authentication.address)
    if (notarize) {
      await documenter.publishPaper(testFileName, defaultField, defaultRefereedStatus, [], fileHash, testFileStorageHash, now, defaultTx)
    }
  })

  it("should properly handle hashes, that's what's poe is all about", async () => {
    fileHash = await fs.hashFile(testFilePath)
    let exists = await documenter.paperExists.call(fileHash)
    assert.isNotOk(exists, "Hash already exists")

    await documenter.publishPaper(testFileName, defaultField, defaultRefereedStatus, [], fileHash, testFileStorageHash, now, defaultTx)
    exists = await documenter.paperExists.call(fileHash)
    assert.isOk(exists, "Didn't add hash")
    notarize = true
  })

  it("should properly store paper data", async () => {
    const block = await documenter.getDeploymentBlockNumber.call()
    const result = await getPapers(documenter, defaultAccount, block.toNumber())
    const data = result[0].args

    assert.equal(data.name, testFileName, "Wrong file name")
    assert.equal(data.field.toNumber(), 1, "Wrong file field")
    assert.equal(web3.toAscii(data.hash), fileHash, "Paper hash different")
    assert.equal(web3.toAscii(data.multihash), testFileStorageHash, "Storage hash different")
    assert.equal(data.timestamp.toNumber(), now, "Paper with wrong date")
    assert.equal(data.owner, defaultAccount, "Paper owner not stored correctly")
  })

  it("a user shouldn't be able to add an existing paper", async () => {
    try {
      await documenter.publishPaper(testFileName, defaultField, defaultRefereedStatus, [], fileHash, testFileStorageHash, Date.now(), defaultTx)
      assert(false, "User added an existing paper")
    } catch (error) {
      assert.match(error.message, /invalid opcode/, defaultErrorMessage)
    }
    notarize = false
  })

  it("a user shouldn't be able to notarize a paper with an invalid field", async () => {
    try {
      await documenter.publishPaper(testFileName, 2, defaultRefereedStatus, [], fileHash, testFileStorageHash, Date.now(), defaultTx)
      assert(false, "User added a paper with invalid field")
    } catch (error) {
      assert.match(error.message, /invalid opcode/, defaultErrorMessage)
    }
    notarize = false
  })

  it("shouldn't notarize a paper with a not existing quote", async () => {
    try {
      await documenter.publishPaper(testFileName, defaultField, defaultRefereedStatus, ["meesa_not_exists"], fileHash, testFileStorageHash, Date.now(), defaultTx)
      assert(false, "User added a paper with not existing quote")
    } catch (error) {
      assert.match(error.message, /invalid opcode/, defaultErrorMessage)
    }
    notarize = false
  })

  it("should fire an event when a new file is added", async () => {
    const error = await watchPapers(documenter, defaultAccount, web3.eth.blockNumber, testFileName, defaultField, defaultRefereedStatus, fileHash)
    assert.equal(error, null, "Watcher returned error")
    notarize = true
  })

  it("a user should be able to perform a peer review", async () => {
    const refereeTx = {from: accounts[1] }
    await authentication.signup('other user', 0, refereeTx)
    await documenter.reviewPaper(fileHash, refereeTx)
    const block = await documenter.getDeploymentBlockNumber.call()
    const reviewsMadeByUserResult = await getReviews(documenter, {user: accounts[1]}, block)
    assert.equal(reviewsMadeByUserResult.length, 1, "Wrong number of user reviews")
    const reviewsReceivedByPaperResult = await getReviews(documenter, {hash: fileHash}, block)
    assert.equal(reviewsReceivedByPaperResult.length, 1, "Wrong number of reviews received by paper")
    try {
      await documenter.reviewPaper("non_existing_hash", refereeTx)
      assert(false, "User reviewed a non existing paper")
      await documenter.reviewPaper(fileHash, refereeTx)
      assert(false, "User reviewed a paper for a second time")
      await documenter.reviewPaper(fileHash, defaultTx)
      assert(false, "User reviewed a paper of his own")
    } catch (error) {
      // Calls are supposed to throw
    }
  })
})
