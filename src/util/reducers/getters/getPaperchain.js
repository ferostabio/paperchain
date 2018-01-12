import Contract from 'truffle-contract'

import Authentication from '../../../../build/contracts/Authentication.json'
import Documenter from '../../../../build/contracts/Documenter.json'

import store from '../../../store'
import promisify from '../../helpers/promisify'
import { PAPERCHAIN_INITIALIZED } from '../paperchainReducer'

import getWeb3 from './getWeb3'

let getPaperchain = new Promise(async (resolve, reject) => {
  const result = await getWeb3
  const web3 = result.instance
  if (typeof web3 !== 'undefined') {
    const authentication = Contract(Authentication)
    authentication.setProvider(web3.currentProvider)
    const documenter = Contract(Documenter)
    documenter.setProvider(web3.currentProvider)
    const accounts = await promisify(web3.eth.getAccounts)

    const defaultAccount = accounts[0]

    const authenticationInstance = await authentication.deployed()
    const documenterInstance = await documenter.deployed()

    const deploymentBlock = await documenterInstance.getDeploymentBlockNumber.call()

    resolve(store.dispatch({
      type: PAPERCHAIN_INITIALIZED,
      account: defaultAccount,
      authentication: authenticationInstance,
      documenter: documenterInstance,
      deploymentBlock: deploymentBlock
    }))
  } else {
    console.error('Web3 is not initialized.')
  }
})

export default getPaperchain
