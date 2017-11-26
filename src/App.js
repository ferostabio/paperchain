// Libraries
const CryptoJS = require("crypto-js")
const Storage = require("../utils/storage.js")

import React, { Component } from 'react'
import Contract from 'truffle-contract'

// Contract Abis
import Authentication from '../build/contracts/Authentication.json'
import Documenter from '../build/contracts/Documenter.json'

// Utils
import getWeb3 from './utils/getWeb3'
import promisify from './utils/promisify'

// Components
import AddFileForm from './components/AddFileForm'
import DocumentList from './components/DocumentList'
import DocumentReader from './components/DocumentReader'


export default class App extends Component {
  constructor(props) {
    super(props)

    // Set default state
    this.state = {
      documents: [],
      defaultAccount: undefined,
      authenticationInstance: undefined,
      documenterInstance: undefined,
      web3: undefined,
      name: undefined,
      storage_id: undefined,
      storage_version: undefined,
      storage_protocol: undefined,
      fileName: undefined,
      fileContents: undefined
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
    Storage.start('ipfs-edgar_allen').then(error => {
      return Storage.id()
    }).then(info => {
      this.setState({
        storage_id: info[0],
        storage_version: info[1],
        storage_protocol: info[2]
      })
    })

    // get logged in user, otherwise request user (un)friendly signup
    var name
    try {
      name = await authenticationInstance.login.call({from: defaultAccount})
      this.didLogin(web3.toUtf8(name))
    } catch (error) {
      do {
        name = prompt("Please enter your user name")
      } while (name === null || name === "" )
      await authenticationInstance.signup(name, {from: defaultAccount})
      this.didLogin(name)
    }
  }

  didLogin(name) {
    // store user name in state and load documents
    this.setState({
      ...this.state,
      name: name
    })
    this.loadDocuments()
  }

  onFileAdd(file) {
    // check if IPFS setup has completed
    if (this.state.storage_id === undefined) {
      alert("Please wait for IPFS to finish loading")
      return
    }
    // check if we have a logged in user
    if (this.state.name === undefined) {
      alert("Please sign up before adding the file (hit reload)")
      return
    }
    const { documenterInstance, defaultAccount } = this.state
    // read file and get it's md5 hash
    var reader = new FileReader();
    reader.onload = event => {
      if (event === undefined) return
      const binary = event.target.result;
      var md5 = CryptoJS.MD5(binary).toString()
      // check if the document exists. hey, this should use `await` instead of promises
      documenterInstance.documentExists.call(md5).then(exists => {
        if (exists) {
          alert("Document already exists")
        } else {
          // if it's a new document, add it to IPFS so we have it's multihash
          return Storage.add(file.name, Buffer.from(binary))
        }
      }).then(multihash => {
        // and then... let's add it to the blockchain
        if (multihash !== undefined) {
          documenterInstance.notarizeDocument(md5, file.name, multihash, Date.now(), { from: defaultAccount })
        }
      })
    }
    reader.readAsBinaryString(file)
  }

  async loadDocuments() {
    // load user's documents array, as bytes32[] and convert it to string[]
    const { web3, authenticationInstance, defaultAccount } = this.state
    try {
      const hashesInBytes32 = await authenticationInstance.getDocuments.call(defaultAccount)
      const documents = hashesInBytes32.map((hash) => web3.toAscii(hash))
      this.setState({
        ...this.state,
        documents,
      })
    } catch (error) {
      console.log("Error loading documents: " + error)
    }
  }

  async watchNewDocuments() {
    // watch for new registered documents
    const { web3, documenterInstance, defaultAccount } = this.state
    var blockNumber = await promisify(web3.eth.getBlockNumber)
    // filter so only documents created by the user are fetched and starting in the current block
    documenterInstance.LogNewDocument({owner: defaultAccount}, {fromBlock: blockNumber, toBlock: "latest"}).watch((error, result) => {
      if (error) {
        console.log("Nooooo! " + error)
      } else {
        console.log("Result: " + JSON.stringify(result.args))

        const hashInBytes32 = result.args.hash
        const hash = web3.toAscii(hashInBytes32)

        // just in case: check if the document hasn't been added already
        if (!this.state.documents.includes(hash)) {
          this.setState({...this.state, documents: [...this.state.documents, hash]})
        }
      }
    })
  }

  readBlob(blob, callback) {
    // function to convert uint8array that we get from IPFS into something nicer
    // should probably be somewhere else, not in App.js
    var bb = new Blob(blob)
    var f = new FileReader()
    f.onload = e => {
      callback(e.target.result)
    }
    f.readAsText(bb)
  }

  onRead(hash) {
    // check if IPFS setup has completed
    if (this.state.storage_id === undefined) {
      alert("Please wait for IPFS to finish loading")
    }
    const { web3, documenterInstance, defaultAccount } = this.state
    // get document data from the blockchain
    var name
    documenterInstance.getDocumentData(hash, {from: defaultAccount}).then(args => {
      name = web3.toAscii(args[0])
      var multihash = web3.toAscii(args[2])
      // get the document from IPFS
      return Storage.get(multihash)
    }).then(raw => {
      // update the app's state with the file name and contents
      this.readBlob(raw, contents => {
        this.setState({...this.state, fileName: name, fileContents: contents})
      })
    })
  }

  render() {
    return (
      <div>
      <h1>{ this.state.name === undefined ? "Edgar Allen" : "Hi, " + this.state.name + "!"}</h1>
      <hr/>
      <AddFileForm name={this.state.name} onFileAdd={this.onFileAdd.bind(this)} />
      <p>Your ID is <strong>{this.state.storage_id}</strong></p>
      <p>Your IPFS version is <strong>{this.state.storage_version}</strong></p>
      <p>Your IPFS protocol version is <strong>{this.state.storage_protocol}</strong></p>
      <hr/>
      <DocumentList documents={this.state.documents} onRead={this.onRead.bind(this)}/>
      <hr/>
      <DocumentReader name={this.state.fileName} contents={this.state.fileContents}/>
      </div>
    )
  }
}
