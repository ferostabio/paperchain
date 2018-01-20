import store from '../store'
import promisify from './helpers/promisify'

const CryptoJS = require('crypto-js')
const contract = require('truffle-contract')

import { USER_LOGGED_IN } from './reducers/userReducer'
import { GOT_PAPER, UPDATED_QUOTES_MADE, UPDATED_QUOTES_RECEIVED, GOT_REVIEWS, UPDATED_REVIEWS } from './reducers/detailReducer'
import { GOT_PAPERS, UPDATED_PAPERS, GOT_FIELD_PAPERS, UPDATED_FIELD_PAPERS } from './reducers/paperchainReducer'

let watchPapersEvent
let watchFieldPapersEvent
let watchReviewsEvent

/*
 * Some notes on paperchain.js
 * First, this thing should be detached from redux.
 * Second, this functions should be used in the smart contract testing classes
 */

function login() {
  return new Promise(async (resolve, reject) => {
    const web3 = store.getState().web3.instance
    const { authentication, account } = store.getState().paperchain
    try {
      const result = await authentication.login.call({from: account})
      const payload = { type: USER_LOGGED_IN, data: { name: web3.toUtf8(result[0]), field: result[1].toNumber()}}
      resolve(store.dispatch(payload))
    } catch (error) {
      reject(error)
    }
  })
}

function signup(name, field) {
  return new Promise(async (resolve, reject) => {
    const { authentication, account } = store.getState().paperchain
    try {
      await authentication.signup(name, field, {from: account})
      const payload = { type: USER_LOGGED_IN, data: { name: name, field: field}}
      resolve(store.dispatch(payload))
    } catch (error) {
      reject(error)
    }
  })
}

function getPapers() {
  return new Promise(async (resolve, reject) => {
    // load user's papers off-storage ;) -had to simplify some things in order to get started this way, but it's worth it
    const { documenter, account, deploymentBlock } = store.getState().paperchain
    // filter so only papers created by the user are fetched starting when the contract was deployed are fetched (better than zero)
    documenter.LogPaper({owner: account}, {fromBlock: deploymentBlock, toBlock: 'latest'}).get((error, result) => {
      if (error) {
        reject(error)
      } else {
        const papers = result.map(x => { return x.args })
        const payload = { type: GOT_PAPERS, papers: papers }
        resolve(store.dispatch(payload))
      }
    })
  })
}

async function watchPapers() {
  return new Promise(async (resolve, reject) => {
    // first stop current watcher, if there is one
    this.stopWatchingPapers()
    // watch for new registered papers
    const { documenter, account } = store.getState().paperchain
    const web3 = store.getState().web3.instance
    const currentBlock = await promisify(web3.eth.getBlockNumber)
    // filter so only papers created by the user and starting in the current block are fetched
    this.watchPapersEvent = documenter.LogPaper({owner: account}, {fromBlock: currentBlock, toBlock: 'latest'}).watch((error, result) => {
      if (error) {
        reject(error)
      } else {
        const paper = result.args
        const payload = { type: UPDATED_PAPERS, paper: paper }
        resolve(store.dispatch(payload))
      }
    })
  })
}

function stopWatchingPapers() {
  // can probably be simpler
  if (this.watchPapersEvent !== undefined) {
    this.watchPapersEvent.stopWatching()
    this.watchPapersEvent = undefined
  }
}

function getFieldPapers() {
  // loadPapers() variation, a watchFieldPapers method will need to be added as well
  const { documenter, account, deploymentBlock } = store.getState().paperchain
  const { field } = store.getState().user
  return new Promise(async (resolve, reject) => {
    documenter.LogPaper({field: field}, {fromBlock: deploymentBlock, toBlock: 'latest'}).get((error, result) => {
      if (error) {
        reject(error)
      } else {
        const papers = result.map(x => { return x.args }).filter(paper => (paper.owner !== account))
        const payload = { type: GOT_FIELD_PAPERS, papers: papers }
        resolve(store.dispatch(payload))
      }
    })
  })
}

async function watchFieldPapers() {
  return new Promise(async (resolve, reject) => {
    // first stop current watcher, if there is one
    this.stopWatchingFieldPapers()
    // watch for new registered papers
    const { documenter, account, deploymentBlock } = store.getState().paperchain
    const { field } = store.getState().user
    const web3 = store.getState().web3.instance
    const currentBlock = await promisify(web3.eth.getBlockNumber)
    // filter so only papers created by the user and starting in the current block are fetched
    this.watchFieldPapersEvent = documenter.LogPaper({field: field}, {fromBlock: currentBlock, toBlock: 'latest'}).watch((error, result) => {
      if (error) {
        reject(error)
      } else {
        const paper = result.args
        if (paper.owner !== account) {
          const payload = { type: UPDATED_FIELD_PAPERS, paper: paper }
          resolve(store.dispatch(payload))
        }
      }
    })
  })
}

function stopWatchingFieldPapers() {
  if (this.watchFieldPapersEvent !== undefined) {
    this.watchFieldPapersEvent.stopWatching()
    this.watchFieldPapersEvent = undefined
  }
}

