var Documenter = artifacts.require("./Documenter.sol")

module.exports = deployer => {
  deployer.deploy(Documenter)
}
