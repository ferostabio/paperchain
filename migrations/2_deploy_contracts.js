var Model = artifacts.require("./Model.sol")
var Authentication = artifacts.require("./Authentication.sol")
var Documenter = artifacts.require("./Documenter.sol")

module.exports = deployer => {
  deployer.deploy(Model).then(() => {
    return deployer.deploy(Authentication)
  }).then(() => {
    return deployer.deploy(Documenter, Authentication.address)
  }).then(() => {

  })
}
