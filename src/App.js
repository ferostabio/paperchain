// Libraries
const CryptoJS = require("crypto-js")
const fileDownload = require("js-file-download")

import React, { Component } from 'react'
import Contract from 'truffle-contract'

import Storage from '../utils/storage'
const storage = new Storage()

// Contract Abis
import Authentication from '../build/contracts/Authentication.json'
import Documenter from '../build/contracts/Documenter.json'

// Utils
import getWeb3 from './utils/getWeb3'
import promisify from './utils/promisify'

// Components
import AuthForm from './components/AuthForm'
import AddPaperForm from './components/AddPaperForm'
import PaperList from './components/PaperList'
import PaperReader from './components/PaperReader'
import FieldList from './components/FieldList'

// Currently... everything is here. And i do mean it. Everything. Will eventually grow into a much nicer codebase, of course.
export default class App extends Component {
  constructor(props) {
    super(props)

    // Set default state
    this.state = {
      web3: undefined,
      defaultAccount: undefined, // Default eth account
      authenticationInstance: undefined, // Contract instances
      documenterInstance: undefined,
      storage_started: false, // IPFS state
      user: undefined, // User authentication data
      papers: [], // User papers
      reviews: [], // User reviews
      selectedPaper: undefined, // Currently selected paper
      fields: ["Quantum Physics", "Lepufology"], // Taken from Documenter.sol
      selectedField: 0, // Field related
      fieldPapers: [],
      selectedPaperFromQuotes: [], // Selected paper quotes
      selectedPaperToQuotes: [],
      selectedPaperReviews: [] // Selected paper reviews
    }
  }

  componentWillMount() {
    this.initialize()
    .then(() => {
      this.watchNewPapers()
      this.watchNewReviews()
    })
  }

  async initialize() {
    const { web3 } = await getWeb3

    // setup and store deployed contracts
    const authentication = Contract(Authentication)
    authentication.setProvider(web3.currentProvider)
    const documenter = Contract(Documenter)
    documenter.setProvider(web3.currentProvider)
    const accounts = await promisify(web3.eth.getAccounts)
    console.log(accounts[0])

    const defaultAccount = accounts[0]

    const authenticationInstance = await authentication.deployed()
    const documenterInstance = await documenter.deployed()

    this.setState({
      ...this.state,
      web3,
      defaultAccount,
      authenticationInstance,
      documenterInstance,
    })

    // setup IPFS
    storage.start('ipfs-paperchain').then(error => {
      if (error) {
        console.log(error)
      } else {
        this.setState({
          storage_started: true
        })
      }
    })

    // get logged in user, otherwise request user (un)friendly signup
    let result
    try {
      result = await authenticationInstance.login.call({from: defaultAccount})
      const user = {"name": web3.toUtf8(result[0]), "field": result[1].toNumber()}
      this.didLogin(user)
    } catch (error) {
      console.log(error)
    }

    // No need to have a logged in user to get papers by field
    this.loadFieldPapers(0)
  }

  didLogin(user) {
    // store user in state and load papers
    this.setState({
      ...this.state,
      user: user
    })
    this.loadPapers()
    this.loadReviews()
  }

  async onSignupClicked(name, field) {
    const index = this.state.fields.indexOf(field)
    const { authenticationInstance, defaultAccount} = this.state
    await authenticationInstance.signup(name, index, {from: defaultAccount})
    const user = {"name": name, "field": index}
    this.didLogin(user)
  }

  onPaperAdd(file, refereed, quotes) {
    // check if IPFS setup has completed
    if (this.state.storage_started === false) {
      alert("Please wait for IPFS to finish loading")
      return
    }
    // check if we have a logged in user
    if (this.state.user === undefined) {
      alert("Please sign up before adding the file (hit reload)")
      return
    }
    const { documenterInstance, defaultAccount } = this.state
    const index = this.state.user.field

    // read file and get it's hash
    const reader = new FileReader();
    reader.onload = async event => {
      if (event === undefined) return
      const binary = event.target.result;
      const hash = CryptoJS.MD5(binary).toString()
      // check if the paper exists. hey, this should use `await` instead of promises
      const exists = await documenterInstance.paperExists.call(hash)
      if (exists) {
        alert("Paper already exists")
        return
      }
      const multihash = await storage.add(file.name, Buffer.from(binary))
      if (multihash !== undefined) {
        documenterInstance.publishPaper(file.name, index, refereed, quotes, hash, multihash, Date.now(), { from: defaultAccount })
      }
    }
    reader.readAsArrayBuffer(file)
  }

