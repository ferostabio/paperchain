import store from '../../store'
import Web3 from 'web3'

import { WEB3_INITIALIZED } from './web3Reducer'

function web3Initialized(web3) {
  return {
    type: WEB3_INITIALIZED,
    instance: web3
  }
}

let getWeb3 = new Promise(function(resolve, reject) {
  // Wait for loading completion to avoid race conditions with web3 injection timing.
  window.addEventListener('load', function(dispatch) {
    let results
    let web3 = window.web3
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider.
      web3 = new Web3(web3.currentProvider)
      resolve(store.dispatch(web3Initialized(web3)))
    } else {
      // Fallback to localhost if no web3 injection. We've configured this to
      // use the development console's port by default.
      const provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545')
      web3 = new Web3(provider)
      resolve(store.dispatch(web3Initialized(web3)))
    }
  })
})

export default getWeb3
