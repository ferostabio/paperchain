const Authentication = artifacts.require("./Authentication.sol")

function watchSignup(authentication, account, currentBlock, name) {
  return new Promise((resolve, reject) => {
    var event = authentication.LogSignup({user: account}, {fromBlock: currentBlock, toBlock: "latest"})
    event.watch((error, result) => {
      resolve(error)
      event.stopWatching()
    })
    authentication.signup(name, {from: account})
  })
}

before(async () => {
  authentication = await Authentication.new();
})
/*
contract("Authentication", accounts => {
  const defaultAccount = accounts[0]
  const otherAccount = accounts[1]
  it("should sign up and log in a user.", async () => {
    username = "testuser"
    await authentication.signup(username, {from: defaultAccount})
    var name = await authentication.login.call()
    assert.equal(web3.toUtf8(name), username, "The user was not signed up")
  })

  it("should not log in an unexisting user", async () => {
    try {
      await authentication.login.call({from: otherAccount})
      assert(false, "Non existing user was able to login")
    } catch (error) {
      assert.match(error.message, /invalid opcode/, "Call failed but for who knows why")
    }
  })

  it("should not sign up with invalid name", async () => {
    try {
      await authentication.signup("", {from: otherAccount})
      assert(false, "User was able to sign up with empty name")
    } catch (error) {
      assert.match(error.message, /invalid opcode/, "Call failed but for who knows why")
    }
  })

  it("should fire an event when a user signs up", async () => {
    var error = await watchSignup(authentication, otherAccount, web3.eth.blockNumber, "Vitalik")
    assert.equal(error, null, "Watcher returned error")
  })

  it("should add and retrieve document data", async () => {
    var first = await authentication.getNumberOfDocuments.call(defaultAccount)
    await authentication.addDocument(defaultAccount, "hash")
    var second = await authentication.getNumberOfDocuments.call(defaultAccount)
    assert.equal(++first, second, "Document wasn't added as it should")
  })
})*/