  async loadPapers() {
    // load user's papers off-storage ;) -had to simplify some things in order to get started this way, but it's worth it
    const { documenterInstance, defaultAccount } = this.state
    const blockNumber = await documenterInstance.getDeploymentBlockNumber.call()
    // filter so only papers created by the user are fetched starting when the contract was deployed are fetched (better than zero)
    documenterInstance.LogPaper({owner: defaultAccount}, {fromBlock: blockNumber, toBlock: "latest"}).get((error, result) => {
      if (error) {
        console.log("Nooooo! " + error)
      } else {
        const papers = result.map(x => { return x.args })
        this.setState({...this.state, papers: papers})
      }
    })
  }

  async watchNewPapers() {
    // watch for new registered papers
    const { web3, documenterInstance, defaultAccount } = this.state
    const blockNumber = await promisify(web3.eth.getBlockNumber)
    // filter so only papers created by the user are fetched and starting in the current block
    documenterInstance.LogPaper({owner: defaultAccount}, {fromBlock: blockNumber, toBlock: "latest"}).watch((error, result) => {
      if (error) {
        console.log("Nooooo! " + error)
      } else {
        console.log("Result: " + JSON.stringify(result.args))
        // just in case: check if the paper hasn't been added already
        if (this.state.papers.filter(paper => (paper.hash === result.args.hash)).length === 0) {
          this.setState({...this.state, papers: [...this.state.papers, result.args]})
        }
      }
    })
  }

  onRead(paper) {
    this.setState({...this.state,
      selectedPaper: paper,
      selectedPaperToQuotes: [],
      selectedPaperFromQuotes: []
    })
    this.getPaperQuotes(paper)
    this.getPaperReviews(paper)
  }

  async onDownload(paper) {
    // check if IPFS setup has completed
    if (this.state.storage_started === false) {
      alert("Please wait for IPFS to finish loading")
    }
    const { web3 } = this.state
    const multihash = web3.toAscii(paper.multihash)
    const raw = await storage.cat(multihash)

    fileDownload(raw, paper.name)
  }

  // Paper quotes

  loadPaper(block, hash) {
    return new Promise((resolve, reject) => {
      const { documenterInstance, defaultAccount } = this.state
      documenterInstance.LogPaper({hash: hash}, {fromBlock: block, toBlock: "latest"}).get((error, result) => {
        if (error) {
          reject(error)
        } else {
          const paper = result.map(x => { return x.args })[0]
          resolve(paper)
        }
      })
    })
  }

  async getQuotes(block, from, callback) {
    const { documenterInstance } = this.state
    documenterInstance.LogQuote(from, {fromBlock: block, toBlock: "latest"}).get((error, result) => {
      if (error) {
        console.log("Nooooo! " + error)
      } else {
        const args = result.map(x => { return x.args })
        const to = from["from"] !== undefined
        const actions = args.map(quote => {
          if (to) {
            return this.loadPaper(block, quote.to)
          } else {
            return this.loadPaper(block, quote.from)
          }
        })
        Promise.all(actions).then(papers => {
          callback(papers)
        })
      }
    })
  }

  async getPaperQuotes(paper) {
    const { documenterInstance } = this.state
    const blockNumber = await documenterInstance.getDeploymentBlockNumber.call()
    this.getQuotes(blockNumber, {from: paper.hash}, papers => {
      this.setState({...this.state,
        selectedPaperFromQuotes: papers,
      })
    })
    this.getQuotes(blockNumber, {to: paper.hash}, papers => {
      this.setState({...this.state,
        selectedPaperToQuotes: papers,
      })
    })
  }

  // Field related

