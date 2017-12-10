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
import AddFileForm from './components/AddFileForm'
import DocumentList from './components/DocumentList'
import DocumentReader from './components/DocumentReader'
import FieldList from './components/FieldList'

// Currently... everything is here. And i do mean it. Everything. Will eventually grow into a much nicer codebase, of course.
export default class App extends Component {
  constructor(props) {
    super(props)

    // Set default state
    this.state = {
      fields: ["Quantum Physics", "Lepufology"], // Taken from Documenter.sol
      selectedField: 0, // Both this and fieldDocuments are just a sample of data analytics
      fieldDocuments: [],
      documents: [],
      defaultAccount: undefined,
      authenticationInstance: undefined,
      documenterInstance: undefined,
      web3: undefined,
      user: undefined,
      storage_started: false,
      selectedDocument: undefined,
      selectedDocumentsFromQuotes: [],
      selectedDocumentsToQuotes: []
    }
  }

  componentWillMount() {
    this.initialize()
    .then(() => {
      this.watchNewDocuments()
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
      console.log(result)
      const user = {"name": web3.toUtf8(result[0]), "field": result[1].toNumber()}
      this.didLogin(user)
    } catch (error) {
      console.log(error)
    }

    // No need to have a logged in user to get documents by field
    this.loadFieldDocuments(0)
  }

  didLogin(user) {
    // store user in state and load documents
    this.setState({
      ...this.state,
      user: user
    })
    this.loadDocuments()
  }

  async onSignupClicked(name, field) {
    const index = this.state.fields.indexOf(field)
    const { authenticationInstance, defaultAccount} = this.state
    await authenticationInstance.signup(name, index, {from: defaultAccount})
    const user = {"name": name, "field": index}
    this.didLogin(user)
  }

  onFileAdd(file, refereed, quotes) {
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
      // check if the document exists. hey, this should use `await` instead of promises
      const exists = await documenterInstance.documentExists.call(hash)
      if (exists) {
        alert("Document already exists")
        return
      }
      const multihash = await storage.add(file.name, Buffer.from(binary))
      if (multihash !== undefined) {
        documenterInstance.notarizeDocument(file.name, index, refereed, quotes, hash, multihash, Date.now(), { from: defaultAccount })
      }
    }
    reader.readAsArrayBuffer(file)
  }

  async loadDocuments() {
    console.log("about to load")
    // load user's documents off-storage ;) -had to simplify some things in order to get started this way, but it's worth it
    const { documenterInstance, defaultAccount } = this.state
    const blockNumber = await documenterInstance.getDeploymentBlockNumber.call()
    // filter so only documents created by the user are fetched starting when the contract was deployed are fetched (better than zero)
    documenterInstance.LogNewDocument({owner: defaultAccount}, {fromBlock: blockNumber, toBlock: "latest"}).get((error, result) => {
      if (error) {
        console.log("Nooooo! " + error)
      } else {
        console.log(result)
        const documents = result.map(x => { return x.args })
        this.setState({...this.state, documents: documents})
      }
    })
  }

  async watchNewDocuments() {
    // watch for new registered documents
    const { web3, documenterInstance, defaultAccount } = this.state
    const blockNumber = await promisify(web3.eth.getBlockNumber)
    // filter so only documents created by the user are fetched and starting in the current block
    documenterInstance.LogNewDocument({owner: defaultAccount}, {fromBlock: blockNumber, toBlock: "latest"}).watch((error, result) => {
      if (error) {
        console.log("Nooooo! " + error)
      } else {
        console.log("Result: " + JSON.stringify(result.args))
        // just in case: check if the document hasn't been added already
        if (this.state.documents.filter(document => (document.hash === result.args.hash)).length === 0) {
          this.setState({...this.state, documents: [...this.state.documents, result.args]})
        }
      }
    })
  }

  onRead(doc) {
    this.setState({...this.state,
      selectedDocument: doc,
      selectedDocumentsToQuotes: [],
      selectedDocumentsFromQuotes: []
    })
    this.getDocumentQuotes(doc)
  }

  async onDownload(doc) {
    // check if IPFS setup has completed
    if (this.state.storage_started === false) {
      alert("Please wait for IPFS to finish loading")
    }
    const { web3 } = this.state
    const multihash = web3.toAscii(doc.multihash)
    const raw = await storage.cat(multihash)

    fileDownload(raw, doc.name)
  }

  // Document quotes

  loadDoc(block, hash) {
    return new Promise((resolve, reject) => {
      const { documenterInstance, defaultAccount } = this.state
      documenterInstance.LogNewDocument({hash: hash}, {fromBlock: block, toBlock: "latest"}).get((error, result) => {
        if (error) {
          reject(error)
        } else {
          console.log('result')
          console.log(result)
          const document = result.map(x => { return x.args })[0]
          console.log(document)
          resolve(document)
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
            return this.loadDoc(block, quote.to)
          } else {
            return this.loadDoc(block, quote.from)
          }
        })
        Promise.all(actions).then(documents => {
          console.log('to ' + to)
          console.log(documents)
          callback(documents)
        })
      }
    })
  }

  async getDocumentQuotes(doc) {
    const { documenterInstance } = this.state
    const blockNumber = await documenterInstance.getDeploymentBlockNumber.call()
    this.getQuotes(blockNumber, {from: doc.hash}, documents => {
      this.setState({...this.state,
        selectedDocumentsFromQuotes: documents,
      })
    })
    this.getQuotes(blockNumber, {to: doc.hash}, documents => {
      this.setState({...this.state,
        selectedDocumentsToQuotes: documents,
      })
    })
  }

  // Field related

  async loadFieldDocuments(field) {
    // loadDocuments() variation, a watchFieldDocuments method will need to be added as well
    const { documenterInstance } = this.state
    const blockNumber = await documenterInstance.getDeploymentBlockNumber.call()
    documenterInstance.LogNewDocument({field: field}, {fromBlock: blockNumber, toBlock: "latest"}).get((error, result) => {
      if (error) {
        console.log("Nooooo! " + error)
      } else {
        console.log(result)
        const documents = result.map(x => { return x.args })
        console.log(documents)
        this.setState({...this.state, fieldDocuments: documents})
      }
    })
  }

  onFieldChange(field) {
    this.setState({...this.state, selectedField: field})
    this.loadFieldDocuments(field)
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
        <hr/>
        <AddFileForm name={this.state.name} options={this.state.fields} onFileAdd={this.onFileAdd.bind(this)} />
        <hr/>
        <DocumentList documents={this.state.documents} onRead={this.onRead.bind(this)}/>
        <hr/>
        <DocumentReader doc={this.state.selectedDocument} from={this.state.selectedDocumentsFromQuotes} to={this.state.selectedDocumentsToQuotes} fields={this.state.fields} web3={this.state.web3} onDownload={this.onDownload.bind(this)}/>
        <hr/>
        <hr/>
        <FieldList options={this.state.fields} documents={this.state.fieldDocuments} onFieldChange={this.onFieldChange.bind(this)} />
        </div>
      )
    }
  }
}
