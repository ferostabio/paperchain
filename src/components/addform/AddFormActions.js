import store from '../../store'
import paperchain from '../../paperchain'

export function addPaper(file, refereed, description, quotes) {
  const { storage } = store.getState().storage
  if (storage === null) {
    return alert('There seems to be a problem with IPFS, please try again later')
  }

  console.log(file)
  /*
  let web3 = store.getState().web3.web3Instance

  // Double-check web3's status.
  if (typeof web3 !== 'undefined') {

    return function(dispatch) {
      // Using truffle-contract we create the authentication object.
      const authentication = contract(AuthenticationContract)
      authentication.setProvider(web3.currentProvider)

      // Declaring this for later so we can chain functions on Authentication.
      let authenticationInstance

      // Get current ethereum wallet.
      web3.eth.getCoinbase((error, coinbase) => {
        // Log errors, if any.
        if (error) {
          console.error(error);
        }

        authentication.deployed().then(function(instance) {
          authenticationInstance = instance

          // Attempt to login user.
          authenticationInstance.update(name, {from: coinbase})
          .then(function(result) {
            // If no error, update user.

            dispatch(userUpdated({"name": name}))

            return alert('Name updated!')
          })
          .catch(function(result) {
            // If error...
          })
        })
      })
    }
  } else {
    console.error('Web3 is not initialized.');
  }*/
}