  async loadFieldPapers(field) {
    // loadPapers() variation, a watchFieldPapers method will need to be added as well
    const { documenterInstance } = this.state
    const blockNumber = await documenterInstance.getDeploymentBlockNumber.call()
    documenterInstance.LogPaper({field: field}, {fromBlock: blockNumber, toBlock: "latest"}).get((error, result) => {
      if (error) {
        console.log("Nooooo! " + error)
      } else {
        const papers = result.map(x => { return x.args })
        this.setState({...this.state, fieldPapers: papers})
      }
    })
  }

  onFieldChange(field) {
    this.setState({...this.state, selectedField: field})
    this.loadFieldPapers(field)
  }

  // Referee

  onReviewClicked(paper) {
    const { documenterInstance, defaultAccount } = this.state
    documenterInstance.reviewPaper(paper.hash, { from: defaultAccount })
  }

  async loadReviews() {
    const { documenterInstance, defaultAccount } = this.state
    const blockNumber = await documenterInstance.getDeploymentBlockNumber.call()
    documenterInstance.LogReview({from: defaultAccount}, {fromBlock: blockNumber, toBlock: "latest"}).get((error, result) => {
      if (error) {
        console.log("Nooooo! " + error)
      } else {
        console.log(defaultAccount)
        console.log(result)
        const reviews = result.map(x => { return x.args })
        this.setState({...this.state, reviews: reviews})
      }
    })
  }

  async watchNewReviews() {
    // watch for new reviews made by the user
    const { web3, documenterInstance, defaultAccount } = this.state
    const blockNumber = await promisify(web3.eth.getBlockNumber)
    // filter so only papers created by the user are fetched and starting in the current block
    documenterInstance.LogReview({from: defaultAccount}, {fromBlock: blockNumber, toBlock: "latest"}).watch((error, result) => {
      if (error) {
        console.log("Nooooo! " + error)
      } else {
        console.log("Result: " + JSON.stringify(result.args))
        // just in case: check if the paper hasn't been added already
        if (this.state.reviews.filter(review => (review.from === result.args.from)).length === 0) {
          this.setState({...this.state, reviews: [...this.state.reviews, result.args]})
        }
      }
    })
  }

  async getPaperReviews(paper) {
    const { web3, documenterInstance } = this.state
    const blockNumber = await promisify(web3.eth.getBlockNumber)
    documenterInstance.LogReview({hash: paper.hash}, {fromBlock: blockNumber, toBlock: "latest"}).get((error, result) => {
      if (error) {
        console.log("Nooooo! " + error)
      } else {
        console.log(result)
        const reviews = result.map(x => { return x.args })
        this.setState({...this.state, selectedPaperReviews: reviews})
      }
    })
  }

  render() {
    if (this.state.user === undefined) {
      return (
        <div>
        <AuthForm options={this.state.fields} onSignupClicked={this.onSignupClicked.bind(this)}/>
        </div>
      )
    } else {
      return (
        <div>
        <h1>{"Hi, " + this.state.user.name + "!"}</h1>
        <h3>{"You're a " + this.state.fields[this.state.user.field].slice(0, -1).toLowerCase() + "ist"}</h3>
        <p>{"You've peer-reviewed  " + this.state.reviews.length + "paper(s)"}</p>
        <hr/>
        <AddPaperForm name={this.state.name} options={this.state.fields} onPaperAdd={this.onPaperAdd.bind(this)} />
        <hr/>
        <PaperList papers={this.state.papers} onRead={this.onRead.bind(this)}/>
        <hr/>
        <PaperReader paper={this.state.selectedPaper} from={this.state.selectedPaperFromQuotes} to={this.state.selectedPaperToQuotes} reviews={this.state.selectedPaperReviews} fields={this.state.fields} web3={this.state.web3} onDownload={this.onDownload.bind(this)}/>
        <hr/>
        <hr/>
        <FieldList options={this.state.fields} papers={this.state.fieldPapers} reviews={this.state.reviews} userAddress={this.state.defaultAccount} field={this.state.user.field} onFieldChange={this.onFieldChange.bind(this)} onReviewClicked={this.onReviewClicked.bind(this)} />
        </div>
      )
    }
  }
}
