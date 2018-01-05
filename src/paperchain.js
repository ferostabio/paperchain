import store from './store'
import promisify from './util/promisify'

import AuthenticationContract from '../build/contracts/Authentication.json'
const CryptoJS = require("crypto-js")
const contract = require('truffle-contract')

import { USER_LOGGED_IN } from './util/userReducer'

module.exports.login = () => {
  const web3 = store.getState().web3.instance
  const { authentication, account } = store.getState().paperchain
  return new Promise(async (resolve, reject) => {
    try {
      const result = await authentication.login.call({from: account})
      const payload = { type: USER_LOGGED_IN, data: { name: web3.toUtf8(result[0]), field: result[1].toNumber()}}
      resolve(store.dispatch(payload))
    } catch (error) {
      reject(error)
    }
  })
}

module.exports.signup = (name, field) => {
  const { authentication, account } = store.getState().paperchain
  return new Promise(async (resolve, reject) => {
    try {
      await authentication.signup(name, field, {from: account})
      const payload = { type: USER_LOGGED_IN, data: { name: name, field: field}}
      resolve(store.dispatch(payload))
    } catch (error) {
      reject(error)
    }
  })
}

module.exports.addPaper = (file, refereed, description, quotes) => {
  const { documenter, account } = store.getState().paperchain
  const { storage } = store.getState().storage
  const { field } = store.getState().user.data
  return new Promise(async (resolve, reject) => {
    // read file and get it's hash
    const reader = new FileReader()
    reader.onload = async event => {
      if (event === undefined) return
      const binary = event.target.result
      const hash = CryptoJS.MD5(binary).toString()
      // check if the paper exists. hey, this should use `await` instead of promises
      const exists = await documenter.paperExists.call(hash)
      if (exists) {
        alert("Paper already exists")
        return
      }
      const multihash = await storage.add(file.name, Buffer.from(binary))
      if (multihash !== undefined) {
        documenter.publishPaper(file.name, field, refereed, quotes, hash, multihash, Date.now(), { from: account })
      }
    }
    reader.readAsArrayBuffer(file)
  })
}