function loadPaper(hash) {
  return new Promise((resolve, reject) => {
    const { documenter, account, deploymentBlock } = store.getState().paperchain
    documenter.LogPaper({hash: hash}, {fromBlock: deploymentBlock, toBlock: 'latest'}).get((error, result) => {
      if (error) {
        reject(error)
      } else {
        const paper = result.map(x => { return x.args })[0]
        // No dispatch here!? No.
        resolve(paper)
      }
    })
  })
}

function getPaper(hash) {
  return new Promise((resolve, reject) => {
    loadPaper(hash).then(paper => {
      // Because the dispatch shows up here :-)
      const payload = { type: GOT_PAPER, paper: paper }
      resolve(store.dispatch(payload))
    }).catch(error => {
      reject(error)
    })
  })
}

function getQuotesMadeByPaper(paper) {
  return getQuotes({from: paper.hash})
}

function getQuotesReceivedByPaper(paper) {
  return getQuotes({to: paper.hash})
}

function getQuotes(source) {
  return new Promise(async (resolve, reject) => {
    const { documenter, deploymentBlock } = store.getState().paperchain
    const to = source['from'] !== undefined
    documenter.LogQuote(source, {fromBlock: deploymentBlock, toBlock: 'latest'}).get((error, result) => {
      if (error) {
        reject(error)
      } else {
        const args = result.map(x => { return x.args })
        const actions = args.map(quote => {
          if (to) {
            return loadPaper(quote.to)
          } else {
            return loadPaper(quote.from)
          }
        })
        Promise.all(actions).then(papers => {
          const payload = { type: to ? UPDATED_QUOTES_MADE : UPDATED_QUOTES_RECEIVED, papers: papers }
          resolve(store.dispatch(payload))
        })
      }
    })
  })
}

function getReviews(paper) {
  return new Promise(async (resolve, reject) => {
    const { documenter, account, deploymentBlock } = store.getState().paperchain
    documenter.LogReview({hash: paper.hash}, {fromBlock: deploymentBlock, toBlock: 'latest'}).get((error, result) => {
      if (error) {
        reject(error)
      } else {
        const reviews = result.map(x => { return x.args })
        const payload = { type: GOT_REVIEWS, reviews: reviews }
        resolve(store.dispatch(payload))
      }
    })
  })
}

function watchReviews(paper) {
  return new Promise(async (resolve, reject) => {
    this.stopWatchingReviews()
    // watch for new reviews made by the user
    const { documenter } = store.getState().paperchain
    const web3 = store.getState().web3.instance
    const currentBlock = await promisify(web3.eth.getBlockNumber)
    // filter so only papers created by the user are fetched and starting in the current block
    this.watchReviewsEvent = documenter.LogReview({hash: paper.hash}, {fromBlock: currentBlock, toBlock: 'latest'}).watch((error, result) => {
      if (error) {
        reject(error)
      } else {
        const review = result.args
        const payload = { type: UPDATED_REVIEWS, review: review }
        resolve(store.dispatch(payload))
      }
    })
  })
}

function stopWatchingReviews() {
  if (this.watchReviewsEvent !== undefined) {
    this.watchReviewsEvent.stopWatching()
    this.watchReviewsEvent = undefined
  }
}

function addPaper(file, refereed, description, quotes) {
  return new Promise(async (resolve, reject) => {
    const { documenter, account } = store.getState().paperchain
    const { storage } = store.getState().storage
    const { field } = store.getState().user.data
    // read file and get it's hash
    const reader = new FileReader()
    reader.onload = async event => {
      if (event !== undefined) {
        const binary = event.target.result
        const wa = CryptoJS.lib.WordArray.create(binary)
        const crypto = CryptoJS.MD5(wa)
        const hash = crypto.toString()
        // check if the paper exists.
        const exists = await documenter.paperExists.call(hash)
        if (!exists) {
          const multihash = await storage.add(file.name, Buffer.from(binary))
          if (multihash !== undefined) {
            try {
              await documenter.publishPaper(file.name, field, refereed, quotes, description, hash, multihash, Date.now(), { from: account })
              // I don't think we need to store anything at the moment
              resolve()
            } catch(error) {
              reject(error)
            }
          } else {
            reject(new Error('There was a problem uploading the document'))
          }
        } else {
          reject(new Error('Paper already exists'))
        }
      } else {
        reject(new Error('There was a problem reading the document'))
      }
    }
    reader.readAsArrayBuffer(file)
  })
}

function reviewPaper(paper) {
  return new Promise(async (resolve, reject) => {
    const { documenter, account } = store.getState().paperchain
    try {
      await documenter.reviewPaper(paper.hash, { from: account })
      // Same as above, nothing to notify the store
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

module.exports.login = login
module.exports.signup = signup

module.exports.getPapers = getPapers
module.exports.watchPapers = watchPapers
module.exports.getFieldPapers = getFieldPapers
module.exports.watchFieldPapers = watchFieldPapers
module.exports.stopWatchingPapers = stopWatchingPapers
module.exports.stopWatchingFieldPapers = stopWatchingFieldPapers

module.exports.getReviews = getReviews
module.exports.watchReviews = watchReviews
module.exports.stopWatchingReviews = stopWatchingReviews

module.exports.getPaper = getPaper
module.exports.getQuotesMadeByPaper = getQuotesMadeByPaper
module.exports.getQuotesReceivedByPaper = getQuotesReceivedByPaper

module.exports.addPaper = addPaper
module.exports.reviewPaper = reviewPaper
