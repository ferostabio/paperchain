// Libraries

import React, { Component } from 'react'
import Contract from 'truffle-contract'

// Contract Abis
import Documenter from '../build/contracts/Documenter.json'

// Utils
import getWeb3 from './utils/getWeb3'
import promisify from './utils/promisify'

// Components
import AddFileForm from './components/AddFileForm'
import DocumentList from './components/DocumentList'
import DocumentReader from './components/DocumentReader'

const CryptoJS = require("crypto-js")
const storage = require("./storage.js")

const styles = {
  main: {
    'maxWidth': '80%',
    'margin': '0 auto',
  },
}

export default class App extends Component {
  constructor(props) {
    super(props)

    // Set default state
    this.state = {
      documents: [],
      defaultAccount: undefined,
      documenterInstance: undefined,
      web3: undefined,
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

    const documenter = Contract(Documenter)
    documenter.setProvider(web3.currentProvider)
    const accounts = await promisify(web3.eth.getAccounts)
    console.log(accounts[0])

    const defaultAccount = accounts[0]

    const documenterInstance = await documenter.deployed()

    storage.start('ipfs-edgar_allen').then(error => {
      console.log("started ipfs")
      return storage.id()
    }).then(info => {
      this.setState({
        storage_id: info[0],
        storage_version: info[1],
        storage_protocol: info[2]
      })
    })

    this.setState({
      ...this.state,
      web3,
      defaultAccount,
      documenterInstance,
    })
    this.loadDocuments()
  }

  onFileAdd(file) {
    if (this.state.storage_id === undefined) {
      alert("Please wait for IPFS to finish loading")
    }
    const { web3, documenterInstance, defaultAccount } = this.state

    var reader = new FileReader();
    reader.onload = event => {
      if (event === undefined) return
      const binary = event.target.result;
      var md5 = CryptoJS.MD5(binary).toString()

      documenterInstance.documentExists.call(md5).then(exists => {
        if (exists) {
          alert("Document already exists")
        } else {
          return storage.add(file.name, Buffer.from(binary))
        }
      }).then(multihash => {
        if (multihash !== undefined) {
          documenterInstance.notarizeDocument(md5, file.name, multihash, Date.now(), { from: defaultAccount })
        }
      })
    }
    reader.readAsBinaryString(file)
  }

  async loadDocuments() {
    const { web3, documenterInstance, defaultAccount } = this.state

    try {
      const hashesInBytes32 = await documenterInstance.getUserDocuments.call(defaultAccount)
      const documents = hashesInBytes32.map((hash) => web3.toAscii(hash))
      this.setState({
        ...this.state,
        documents,
      })
    } catch (error) {
      console.log(`Error loading documents: ${error}`)
    }
  }

  async watchNewDocuments() {
    const { web3, documenterInstance, defaultAccount } = this.state

    // Class assistant said, in order to test watching of events, i should mine a block. But metamask complains call needs a callback function even after adding one
    // web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 0})

    var blockNumber = await promisify(web3.eth.getBlockNumber)
    console.log('block number: ' + blockNumber)
    documenterInstance.LogNewDocument({owner: defaultAccount}, {fromBlock: blockNumber, toBlock: "latest"}).watch((error, result) => {
      if (error) {
        console.log(`Nooooo! ${error}`)
      } else {
        console.log(`Result ${JSON.stringify(result.args)}`)

        const hashInBytes32 = result.args.hash
        const hash = web3.toAscii(hashInBytes32)

        if (!this.state.documents.includes(hash)) {
          this.setState({...this.state, documents: [...this.state.documents, hash]})
        }
      }
    })
  }

  readBlob(blob, callback) {
    var bb = new Blob(blob)
    var f = new FileReader()
    f.onload = e => {
      callback(e.target.result)
    }
    f.readAsText(bb)
  }

  onRead(hash) {
    if (this.state.storage_id === undefined) {
      alert("Please wait for IPFS to finish loading")
    }
    const { web3, documenterInstance, defaultAccount } = this.state

    var name
    documenterInstance.getDocumentData(hash, {from: defaultAccount}).then(args => {
      name = web3.toAscii(args[0])
      var multihash = web3.toAscii(args[2])
      return storage.get(multihash)
    }).then(raw => {
      this.readBlob(raw, contents => {
        this.setState({...this.state, fileName: name, fileContents: contents})
      })
    })
  }

  render() {
    return (
      <div style={styles.main}>
      <h1>Edgar Allen</h1>
      <hr/>
      <AddFileForm onFileAdd={this.onFileAdd.bind(this)} />
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
